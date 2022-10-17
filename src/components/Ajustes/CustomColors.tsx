import Button from 'components/Button';
import UserContext from 'contexts/User';
import React, { useContext, useEffect, useState } from 'react';
import { writeUserInfo } from 'services/database';
import { Logo } from 'services/determineApp';
import { CustomVarStyles } from 'types/interfaces';

const CUSTOM_PROPERTIES: [keyof CustomVarStyles, string][] = [
  ['--bg-color', 'Fondo 1'],
  ['--bg2-color', 'Fondo 2'],
  ['--bg3-color', 'Fondo 3'],
  ['--bg-red-color', 'Fondo rojo'],
  ['--font-color', 'Letra 1'],
  ['--font2-color', 'Letra 2'],
  // ['--font-red-color', 'Letra rojo'],
  ['--logo-bg', 'Fondo logo'],
  ['--logo-fg', 'Letra logo'],
];

const CUSTOM_PROPERTIES_MAP = new Map(CUSTOM_PROPERTIES);

const rgb2Hex = (str:string) => {
  const rgb = str.split(', ');
  rgb.length = 3; // remove alpha
  return `#${rgb.map((col) => {
    const num = parseInt(col, 10);
    return `${num < 16 ? '0' : ''}${num.toString(16)}`;
  }).join('')}`;
};

const hex2Rgb = (str:string) => {
  const r = str.substring(1, 3);
  const g = str.substring(3, 5);
  const b = str.substring(5, 7);
  return `${parseInt(r, 16)}, ${parseInt(g, 16)}, ${parseInt(b, 16)}`;
};

let timeout:number;
const sendColorsToDatabase = (val:string, id:string) => {
  clearTimeout(timeout);
  timeout = window.setTimeout(() => {
    const rgb = hex2Rgb(val);
    localStorage.setItem(
      'styles:customStyles',
      JSON.stringify({ ...JSON.parse(localStorage.getItem('styles:customStyles') ?? '{}'), [id]: rgb }),
    );
    writeUserInfo(rgb, `customStyles/${id}`);
  }, 300);
};

const useModeDefault = (mode:'dark'|'light') => {
  const entries = CUSTOM_PROPERTIES.map(([prop]) => (
    [prop, getComputedStyle(document.documentElement).getPropertyValue(`${prop.replace('-color', '')}-${mode}-mode`)]
  ));
  const obj = Object.fromEntries(entries);
  localStorage.setItem('styles:customStyles', JSON.stringify(obj));
  writeUserInfo(obj, 'customStyles');
};

function InputColor({ id, name, value }: {id:string, name:string, value:string}) {
  const [val, setValue] = useState(rgb2Hex(value));
  useEffect(() => setValue(rgb2Hex(value)), [value]);
  return (
    <label htmlFor={id}>
      <input
        type="color"
        id={id}
        value={val}
        onChange={(e) => {
          setValue(e.target.value);
          sendColorsToDatabase(e.target.value, id);
        }}
      />
      {name}
    </label>
  );
}

const getColor = (
  customStyles: CustomVarStyles| undefined,
  id: keyof CustomVarStyles,
  op?:string,
) => (
  `${customStyles?.[id] ?? getComputedStyle(document.body).getPropertyValue(`${id}-custom`)}${op === undefined ? '' : `, ${op}`}`
);

function DivDePrueba({
  customStyles, bg, fg, opBg, opFg,
}:
    {customStyles: CustomVarStyles|undefined,
        bg:keyof CustomVarStyles,
        fg:keyof CustomVarStyles, opBg?:string, opFg?:string}) {
  return (
    <>
      <h4>
        Fondo:
        {' '}
        {CUSTOM_PROPERTIES_MAP.get(bg)}
        {opBg && ` (Opacidad: ${opBg})`}
        . Letra:
        {' '}
        {opFg && ` (Opacidad: ${opFg})`}
        {CUSTOM_PROPERTIES_MAP.get(fg)}
      </h4>
      <div
        className="divDePrueba"
        style={{ backgroundColor: `rgba(${getColor(customStyles, bg, opBg)})`, color: `rgba(${getColor(customStyles, fg, opFg)})` }}
      >
        Prueba
        {' '}
        <strong>Prueba</strong>
        {' '}
        <em>Prueba</em>
      </div>
    </>
  );
}

DivDePrueba.defaultProps = {
  opBg: undefined,
  opFg: undefined,
};

export default function CustomColors() {
  const { userDDBB: { customStyles } } = useContext(UserContext)!;
  return (
    <div className="customColor">
      <h3>Colores personalizados</h3>
      <p>
        Cambia los colores y observa
        cómo cambian las muestras más comúnmente utilizadas en la página.
      </p>
      <Button onClick={() => useModeDefault('light')}>Usar paleta del modo claro</Button>
      <Button onClick={() => useModeDefault('dark')}>Usar paleta del modo oscuro</Button>
      {CUSTOM_PROPERTIES.map(([id, name]) => (
        <InputColor
          key={id}
          id={id}
          name={name}
          value={getColor(customStyles, id)}
        />
      ))}
      <DivDePrueba bg="--bg-color" fg="--font-color" customStyles={customStyles} />
      <DivDePrueba bg="--font-color" fg="--bg-color" customStyles={customStyles} />
      <DivDePrueba bg="--bg2-color" fg="--font2-color" customStyles={customStyles} />
      <DivDePrueba bg="--font2-color" fg="--bg2-color" customStyles={customStyles} />
      <DivDePrueba bg="--bg3-color" fg="--font2-color" customStyles={customStyles} />
      <DivDePrueba bg="--bg-red-color" fg="--font-color" customStyles={customStyles} />
      <DivDePrueba
        bg="--bg-color"
        fg="--font-color"
        customStyles={customStyles}
        opBg={getComputedStyle(document.documentElement).getPropertyValue('--bg-opacity')}
      />
      <DivDePrueba
        bg="--bg2-color"
        fg="--font2-color"
        customStyles={customStyles}
        opBg={getComputedStyle(document.documentElement).getPropertyValue('--bg2-opacity')}
      />
      <h4>Logo:</h4>
      <Logo width="60px" height="60px" />
      <h4>Logo invertido (cuando el ratón está sobre el logo):</h4>
      <Logo width="60px" height="60px" className="invertedLogo" />
    </div>
  );
}
