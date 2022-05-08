import { faClipboard, faPersonWalkingDashedLineArrowRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from 'components/Button';
import Chat from 'components/Chat';
import MyErrorContext from 'contexts/Error';
import FrontContext from 'contexts/Front';
import UserContext from 'contexts/User';
import React, {
  ChangeEvent, FormEvent, useContext, useState,
} from 'react';
import copyToClipBoard from 'services/copy';
import { connectToRoom, createRoom, exitRoom } from 'services/rooms';
import { CompleteUser } from 'types/interfaces';
import './Online.css';

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

export default function Online() {
  const user = useContext(UserContext)!;
  const { room } = user.userDDBB;
  if (!room) return <NotInGroup />;
  return (
    <div className="online">
      <Button onClick={() => exitRoom(user)}>
        <FontAwesomeIcon icon={faPersonWalkingDashedLineArrowRight} />
      </Button>
      <div>
        <strong>Código del grupo: </strong>
        <span>{room}</span>
        <Button title="Copiar al portapapeles" onClick={() => copyToClipBoard(room)}>
          <FontAwesomeIcon icon={faClipboard} />
        </Button>
      </div>
      <Chat room={room} />
    </div>
  );
}
