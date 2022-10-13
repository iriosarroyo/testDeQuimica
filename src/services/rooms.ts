import { defaultUserTemas } from 'info/defaultData';
import { getDefaultTemasSelection } from 'info/temas';
import { CompleteUser, MyUser, RoomData } from 'types/interfaces';
import {
  deleteDDBB, existsInDDBB, pushDDBB, readDDBB, writeDDBB, writeUserInfo,
} from './database';
import {
  GrupoNoConnected, GrupoNoExiste, SinNombreDeUsuario, UserErrorEditing,
} from './errores';
import { sendLogroUpdate } from './logros';

export const defaultRoomConfig:RoomData = {
  mode: 'Puntos',
  corregirOnClick: 'No',
  showPunt: 'No',
  endTime: 0,
  goBack: 'Sí',
  inBlanco: 'Sí',
  timePerQuestion: 3,
  timingMode: 'Sin Temporizador',
  type: 'Público',
  chat: 'Sí',
  numPregs: 5,
  difficulty: 'Difícil',
  tema: 'Administrador',
  repetidas: 'Sí',
  temasPersonalizados: getDefaultTemasSelection(),
  adminStats: {
    temas: defaultUserTemas,
    year: 'bach2',
  },
};

export const createRoom = async (user:MyUser, setError:Function) => {
  const username = user?.userDDBB?.username;
  if (!username) return setError(new SinNombreDeUsuario());
  const [ref, error] = await pushDDBB('rooms', { members: { [username]: { ready: false } }, config: defaultRoomConfig, admin: username });
  if (error || ref === undefined) return setError(new GrupoNoConnected());
  const { key } = ref;
  await writeDDBB(`activeRooms/${key}`, true);
  try {
    await writeUserInfo(key, 'room');
  } catch (e) {
    setError(new UserErrorEditing('el grupo'));
  }
  sendLogroUpdate('groupsCreated', user.userDDBB.logros?.groupsCreated);
  return key;
};

export const connectToRoom = async (user:CompleteUser, room:string) => {
  const { username } = user.userDDBB;
  if (!username) throw new SinNombreDeUsuario();
  let exists;
  try {
    exists = !await existsInDDBB(`activeRooms/${room}`);
  } catch (e) {
    throw new GrupoNoConnected();
  }
  if (exists) throw new GrupoNoExiste();
  try {
    const writeError = await writeDDBB(`rooms/${room}/members/${username}`, { ready: false });
    if (writeError) throw new GrupoNoConnected();
    await writeUserInfo(room, 'room');
    sendLogroUpdate('groupsJoined', user.userDDBB.logros?.groupsJoined);
  } catch (e) {
    throw new GrupoNoConnected();
  }
};

export const exitRoom = async (user:CompleteUser) => {
  const { uid, userDDBB } = user;
  const { username, room } = userDDBB;
  const [roomMembers] = await readDDBB(`rooms/${room}/members`);
  const membersUsernames = Object.keys(roomMembers);
  const numOfMembers = membersUsernames.length;
  if (numOfMembers > 1) {
    const [admin] = await readDDBB(`rooms/${room}/admin`);
    if (admin === username) {
      const newIdx = (membersUsernames.indexOf(username) + 1) % membersUsernames.length;
      await writeDDBB(`rooms/${room}/admin`, membersUsernames[newIdx]);
    }
    deleteDDBB(`rooms/${room}/members/${username}`);
  } else {
    deleteDDBB(`rooms/${room}`);
    deleteDDBB(`activeRooms/${room}`);
  }
  deleteDDBB(`users/${uid}/room`);
};
