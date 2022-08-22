import UserContext from 'contexts/User';
import React, {
  useContext, useEffect, useMemo, useState,
} from 'react';

import gen from 'random-seed';
import { getNumOfDays } from 'services/time';
import {
  CompleteUser, difficultyLevels, PreguntaTestDeQuimica, RoomData, RoomMember, userDDBB,
} from 'types/interfaces';
import {
  getPuntuacionDelTema, getProbLevel1, getProbLevel3, getProbTema, getTemasInOrder,
} from 'services/probability';
import {
  changeAllChildren,
  deleteDDBB,
  filterByChildCache, onValueDDBB, readDDBB, readWithSetter, writeDDBB, writeUserInfo,
} from 'services/database';
import Test from 'components/Test';
import { GrupoNoPermission, NotEnoughQuestions } from 'services/errores';
import MyErrorContext from 'contexts/Error';
import RoomParticipants from 'components/RoomParticipants';
import FooterContext from 'contexts/Footer';
import {
  getCorregirOnClick,
  getNotInBlanco,
  getNumOfPregs,
  getOnNext, getPreventPrevious,
  getPuntType, getShowPunt, getTime, getTimeToSiguiente, getUnaPorUna,
} from 'services/conditionsCustomTest';

interface StatsPerTema{
  tema:string, punt:number, probLevel1:number, probLevel3:number
}

interface CompleteStatsPerTema extends StatsPerTema{
  probTema: number
}

const getTema = (statsPerTema:{[key:string]:CompleteStatsPerTema}, rng: gen.RandomSeed) => {
  let cumulativeProb = 0;
  const statsPerTemaArray = Object.values(statsPerTema);
  const random = rng.random();
  const tema = statsPerTemaArray.find((stats) => {
    cumulativeProb += stats.probTema;
    return random < cumulativeProb;
  })?.tema ?? statsPerTemaArray[0].tema;
  return tema;
};

const getLevel = (statsPerTema:CompleteStatsPerTema, rng: gen.RandomSeed) => {
  const { probLevel1, probLevel3 } = statsPerTema;
  const random = rng.random();
  if (random < probLevel1) return 1;
  if (random > 1 - probLevel3) return 3;
  return 2;
};

const getStatPerTema = (
  level:difficultyLevels,
  [tema, dataByLevel]:[string, userDDBB['temas']['']],
):[string, StatsPerTema] => {
  const punt = getPuntuacionDelTema(dataByLevel);
  const probLevel1 = getProbLevel1(punt, level);
  const probLevel3 = getProbLevel3(punt, level);
  return [tema, {
    tema, punt, probLevel1, probLevel3,
  }];
};

const getActiveTemas = (temasInOrder:string[], statsPerTemaObj:{
  [k: string]: StatsPerTema;
}) => {
  const activeTemas:string[] = [];
  for (let i = 0; i < temasInOrder.length; i++) {
    if (i !== 0 && statsPerTemaObj[temasInOrder[i - 1]].punt < 4) break;
    activeTemas.push(temasInOrder[i]);
  }
  return activeTemas;
};

const getCompleteStats = (
  statsPerTema:[string, StatsPerTema][],
  activeTemas: string[],
  equiprobable:boolean,
) => {
  const filteredStatsPerTema = statsPerTema.filter((x) => activeTemas.includes(x[1].tema));
  const puntuaciones = filteredStatsPerTema.map((stats) => stats[1].punt);
  return Object.fromEntries(filteredStatsPerTema.map((x) => [x[0], {
    ...x[1],
    probTema: equiprobable ? 1 / activeTemas.length : getProbTema(x[1].punt, puntuaciones),
  }]));
};

const getPosibleQuestionsFor = async (
  n:number,
  completeStatsPerTema:{[k: string]: CompleteStatsPerTema},
  rng:gen.RandomSeed,
) => {
  const promises = Array(n).fill(null).map(async () => {
    const tema = getTema(completeStatsPerTema, rng);
    const level = getLevel(completeStatsPerTema[tema], rng);
    const posibleQuestions = await filterByChildCache('preguntasTestDeQuimica', 'nivelYTema', `${tema}_${level}`);
    return { tema, level, posibleQuestions };
  });
  return Promise.all(promises);
};

