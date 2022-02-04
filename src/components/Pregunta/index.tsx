import ItemPregunta from 'components/ItemPregunta';
import RadioGroup from 'components/RadioGroup';
import React, { useState } from 'react';
import decodeHTML from 'services/decodeHTML';
import { PreguntaTestDeQuimica } from 'types/interfaces';
import './Pregunta.css';

export default function Pregunta({ objPreg }:
  {objPreg:PreguntaTestDeQuimica}) {
  const [valueGroup, setValue]:[string|undefined, Function] = useState(undefined);
  const {
    pregunta, opciones, id, tema, year,
  } = objPreg;
  const estasOpciones = Object.values(opciones)
    .map(({ id: value, value: text }) => ({ value, text }));
  return (
    <div className="pregunta">
      <h4 className="enunciadoPregunta" dangerouslySetInnerHTML={{ __html: decodeHTML(pregunta) }} />
      <div className="itemGroupPregunta">
        {id && <ItemPregunta title="Id: " text={id} />}
        {tema && <ItemPregunta title="Tema: " text={tema} /> }
        {year && <ItemPregunta title="Año: " text={year} /> }
      </div>
      <RadioGroup
        options={estasOpciones}
        groupValue={valueGroup}
        setter={setValue}
      />
    </div>
  );
}
