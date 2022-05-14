import { faClipboard, faPersonWalkingDashedLineArrowRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from 'components/Button';
import ChangingButton, {
  ChatChangingButton,
  DifficultChangingButton,
  ModoChangingButton,
  RepetidasChangingButton, TemasChangingButton, TypeChangingButton,
} from 'components/ChangingButton';
import Chat from 'components/Chat';
import RoomParticipants from 'components/RoomParticipants';
import MyErrorContext from 'contexts/Error';
import FrontContext from 'contexts/Front';
import UserContext from 'contexts/User';
import React, {
  ChangeEvent, FormEvent, useContext, useEffect, useState,
} from 'react';
import copyToClipBoard from 'services/copy';
import { onValueDDBB, writeDDBB } from 'services/database';
import {
  connectToRoom, createRoom, defaultRoomConfig, exitRoom,
} from 'services/rooms';
import { CompleteUser, RoomData, RoomMember } from 'types/interfaces';
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
      <p>Compite contra tus compañeros en preguntas de Química.</p>
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

function ChangeAdministrador({
  members, room, setFront, username,
}:
  {members:{[key:string]: {}}, room:string, setFront:Function, username:string}) {
  const handleChange = async (e:ChangeEvent<HTMLSelectElement>) => {
    if (window.confirm(`Está seguro de que quiere cambiar el administrador a ${e.target.value}`)) {
      await writeDDBB(`rooms/${room}/admin`, e.target.value);
    }
    setFront({ elem: null, cb: () => {} });
  };
  return (
    <select className="onlineButton" onChange={handleChange}>
      {Object.keys(members)
        .map((x) => <option key={x} value={x} selected={username === x}>{x}</option>)}
    </select>
  );
}

const saveNumGen = () => {
  let lastTimeout:number;
  return (num:number, room:string) => {
    if (lastTimeout) clearTimeout(lastTimeout);
    lastTimeout = window.setTimeout(() => writeDDBB(`rooms/${room}/config/numPregs`, num), 500);
  };
};
const saveNum = saveNumGen();

function TemasPersonalizados({ temas, room, isRoomAdmin }:
  {temas:{[key:string]:string}, room:string, isRoomAdmin:boolean}) {
  const temasEntries = Object.entries(temas ?? defaultRoomConfig.temasPersonalizados);
  temasEntries.sort((a, b) => a[0].localeCompare(b[0]));
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
              title: tema.replace('tema9', 'Temas 9 y 10').replace('tema', 'Tema '),
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

const prepareForTest = (room: string, isRoomAdmin:boolean) => {
  if (isRoomAdmin) {
    // set seed
    writeDDBB(`rooms/${room}/seed`, Math.random());
  }
};

function InGroup({ room }:{room:string}) {
  const user = useContext(UserContext)!;
  const { username } = user.userDDBB;
  const setFront = useContext(FrontContext);
  const setError = useContext(MyErrorContext);
  const [roomData, setRoomData] = useState<RoomData>(defaultRoomConfig);
  const [roomAdmin, setRoomAdmin] = useState<string>('');
  const [num, setNum] = useState<number|string>(5);
  const [members, setMembers] = useState<{[key:string]:RoomMember}>({});
  const {
    mode, type, chat, difficulty, tema, repetidas, temasPersonalizados, numPregs,
  } = roomData;

  const todosListos = Object.values(members).every((x) => x.ready);

  if (todosListos && timeoutListos === undefined) {
    prepareForTest(room, roomAdmin === username);
    timeoutListos = window.setTimeout(() => console.log('listos'), 3000);
  }

  if (!todosListos && timeoutListos !== undefined) {
    clearTimeout(timeoutListos);
    timeoutListos = undefined;
  }

  const handleChange = (value:string, param:string) => {
    if (user.userDDBB.username !== roomAdmin || timeoutListos !== undefined) return;
    writeDDBB(`rooms/${room}/config/${param}`, value);
  };
  const handleListo = () => {
    writeDDBB(`rooms/${room}/members/${username}/ready`, !members[username]?.ready);
  };
  const handleNumPregsChange = (e:ChangeEvent<HTMLInputElement>) => {
    if (user.userDDBB.username !== roomAdmin || timeoutListos !== undefined) return undefined;
    const numero = parseInt(e.target.value, 10);
    if (Number.isNaN(numero) || numero < 1) return setNum('');
    setNum(numero > 50 ? 50 : numero);
    return saveNum(numero > 50 ? 50 : numero, room);
  };
  useEffect(() => (num !== numPregs && num !== '' ? setNum(numPregs) : undefined), [numPregs]);
  useEffect(() => onValueDDBB(`rooms/${room}/config`, setRoomData, setError), []);
  useEffect(() => onValueDDBB(`rooms/${room}/admin`, setRoomAdmin, setError), []);
  useEffect(() => onValueDDBB(`rooms/${room}/members`, setMembers, setError), []);
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
        { username === roomAdmin
        && (
        <Button
          className="changeRoomAdmin"
          onClick={
          () => timeoutListos === undefined && setFront({
            elem: <ChangeAdministrador
              members={members}
              room={room}
              setFront={setFront}
              username={username}
            />,
            cb: () => {},
          })
}
        >
          Cambiar Administrador
        </Button>
        )}
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
      <DifficultChangingButton
        text={difficulty}
        handleChange={handleChange}
      />
      <RepetidasChangingButton
        text={repetidas}
        handleChange={handleChange}
      />
      <div className="onlineChanging">
        <strong>Nº de preguntas: </strong>
        <input type="number" min="1" max="50" value={num} onChange={handleNumPregsChange} />
        <em>Elige el número de preguntas entre 1 y 50.</em>
      </div>
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
      <RoomParticipants members={members} username={username} />
      <Button onClick={handleListo} className={members[username]?.ready ? 'isReady' : 'isNotReady'}>
        {members[username]?.ready ? 'Listo' : 'No Listo'}
      </Button>
      {chat === 'Sí' && <Chat room={room} /> }
    </div>
  );
}

export default function Online() {
  const user = useContext(UserContext)!;
  const { room } = user.userDDBB;
  if (!room) return <NotInGroup />;
  return <InGroup room={room} />;
}
