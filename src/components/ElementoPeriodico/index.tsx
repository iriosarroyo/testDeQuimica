import React from 'react';
import {
  ColorMode, ElementoPeriodicoProps, GradientColorsTypes, PeriodicElement, subColorsType,
} from 'types/interfaces';
import './ElementoPeriodico.css';
import maxAndMin from 'info/maxAndMinTabla.json';
import general from 'info/general.json';
import { hslToHex } from 'services/colors';
import { linearInterpolation, logarithmicInterpolation } from 'services/interpolation';

const { contrastColor } = require('contrast-color');

const {
  translations,
}:{ translations:{[key:string]:{default:string, [key:string]:string}}} = general;

const getMatterState = (temp: number, melt: any, boil: any) => {
  if (melt === null || boil === null) return 'no-data';
  if (temp > boil) return 'gas';
  if (temp < melt) return 'solid';
  return 'liquid';
};

const getGradientColor = (
  property:GradientColorsTypes,
  subProperty: subColorsType | undefined,
  element:PeriodicElement,
  colorNumber:number,
  invert: boolean,
  log: boolean,
) => {
  let data:any = element[property];
  let minMax:any = maxAndMin[property];
  if (data === null) return undefined;
  if (typeof data === 'object'
  && subProperty
  && subProperty in data
  && typeof data[subProperty] === 'number') {
    data = data[subProperty];
    minMax = minMax[subProperty];
  }
  if (typeof data !== 'number') return undefined;
  const { max, min } = minMax;
  let interpolation = linearInterpolation(data, min, max, 20, 100);
  if (log) interpolation = logarithmicInterpolation(data, min, max, 20, 100);
  if (!invert) interpolation = 120 - interpolation;
  return hslToHex(
    colorNumber, // Math.trunc(255 * interpolation),
    50, // Math.trunc(100 * interpolation),
    Math.round(interpolation), // Math.trunc(255 * interpolation),
  );
};

const getColors = (
  colorMode:ColorMode,
  subProperty: subColorsType | undefined,
  element:PeriodicElement,
  colorNumber:number,
  invert:boolean,
  log:boolean,
) => {
  const { 'cpk-hex': cpk } = element;
  let color;
  if (colorMode === 'phases') return [undefined, undefined];
  if (colorMode === 'category') return [element.category, undefined];
  if (colorMode === 'cpk') color = cpk ? `#${cpk}` : undefined;
  else color = getGradientColor(colorMode, subProperty, element, colorNumber, invert, log);
  return [color, contrastColor({ bgColor: color })];
};

const getNumberToRepresent = (
  colorMode:ColorMode,
  subProperty: subColorsType | undefined,
  element:PeriodicElement,
):number|null => {
  if (colorMode === 'cpk' || colorMode === 'phases' || colorMode === 'category') return element.atomic_mass;
  const result:any = element[colorMode];
  if (typeof result === 'number' || result === null) return result;
  if (subProperty
    && typeof result === 'object'
    && subProperty in result
    && typeof result[subProperty] === 'number') return result[subProperty];
  return null;
};

export default function ElementoPeriodico({
  elementData, w, h, colorMode, temp = 293, invert, log, colorNumber, handleClick, subColorMode,
}:ElementoPeriodicoProps) {
  const {
    symbol, number, xpos, ypos, melt, boil, name,
  } = elementData;
  const [color, textColor] = getColors(
    colorMode,
    subColorMode,
    elementData,
    colorNumber,
    invert,
    log,
  );
  const estado = getMatterState(temp, melt, boil);
  let numberToRepresent = getNumberToRepresent(colorMode, subColorMode, elementData);
  if (numberToRepresent !== null) { numberToRepresent = Math.round(numberToRepresent * 100) / 100; }
  const x = (xpos - 1) * w;
  const y = (ypos - 1) * h;
  return (
    <g
      id={name.toLowerCase()}
      fill={textColor}
      className={colorMode === 'phases' ? estado : color ?? 'no-data'}
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
        y={y + h / 2 - 20}
        textAnchor="middle"
        dominantBaseline="text-before-edge"
        fontSize="16px"
      >
        {symbol}
      </text>
      <text
        x={x + w / 2}
        y={y + h / 2}
        textAnchor="middle"
        dominantBaseline="text-before-edge"
        fontSize="7px"
      >
        {translations.elementosTabla[name]}
      </text>
      <text
        x={x + w - 2}
        y={y + 2}
        textAnchor="end"
        dominantBaseline="hanging"
        fontSize="11px"
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
