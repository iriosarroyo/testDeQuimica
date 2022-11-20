import { getTemas } from 'info/temas';
import { PreguntaTest } from 'types/interfaces';
import Toast from './toast';

const copyToClipBoard = async (text:string) => {
  await navigator.clipboard.writeText(text);
  Toast.addMsg('Texto copiado al portapapeles', 5000);
};

export const copyWithStyle = (text:string) => {
  const elem = document.createElement('div');
  elem.innerHTML = text;
  elem.style.position = 'absolute';
  elem.style.left = '-5000px';
  document.body.append(elem);
  const selection = window.getSelection();

  const range = document.createRange();
  range.selectNodeContents(elem);

  selection?.removeAllRanges();
  selection?.addRange(range);
  document.execCommand('copy');
  window.getSelection()?.removeAllRanges();
  elem.remove();
  Toast.addMsg('Texto copiado al portapapeles', 5000);
};

const tagsToTranslate = [
  {
    tag: 'strong',
    replaceL: '*',
    replaceR: '*',
  },
  {
    tag: 'b',
    replaceL: '*',
    replaceR: '*',
  },
  {
    tag: 'sup',
    replaceL: '^(',
    replaceR: ')',

  },
  {
    tag: 'em',
    replaceL: '_',
    replaceR: '_',
  },
  {
    tag: 'i',
    replaceL: '_',
    replaceR: '_',
  },
];

const abc = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n',
  'ñ', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];

const translateToWhatsapp = (text:string, numbers:boolean = false) => {
  let finalText = text;
  tagsToTranslate.forEach((elem) => {
    finalText = finalText.replace(
      // eslint-disable-next-line no-useless-escape
      new RegExp(`<${elem.tag}>(( |(&nbsp;))*)([^<]*?)(( |(&nbsp;))*)</${elem.tag}>`, 'g'),
      `$1${elem.replaceL}$4${elem.replaceR}$5`,
    );
  });
  const regex = /<li>(.*?)<\/li>/;
  let idx = 0;
  let hasLi = regex.test(finalText);
  while (hasLi) {
    finalText = finalText.replace(regex, `${numbers ? idx + 1 : abc[idx]}) $1<br>`);
    idx++;
    hasLi = regex.test(finalText);
  }
  return finalText;
};

const getStrQuestion = (question:PreguntaTest, whatsapp:boolean) => {
  let strQuestion = `<strong>${question.pregunta}</strong><ol type="a" start="1">`;
  Object.values(question.opciones).forEach((opt) => {
    strQuestion += `<li>${opt.value}</li>`;
  });
  strQuestion += `</ol>(<em>${question.id}, ${(getTemas() as any)[question.tema]}, Nivel ${question.level}</em>)`;
  if (whatsapp) strQuestion = translateToWhatsapp(strQuestion);
  return strQuestion;
};

export const copyAllQuestions = (questions:PreguntaTest[], whatsapp:boolean) => {
  let strAllQ = '<ol type="1">';
  questions.forEach((preg) => { strAllQ += `<li>${getStrQuestion(preg, whatsapp)}</li><br>`; });
  strAllQ += '</ol>';
  if (whatsapp) strAllQ = translateToWhatsapp(strAllQ, true);
  copyWithStyle(strAllQ);
};

export const copyQuestion = (question:PreguntaTest, whatsapp:boolean) => {
  const strQuestion = getStrQuestion(question, whatsapp);
  copyWithStyle(strQuestion);
};

export default copyToClipBoard;
