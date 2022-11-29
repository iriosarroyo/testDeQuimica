/* eslint-disable react/jsx-no-bind */
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
import GeneralContentLoader from 'components/GeneralContentLoader';
import RoomParticipants from 'components/RoomParticipants';
import Temporizador from 'components/Temporizador';
import MyErrorContext from 'contexts/Error';
import FooterContext from 'contexts/Footer';
import FrontContext from 'contexts/Front';
import UserContext from 'contexts/User';
import { useEvent } from 'hooks/general';
import { getTemas, getTemasOrder } from 'info/temas';
import React, {
  ChangeEvent, FormEvent, useContext, useEffect, useState,
} from 'react';
import SearchCmd from 'services/commands';
import copyToClipBoard from 'services/copy';
import {
  onValueDDBB, onValueQuery, readDDBB, writeDDBB, writeUserInfo,
} from 'services/database';
import { GrupoNoPermission } from 'services/errores';
import { round } from 'services/probability';
import {
  connectToRoom, createRoom, defaultRoomConfig, exitRoom,
} from 'services/rooms';
import Toast from 'services/toast';
import {
  ActiveRoomData,
  CompleteUser, RoomData, RoomMember, UserDDBB,
} from 'types/interfaces';
import './Online.css';

let timeoutListos: number|undefined;

const getPositions = (members:{[k:string]:RoomMember}, username:string):
[number, [string, number][]] => {
  const notViewers = Object.entries(members).filter(([, data]) => !data.isViewer);
  if (notViewers.length <= 1) throw new Error('Not enough viewers');
  const values = notViewers.map(([, data]) => data.value);
  values.sort((a, b) => parseFloat(a ?? '0') - parseFloat(b ?? '0'));
  const positions:{[k:string]:number} = {};
  values.forEach((x, i) => {
    const value = x ?? '0';
    if (!(value in positions)) positions[value] = values.length - i;
  });
  const puestos:[string, number][] = notViewers.map(([name, data]) => ([name, positions[data.value ?? '0']]));
  puestos.sort((a, b) => a[1] - b[1]);
  return [positions[members[username]?.value ?? '0'], puestos];
};

const getExponent = (num:number) => {
  if (num === 1 || num === 3) return 'er';
  return 'o';
};

const setFrontAfterExam = (setFront:Function, exam:any, username:string, room:string|undefined) => {
  if (!exam || room === undefined) return;
  readDDBB(`rooms/${room}/members`).then(([mbrs]:[{[k:string]:RoomMember}, any]) => {
    const [ownPos, allPos] = getPositions(mbrs, username);
    setFront({
      elem:
  <div>
    <ul className="unlisted">
      {allPos.map(([name, pos]) => (
        <li key={name}>
          <strong>
            {pos}
            <sup>{getExponent(pos)}</sup>
            {' '}
            puesto:
          </strong>
          {' '}
          {name}
        </li>
      ))}
    </ul>
    {mbrs[username].isViewer || (
    <h3>
      Tu has quedado en
      {' '}
      {ownPos}
      <sup>{getExponent(ownPos)}</sup>
      {' '}
      puesto
    </h3>
    )}
  </div>,
      cb: () => {},
    });
  });
};

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
const totalWeights = (weights: RoomData['probLevels']) => Object.values(weights).reduce((a, c) => a + c);
function LevelsProbs({
  levelsProb, editor, room, editable,
}:
  {room:string, levelsProb:RoomData['probLevels'], editor:boolean, editable:boolean}) {
  const [weights, setWeight] = useState(levelsProb);
  const totalProbs = totalWeights(weights);
  const handleChange = (e:ChangeEvent<HTMLInputElement>, level:string) => {
    if (!editor || !editable) return;
    const w = Math.max(parseFloat(e.target.value), 0);
    setWeight((prev) => {
      const newWeights = { ...prev, [level]: w };
      const total = totalWeights(newWeights);
      const probs = Object.fromEntries(Object.entries(newWeights)
        .map(([lvl, we]) => ([lvl, round(Number.isNaN(we / total) ? 0.33 : (we / total))])));
      writeDDBB(`rooms/${room}/config/probLevels`, probs);
      return newWeights;
    });
  };
  useEffect(() => {
    if (!editor) setWeight(levelsProb);
  }, [editor, levelsProb]);
  return (
    <ul className={`unlisted temasPersonalizados ${editable ? '' : 'notEditableOnline'}`}>
      {Object.entries(weights).map(([level, weight]) => {
        const prob = round(weight / totalProbs);
        return (
          <li key={level}>
            <div className="onlineChanging">
              <strong>
                Nivel
                {' '}
                {level}
              </strong>
              <input
                type="number"
                min="0"
                step="0.1"
                value={weight}
                disabled={!editable}
                onChange={(e) => handleChange(e, level)}
              />
              <em>
                Prob.:
                {' '}
                {Number.isNaN(prob) ? 0.33 : prob}
              </em>
            </div>
          </li>
        );
      })}

    </ul>
  );
}

