import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from 'components/Button';
import React from 'react';
import decodeHTML from 'services/decodeHTML';
import './Radio.css';

export default function Radio({
  text, value, groupValue, setter, correcta,
}:
  {text:string, value:string, groupValue:string|undefined, correcta:string|undefined
     setter:Function}) {
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
        <div dangerouslySetInnerHTML={{ __html: decodeHTML(text) }} />
      </Button>
    </li>
  );
}
