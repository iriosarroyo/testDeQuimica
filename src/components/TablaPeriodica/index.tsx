import ElementoPeriodico from 'components/ElementoPeriodico';
import elementosTabla from 'info/tablaPeriodica.json';
import React from 'react';

const CELL_SIZE_W = 50;
const CELL_SIZE_H = CELL_SIZE_W;

export default function TablaPeriodica({ properties }:{properties:any}) {
  const {
    color, log, invert, colorNumber, temp, handleClick,
  } = properties;
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={CELL_SIZE_W * 18} height={CELL_SIZE_H * 11}>
      {Object.values(elementosTabla).map((el) => (
        <ElementoPeriodico
          colorMode={color}
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
    </svg>

  );
}
