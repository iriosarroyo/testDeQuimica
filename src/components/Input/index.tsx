import React from 'react';
import { InputProps } from 'types/interfaces';

export default function Input({
  className,
  id,
  onChange,
  required = false,
  type = 'text',
  value,
  min,
  max,
}:InputProps) {
  return (
    <input {...{
      className,
      id,
      onChange,
      required,
      type,
      value,
      min,
      max,
    }}
    />
  );
}
