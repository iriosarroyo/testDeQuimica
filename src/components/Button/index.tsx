/* eslint-disable react/button-has-type */
import React, { MouseEventHandler, MutableRefObject } from 'react';
import './Button.css';

type ButtonTypes = 'button' | 'submit' | 'reset' | undefined
interface ButtonProps{
  type?:ButtonTypes,
  className?: string | undefined,
  onClick?: MouseEventHandler<HTMLButtonElement> | undefined,
  children:any,
  nextref?: MutableRefObject<any>
}

function getClase(clase:string|undefined) {
  if (clase === undefined) return 'styledButton';
  if (clase.includes('styledButton')) return clase;
  return `styledButton ${clase}`;
}

export default function Button({
  type, className, children, onClick, nextref,
}:ButtonProps) {
  const clase = getClase(className);
  return <button type={type} ref={nextref} onClick={onClick} className={clase}>{children}</button>;
}

Button.defaultProps = {
  type: 'button', className: '', onClick: () => {}, nextref: undefined,
};
