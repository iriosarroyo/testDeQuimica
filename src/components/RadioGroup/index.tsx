import Radio from 'components/Radio';
import React from 'react';
import './RadioGroup.css';

export default function RadioGroup({
  options, groupValue, setter,
}:
  {options:{value:string, text:string}[], groupValue:string|undefined,
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
        />
      ))}
    </ul>
  );
}
