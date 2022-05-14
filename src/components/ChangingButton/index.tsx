import Button from 'components/Button';
import React from 'react';

interface configChangingButton{
    title: string,
    text:string,
    values:string[],
    descriptions?:string[],
    onChange:Function
}

export default function ChangingButton({ className, config }:
    {className:string|undefined, config:configChangingButton}) {
  const {
    text, values, descriptions, onChange, title,
  } = config;
  const idx = values.indexOf(text);
  const handleClick = () => {
    const newIdx = (idx + 1) % values.length;
    onChange(values[newIdx]);
  };
  return (
    <div className={className}>
      <strong>{title}</strong>
      <Button onClick={handleClick}>{text}</Button>
      {descriptions && <em>{descriptions[idx]}</em>}
    </div>
  );
}

export function ModoChangingButton({ text, handleChange }:{text:string, handleChange:Function}) {
  return (
    <ChangingButton
      className="onlineChanging"
      config={{
        title: 'Modo del examen',
        text,
        values: ['Contrarreloj', 'Puntuación'],
        descriptions: [
          'Acierta el máximo de preguntas en un tiempo a determinar.',
          'Saca la máxima puntuación en un número de preguntas a determinar.',
        ],
        onChange: (val:string) => handleChange(val, 'mode'),
      }}
    />
  );
}

export function ChatChangingButton({ text, handleChange }:{text:string, handleChange:Function}) {
  return (
    <ChangingButton
      className="onlineChanging"
      config={{
        title: 'Chat',
        text,
        values: ['Sí', 'No'],
        descriptions: ['Chat activado.', 'Chat desactivado.'],
        onChange: (val:string) => handleChange(val, 'chat'),
      }}
    />
  );
}
export function TypeChangingButton({ text, handleChange }:{text:string, handleChange:Function}) {
  return (
    <ChangingButton
      className="onlineChanging"
      config={{
        title: 'Tipo',
        text,
        values: ['Público', 'Privado'],
        descriptions: [
          'Cualquier persona con el código puede unirse.',
          'Nadie puede unirse.',
        ],
        onChange: (val:string) => handleChange(val, 'type'),
      }}
    />
  );
}

export function DifficultChangingButton({ text, handleChange }:
  {text:string, handleChange:Function}) {
  return (
    <ChangingButton
      className="onlineChanging"
      config={{
        title: 'Dificultad',
        text,
        values: ['Fácil', 'Medio', 'Difícil', 'Administrador'],
        descriptions: [
          'Solo aparecen preguntas de nivel 1.',
          'Solo aparecen preguntas de nivel 2.',
          'Solo aparecen preguntas de nivel 3 (preguntas de olimpiada).',
          'Se usan las estadísticas del administrador para determinar la dificultad.',
        ],
        onChange: (val:string) => handleChange(val, 'difficulty'),
      }}
    />
  );
}

export function TemasChangingButton({ text, handleChange }:
  {text:string, handleChange:Function}) {
  return (
    <ChangingButton
      className="onlineChanging"
      config={{
        title: 'Temas',
        text,
        values: ['Administrador', 'Personalizado'],
        descriptions: [
          'Se usan las estadísticas del administrador para determinar los temas que deben de aparecer.',
          'Configura los temas que quieres que aparezcan a tu gusto.',
        ],
        onChange: (val:string) => handleChange(val, 'tema'),
      }}
    />
  );
}

export function RepetidasChangingButton({ text, handleChange }:
  {text:string, handleChange:Function}) {
  return (
    <ChangingButton
      className="onlineChanging"
      config={{
        title: 'Preguntas ya realizadas',
        text,
        values: ['Sí', 'No'],
        descriptions: [
          'Pueden aparecen aquellas preguntas que el administrador ha acertado varias veces.',
          'No aparecen aquellas preguntas que el administrador ha acertado varias veces.',
        ],
        onChange: (val:string) => handleChange(val, 'repetidas'),
      }}
    />
  );
}
