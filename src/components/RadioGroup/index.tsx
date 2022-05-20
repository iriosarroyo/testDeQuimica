import Radio from 'components/Radio';
import React from 'react';
import './RadioGroup.css';

export default function RadioGroup({
  options, groupValue, setter, correcta,
}:
  {options:{value:string, text:string}[], groupValue:string|undefined, correcta:string|undefined
  setter:Function}) {
  return (
    <ul className="unlisted radioGroup">
      {options.map(({ value, text }) => (
        <Radio
          key={value}
          value={value}
          text={text}
          setter={setter}
          groupValue={groupValue}
          correcta={correcta}
        />
      ))}
    </ul>
  );
}
