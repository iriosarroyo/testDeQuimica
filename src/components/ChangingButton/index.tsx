import Button from 'components/Button';
import React from 'react';
import { DifficultyLevels, HandleChangeOnline, RoomData } from 'types/interfaces';

interface ConfigChangingButton{
    title: string,
    text:string,
    values:string[],
    descriptions?:string[],
    onChange:(v:string) => any,
    notEditable?:boolean|string,
    notEditableText?:string,
}

export default function ChangingButton({ className, config }:
    {className:string|undefined, config:ConfigChangingButton}) {
  const {
    text, values, descriptions, onChange, title, notEditable,
    notEditableText = '',
  } = config;
  const idx = values.indexOf(notEditable ? notEditableText : text);
  const handleClick = () => {
    if (notEditable) return;
    const newIdx = (idx + 1) % values.length;
    onChange(values[newIdx]);
  };
  return (
    <div
      className={className + (notEditable ? ' changingNotEditable' : '')}
      title={notEditable && typeof notEditable === 'string' ? notEditable : ''}
    >
      <strong>{title}</strong>
      <Button onClick={handleClick}>{values[idx]}</Button>
      {descriptions && <em>{descriptions[idx]}</em>}
    </div>
  );
}

export function ModoChangingButton({ text, handleChange }:{text:string, handleChange:HandleChangeOnline<'mode'>}) {
  return (
    <ChangingButton
      className="onlineChanging"
      config={{
        title: 'Puntuación',
        text,
        values: ['Puntos', 'Aciertos', 'Fallos'],
        descriptions: [
          'Tu puntuación será igual al número de aciertos menos 0.33 por el número de fallos.',
          'Tu puntuación será igual al número de aciertos.',
          'Tu puntuación será igual al número de fallos. Las preguntas en blanco cuentan como fallo.',
        ],
        onChange: (val) => handleChange(val as RoomData['mode'], 'mode'),
      }}
    />
  );
}

export function ChatChangingButton({ text, handleChange }:{text:string, handleChange:HandleChangeOnline<'chat'>}) {
  return (
    <ChangingButton
      className="onlineChanging"
      config={{
        title: 'Chat',
        text,
        values: ['Siempre', 'Siempre para los observadores',
          'Solo en el lobby', 'Nunca',
        ],
        descriptions: ['Se puede acceder siempre al chat, incluso durante el test.',
          'Solo los observadores pueden acceder al chat durante el test. Aquí (en el "lobby") todos pueden acceder al chat.',
          'Solo se puede hacer al chat aquí (no durante el examen)',
          'Chat desactivado.'],
        onChange: (val) => handleChange(val as RoomData['chat'], 'chat'),
      }}
    />
  );
}
export function TypeChangingButton({ text, handleChange }:{text:string, handleChange:HandleChangeOnline<'type'>}) {
  return (
    <ChangingButton
      className="onlineChanging"
      config={{
        title: 'Tipo',
        text,
        values: ['Público', 'Con invitación', 'Privado'],
        descriptions: [
          'Cualquier persona puede unirse.',
          'Cualquier persona con el código puede unirse.',
          'Nadie puede unirse.',
        ],
        onChange: (val) => handleChange(val as RoomData['type'], 'type'),
      }}
    />
  );
}

export function DifficultChangingButton({ text, handleChange }:
  {text:string, handleChange:HandleChangeOnline<'difficulty'>}) {
  return (
    <ChangingButton
      className="onlineChanging"
      config={{
        title: 'Dificultad',
        text,
        values: ['Personalizado', 'Administrador'],
        descriptions: [
          'Se usan las probabilidades indicadas a continuación. El administrador puede cambiar los pesos de los niveles, a partir de los cuales se calcula la probabilidad (derecha)',
          'Se usan las estadísticas del administrador para determinar la dificultad.',
        ],
        onChange: (val) => handleChange(val as DifficultyLevels, 'difficulty'),
      }}
    />
  );
}

export function TemasChangingButton({ text, handleChange }:
  {text:string, handleChange:HandleChangeOnline<'tema'>}) {
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
        onChange: (val) => handleChange(val as RoomData['tema'], 'tema'),
      }}
    />
  );
}

export function RepetidasChangingButton({ text, handleChange }:
  {text:string, handleChange:HandleChangeOnline<'repetidas'>}) {
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
        onChange: (val) => handleChange(val as RoomData['repetidas'], 'repetidas'),
      }}
    />
  );
}

export function EnBlancoChangingButton({
  text, notEditable, notEditableText, handleChange,
}:
  {text:string, notEditableText:string,
    notEditable:string|boolean, handleChange:HandleChangeOnline<'inBlanco'>}) {
  return (
    <ChangingButton
      className="onlineChanging"
      config={{
        title: 'En blanco',
        text,
        values: ['Sí', 'No'],
        descriptions: ['Las preguntas en blanco cuentan 0 puntos.',
          'Las preguntas en blanco cuentan como fallos.'],
        onChange: (val) => handleChange(val as RoomData['inBlanco'], 'inBlanco'),
        notEditable,
        notEditableText,
      }}
    />
  );
}

export function TimingChangingButton({ text, handleChange }:
  {text:string, handleChange:Function}) {
  return (
    <ChangingButton
      className="onlineChanging"
      config={{
        title: 'Temporizador',
        text,
        values: ['Sin Temporizador', 'Temporizador Global', 'Temporizador por Pregunta'],
        descriptions: ['No hay cuenta atrás. Si que dispondrás de un cronometro para saber cuánto has tardado.',
          'El examen termina cuando se acabe el temporizador.',
          'Cuando se acabe el temporizador pasas a la siguiente pregunta. Con este modo se impide volver hacia atrás.'],
        onChange: (val:string) => handleChange(val, 'timingMode'),
      }}
    />
  );
}

export function GoBackChangingButton({
  text, handleChange, notEditable, notEditableText,
}:{text:string, notEditableText:string,
  notEditable:string|boolean, handleChange:Function}) {
  return (
    <ChangingButton
      className="onlineChanging"
      config={{
        title: 'Volver hacia atrás',
        text,
        values: ['Sí', 'No'],
        descriptions: ['Se permite volver hacia atrás.',
          'Se impide volver hacia atrás.'],
        onChange: (val:string) => handleChange(val, 'goBack'),
        notEditable,
        notEditableText,
      }}
    />
  );
}

export function ShowPuntChangingButton({ text, handleChange }:
  {text:string, handleChange:Function}) {
  return (
    <ChangingButton
      className="onlineChanging"
      config={{
        title: 'Mostrar puntuación',
        text,
        values: ['Sí', 'No'],
        descriptions: ['Se muestra la puntuación a lo largo de todo el examen. Esto activa Corregir al contestar.',
          'Solo se muestra la puntuación al final del examen.'],
        onChange: (val:string) => handleChange(val, 'showPunt'),
      }}
    />
  );
}

export function CorregirOnClickChangingButton({
  text, handleChange, notEditable, notEditableText,
}:
  {text:string, notEditableText:string,
    notEditable:string|boolean, handleChange:Function}) {
  return (
    <ChangingButton
      className="onlineChanging"
      config={{
        title: 'Corregir al contestar',
        text,
        values: ['Sí', 'No'],
        descriptions: [
          'Las preguntas se corrigen al contestar.',
          'Las preguntas se corrigen al final del examen.',
        ],
        onChange: (val:string) => handleChange(val, 'corregirOnClick'),
        notEditable,
        notEditableText,
      }}
    />
  );
}
