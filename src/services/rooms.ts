import { getDefaultTemasSelection } from 'info/temas';
import { CompleteUser, MyUser, RoomData } from 'types/interfaces';
import {
  addOne,
  deleteDDBB, existsInDDBB, pushDDBB, readDDBB, writeDDBB, writeUserInfo,
} from './database';
import {
  GrupoNoConnected, GrupoNoExiste, SinNombreDeUsuario, UserErrorEditing,
} from './errores';
import { sendLogroUpdate } from './logros';

export const defaultRoomConfig:RoomData = {
  probLevels: { 1: 0, 2: 0, 3: 1 },
  mode: 'Puntos',
  corregirOnClick: 'No',
  showPunt: 'No',
  endTime: 0,
  goBack: 'Sí',
  inBlanco: 'Sí',
  timePerQuestion: 3,
  timingMode: 'Sin Temporizador',
  type: 'Con invitación',
  chat: 'Siempre para los observadores',
  numPregs: 5,
  difficulty: 'Administrador',
  tema: 'Administrador',
  repetidas: 'Sí',
  temasPersonalizados: getDefaultTemasSelection(),
  adminStats: {
    year: 'bach2',
  },
};
export const sendAutoMsg = (room:string, username:string, msg:string) => pushDDBB(
  `rooms/${room}/chat`,
  {
    msg, username, time: Date.now(), auto: true,
  },
);
export const createRoom = async (user:MyUser, setError:Function) => {
  const username = user?.userDDBB?.username;
  if (!username) return setError(new SinNombreDeUsuario());
  const [ref, error] = await pushDDBB('rooms', { members: { [username]: { ready: false } }, config: defaultRoomConfig, admin: username });
  if (error || ref === undefined) return setError(new GrupoNoConnected());
  const { key } = ref;
  if (key === null) return setError(new GrupoNoConnected());
  await writeDDBB(`activeRooms/${key}`, {
    name: 'Nuevo Grupo',
    public: false,
    participants: 1,
  }); // True == 'public'
  try {
    await writeUserInfo(key, 'room');
    sendAutoMsg(key, username, `${username} ha creado el grupo`);
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
    await Promise.all([writeUserInfo(room, 'room'),
      addOne(`activeRooms/${room}/participants`)]);
    sendAutoMsg(room, username, `${username} se ha unido`);
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
      await sendAutoMsg(`${room}`, username, `${username} ha abandonado el grupo`);
      await sendAutoMsg(`${room}`, username, `${membersUsernames[newIdx]} es ahora administrador`);
    } else await sendAutoMsg(`${room}`, username, `${username} ha abandonado el grupo`);
    deleteDDBB(`rooms/${room}/members/${username}`);
    addOne(`activeRooms/${room}/participants`, true);
  } else {
    deleteDDBB(`rooms/${room}`);
    deleteDDBB(`activeRooms/${room}`);
  }
  deleteDDBB(`users/${uid}/room`);
};
