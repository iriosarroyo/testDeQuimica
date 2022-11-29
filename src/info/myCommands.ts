import { NavigateFunction } from 'react-router-dom';
import SearchCmd from 'services/commands';
import { copyAllQuestions, copyQuestion } from 'services/copy';
import { writeUserInfo } from 'services/database';
import { connectToRoom, createRoom, exitRoom } from 'services/rooms';
import { getFromSocketUID } from 'services/socket';
import Toast from 'services/toast';
import { MyErrorContextType, PreguntaTest } from 'types/interfaces';
import { getUser } from './shortcutTools';

export const copyCmd = (
  preguntas:PreguntaTest[],
  answers: {[k:string]:{current:string}|undefined},
  type:string[],
) => SearchCmd.addCommand(
  'copy',
  'Copia una pregunta del test activo.',
  (id:string, whatsapp:boolean) => {
    const preg = preguntas.find((x) => x.id === id);
    const ans = answers[id]?.current;
    if (preg === undefined) return Toast.addMsg('La pregunta con ese id no está activa', 5000);
    return copyQuestion(preg, ans, whatsapp);
  },
  {
    name: 'id',
    desc: 'Introduce el id de la pregunta a copiar.',
    optional: false,
    type,
  },
  {
    name: 'toWhatsapp',
    desc: 'Introduce si quieres que se copie con estilo para Whatsapp.',
    optional: true,
    default: 'true',
    type: ['boolean'],
  },
);

export const copyAllCmd = (
  preguntas:PreguntaTest[],
  answers: {[k:string]:{current:string}|undefined},
) => SearchCmd.addCommand(
  'copyAll',
  'Copia todas las preguntas activas',
  (whatsapp:boolean) => copyAllQuestions(preguntas, answers, whatsapp),
  {
    name: 'toWhatsapp',
    desc: 'Introduce si quieres que se copie con estilo para Whatsapp.',
    optional: true,
    default: 'true',
    type: ['boolean'],
  },
);

// AdminCommands

export const mantenimientoCommand = (setMantenimiento:(b:boolean) => any) => SearchCmd.addCommand(
  'setMantenimiento',
  'Modifica el estado de mantenimiento de la página',
  setMantenimiento,
  {
    name: 'estado',
    desc: 'Activa (true) o desactiva (false) el estado de mantenimiento.',
    optional: false,
    type: ['boolean'],
  },
);

export const notificationCommand = (sendNotification:(...params:any[]) => void) => SearchCmd
  .addCommand(
    'sendNotification',
    'Envía una notificación a los usuarios de la página.',
    sendNotification,
    {
      name: 'titulo',
      desc: 'Título de la notificación.',
      optional: false,
      type: ['string'],
    },
    {
      name: 'cuerpo',
      desc: 'Cuerpo de la notificación.',
      optional: false,
      type: ['string'],
    },
    {
      name: 'grupo',
      desc: 'Indica el grupo al que mandarle la notificación. Por defecto es a todos.',
      optional: true,
      type: ['all', 'eso3', 'eso4', 'bach1', 'bach2', 'test'],
      default: 'all',
    },
  );

export const sendDisconnectUser = async () => SearchCmd.addCommand(
  'disconnectUser',
  'Desconecta al usuario del servidor (Por defecto, momentáneamente',
  (user:string) => getFromSocketUID('admin:disconnectUser', user),
  {
    name: 'Uid del usuario',
    desc: 'Escribe el uid del usuario que quieres que se desconecte.',
    optional: false,
    type: await getFromSocketUID('admin:allUids'),
  },
);

export const forceReloadUser = async () => SearchCmd.addCommand(
  'forceReloadUser',
  'Fuerza que se recarguen las páginas del usuario indicado (sólo válido si están conectados al servidor)',
  (user:string) => getFromSocketUID('admin:reloadUser', user),
  {
    name: 'Uid del usuario',
    desc: 'Escribe el uid del usuario del que quieres que recargue la página.',
    optional: false,
    type: await getFromSocketUID('admin:allUids'),
  },
);
export const sendDisconnectAllUsers = () => SearchCmd.addCommand(
  'disconnectAllUser',
  'Desconecta a todos los usuario del servidor momentáneamente',
  () => getFromSocketUID('admin:disconnectAllUsers'),
);

