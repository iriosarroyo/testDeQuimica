import { CompleteUser, MyUser } from 'types/interfaces';
import {
  deleteDDBB, existsInDDBB, pushDDBB, readDDBB, writeDDBB, writeUserInfo,
} from './database';
import {
  GrupoNoConnected, GrupoNoExiste, SinNombreDeUsuario, UserErrorEditing,
} from './errores';

export const createRoom = async (user:MyUser, setError:Function) => {
  const username = user?.userDDBB?.username;
  if (!username) return setError(new SinNombreDeUsuario());
  const [ref, error] = await pushDDBB('rooms', { members: { [username]: true } });
  if (error || ref === undefined) return setError(new GrupoNoConnected());
  const { key } = ref;
  try {
    await writeUserInfo(key, 'room');
  } catch (e) {
    setError(new UserErrorEditing('el grupo'));
  }
  return key;
};

export const connectToRoom = async (user:CompleteUser, room:string) => {
  const { username } = user.userDDBB;
  if (!username) throw new SinNombreDeUsuario();
  let exists;
  try {
    exists = !await existsInDDBB(`rooms/${room}`);
  } catch (e) {
    throw new GrupoNoConnected();
  }
  if (exists) throw new GrupoNoExiste();
  try {
    await writeDDBB(`rooms/${room}/members/${username}`, true);
    await writeUserInfo(room, 'room');
  } catch (e) {
    throw new GrupoNoConnected();
  }
};

export const addRoomMate = () => {
};

export const exitRoom = async (user:CompleteUser) => {
  const { uid, userDDBB } = user;
  const { username, room } = userDDBB;
  const [roomMembers] = await readDDBB(`rooms/${room}/members`);
  const numOfMembers = Object.values(roomMembers).length;
  if (numOfMembers > 1) deleteDDBB(`rooms/${room}/members/${username}`);
  else deleteDDBB(`rooms/${room}`);
  deleteDDBB(`users/${uid}/room`);
};
