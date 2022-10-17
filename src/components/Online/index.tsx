import { faClipboard, faPersonWalkingDashedLineArrowRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from 'components/Button';
import ChangingButton, {
  ChatChangingButton,
  CorregirOnClickChangingButton,
  DifficultChangingButton,
  EnBlancoChangingButton,
  GoBackChangingButton,
  ModoChangingButton,
  RepetidasChangingButton,
  ShowPuntChangingButton,
  TemasChangingButton, TimingChangingButton, TypeChangingButton,
} from 'components/ChangingButton';
import Chat from 'components/Chat';
import CustomTest from 'components/CustomTest';
import RoomParticipants from 'components/RoomParticipants';
import Temporizador from 'components/Temporizador';
import MyErrorContext from 'contexts/Error';
import FooterContext from 'contexts/Footer';
import FrontContext from 'contexts/Front';
import UserContext from 'contexts/User';
import { getTemas, getTemasOrder } from 'info/temas';
import React, {
  ChangeEvent, FormEvent, useContext, useEffect, useState,
} from 'react';
import copyToClipBoard from 'services/copy';
import {
  onValueDDBB, readDDBB, writeDDBB, writeUserInfo,
} from 'services/database';
import { GrupoNoPermission } from 'services/errores';
import {
  connectToRoom, createRoom, defaultRoomConfig, exitRoom,
} from 'services/rooms';
import {
  CompleteUser, RoomData, RoomMember, userDDBB,
} from 'types/interfaces';
import './Online.css';

let timeoutListos: number|undefined;

function ConnectToGroup({ user, setError, setFront }:
  {user:CompleteUser, setError: Function, setFront:Function}) {
  const [group, setGroup] = useState('');
  const handleChange = (e:ChangeEvent<HTMLInputElement>) => setGroup(e.target.value);
  const handleSubmit = async (e:FormEvent) => {
    e.preventDefault();
    if (group.trim() === '') return;
    try {
      await connectToRoom(user, group.trim());
      setFront({ elem: null, cb: () => {} });
    } catch (error) {
      if (error instanceof Error) { setError(error); }
    }
  };
  return (
    <div>
      <form onSubmit={handleSubmit}>
        <h3>Introduce el código del grupo</h3>
        <input type="text" className="inputGroup" onChange={handleChange} value={group} />
        <Button className="onlineButton" type="submit">Unirse</Button>
      </form>
    </div>
  );
}

function NotInGroup() {
  const user = useContext(UserContext)!;
  const setFront = useContext(FrontContext);
  const setError = useContext(MyErrorContext);
  return (
    <div className="online">
      <p>
        Compite contra tus compañeros en preguntas de
        {' '}
        {process.env.REACT_APP_ASIGNATURA}
        .
      </p>
      <p>
        Crea o únete a un grupo para seleccionar el estilo del examen,
        el modo de competición y mucho más.
      </p>
      <p>
        Puedes crear un grupo, pulsando el siguiente botón:
        <Button className="onlineButton" onClick={() => createRoom(user, setError)}>Crear Grupo</Button>
      </p>
      <p>
        O unirte a un grupo ya existente haciendo
        click en el siguiente botón e introduciendo el código del grupo:
        <Button
          className="onlineButton"
          onClick={() => setFront({
            elem: <ConnectToGroup user={user} setError={setError} setFront={setFront} />,
            cb: () => {},
          })}
        >
          Unirse a un Grupo

        </Button>
      </p>

    </div>
  );
}

const saveGen = (path:string) => {
  let lastTimeout:number;
  return (num:number, room:string) => {
    if (lastTimeout) clearTimeout(lastTimeout);
    lastTimeout = window.setTimeout(() => writeDDBB(`rooms/${room}/config/${path}`, num), 500);
  };
};
const saveNum = saveGen('numPregs');
const saveTime = saveGen('timePerQuestion');

function TemasPersonalizados({ temas, room, isRoomAdmin }:
  {temas:{[key:string]:string}, room:string, isRoomAdmin:boolean}) {
  const TEMAS = getTemas();
  const temasEntries = Object.entries(temas ?? defaultRoomConfig.temasPersonalizados);
  temasEntries.sort((a, b) => getTemasOrder()[a[0]] - getTemasOrder()[b[0]]);
  const isTodoSi = temasEntries.every(([, val]) => val === 'Sí');
  const handleChange = (value:string, tema:string) => {
    if (!isRoomAdmin || timeoutListos !== undefined) return;
    writeDDBB(`rooms/${room}/config/temasPersonalizados/${tema}`, value);
  };

  const handleTodos = (value:string) => {
    if (!isRoomAdmin || timeoutListos !== undefined) return undefined;
    // value is opposite as we want, as it is new value
    if (value === 'Desactivar todos') {
      return writeDDBB(`rooms/${room}/config/temasPersonalizados/`, defaultRoomConfig.temasPersonalizados);
    }
    const todoNo = temasEntries.map(([key]) => [key, 'No']);
    return writeDDBB(`rooms/${room}/config/temasPersonalizados/`, Object.fromEntries(todoNo));
  };
  return (
    <ul className="unlisted temasPersonalizados">

      <li>
        <ChangingButton
          className="onlineChanging"
          config={{
            title: 'Temas',
            values: ['Activar todos', 'Desactivar todos'],
            text: isTodoSi ? 'Desactivar todos' : 'Activar todos',
            onChange: handleTodos,
          }}
        />
      </li>
      {temasEntries.map(([tema, show]) => (
        <li key={tema}>
          <ChangingButton
            className="onlineChanging"
            config={{
              title: TEMAS[tema as keyof typeof TEMAS],
              values: ['Sí', 'No'],
              text: show,
              onChange: (val:string) => handleChange(val, tema),
            }}
          />
        </li>
      ))}
    </ul>
  );
}

const prepareForTest = async (room: string, isRoomAdmin:boolean, temas:userDDBB['temas'], year:userDDBB['year'], roomData:RoomData) => {
  if (isRoomAdmin) {
    const { timingMode, timePerQuestion, numPregs } = roomData;
    // set seed
    if ((await readDDBB(`rooms/${room}/inExam`))[0]) return;
    writeDDBB(`rooms/${room}/seed`, Math.random());
    writeDDBB(`rooms/${room}/config/adminStats`, { temas, year });
    if (timingMode !== 'Temporizador Global') return;
    writeDDBB(`rooms/${room}/config/endTime`, Date.now()
    + 3000 // 3 extra waiting seconds
    + timePerQuestion * numPregs * 60000); // mins to msecs
  }
};

function InGroup({ room, setExam }:
  {room:string, setExam: Function}) {
  const user = useContext(UserContext)!;
  const { username, temas, year } = user.userDDBB;
  const setError = useContext(MyErrorContext);
  const [roomData, setRoomData] = useState<RoomData>(defaultRoomConfig);
  const [roomAdmin, setRoomAdmin] = useState<string>('');
  const [num, setNum] = useState<number|string>(5);
  const [time, setTime] = useState<number|string>(3);
  const [members, setMembers] = useState<{[key:string]:RoomMember}|null>(null);
  const {
    mode, inBlanco, timingMode, goBack, showPunt, corregirOnClick, timePerQuestion,
    type, chat, difficulty, tema, repetidas, temasPersonalizados, numPregs,
  } = roomData;
  const todosListos = members !== null && Object.values(members).every((x) => x.ready);

  if (todosListos && timeoutListos === undefined) {
    prepareForTest(room, roomAdmin === username, temas, year, roomData);
    timeoutListos = window.setTimeout(
      () => {
        setExam({ isRoomAdmin: roomAdmin === username });
        if (roomAdmin === username) writeDDBB(`rooms/${room}/inExam`, true);
      },
      3000,
    );
  }

  if (!todosListos && timeoutListos !== undefined) {
    clearTimeout(timeoutListos);
    timeoutListos = undefined;
  }

  useEffect(() => () => { timeoutListos = undefined; }, []);

  const handleChange = (value:string, param:string) => {
    if (user.userDDBB.username !== roomAdmin || timeoutListos !== undefined) return;
    writeDDBB(`rooms/${room}/config/${param}`, value);
  };
  const handleListo = async () => {
    if ((await readDDBB(`rooms/${room}/inExam`))[0]) return writeDDBB(`rooms/${room}/members/${username}/ready`, true);
    return writeDDBB(`rooms/${room}/members/${username}/ready`, !members?.[username]?.ready);
  };
  const handleNumPregsChange = (e:ChangeEvent<HTMLInputElement>) => {
    if (user.userDDBB.username !== roomAdmin || timeoutListos !== undefined) return undefined;
    const numero = parseInt(e.target.value, 10);
    if (Number.isNaN(numero) || numero < 1) return setNum('');
    setNum(numero > 50 ? 50 : numero);
    return saveNum(numero > 50 ? 50 : numero, room);
  };
  const handleTimeChange = (e:ChangeEvent<HTMLInputElement>) => {
    if (user.userDDBB.username !== roomAdmin || timeoutListos !== undefined) return undefined;
    const numero = parseFloat(e.target.value);
    if (Number.isNaN(numero) || numero < 0.5) return setTime('');
    setTime(numero > 10 ? 10 : numero);
    return saveTime(numero > 10 ? 10 : numero, room);
  };
  useEffect(() => (num !== numPregs && num !== '' ? setNum(numPregs) : undefined), [numPregs]);
  useEffect(() => (time !== timePerQuestion && time !== '' ? setTime(timePerQuestion) : undefined), [numPregs]);
  useEffect(() => onValueDDBB(`rooms/${room}/config`, setRoomData, setError), []);
  useEffect(() => onValueDDBB(`rooms/${room}/admin`, setRoomAdmin, setError), []);
  useEffect(() => onValueDDBB(`rooms/${room}/members`, setMembers, () => {
    setError(new GrupoNoPermission());
    writeUserInfo(null, 'room');
  }), []);
  return (
    <div className="online">
      <Button className="exitRoom" title="Salir del Grupo" onClick={() => exitRoom(user)}>
        <FontAwesomeIcon icon={faPersonWalkingDashedLineArrowRight} />
      </Button>
      <div className="onlineChanging">
        <strong>Código del grupo: </strong>
        <span>{room}</span>
        <Button title="Copiar al portapapeles" onClick={() => copyToClipBoard(room)} className="copiarAlPortapapeles">
          <FontAwesomeIcon icon={faClipboard} />
        </Button>
      </div>
      <div className="onlineChanging">
        <strong>Administrador: </strong>
        <span>{username === roomAdmin ? 'Tú' : roomAdmin}</span>
      </div>
      <TypeChangingButton
        text={type}
        handleChange={handleChange}
      />
      <ChatChangingButton
        text={chat}
        handleChange={handleChange}
      />
      <ModoChangingButton
        text={mode}
        handleChange={handleChange}
      />
      <TimingChangingButton
        text={timingMode}
        handleChange={handleChange}
      />
      <DifficultChangingButton
        text={difficulty}
        handleChange={handleChange}
      />
      {mode !== 'Fallos' && (
      <EnBlancoChangingButton
        text={inBlanco}
        handleChange={handleChange}
      />
      )}
      {timingMode !== 'Temporizador por Pregunta'
      && (
      <GoBackChangingButton
        text={goBack}
        handleChange={handleChange}
      />
      )}
      <ShowPuntChangingButton
        text={showPunt}
        handleChange={handleChange}
      />
      <RepetidasChangingButton
        text={repetidas}
        handleChange={handleChange}
      />
      {showPunt === 'No' && (
      <CorregirOnClickChangingButton
        text={corregirOnClick}
        handleChange={handleChange}
      />
      )}
      {timingMode !== 'Temporizador por Pregunta' && (
      <div className="onlineChanging">
        <strong>Nº de preguntas: </strong>
        <input type="number" min="1" max="50" value={num} onChange={handleNumPregsChange} />
        <em>Elige el número de preguntas entre 1 y 50.</em>
      </div>
      )}
      {timingMode !== 'Sin Temporizador' && (
      <div className="onlineChanging">
        <strong>Tiempo por pregunta (en mins): </strong>
        <input type="number" min="0.5" max="10" step="0.5" value={time} onChange={handleTimeChange} />
        <em>Elige el tiempo por pregunta (en mins) desde 0.5 a 10 mins.</em>
      </div>
      )}
      <TemasChangingButton
        text={tema}
        handleChange={handleChange}
      />
      { tema === 'Personalizado'
      && (
      <TemasPersonalizados
        temas={temasPersonalizados}
        isRoomAdmin={username === roomAdmin}
        room={room}
      />
      )}
      <RoomParticipants
        members={members ?? {}}
        username={username}
        isRoomAdmin={username === roomAdmin}
        room={room}
      />
      <Button onClick={handleListo} className={members?.[username]?.ready ? 'isReady' : 'isNotReady'}>
        {members?.[username]?.ready ? 'Listo' : 'No Listo'}
      </Button>
      {todosListos && (
      <div>
        En
        {' '}
        <Temporizador alert={false} className="temporizadorRooms" initial={3 * 1000} format="seconds" />
        {' '}
        segundos empieza el examen
      </div>
      )}
      {chat === 'Sí' && <Chat room={room} /> }
    </div>
  );
}

export default function Online() {
  const user = useContext(UserContext)!;
  const setFooter = useContext(FooterContext);
  const setError = useContext(MyErrorContext);
  const [exam, setExam] = useState<{isRoomAdmin:boolean}|undefined>(undefined);
  const { room } = user.userDDBB;
  useEffect(() => onValueDDBB(
    `rooms/${room}/inExam`,
    (val:any) => {
      if (val) return;
      setExam(undefined);
      setFooter(null);
    },
    () => setExam(undefined),
  ), [room]);
  useEffect(() => {
    if (!room) return undefined;
    return onValueDDBB(
      `rooms/${room}/admin`,
      (val:any) => { if (exam) setExam({ ...exam, isRoomAdmin: val === user.userDDBB.username }); },
      () => {
        setError(new GrupoNoPermission());
        writeUserInfo(null, 'room');
        setFooter(null);
      },
    );
  }, [room]);
  if (exam && room !== undefined) return <CustomTest room={room} exam={exam} />;
  if (!room) return <NotInGroup />;
  return <InGroup room={room} setExam={setExam} />;
}
