import Select from 'components/Select';
import TablaPeriodica from 'components/TablaPeriodica';
import React, { ChangeEvent, MouseEvent, useState } from 'react';
import general from 'info/general.json';
import elementosTabla from 'info/tablaPeriodica.json';
import ElementDetails from 'components/ElementDetails';
import './TablaEditor.css';

const defaultElement:keyof typeof elementosTabla|undefined = undefined;

const isElement = (elem:string): elem is keyof typeof elementosTabla => (
  Object.keys(elementosTabla).includes(elem)
);

export default function TablaEditor() {
  const [element, changeElement] = useState(defaultElement);
  const handleClick = (event:MouseEvent<SVGElement>) => {
    const { id } = event.currentTarget;
    if (isElement(id)) changeElement(id);
  };
  const [properties, setProperties] = useState(
    {
      color: general.colorModes[0],
      invert: false,
      log: false,
      colorNumber: Math.trunc(Math.random() * 360),
      temp: 293,
      handleClick,
    },
  );
  const handleChange = (event:ChangeEvent<any>) => {
    const {
      value, id, checked, type,
    } = event.target;
    let result = value;
    if (type === 'checkbox') result = checked;
    setProperties({ ...properties, [id]: result });
  };
  if (element !== undefined) {
    return (
      <ElementDetails
        goBack={() => changeElement(undefined)}
        elementData={elementosTabla[element]}
      />
    );
  }
  return (
    <div>
      <TablaPeriodica properties={properties} />
      <div>Color Mode</div>
      <Select id="color" onChange={handleChange} options={general.colorModes} value={properties.color} />
      Invertir
      <input type="checkbox" onChange={handleChange} id="invert" value={properties.invert ? 'on' : undefined} />
      Logaritmo
      <input type="checkbox" onChange={handleChange} id="log" checked={properties.log} />
      Color
      <input className="range" type="range" onChange={handleChange} id="colorNumber" min="0" step="1" max="360" value={properties.colorNumber} />
      <span>
        {`${properties.colorNumber} grados`}
      </span>
      <input className="range" type="range" onChange={handleChange} id="temp" min="0" step="1" max="6500" value={properties.temp} />
      <span>
        {properties.temp}
        {' '}
        K
      </span>
      <div style={{
        background: `linear-gradient(to right, white 0%, 
                        hsl(${properties.colorNumber} 50% 80%) 25%, 
                        hsl(${properties.colorNumber} 50% 60%) 50%,
                        hsl(${properties.colorNumber} 50% 40%) 75%,
                        hsl(${properties.colorNumber} 50% 20%) 100%)`,
        width: '500px',
        height: '20px',
      }}
      />
    </div>
  );
}
