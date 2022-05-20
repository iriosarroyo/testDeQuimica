import ElementoPeriodico from 'components/ElementoPeriodico';
import elementosTabla from 'info/tablaPeriodica.json';
import general from 'info/general.json';
import React from 'react';
import { ColorMode } from 'types/interfaces';
import { linearInterpolation, logarithmicInterpolation } from 'services/interpolation';

const CELL_SIZE_W = 50;
const CELL_SIZE_H = CELL_SIZE_W;
const {
  translations,
}:{ translations:{[key:string]:{default:string, [key:string]:string}}} = general;

const posibleCategoriesDups = Object.values(elementosTabla).map((x) => x.category)
  .filter((x) => x && !x.includes('unknown') && !x.includes('polyatomic'));
const posibleCategories = Array.from(new Set(posibleCategoriesDups));
const posibleCpk = Object.values(elementosTabla).map((x) => x['cpk-hex']).filter((x) => x);

function getPossibleColors(colorMode:ColorMode, hue:number, invert:boolean, log:boolean) {
  if (colorMode === 'phases') return ['gas', 'liquid', 'solid', 'no-data'];
  if (colorMode === 'category') return posibleCategories;
  if (colorMode === 'cpk') {
    const randomCpkIdx = Math.min(
      Math.trunc(Math.random() * posibleCpk.length),
      posibleCpk.length - 10,
    );
    return posibleCpk.slice(randomCpkIdx, randomCpkIdx + 4).map((x) => `#${x}`)
      .concat('no-data');
  }
  let intermediate = linearInterpolation(0.5, 0, 1, 20, 100);
  if (log) intermediate = logarithmicInterpolation(0.5, 0, 1, 20, 100);
  if (!invert) intermediate = 100 - intermediate + 20;
  const minAndMaxCol = [`hsl(${hue}, 50%, 100%)`,
    `hsl(${hue}, 50%, ${intermediate}%)`, `hsl(${hue}, 50%, 20%)`];
  if (invert) minAndMaxCol.reverse();
  return minAndMaxCol.concat('no-data');
}

function TemplateTablaPeriodica({
  color, subColor,
}:any) {
  const subColorMode = subColor ? `_${subColor.replace(/[0-9]+/, 'index')}` : '';
  const displayedNumber = translations[color][`displayed${subColorMode}`]
    ?.replace('$index', `${parseInt(subColor, 10) + 1}`);
  const units = translations[color][`units${subColorMode}`];
  const displayedText = `${displayedNumber} (${units})`;
  const colorModeBr = displayedText.split(' ').reduce((acum, curr) => {
    if (acum[acum.length - 1].length + curr.length > 16) return [...acum, curr];
    const newAcum = [...acum];
    newAcum[acum.length - 1] += ` ${curr}`;
    return newAcum;
  }, ['']);
  return (
    <g
      className="generalText"
    >
      <rect
        x={4 * CELL_SIZE_W}
        y={0.5 * CELL_SIZE_H}
        rx={5}
        ry={5}
        width={2 * CELL_SIZE_W}
        height={2 * CELL_SIZE_H}
        className="generalRect"
      />
      <text
        x={4 * CELL_SIZE_W + (2 * CELL_SIZE_W) / 2}
        y={0.5 * CELL_SIZE_H + (2 * CELL_SIZE_H) / 2 - 30}
        textAnchor="middle"
        dominantBaseline="text-before-edge"
        fontSize="20px"
      >
        X
      </text>
      <text
        x={4 * CELL_SIZE_W + (2 * CELL_SIZE_W) / 2}
        y={0.5 * CELL_SIZE_H + (2 * CELL_SIZE_H) / 2 - 8}
        textAnchor="middle"
        dominantBaseline="text-before-edge"
        fontSize="10px"
      >
        Nombre
      </text>
      <text
        x={4 * CELL_SIZE_W + (2 * CELL_SIZE_W) - 2}
        y={0.5 * CELL_SIZE_H + 2}
        textAnchor="end"
        dominantBaseline="hanging"
        fontSize="12px"
      >
        Z
      </text>
      {
    colorModeBr.map((text:any, idx:number) => (
      <text
        x={4 * CELL_SIZE_W + (2 * CELL_SIZE_W) / 2}
        y={0.5 * CELL_SIZE_H + 2 * CELL_SIZE_H + (idx - colorModeBr.length + 1) * 12}
        width={2 * CELL_SIZE_W}
        textAnchor="middle"
        dominantBaseline="text-after-edge"
        fontSize="12px"
        key={text}
      >
        {text}

      </text>
    ))
  }
    </g>
  );
}

export default function TablaPeriodica({ properties }:{properties:any}) {
  const {
    color, log, invert, colorNumber, temp, handleClick, subColor,
  } = properties;
  const colores = getPossibleColors(color, colorNumber, invert, log);
  return (
    <svg
      className="tablaPeriodica"
      xmlns="http://www.w3.org/2000/svg"
      style={{ minWidth: `${CELL_SIZE_W * 14}px`, minHeight: `${CELL_SIZE_H * 9}px` }}
      width="100%"
      viewBox={`0 0 ${CELL_SIZE_W * 18} ${CELL_SIZE_H * 11}`}
    >
      {Object.values(elementosTabla).map((el) => (
        <ElementoPeriodico
          colorMode={color}
          subColorMode={subColor}
          colorNumber={colorNumber}
          elementData={el}
          h={CELL_SIZE_H}
          handleClick={handleClick}
          invert={invert}
          key={el.symbol}
          log={log}
          temp={temp}
          w={CELL_SIZE_W}
        />
      ))}
      <TemplateTablaPeriodica color={color} subColor={subColor} />
      <g
        fill="white"
      >
        <rect
          x={8 * CELL_SIZE_W}
          y={0.5 * CELL_SIZE_H}
          rx={5}
          ry={5}
          width={2 * CELL_SIZE_W}
          height={2 * CELL_SIZE_H}
          className="generalRect"
        />
        {
          colores.map((x, i) => {
            const key = x + i;
            const numberOfRows = (1.5 * colores.length + 0.5);
            let text = translations.elementosTabla[x];
            if (text === undefined) {
              if (color === 'cpk') text = `Ejemplo ${i + 1}`;
              else if (i === 0) text = 'Mínimo';
              else if (i === 1) text = '50%';
              else if (i === 2) text = 'Máximo';
            }
            return (
              <g key={key} className={x}>
                <rect
                  x={8 * CELL_SIZE_W + CELL_SIZE_W / 20}
                  y={0.5 * CELL_SIZE_H + ((1.5 * i + 0.5) * (2 * CELL_SIZE_W)) / numberOfRows}
                  rx={CELL_SIZE_W}
                  ry={CELL_SIZE_H}
                  width={(2 * CELL_SIZE_W) / numberOfRows}
                  height={(2 * CELL_SIZE_H) / numberOfRows}
                  className="generalStroke"
                  fill={x}
                />
                <text
                  x={8 * CELL_SIZE_W + (3 * CELL_SIZE_W) / 20 + (2 * CELL_SIZE_W) / numberOfRows}
                  y={0.5 * CELL_SIZE_H + ((1.5 * i + 0.5) * (2 * CELL_SIZE_W)) / numberOfRows}
                  fontSize={`${Math.min((2 * CELL_SIZE_H) / numberOfRows, 18)}px`}
                  dominantBaseline="hanging"
                  className="generalText"
                >
                  {text}
                </text>
              </g>
            );
          })
        }
      </g>
    </svg>

  );
}
