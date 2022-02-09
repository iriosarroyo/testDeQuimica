import ItemPregunta from 'components/ItemPregunta';
import RadioGroup from 'components/RadioGroup';
import React from 'react';

import decodeHTML from 'services/decodeHTML';
import { PreguntaTestDeQuimica } from 'types/interfaces';
import './Pregunta.css';

export default function Pregunta({
  idx, objPreg, myRef, setValue,
}:
  {idx: number,
    objPreg:PreguntaTestDeQuimica,
    myRef:(el:HTMLDivElement)=>void,
    setValue:Function}) {
  const {
    pregunta, opciones, id, tema, year, answer,
  } = objPreg;

  const estasOpciones = Object.values(opciones)
    .map(({ id: value, value: text }) => ({ value, text }));
  return (
    <div className="pregunta" id={id} ref={myRef}>
      <h4
        className="enunciadoPregunta"
        dangerouslySetInnerHTML={{ __html: `${idx + 1}) ${decodeHTML(pregunta)}` }}
      />
      <div className="itemGroupPregunta">
        {id && <ItemPregunta title="Id: " text={id} />}
        {tema && <ItemPregunta title="Tema: " text={tema} /> }
        {year && <ItemPregunta title="Año: " text={year} /> }
      </div>
      <RadioGroup
        options={estasOpciones}
        groupValue={answer}
        setter={(val:string) => setValue(val, idx)}
      />
    </div>
  );
}