function NotInGroup() {
  const user = useContext(UserContext)!;
  const setFront = useContext(FrontContext);
  const setError = useContext(MyErrorContext);
  const [publicRooms] = useEvent<{[k:string]:ActiveRoomData}>((val) => onValueQuery(
    'activeRooms',
    'public',
    true,
    val,
  ));
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
      <div>
        <p>
          También puedes unirte a un grupo público.
          La lista de los grupos públicos aparece a continuación:
        </p>

        <ul className="unlisted grupoList">
          <li className="gruposListItem gruposListTitle">
            <div>Nombre</div>
            <div>Código</div>
            <div title="Número de participantes"># part.</div>
            <div> Unirse</div>
          </li>
          {publicRooms && Object.entries(publicRooms).map(([x, data]) => (
            <li className="gruposListItem" key={x}>
              <div>{data.name}</div>
              <div>{x}</div>
              <div>{data.participants}</div>
              <Button onClick={() => connectToRoom(user, x).catch(setError)}>Unirse</Button>
            </li>
          ))}
        </ul>

      </div>
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

function TemasPersonalizados({
  temas, room, isRoomAdmin, editable,
}:
  {temas:{[key:string]:string}, room:string, isRoomAdmin:boolean, editable:boolean}) {
  const TEMAS = getTemas();
  const temasEntries = Object.entries(temas ?? defaultRoomConfig.temasPersonalizados);
  temasEntries.sort((a, b) => getTemasOrder()[a[0]] - getTemasOrder()[b[0]]);
  const isTodoSi = temasEntries.every(([, val]) => val === 'Sí');
  const handleChange = (value:string, tema:string) => {
    if (!editable) return;
    if (!isRoomAdmin || timeoutListos !== undefined) return;
    writeDDBB(`rooms/${room}/config/temasPersonalizados/${tema}`, value);
  };

  const handleTodos = (value:string) => {
    if (!editable) return undefined;
    if (!isRoomAdmin || timeoutListos !== undefined) return undefined;
    // value is opposite as we want, as it is new value
    if (value === 'Desactivar todos') {
      return writeDDBB(`rooms/${room}/config/temasPersonalizados/`, defaultRoomConfig.temasPersonalizados);
    }
    const todoNo = temasEntries.map(([key]) => [key, 'No']);
    return writeDDBB(`rooms/${room}/config/temasPersonalizados/`, Object.fromEntries(todoNo));
  };
  return (
    <ul className={`unlisted temasPersonalizados ${editable ? '' : 'notEditableOnline'}`}>

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

const prepareForTest = async (room: string, isRoomAdmin:boolean, temas:UserDDBB['temas'], year:UserDDBB['year'], roomData:RoomData) => {
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
  const [roomData, setRoomData] = useState<RoomData|null>(null);
  const [roomAdmin, setRoomAdmin] = useState<string>('');
  const [num, setNum] = useState<number|string>(5);
  const [time, setTime] = useState<number|string>(3);
  const [members, setMembers] = useState<{[key:string]:RoomMember}|null>(null);
  const [name] = useEvent<string>((val) => onValueDDBB(`activeRooms/${room}/name`, val, Toast.addMsg));

  useEffect(() => (roomData && num !== roomData.numPregs && num !== '' ? setNum(roomData.numPregs) : undefined), [roomData?.numPregs]);
  useEffect(() => (roomData && time !== roomData.timePerQuestion && time !== '' ? setTime(roomData.timePerQuestion) : undefined), [roomData?.numPregs]);
  useEffect(() => onValueDDBB(`rooms/${room}/config`, setRoomData, setError), []);
  useEffect(() => onValueDDBB(`rooms/${room}/admin`, setRoomAdmin, setError), []);
  useEffect(() => onValueDDBB(`rooms/${room}/members`, setMembers, () => {
    setError(new GrupoNoPermission());
    writeUserInfo(null, 'room');
  }), []);
  useEffect(() => () => { timeoutListos = undefined; }, []);

  if (!roomData) return <GeneralContentLoader />;
  const {
    mode, inBlanco, timingMode, goBack, showPunt, corregirOnClick,
    type, chat, difficulty, tema, repetidas, temasPersonalizados, probLevels,
  } = roomData;
  const todosListos = members !== null && Object.values(members)
    .every((x) => x.ready || x.isViewer);

  if (todosListos && timeoutListos === undefined) {
    prepareForTest(room, roomAdmin === username, temas, year, roomData);
    timeoutListos = window.setTimeout(
      () => {
        setExam({ isRoomAdmin: roomAdmin === username });
        if (roomAdmin === username) writeDDBB(`rooms/${room}/inExam`, true);
      },
      3000, // _00000,
    );
  }

  if (!todosListos && timeoutListos !== undefined) {
    clearTimeout(timeoutListos);
    timeoutListos = undefined;
  }

  function handleChange<T extends keyof RoomData>(value:RoomData[T], param:T) {
    if (user.userDDBB.username !== roomAdmin || timeoutListos !== undefined) return;
    if (param === 'type') writeDDBB(`activeRooms/${room}/public`, value === 'Público');
    writeDDBB(`rooms/${room}/config/${param}`, value);
  }

  const handleListo = async () => {
    if ((await readDDBB(`rooms/${room}/inExam`))[0]) {
      Toast.addMsg('No se puede cancelar un examen que ya se había empezado', 3000);
      return writeDDBB(`rooms/${room}/members/${username}/ready`, true);
    }
    return writeDDBB(`rooms/${room}/members/${username}/ready`, !members?.[username]?.ready);
  };
  const handleNumPregsChange = (e:ChangeEvent<HTMLInputElement>) => {
    if (user.userDDBB.username !== roomAdmin || timeoutListos !== undefined) return undefined;
    if (timingMode === 'Temporizador por Pregunta') return false;
    const numero = parseInt(e.target.value, 10);
    if (Number.isNaN(numero) || numero < 1) return setNum('');
    setNum(numero > 50 ? 50 : numero);
    return saveNum(numero > 50 ? 50 : numero, room);
  };
  const handleTimeChange = (e:ChangeEvent<HTMLInputElement>) => {
    if (user.userDDBB.username !== roomAdmin || timeoutListos !== undefined) return undefined;
    if (timingMode === 'Sin Temporizador') return false;
    const numero = parseFloat(e.target.value);
    if (Number.isNaN(numero) || numero < 0.5) return setTime('');
    setTime(numero > 10 ? 10 : numero);
    return saveTime(numero > 10 ? 10 : numero, room);
  };

  const isListo = members?.[username]?.ready || members?.[username]?.isViewer;
  return (
    <div className="online">
      <div className="fixedContainerOnline">

        <div className="onlineChanging">
          <strong>Código del grupo: </strong>
          <span>{room}</span>
          <Button title="Copiar al portapapeles" onClick={() => copyToClipBoard(room)} className="copiarAlPortapapeles">
            <FontAwesomeIcon icon={faClipboard} />
          </Button>
          <Button className="exitRoom" title="Salir del Grupo" onClick={() => exitRoom(user)}>
            <FontAwesomeIcon icon={faPersonWalkingDashedLineArrowRight} />
          </Button>
        </div>
        <div className="onlineChanging">
          <strong>¿Listo?</strong>
          <Button onClick={handleListo} className={isListo ? 'isReady' : 'isNotReady'}>
            {isListo ? 'Listo' : 'No Listo'}
          </Button>
          <em>PULSA AQUÍ PARA INDICAR QUE ESTÁS PREPARADO O NO</em>
        </div>
      </div>
      <h3>Configuración del grupo</h3>
      <div className="onlineChanging">
        <strong>Administrador </strong>
        <span>{username === roomAdmin ? 'Tú' : roomAdmin}</span>
      </div>
      <div className="onlineChanging">
        <strong>Nombre </strong>
        {username === roomAdmin ? (
          <input
            value={name}
            onChange={(e) => writeDDBB(`activeRooms/${room}/name`, e.target.value)}
          />
        ) : <span>{name}</span>}
      </div>
      <TypeChangingButton
        text={type}
        handleChange={handleChange}
      />
      <ChatChangingButton
        text={chat}
        handleChange={handleChange}
      />
      <h3>Configuración del examen</h3>
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
      <LevelsProbs
        levelsProb={probLevels}
        editor={username === roomAdmin}
        room={room}
        editable={difficulty === 'Personalizado'}
      />
      <TemasChangingButton
        text={tema}
        handleChange={handleChange}
      />

      <TemasPersonalizados
        temas={temasPersonalizados}
        isRoomAdmin={username === roomAdmin}
        room={room}
        editable={tema === 'Personalizado'}
      />

      <div
        className={`onlineChanging ${timingMode !== 'Temporizador por Pregunta' ? '' : 'changingNotEditable'}`}
        title={timingMode === 'Temporizador por Pregunta' ? 'Con la configuración "Temporizador por pregunta" no tienes que seleccionar el número de preguntas, puedes hacer infinitas preguntas hasta que pulses corregir' : ''}
      >
        <strong>Nº de preguntas </strong>
        <input
          type="number"
          min="1"
          max="50"
          disabled={timingMode === 'Temporizador por Pregunta'}
          value={num}
          onChange={handleNumPregsChange}
        />
        <em>Elige el número de preguntas entre 1 y 50.</em>
      </div>

      <div
        className={`onlineChanging ${timingMode !== 'Sin Temporizador' ? '' : 'changingNotEditable'}`}
        title={timingMode === 'Sin Temporizador' ? 'El temporizador está desactivado' : ''}
      >
        <strong>Tiempo por pregunta (en mins) </strong>
        <input
          type="number"
          min="0.5"
          max="10"
          step="0.5"
          value={time}
          disabled={timingMode === 'Sin Temporizador'}
          onChange={handleTimeChange}
        />
        <em>Elige el tiempo por pregunta (en mins) desde 0.5 a 10 mins.</em>
      </div>
      <h3>Otras configuraciones</h3>

      <EnBlancoChangingButton
        text={inBlanco}
        handleChange={handleChange}
        notEditable={mode === 'Fallos' && 'Si el modo es Fallos esta configuración no se usa. Las preguntas en blanco cuentan como fallos.'}
        notEditableText="No"
      />

      <GoBackChangingButton
        text={goBack}
        handleChange={handleChange}
        notEditable={timingMode === 'Temporizador por Pregunta' && 'Con la configuración "Temporizador por pregunta" no se puede volver hacia atrás'}
        notEditableText="No"
      />
      <ShowPuntChangingButton
        text={showPunt}
        handleChange={handleChange}
      />
      <RepetidasChangingButton
        text={repetidas}
        handleChange={handleChange}
      />

      <CorregirOnClickChangingButton
        text={corregirOnClick}
        handleChange={handleChange}
        notEditable={showPunt === 'Sí' && 'Con la configuración "Mostrar Puntuación" en Sí solo se puede hacer test donde se corrijan las preguntas al hacer click.'}
        notEditableText="Sí"
      />

      <RoomParticipants
        members={members ?? {}}
        username={username}
        isRoomAdmin={username === roomAdmin}
        room={room}
      />

      {todosListos && (
      <div className="listoPanel">
        En
        {' '}
        <Temporizador alert={false} className="temporizadorRooms" initial={3 * 1000} format="seconds" />
        {' '}
        segundos empieza el examen
        <Button onClick={handleListo} className="cancelarListo">Cancelar</Button>
      </div>
      )}
      {chat !== 'Nunca' && <Chat room={room} /> }
    </div>
  );
}

export default function Online() {
  const user = useContext(UserContext)!;
  const setFooter = useContext(FooterContext);
  const setFront = useContext(FrontContext);
  const setError = useContext(MyErrorContext);
  const [exam, setExam] = useState<{isRoomAdmin:boolean}|undefined>(undefined);
  const { room } = user.userDDBB;
  useEffect(() => onValueDDBB(
    `rooms/${room}/inExam`,
    (val:any) => {
      if (val) return;

      setExam((e) => {
        setFrontAfterExam(setFront, e, user.userDDBB.username, room);
        return undefined;
      });
      setFooter(null);
    },
    () => setExam(undefined),
  ), [room]);
  useEffect(() => {
    if (!room) return undefined;
    return onValueDDBB(
      `rooms/${room}/admin`,
      (val:any) => {
        setExam((prevExam) => (prevExam ? {
          ...prevExam,
          isRoomAdmin: val === user.userDDBB.username,
        } : prevExam));
      },
      () => {
        setError(new GrupoNoPermission());
        writeUserInfo(null, 'room');
        setFooter(null);
      },
    );
  }, [room]);
  useEffect(() => {
    if (!room) return undefined;
    return SearchCmd.addCommand('copyRoomCode', 'Copia el código del grupo al portapapeles', () => copyToClipBoard(room));
  }, [room]);
  if (exam && room !== undefined) return <CustomTest room={room} exam={exam} />;
  if (!room) return <NotInGroup />;
  return <InGroup room={room} setExam={setExam} />;
}
