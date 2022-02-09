import React from 'react';
import {
  ColorMode, ElementoPeriodicoProps, GradientColorsTypes, PeriodicElement,
} from 'types/interfaces';
import './ElementoPeriodico.css';
import maxAndMin from 'info/maxAndMinTabla.json';
import { hslToHex } from 'services/colors';

const { contrastColor } = require('contrast-color');

const getMatterState = (temp: number, melt: any, boil: any) => {
  if (melt === null || boil === null) return 'no-data';
  if (temp > boil) return 'gas';
  if (temp < melt) return 'solid';
  return 'liquid';
};

const getGradientColor = (
  property:GradientColorsTypes,
  element:PeriodicElement,
  colorNumber:number,
  invert: boolean,
  log: boolean,
) => {
  let { max, min } = maxAndMin[property];
  let { [property]: data } = element;
  if (data === null) return 'orange';
  if (log) {
    max = Math.log10(max - min + 1);
    data = Math.log10(data - min + 1);
    data = Number.isFinite(data) ? data : 0;
    min = 0;
  }
  let interpolation = (min - data) / (min - max);
  if (invert) interpolation = 1 - interpolation;
  return hslToHex(
    colorNumber, // Math.trunc(255 * interpolation),
    50, // Math.trunc(100 * interpolation),
    100 - Math.trunc(80 * interpolation), // Math.trunc(255 * interpolation),
  );
};

const getColors = (
  colorMode:ColorMode,
  element:PeriodicElement,
  colorNumber:number,
  invert:boolean,
  log:boolean,
) => {
  const { 'cpk-hex': cpk } = element;
  let color;
  if (colorMode === 'phases') return [undefined, undefined];
  if (colorMode === 'cpk') color = cpk ? `#${cpk}` : '#ffffff';
  else color = getGradientColor(colorMode, element, colorNumber, invert, log);
  return [color, contrastColor({ bgColor: color })];
};

export default function ElementoPeriodico({
  elementData, w, h, colorMode, temp = 293, invert, log, colorNumber, handleClick,
}:ElementoPeriodicoProps) {
  const {
    symbol, atomic_mass: atomicMass, number, xpos, ypos, melt, boil, name,
  } = elementData;
  const [color, textColor] = getColors(colorMode, elementData, colorNumber, invert, log);
  const estado = getMatterState(temp, melt, boil);
  let numberToRepresent:number|null = atomicMass;
  if (colorMode !== 'cpk' && colorMode !== 'phases') numberToRepresent = elementData[colorMode];
  if (numberToRepresent !== null) { numberToRepresent = Math.round(numberToRepresent * 100) / 100; }
  const x = (xpos - 1) * w;
  const y = (ypos - 1) * h;
  return (
    <g
      id={name.toLowerCase()}
      fill={textColor}
      className={colorMode === 'phases' ? estado : undefined}
      onClick={handleClick}
    >
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        stroke="black"
        fill={color}
      />
      <text
        x={x + w / 2}
        y={y + h / 2}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="16px"
      >
        {symbol}
      </text>
      <text
        x={x + w - 2}
        y={y + 2}
        textAnchor="end"
        dominantBaseline="hanging"
        fontSize="12px"
      >
        {number}
      </text>
      <text
        x={x + w / 2}
        y={y + h}
        textAnchor="middle"
        dominantBaseline="text-after-edge"
        fontSize="12px"
      >
        {numberToRepresent}
      </text>
    </g>
  );
}
