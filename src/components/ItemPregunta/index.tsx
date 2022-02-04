import React from 'react';

export default function ItemPregunta({ title, text }:
  {title:string, text:string}) {
  return (
    <div className="itemPregunta">
      <em className="itemPreguntaTitle">{title}</em>
      <span>{text}</span>
    </div>
  );
}
