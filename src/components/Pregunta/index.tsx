import ItemPregunta from 'components/ItemPregunta';
import RadioGroup from 'components/RadioGroup';
import React, {
  useState,
} from 'react';

import SearchCmd from 'services/commands';

import decodeHTML from 'services/decodeHTML';
import { PreguntaTestDeQuimica } from 'types/interfaces';
import './Pregunta.css';

function PiePregunta({ correcta, answer, notInBlanco }:
  {correcta:string|undefined, answer:string|undefined, notInBlanco:boolean}) {
  if (correcta === undefined) return null;
  if (answer === correcta) return <div className="piePregunta">Pregunta correcta</div>;
  if (answer === '' && !notInBlanco) return <div className="piePregunta">Pregunta en blanco</div>;
  return <div className="piePregunta">Pregunta incorrecta</div>;
}

export default function Pregunta({
  idx, objPreg, myRef, setValue, answer, correctAnswer, notInBlanco,
}:
  {idx: number,
    objPreg:PreguntaTestDeQuimica,
    myRef:(el:HTMLDivElement)=>void,
    setValue:Function,
  answer:string|undefined,
  notInBlanco:boolean,
correctAnswer:string|undefined}) {
  const {
    pregunta, opciones, id, tema, year,
  } = objPreg;
  const [text, setText] = useState(`${idx + 1}) ${decodeHTML(pregunta)}`);
  const estasOpciones = Object.values(opciones)
    .map(({ id: value, value: texto }) => ({ value, text: texto }));
  SearchCmd.searchHook('Preguntas', id, text, (val:string) => setText(val), [], [text]);
  let classCorregida = answer === correctAnswer ? 'preguntaCorrecta' : 'preguntaIncorrecta';
  if (answer === '' && !notInBlanco) classCorregida = '';
  return (
    <div className={`pregunta ${correctAnswer !== undefined && `preguntaCorregida ${classCorregida}`}`} id={id} ref={myRef}>
      <h4
        className="enunciadoPregunta"
        dangerouslySetInnerHTML={{ __html: text }}
      />
      <div className="itemGroupPregunta">
        {id && <ItemPregunta title="Id: " text={id} />}
        {tema && <ItemPregunta title="Tema: " text={tema} /> }
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