const getPreguntasWithWeights = (
  results: { tema: string; level: number; posibleQuestions: any; }[],
  temas: userDDBB['temas'],
  rng: gen.RandomSeed,
  allQuestions: boolean,
  repeatedQuestions: boolean,
  filterIds:string[] = [],
) => {
  const yaPreguntado: string[] = filterIds;
  const preguntas = results.map(({ tema, level, posibleQuestions }) => {
    if (!posibleQuestions) { throw new NotEnoughQuestions(); }
    const weightedIds: string[] = [];

    Object.keys(posibleQuestions).forEach((id) => {
      if (!repeatedQuestions && yaPreguntado.includes(id)) { return; }
      const { aciertos, fallos } = temas[tema][`level${level}`];
      const numAc = (aciertos.match(new RegExp(id, 'g')) ?? []).length;
      const numFal = (fallos.match(new RegExp(id, 'g')) ?? []).length;
      const weight = allQuestions ? 1 : Math.trunc((numFal + 2) / (2 ** (numAc - 1)));
      weightedIds.push(...Array(weight).fill(id));
    });
    const idx = rng.intBetween(0, weightedIds.length - 1);
    const result = posibleQuestions[weightedIds[idx]];
    yaPreguntado.push(result?.id);
    return result;
  });
  return preguntas.filter((x:any) => x !== undefined);
};

const getPreguntas = async (
  n:number,
  UserDDBB: {temas:userDDBB['temas'], year:userDDBB['year']},
  rng: gen.RandomSeed,
  temasSeleccionados:string[]|undefined = undefined,
  level:difficultyLevels = 'User',
  allQuestions = false, // Include questions with high number of correct
  filterIds:string[] = [],
  repeatedQuestions = false,
) => {
  const { temas, year } = UserDDBB;
  const temasInOrder = temasSeleccionados ?? await getTemasInOrder(year);
  const statsPerTema:[string, StatsPerTema][] = Object.entries(temas)
    .map((tema) => getStatPerTema(level, tema));
  const statsPerTemaObj = Object.fromEntries(statsPerTema);
  const activeTemas = temasSeleccionados ?? getActiveTemas(temasInOrder, statsPerTemaObj);
  const completeStatsPerTema = getCompleteStats(
    statsPerTema,
    activeTemas,
    temasSeleccionados !== undefined,
  );
  const results = await getPosibleQuestionsFor(n, completeStatsPerTema, rng);
  return getPreguntasWithWeights(results, temas, rng, allQuestions, repeatedQuestions, filterIds);
};

const getTodaysPreguntas = async (
  user:CompleteUser,
  setter:Function,
  setError:Function,
  setStart:Function,
  path:string,
  newTest:boolean = false,
) => {
  let UserDDBB: {temas:userDDBB['temas'], year:userDDBB['year']};
  if (newTest) {
    await writeDDBB(path, { temas: user.userDDBB.temas, time: 0 });
    await writeUserInfo(Date.now(), 'lastTest');
    UserDDBB = user.userDDBB;
  } else {
    const [temas]:[userDDBB['temas'], Error|undefined] = await readDDBB(`${path}/temas`);
    const [time] = await readDDBB(`${path}/time`);
    setStart(time ?? 0);
    UserDDBB = { temas, year: user.userDDBB.year };
  }
  let preguntas;
  try {
    preguntas = await getPreguntas(5, UserDDBB, gen.create(`${getNumOfDays(Date.now())}`), undefined, 'Difícil');
  } catch (e) {
    setError(e);
  }
  setter(preguntas);
};

const getPreguntasWithSetter = async (
  setter:Function,
  setError:Function,
  end:Function,
  n:number,
  UserDDBB: {temas:userDDBB['temas'], year:userDDBB['year']},
  rng: gen.RandomSeed,
  temasSeleccionados:string[]|undefined = undefined,
  level:difficultyLevels = 'User',
  allQuestions = false, // Include questions with high number of correct
  filterIds:string[] = [],
  repeatedQuestions = false,
) => {
  try {
    const preguntas = await getPreguntas(
      n,
      UserDDBB,
      rng,
      temasSeleccionados,
      level,
      allQuestions,
      filterIds,
      repeatedQuestions,
    );
    setter(preguntas);
  } catch (e) {
    setError(e);
    end();
  }
};

function TestDelDia() {
  const user = useContext(UserContext)!;
  const setError = useContext(MyErrorContext);
  const { lastTest, unaPorUna } = user.userDDBB;
  const [startTime, setStartTime] = useState(0);
  const today = getNumOfDays(Date.now());
  const [preguntas, setPreguntas] = useState<PreguntaTestDeQuimica[]>([]);
  const path = `stats/${user.uid}/activeTest`;
  useEffect(() => {
    getTodaysPreguntas(
      user,
      setPreguntas,
      setError,
      setStartTime,
      path,
      !(lastTest && getNumOfDays(lastTest) === today), // new test a.k.a.: has done test yet?
    );
  }, []);
  if (preguntas.length === 0) return <div />;
  return <Test preguntas={preguntas} unaPorUna={unaPorUna} path={path} startTime={startTime} />;
}

