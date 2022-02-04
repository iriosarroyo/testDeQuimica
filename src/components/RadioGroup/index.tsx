import Radio from 'components/Radio';
import React from 'react';
import './RadioGroup.css';

export default function RadioGroup({
  options, groupValue, setter,
}:
  {options:{value:string, text:string}[], groupValue:string|undefined,
  setter:Function}) {
  return (
    <div className="radioGroup">
      {options.map(({ value, text }) => (
        <Radio
          value={value}
          text={text}
          setter={setter}
          groupValue={groupValue}
        />
      ))}
    </div>
  );
}
