import UserContext from 'contexts/User';
import React, {
  useContext, useEffect, useMemo, useState,
} from 'react';

import { getNumOfDays } from 'services/time';
import {
  CompleteUser, DifficultyLevels, PreguntaTest, RoomData, RoomMember, userDDBB,
} from 'types/interfaces';

import {
  changeAllChildren,
  deleteDDBB, onValueDDBB, readDDBB, readWithSetter, writeDDBB, writeUserInfo,
} from 'services/database';
import Test from 'components/Test';
import { GrupoNoPermission } from 'services/errores';
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

import { getNQuestions, getNQuestionsWithSetters } from 'services/preguntasGen';

const getTodaysPreguntas = async (
  user:CompleteUser,
  setter:Function,
  setError:Function,
  setStart:Function,
  path:string,
  newTest:boolean = false,
) => {
  let UserDDBB: {temas?:userDDBB['temas'], year:userDDBB['year']};
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
    [preguntas] = await getNQuestions(5, { userData: UserDDBB });
  } catch (e) {
    setError(e);
  }
  setter(preguntas);
};

const getOverWriteLevels = (level:DifficultyLevels) => {
  if (level === 'Fácil') return { 1: 1, 2: 0, 3: 0 };
  if (level === 'Medio') return { 1: 0, 2: 1, 3: 0 };
  if (level === 'Difícil') return { 1: 0, 2: 0, 3: 1 };
  return undefined;
};

function TestDelDia() {
  const user = useContext(UserContext)!;
  const setError = useContext(MyErrorContext);
  const { lastTest, unaPorUna } = user.userDDBB;
  const [startTime, setStartTime] = useState(0);
  const today = getNumOfDays(Date.now());
  const [preguntas, setPreguntas] = useState<PreguntaTest[]>([]);
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
  if (preguntas === undefined || preguntas.length === 0) return <div />;
  return <Test preguntas={preguntas} unaPorUna={unaPorUna} path={path} startTime={startTime} />;
}

function TestPuntuacion({
  config, seed, room, onEnd, showEndButton,
}:
  // eslint-disable-next-line no-undef
  {config:RoomData, seed:number, room:string, onEnd:Function, showEndButton:boolean}) {
  const setError = useContext(MyErrorContext);
  const [preguntas, setPreguntas] = useState<PreguntaTest[]>([]);
  const [startTime, setStartTime] = useState(0);
  const [createNext, setCreateNext] = useState<any>(null);
  const { username, unaPorUna } = useContext(UserContext)!.userDDBB;
  const {
    difficulty, repetidas, tema, temasPersonalizados, adminStats,
  } = config;
  const temasSeleccionados = tema === 'Personalizado'
    ? Object.entries(temasPersonalizados).filter(([, val]) => val === 'Sí').map(([key]) => key)
    : undefined;
  useEffect(() => {
    readWithSetter(`rooms/${room}/activeTest/${username}/time`, setStartTime, setError);
    getNQuestionsWithSetters(
      setPreguntas,
      (e:any) => { setError(e); onEnd(); },
      getNumOfPregs(config),
      {
        seed,
        userData: adminStats,
        overwriteTemas: temasSeleccionados,
        overwriteLevels: getOverWriteLevels(difficulty),
        allQuestions: repetidas === 'Sí',
      },
      setCreateNext,
    );
  }, []);

  const onNext = useMemo(() => async (
    pregs:PreguntaTest[],
    active:number,
    setActive:Function,
    isCorregido:boolean,
  ) => {
    if (active < pregs.length - 1) return setActive(active + 1);
    if (isCorregido || createNext === null) return undefined;
    // const prevIds = pregs.map(({ id }) => id);
    try {
      const newPreg = await createNext();
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
