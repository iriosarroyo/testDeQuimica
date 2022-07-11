import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from 'components/Button';
import React, { useState } from 'react';
import SearchCmd from 'services/commands';
import decodeHTML from 'services/decodeHTML';
import './Radio.css';

export default function Radio({
  text, value, groupValue, setter, correcta, id,
}:
  {text:string, value:string, groupValue:string|undefined, correcta:string|undefined
     setter:Function, id:string}) {
  const [textOpt, setText] = useState(text);
  SearchCmd.searchHook('Preguntas', `${id}_${value}`, text, (val:string) => setText(val), [], [textOpt]);

  const handleClick = () => {
    if (groupValue !== value) return setter(value);
    return setter('');
  };

  let className;
  if (correcta === value) className = 'respuestaCorrecta';
  else if (correcta !== undefined && groupValue === value) className = 'respuestaIncorrecta';

  return (
    <li className="radioButton">
      <Button onClick={handleClick} className={className}>
        {groupValue === value ? <FontAwesomeIcon icon="check-circle" />
          : <FontAwesomeIcon icon={['fas', 'circle']} />}
        <div dangerouslySetInnerHTML={{ __html: decodeHTML(textOpt) }} />
      </Button>
    </li>
  );
}
