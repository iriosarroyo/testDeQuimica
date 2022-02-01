import React from 'react';
import { SelectProps } from 'types/interfaces';

export default function Select({
  className,
  id,
  onChange,
  required = false,
  value,
  options,
}:SelectProps) {
  return (
    <select {...{
      className,
      id,
      onChange,
      required,
      value,
    }}
    >
      {options.map((x) => {
        if (typeof x === 'string') return <option key={x} value={x}>{x}</option>;
        const { value: val, text } = x;
        return <option key={val} value={val}>{text}</option>;
      })}

    </select>
  );
}