export const forceReloadAllUsers = () => SearchCmd.addCommand(
  'forceReloadAllUser',
  'Fuerza que se recarguen las páginas de todos los usuarios (sólo válido si están conectados al servidor)',
  () => getFromSocketUID('admin:reloadAllUsers'),
);

export const joinGroupCmd = (
  navigate:NavigateFunction,
  setError:MyErrorContextType,
) => SearchCmd.addCommand(
  'joinGroup',
  'Únete a un grupo online.',
  (room:string) => {
    const user = getUser();
    navigate('/online');
    if (user === undefined) return undefined;
    if (user.userDDBB.room !== undefined) return Toast.addMsg('Ya estás en un grupo', 5000);
    return connectToRoom(user, room).catch((err) => setError(err));
  },
  {
    name: 'codigo',
    desc: 'Escribe el código del grupo',
    optional: false,
    type: ['string'],
  },
);

export const createGroupCmd = (
  navigate:NavigateFunction,
  setError:MyErrorContextType,
) => SearchCmd.addCommand(
  'createGroup',
  'Crea un grupo online.',
  () => {
    const user = getUser();
    navigate('/online');
    if (user === undefined) return undefined;
    if (user.userDDBB.room !== undefined) return Toast.addMsg('Ya estás en un grupo', 5000);
    return createRoom(user, setError);
  },
);

export const exitGroupCmd = (
  setError:MyErrorContextType,
) => SearchCmd.addCommand(
  'exitGroup',
  'Sal del grupo online.',
  () => {
    const user = getUser();
    if (user === undefined) return undefined;
    if (user.userDDBB.room === undefined) return Toast.addMsg('No estás en ningún grupo', 5000);
    return exitRoom(user).catch((err) => setError(err));
  },
);

export const changeModeCmd = (
  setError:MyErrorContextType,
) => SearchCmd.addCommand(
  'mode',
  'Cambiar el modo de la página',
  async (mode:string) => {
    const error = await writeUserInfo(mode === 'default' ? 'null' : mode, 'mode');
    localStorage.setItem('mode', mode);
    if (error) setError(error);
    else Toast.addMsg(`Modo cambiado a ${mode}`, 5000);
  },
  {
    name: 'modo',
    desc: 'Elige el estilo',
    optional: false,
    type: ['dark', 'light', 'custom', 'default'],
  },
);

export const setVelocityCmd = (
  setError:MyErrorContextType,
) => SearchCmd.addCommand(
  'setVelocity',
  'Cambia la velocidad de los mensajes del pie',
  async (velocity:number) => {
    if (velocity < 0) {
      Toast.addMsg('La velocidad debe ser al menos 0', 3000);
      return;
    }
    const error = await writeUserInfo(velocity, 'velocidad');
    if (error) setError(error);
    else Toast.addMsg(`La velocidad ha cambiado a ${velocity}.`, 5000);
  },
  {
    name: 'velocidad',
    desc: 'Velocidad del mensaje (debe ser mayor que 0).',
    optional: false,
    type: ['number'],
  },
);

export const setMaxNumOfSquaresCmd = (
  setError:MyErrorContextType,
) => SearchCmd.addCommand(
  'setMaxNumOfSquares',
  'Cambia el número de cuadrados que aparecen en el pie de página en los tests.',
  async (n:number, scope:string) => {
    if (n < 1) {
      Toast.addMsg('El número de cuadrados debe ser un número natural');
      return;
    }
    if (scope === 'local') {
      localStorage.setItem('testDeQuimica:maxNumOfSquares', `${n - 1}`);
      writeUserInfo(n - 1, 'localNumOfSquares');
      return;
    }
    if (scope === 'both') {
      localStorage.removeItem('testDeQuimica:maxNumOfSquares');
    }
    const error = await writeUserInfo(n - 1, 'numOfSquares');
    if (error) setError(error);
    else Toast.addMsg(`El número de cuadrados ha cambiado a ${n}.`, 3000);
  },
  {
    name: 'número de cuadrados',
    desc: 'Número de cuadrados que quieres que aparezcan en el pie (mínimo 1).',
    optional: false,
    type: ['int'],
  },
  {
    name: 'alcance',
    desc: 'Determina a qué afecta este cambio: "local" (solo en este navegador, por defecto), "goblal" (todos los dispositivos que no tengan un valor local determinado) o "both" (es como borrar el valor local y utilizar un nuevo valor global"',
    optional: true,
    type: ['local', 'global', 'both'],
    default: 'local',
  },
);
