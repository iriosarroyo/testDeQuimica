import SearchCmd from 'services/commands';
import { copyAllQuestions, copyQuestion } from 'services/copy';
import { getFromSocketUID } from 'services/socket';
import Toast from 'services/toast';
import { PreguntaTest } from 'types/interfaces';

export const copyCmd = (preguntas:PreguntaTest[], type:string[]) => SearchCmd.addCommand(
  'copy',
  'Copia una pregunta del test activo.',
  (id:string, whatsapp:boolean) => {
    const preg = preguntas.find((x) => x.id === id);
    if (preg === undefined) return Toast.addMsg('La pregunta con ese id no está activa', 5000);
    return copyQuestion(preg, whatsapp);
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

export const copyAllCmd = (preguntas:PreguntaTest[]) => SearchCmd.addCommand(
  'copyAll',
  'Copia todas las preguntas activas',
  (whatsapp:boolean) => copyAllQuestions(preguntas, whatsapp),
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
