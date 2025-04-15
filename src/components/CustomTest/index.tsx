import UserContext from 'contexts/User';
import React, {
  useContext, useEffect, useMemo, useState,
} from 'react';

import { getNumOfDays } from 'services/time';
import {
  CompleteUser, PreguntaTest, RoomData, RoomMember, UserDDBB,
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
import Chat from 'components/Chat';

import { getNQuestions, getNQuestionsWithSetters } from 'services/preguntasGen';
import { setRestartTimer } from 'components/Temporizador';
import Toast from 'services/toast';

const getTodaysPreguntas = async (
  user:CompleteUser,
  setter:Function,
  setError:Function,
  setStart:Function,
  path:string,
  newTest:boolean = false,
) => {
  let userDDBB: {temas?:UserDDBB['temas'], year:UserDDBB['year']};
  let started = Date.now();
  if (newTest) {
    await writeDDBB(path, { temas: user.userDDBB.temas, time: 0, started });
    await writeUserInfo(Date.now(), 'lastTest');
    userDDBB = user.userDDBB;
  } else {
    const [temas]:[UserDDBB['temas'], Error|undefined] = await readDDBB(`${path}/temas`);
    const [data] = await readDDBB(`${path}`);
    let time;
    ({ time, started } = data);
    setStart(time ?? 0);
    userDDBB = { temas, year: user.userDDBB.year };
  }
  let preguntas;
  try {
    [preguntas] = await getNQuestions(5, { userData: userDDBB, started });
  } catch (e) {
    setError(e);
  }
  setter(preguntas);
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
  config, seed, room, onEnd, showEndButton, viewerUser, started,
}:
  // eslint-disable-next-line no-undef
  {config:RoomData, seed:number, room:string, viewerUser:string, started: number,
    onEnd:Function, showEndButton:boolean}) {
  const setError = useContext(MyErrorContext);
  const [preguntas, setPreguntas] = useState<PreguntaTest[]>([]);
  const [startTime, setStartTime] = useState(0);
  const [createNext, setCreateNext] = useState<any>(null);
  const { username, unaPorUna } = useContext(UserContext)!.userDDBB;
  const {
    difficulty, repetidas, tema, temasPersonalizados, adminStats, probLevels,
  } = config;
  const temasSeleccionados = tema === 'Personalizado'
    ? Object.entries(temasPersonalizados).filter(([, val]) => val === 'Sí').map(([key]) => key)
    : undefined;
  useEffect(() => {
    readWithSetter(`rooms/${room}/activeTest/${viewerUser}/time`, setStartTime, setError);
    getNQuestionsWithSetters(
      setPreguntas,
      (e:any) => { setError(e); onEnd(); },
      getNumOfPregs(config),
      {
        seed,
        started,
        userData: adminStats,
        overwriteTemas: temasSeleccionados,
        overwriteLevels: difficulty === 'Personalizado' ? probLevels : undefined,
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
    numOfPregs = 1,
  ) => {
    if (active < pregs.length - 1) return setActive(active + 1);
    if (isCorregido || createNext === null) return undefined;
    try {
      const newPreg:PreguntaTest[] = await Promise.all(Array(numOfPregs)
        .fill(null).map(createNext));
      setPreguntas((prevPregs) => ([...prevPregs, ...newPreg]));
      setActive((act:number) => act + numOfPregs);
      if (config.timingMode === 'Temporizador por Pregunta') setRestartTimer();
    } catch (e) {
      setError(e as Error);
    }
    return undefined;
  }, [createNext]);
  return (
    <Test
      preguntas={preguntas}
      corregirOnClick={getCorregirOnClick(config)}
      unaPorUna={getUnaPorUna(config, unaPorUna)}
      path={`rooms/${room}/activeTest/${viewerUser}`}
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
      isViewer={viewerUser !== username}
    />
  );
}

export default function CustomTest({ room, exam = CustomTest.defaultProps.exam }:
  {room:string, exam?:{isRoomAdmin:boolean}}) {
  if (room === 'testDelDia') return <TestDelDia />;
  const { username } = useContext(UserContext)!.userDDBB;
  const [config, setConfig] = useState<RoomData>();
  const [seed, setSeed] = useState<number>();
  const [start, setStart] = useState<number>();
  const [members, setMembers] = useState<{[key:string]:RoomMember}|null>(null);
  const setError = useContext(MyErrorContext);
  const setFooter = useContext(FooterContext);
  const [viewerUser, setViewerUser] = useState(username);

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
  if (members && viewerUser !== username
    && (!members[viewerUser] || members[viewerUser].isViewer)) {
    const newObservatory = Object.entries(members)
      .filter(([x, v]) => x !== username && !v.isViewer)[0]?.[0];
    if (newObservatory === undefined && isRoomAdmin) {
      writeDDBB(`rooms/${room}/members/${username}/isViewer`, false);
      deleteDDBB(`rooms/${room}/members/${username}/viewing`);
      onEnd();
    } else {
      writeDDBB(`rooms/${room}/members/${username}/viewing`, newObservatory).then(() => {
        setViewerUser(newObservatory);
      });
    }
    Toast.addMsg(`Observando a ${newObservatory}`, 3000);
  }

  const allMembersEnded = useMemo(() => Object
    .values(members ?? {}).every((x) => x.done || x.isViewer), [members]);
  const showEndButton = isRoomAdmin && allMembersEnded;
  useEffect(() => {
    readWithSetter(`rooms/${room}/config`, setConfig);
    readWithSetter(`rooms/${room}/started`, setStart);
    readWithSetter(`rooms/${room}/seed`, setSeed);
  }, [room]);

  useEffect(() => onValueDDBB(
    `rooms/${room}/members/${username}/viewing`,
    (val:string|null) => setViewerUser(val ?? username),
    setError,
  ), []);
  if (!config || seed === undefined) return <div />;
  return (
    <>
      {username !== viewerUser && (
      <div className="viewingUsername">
        Observando:
        {' '}
        {viewerUser}
      </div>
      )}
      <RoomParticipants
        isRoomAdmin={isRoomAdmin}
        members={members ?? {}}
        room={room}
        username={username}
        viewerUser={viewerUser}
      />
      <TestPuntuacion
        viewerUser={viewerUser}
        started={start ?? Date.now()}
        room={room}
        config={config}
        seed={seed}
        onEnd={onEnd}
        showEndButton={showEndButton}
      />
      {(config.chat === 'Siempre' || (config.chat === 'Siempre para los observadores' && viewerUser !== username))
      && <Chat room={room} />}
    </>
  );
}

CustomTest.defaultProps = {
  exam: { isRoomAdmin: false },
};