function TestPuntuacion({
  config, seed, room, onEnd, showEndButton,
}:
  // eslint-disable-next-line no-undef
  {config:RoomData, seed:number, room:string, onEnd:Function, showEndButton:boolean}) {
  const setError = useContext(MyErrorContext);
  const [preguntas, setPreguntas] = useState<PreguntaTestDeQuimica[]>([]);
  const [startTime, setStartTime] = useState(0);
  const { username, unaPorUna } = useContext(UserContext)!.userDDBB;
  const {
    difficulty, repetidas, tema, temasPersonalizados, adminStats,
  } = config;
  const temasSeleccionados = tema === 'Personalizado'
    ? Object.entries(temasPersonalizados).filter(([, val]) => val === 'Sí').map(([key]) => key)
    : undefined;
  useEffect(() => {
    readWithSetter(`rooms/${room}/activeTest/${username}/time`, setStartTime, setError);
    getPreguntasWithSetter(
      setPreguntas,
      setError,
      onEnd,
      getNumOfPregs(config),
      adminStats,
      gen.create(`${seed}`),
      temasSeleccionados,
      difficulty,
      repetidas === 'Sí',
    );
  }, []);

  const onNext = useMemo(() => async (
    pregs:PreguntaTestDeQuimica[],
    active:number,
    setActive:Function,
    isCorregido:boolean,
  ) => {
    if (active < pregs.length - 1) return setActive(active + 1);
    if (isCorregido) return undefined;
    const prevIds = pregs.map(({ id }) => id);
    try {
      const newPreg = await getPreguntas(
        1,
        adminStats,
        gen.create(`${seed * (pregs.length + 1)}`),
        temasSeleccionados,
        difficulty,
        repetidas === 'Sí',
        prevIds,
      );
      setPreguntas([...pregs, ...newPreg]);
    } catch (e) {
      setError(e);
    }
    return setActive(pregs.length);
  }, [preguntas, setPreguntas]);
  return (
    <Test
      preguntas={preguntas}
      corregirOnClick={getCorregirOnClick(config)}
      unaPorUna={getUnaPorUna(config, unaPorUna)}
      path={`rooms/${room}/activeTest/${username}`}
      notInBlanco={getNotInBlanco(config)}
      preventPrevious={getPreventPrevious(config)}
      puntType={getPuntType(config)}
      showPunt={getShowPunt(config)}
      time={getTime(config)}
      timerToSiguiente={getTimeToSiguiente(config)}
      startTime={startTime}
      onEnd={onEnd}
      showEndButton={showEndButton}
      onNext={getOnNext(config) ? onNext : undefined}
    />
  );
}

/* function EndButton({ onEnd, isRoomAdmin, members }:
  {onEnd:Function, isRoomAdmin: boolean, members:{[key:string]:RoomMember}}) {
  const allMembersEnded = useMemo(() => Object.values(members).every((x) => x.done), [members]);
  if (!isRoomAdmin || !allMembersEnded) return null;
  return <Button onClick={() => onEnd()}>Hello</Button>;
} */

export default function CustomTest({ room, exam = CustomTest.defaultProps.exam }:
  {room:string, exam?:{isRoomAdmin:boolean}}) {
  if (room === 'testDelDia') return <TestDelDia />;
  const { username } = useContext(UserContext)!.userDDBB;
  const [config, setConfig] = useState<RoomData>();
  const [seed, setSeed] = useState<number>();
  const [members, setMembers] = useState<{[key:string]:RoomMember}|null>(null);
  const setError = useContext(MyErrorContext);
  const setFooter = useContext(FooterContext);

  const { isRoomAdmin } = exam;
  useEffect(() => onValueDDBB(`rooms/${room}/members`, setMembers, () => {
    setError(new GrupoNoPermission());
    writeUserInfo(null, 'room');
    setFooter(null);
  }), [room]);

  const onEnd = useMemo(() => async () => {
    await changeAllChildren(`rooms/${room}/members`, { ready: false, done: false });
    await writeDDBB(`rooms/${room}/inExam`, false);
    await deleteDDBB(`rooms/${room}/activeTest`);
  }, [room]);

  const allMembersEnded = useMemo(() => Object
    .values(members ?? {}).every((x) => x.done), [members]);

  const showEndButton = isRoomAdmin && allMembersEnded;
  useEffect(() => {
    readWithSetter(`rooms/${room}/config`, setConfig);
    readWithSetter(`rooms/${room}/seed`, setSeed);
  }, [room]);

  if (!config || seed === undefined) return <div />;
  return (
    <>
      <RoomParticipants
        isRoomAdmin={isRoomAdmin}
        members={members ?? {}}
        room={room}
        username={username}
      />
      <TestPuntuacion
        room={room}
        config={config}
        seed={seed}
        onEnd={onEnd}
        showEndButton={showEndButton}
      />
    </>
  );
}

CustomTest.defaultProps = {
  exam: { isRoomAdmin: false },
};
