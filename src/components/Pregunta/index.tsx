import { faClipboard } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from 'components/Button';
import ItemPregunta from 'components/ItemPregunta';
import RadioGroup from 'components/RadioGroup';
import { getTemas } from 'info/temas';
import React, {
  MouseEvent,
  useState,
} from 'react';

import SearchCmd from 'services/commands';
import { copyQuestion } from 'services/copy';

import decodeHTML from 'services/decodeHTML';
import { PreguntaTest } from 'types/interfaces';
import './Pregunta.css';

function PiePregunta({ correcta, answer, notInBlanco }:
  {correcta:string|undefined, answer:string|undefined, notInBlanco:boolean}) {
  if (correcta === undefined) return null;
  if (answer === correcta) return <div className="piePregunta">Pregunta correcta</div>;
  if (answer === '' && !notInBlanco) return <div className="piePregunta">Pregunta en blanco</div>;
  return <div className="piePregunta">Pregunta incorrecta</div>;
}

const TEMAS = getTemas();

export default function Pregunta({
  idx, objPreg, myRef, setValue, answer, correctAnswer, notInBlanco,
}:
  {idx: number,
    objPreg:PreguntaTest,
    myRef:(el:HTMLDivElement)=>void,
    setValue:Function,
  answer:string|undefined,
  notInBlanco:boolean,
correctAnswer:string|undefined}) {
  const {
    pregunta, opciones, id, tema, year, level,
  } = objPreg;
  const [text, setText] = useState(`${idx + 1}) ${decodeHTML(pregunta)}`);
  const estasOpciones = Object.values(opciones)
    .map(({ id: value, value: texto }) => ({ value, text: texto }));
  SearchCmd.searchHook('Preguntas', id, text, (val:string) => setText(val), [], [text]);
  let classCorregida = answer === correctAnswer ? 'preguntaCorrecta' : 'preguntaIncorrecta';
  if (answer === '' && !notInBlanco) classCorregida = '';

  const handleCopyClick = (e:MouseEvent<HTMLButtonElement>) => {
    copyQuestion(objPreg, answer, !e.ctrlKey);
  };

  return (
    <div className={`pregunta ${correctAnswer !== undefined && `preguntaCorregida ${classCorregida}`}`} id={id} ref={myRef}>
      <Button
        className="copyPregunta"
        title="Haz click para copiar la pregunta en formato WhatsApp. Si pulsas ctrl lo copias con formato html (válido para email, Word...)"
        onClick={handleCopyClick}
      >
        <FontAwesomeIcon icon={faClipboard} />

      </Button>
      <h4
        className="enunciadoPregunta"
        dangerouslySetInnerHTML={{ __html: text }}
      />
      <div className="itemGroupPregunta">
        {id && <ItemPregunta title="Id: " text={id} />}
        {tema && <ItemPregunta title="Tema: " text={TEMAS[tema as keyof typeof TEMAS]} /> }
        {level && <ItemPregunta title="Nivel: " text={level} /> }
        {year && <ItemPregunta title="Año: " text={year} /> }
      </div>
      <RadioGroup
        id={id}
        options={estasOpciones}
        groupValue={answer}
        correcta={correctAnswer}
        setter={(val:string) => correctAnswer === undefined && setValue(val, id)}
      />
      <PiePregunta answer={answer} correcta={correctAnswer} notInBlanco={notInBlanco} />
    </div>
  );
}
