import SearchCmd from 'services/commands';
import { copyAllQuestions, copyQuestion } from 'services/copy';
import Toast from 'services/toast';
import { PreguntaTestDeQuimica } from 'types/interfaces';

export const copyCmd = (preguntas:PreguntaTestDeQuimica[], type:string[]) => SearchCmd.addCommand(
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

export const copyAllCmd = (preguntas:PreguntaTestDeQuimica[]) => SearchCmd.addCommand(
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
