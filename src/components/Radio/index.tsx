import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from 'components/Button';
import React from 'react';
import decodeHTML from 'services/decodeHTML';
import './Radio.css';

export default function Radio({
  text, value, groupValue, setter,
}:
  {text:string, value:string, groupValue:string|undefined,
     setter:Function}) {
  const handleClick = () => {
    if (groupValue !== value) setter(value);
    else setter(undefined);
  };
  return (
    <li className="radioButton">
      <Button onClick={handleClick}>
        {groupValue === value ? <FontAwesomeIcon icon="check-circle" />
          : <FontAwesomeIcon icon={['fas', 'circle']} />}
        <div dangerouslySetInnerHTML={{ __html: decodeHTML(text) }} />
      </Button>
    </li>
  );
}
