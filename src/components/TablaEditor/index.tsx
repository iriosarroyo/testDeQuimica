import Select from 'components/Select';
import TablaPeriodica from 'components/TablaPeriodica';
import React, {
  ChangeEvent, ChangeEventHandler, MouseEvent, useContext, useEffect, useRef, useState,
} from 'react';
import minMax from 'info/maxAndMinTabla.json';
import elementosTabla from 'info/tablaPeriodica.json';
import general from 'info/general.json';
import ElementDetails from 'components/ElementDetails';
import './TablaEditor.css';
import Button from 'components/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheckSquare,
  faPalette,
  faPauseCircle,
  faPlayCircle,
  faThermometerEmpty,
  faThermometerFull,
  faThermometerHalf,
  faThermometerQuarter,
  faThermometerThreeQuarters,
} from '@fortawesome/free-solid-svg-icons';
import { inverseLogInterpolation, logarithmicInterpolation } from 'services/interpolation';
import { faSquare } from '@fortawesome/free-regular-svg-icons';
import FrontContext from 'contexts/Front';

const {
  translations,
}:{ translations:{[key:string]:{default:string, [key:string]:string}}} = general;

const MAX_TEMP = 6500;
const colorModes = [
  { value: 'phases', text: translations.phases.default },
  { value: 'category', text: translations.category.default },
  { value: 'cpk', text: translations.cpk.default },
  ...Object.keys(minMax)
    .map((value) => ({ value, text: translations[value].default }))
    .sort((a, b) => a.text.localeCompare(b.text)),
];
const filteredColorsEntries = Object.entries(minMax).filter(([, x]) => !('min' in x));
const colorsModesWithSub = filteredColorsEntries.map(([key]) => key);
const subColorModes = Object.fromEntries(filteredColorsEntries
  .map(([key, x]) => [key, Object.keys(x)
    .map((value) => ({
      value,
      text: translations[key][value.replace(/[0-9]+/, 'index')].replace('$index', `${parseInt(value, 10) + 1}`),
    }))
    .sort((a, b) => Number(key === 'ionization_energies') || a.text.localeCompare(b.text))]));

function ThermometerIcon({ temp }:{temp:number}) {
  const t = Math.round(temp);
  if (t < 100) return <FontAwesomeIcon icon={faThermometerEmpty} />;
  if (t < 273) return <FontAwesomeIcon icon={faThermometerQuarter} />;
  if (t < 600) return <FontAwesomeIcon icon={faThermometerHalf} />;
  if (t < 1000) return <FontAwesomeIcon icon={faThermometerThreeQuarters} />;
  return <FontAwesomeIcon icon={faThermometerFull} />;
}

function Temperatura({ height }:{height:number}) {
  const MAX_HEIGHT = 175;
  const MIN_HEIGHT = 7;
  return (
    <svg
      version="1.0"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 40 215"
      width="40px"
      height="215px"
    >
      <g strokeWidth="1" fill="rgb(182, 23, 23)" stroke="black">
        <rect id="backTerm" fill="#bbb" x="15" y="5" width="10" height="195" rx="5" ry="5" />
        <ellipse id="circuloTerm" cx="20" cy="195" rx="15" ry="15" />
        <rect
          strokeWidth={0}
          x="17"
          y={MAX_HEIGHT - MIN_HEIGHT - height + 10}
          width="6"
          height={height + MIN_HEIGHT}
          rx="3"
          ry="3"
        />
      </g>
    </svg>
  );
}

const getColorData = (
  elem:HTMLElement,
  offsetX:number,
  offsetY:number,
  hueInRadians?:number,
) => {
  const { width, height } = window.getComputedStyle(elem);
  const clientWidth = parseInt(width, 10);
  const clientHeight = parseInt(height, 10);
  const selector:HTMLDivElement = elem.querySelector('.selector') as HTMLDivElement;
  const selectorRadius = parseInt(window.getComputedStyle(selector).width, 10) * 0.5;
  const angleContainer:HTMLDivElement = elem.querySelector('.angle') as HTMLDivElement;
  const angleRadius = parseInt(window.getComputedStyle(angleContainer).width, 10) * 0.5;
  // (clientWidth * 0.5 - angleRadius) *0.5 + angleRadius
  const radius = clientWidth * 0.25 + angleRadius * 0.5;
  let angle = Number.isNaN(hueInRadians) ? 0 : hueInRadians;
  if (angle === undefined) {
    const x = offsetX - clientWidth * 0.5;
    const y = -offsetY + clientHeight * 0.5;
    angle = Math.atan(x / y);
    if (Number.isNaN(angle)) angle = 0;

    if (x >= 0 && y < 0) angle += Math.PI;
    else if (x < 0 && y >= 0) angle += 2 * Math.PI;
    else if (x < 0 && y < 0) angle += Math.PI;
  }
  const angleDegree = (Math.round((180 * angle) / Math.PI) + 360) % 360;
  const returnedX = Math.sin(angle) * radius + clientWidth * 0.5 - selectorRadius;
  const returnedY = -Math.cos(angle) * radius + clientHeight * 0.5 - selectorRadius;
  return { hue: angleDegree, x: `${returnedX}px`, y: `${returnedY}px` };
};

const handleClickColor = (e:MouseEvent<HTMLButtonElement>, setColorData:Function) => {
  const target = e.nativeEvent.target as HTMLElement;
  if (target?.tagName === 'INPUT' || target?.closest('.angle') !== null) return;
  const { left, top } = e.currentTarget.getBoundingClientRect();
  const { clientX, clientY } = e;
  const colorData = getColorData(e.currentTarget, clientX - left, clientY - top);
  setColorData(colorData);
};

const getHeightTemperature = (
  elem:HTMLElement,
  offset:number,
  maxTemp:number,
  temp?:number,
) => {
  const nonNaNTemp = Number.isNaN(temp) ? 0 : temp;
  const circle = elem.querySelector('ellipse#circuloTerm') as SVGEllipseElement;
  const yCircle = circle.cy.baseVal.value - circle.ry.baseVal.value;
  const bgRect = elem.querySelector('rect#backTerm') as SVGRectElement;
  const maxHeight = yCircle - bgRect.y.baseVal.value - 7;
  const y = yCircle - offset;
  const h = nonNaNTemp === undefined ? Math.max(Math.min(y, maxHeight), 0)
    : logarithmicInterpolation(nonNaNTemp, 0, MAX_TEMP, 0, maxHeight, 10);
  const T = nonNaNTemp === undefined ? inverseLogInterpolation(h, 0, maxHeight, 0, maxTemp, 100)
    : (maxTemp + nonNaNTemp) % maxTemp;
  return { h, T };
};

const handleClickTemperature = (e:MouseEvent<HTMLButtonElement>, setTempData:Function) => {
  const target = e.nativeEvent.target as HTMLElement;
  if (target?.tagName === 'INPUT' || target?.closest('.angle') !== null) return;
  const { top } = e.currentTarget.getBoundingClientRect();
  const { clientY } = e;
  const offset = clientY - top;
  setTempData(getHeightTemperature(e.currentTarget, offset, MAX_TEMP));
};

const handleChangeTemperature = (
  e:ChangeEvent<HTMLInputElement>,
  setTempData:Function,
  ref:React.MutableRefObject<any>,
) => {
  const { value } = e.currentTarget;
  const tempData = getHeightTemperature(
    (ref.current ?? null) as HTMLElement,
    0,
    MAX_TEMP,
    parseInt(value, 10),
  );
  setTempData(tempData);
};
const handleChangeColor = (e:ChangeEvent<HTMLInputElement>, setColorData:Function) => {
  const { value, parentElement } = e.currentTarget;
  const colorData = getColorData(
    parentElement?.parentElement as HTMLElement,
    0,
    0,
    (parseInt(value, 10) * Math.PI) / 180,
  );
  setColorData(colorData);
};

const isElement = (elem:string): elem is keyof typeof elementosTabla => (
  Object.keys(elementosTabla).includes(elem)
);

function TablaPederiodicaHeader({
  handleChange,
  properties,
  setAnimate,
  animate,
  setAnimateTemp,
  animateTemp,
  nextref,
  nextref2,
  hue,
  colorData,
  setColorData,
  tempData,
  setTempData,
}:{
  handleChange:ChangeEventHandler<any>,
  properties:{
    color: string;
    subColor: string | undefined;
    invert: boolean;
    log: boolean;
    temp: number;
    handleClick: (event: MouseEvent<SVGElement>) => void;
  },
  nextref:React.MutableRefObject<undefined>,
  nextref2:React.MutableRefObject<undefined>,
  hue:number,
  setAnimate: Function,
  animate:boolean,
  setAnimateTemp: Function,
  animateTemp:boolean,
  colorData:{hue:number, x:string, y:string},
  setColorData:React.Dispatch<React.SetStateAction<{
    hue: number,
    x: string,
    y: string}>>,
  tempData:{h:number, T:number}
  setTempData:React.Dispatch<React.SetStateAction<{h:number, T:number}>>,
}) {
  const [displayColorPicker, setDisplayColorPicker] = useState<boolean>(false);
  const [displayTemperatura, setDisplayTemperatura] = useState<boolean>(false);
  return (
    <header className="tablaPeriodicaHeader">
      <div className="tablaHeadergroup1">
        <div className="modoTitle">Modo de color</div>
        <Select id="color" className="modoDesplegable1" onChange={handleChange} options={colorModes} value={properties.color} />
        { colorsModesWithSub.includes(properties.color)
        && (
        <Select
          id="subColor"
          className="modoDesplegable2"
          onChange={handleChange}
          options={subColorModes[properties.color]}
          value={properties.subColor ?? ''}
        />
        )}
        {properties.color !== 'phases' && properties.color !== 'cpk' && properties.color !== 'category'
        && (
          <>
            <label htmlFor="invert" className="modoInvertir">
              <input type="checkbox" onChange={handleChange} id="invert" checked={properties.invert} hidden />
              {properties.invert
                ? <FontAwesomeIcon icon={faCheckSquare} />
                : <FontAwesomeIcon icon={faSquare} />}
              Invertir
            </label>
            <label htmlFor="log" className="modoLogaritmo">
              <input type="checkbox" onChange={handleChange} id="log" checked={properties.log} hidden />
              {properties.log
                ? <FontAwesomeIcon icon={faCheckSquare} />
                : <FontAwesomeIcon icon={faSquare} />}
              Logaritmo
            </label>
          </>
        )}
      </div>
      {properties.color !== 'phases' && properties.color !== 'cpk' && properties.color !== 'category'
        && (
          <div className="tablaHeadergroup2">
            <Button
              id="dropdownColorButton"
              className={displayColorPicker ? 'displayedColorPicker' : undefined}
              onClick={() => setDisplayColorPicker(!displayColorPicker)}
            >
              <FontAwesomeIcon icon={faPalette} style={{ color: `hsl(${hue},50% ,50%)` }} />
            </Button>
            <div className="colorPickerContainer">
              <Button
                nextref={nextref}
                onClick={(e:MouseEvent<HTMLButtonElement>) => handleClickColor(e, setColorData)}
                className="colorPicker"
              >
                <div className="selector" style={{ top: colorData.y, left: colorData.x }} />
                <div className="angle">
                  <input
                    type="number"
                    value={`${hue}`}
                    min="-360"
                    step="1"
                    max="360"
                    onChange={(e:ChangeEvent<HTMLInputElement>) => (
                      handleChangeColor(e, setColorData))}
                  />
                  <label htmlFor="animate" className={`playPauseButton ${animate ? 'pause' : 'play'}`}>
                    { animate
                      ? <FontAwesomeIcon icon={faPauseCircle} />
                      : <FontAwesomeIcon icon={faPlayCircle} />}
                  </label>
                  <input
                    type="checkbox"
                    checked={animate}
                    id="animate"
                    onChange={() => setAnimate(!animate)}
                    hidden
                  />
                </div>
              </Button>
            </div>
          </div>
        )}
      { properties.color === 'phases'
        && (
        <div className="tablaHeadergroup2">
          <Button
            id="dropdownTempButton"
            className={displayTemperatura ? 'displayedTemperature' : undefined}
            onClick={() => setDisplayTemperatura(!displayTemperatura)}
          >
            <ThermometerIcon temp={tempData.T} />
          </Button>
          <div className="temperatureContainer">
            <Button
              nextref={nextref2}
              onClick={(e) => handleClickTemperature(e, setTempData)}
              className="temperaturePicker"
            >
              <Temperatura height={tempData.h} />
            </Button>
            <div>
              <input
                type="number"
                min={-1}
                max={MAX_TEMP + 1}
                value={`${Math.round(tempData.T)}`}
                onChange={(e) => handleChangeTemperature(e, setTempData, nextref2)}
              />
              <label htmlFor="animateTemp" className={`playPauseButton ${animateTemp ? 'pause' : 'play'}`}>
                { animateTemp
                  ? <FontAwesomeIcon icon={faPauseCircle} />
                  : <FontAwesomeIcon icon={faPlayCircle} />}
              </label>
              <input
                type="checkbox"
                checked={animateTemp}
                id="animateTemp"
                onChange={() => setAnimateTemp(!animateTemp)}
                hidden
              />
            </div>
          </div>
        </div>
        )}
    </header>
  );
}

export default function TablaEditor() {
  const setFront = useContext(FrontContext);
  const [animate, setAnimate] = useState<boolean>(false);
  const [animateTemp, setAnimateTemp] = useState<boolean>(false);
  const changeElement = (element:keyof typeof elementosTabla) => setFront({
    elem: <ElementDetails
      elementData={elementosTabla[element]}
    />,
    cb: () => {},
  });

  const handleClick = (event:MouseEvent<SVGElement>) => {
    const { id } = event.currentTarget;
    if (isElement(id)) changeElement(id);
  };
  const [colorData, setColorData] = useState<{hue:number, x:string, y:string}>({
    hue: NaN,
    x: '95px',
    y: '20px',
  });
  const [tempData, setTempData] = useState<{h:number, T:number}>({ T: NaN, h: 0 });
  const ref = useRef();
  const ref2 = useRef();
  const { hue } = colorData;
  useEffect(() => {
    if (animate) {
      const timeout = setTimeout(() => {
        const radianHue = ((hue + 1) * Math.PI) / 180;
        if (ref.current) setColorData(getColorData(ref.current, 0, 0, radianHue));
      }, 50);
      return () => { clearTimeout(timeout); };
    }
    return () => {};
  }, [animate, hue]);
  useEffect(() => {
    if (animateTemp) {
      const timeout = setTimeout(() => {
        if (ref2.current) {
          setTempData(getHeightTemperature(ref2.current, 0, MAX_TEMP, tempData.T + 20));
        }
      }, 50);
      return () => { clearTimeout(timeout); };
    }
    return () => {};
  }, [animateTemp, tempData.T]);
  const [properties, setProperties] = useState<{
    color: string;
    subColor: string | undefined;
    invert: boolean;
    log: boolean;
    temp: number;
    handleClick:(event: MouseEvent<SVGElement>) => void;
      }>(
      {
        color: colorModes[0].value,
        subColor: undefined,
        invert: false,
        log: false,
        temp: 293,
        handleClick,
      });
  useEffect(() => {
    if (colorsModesWithSub.includes(properties.color)) {
      setProperties({ ...properties, subColor: subColorModes[properties.color][0].value });
    } else setProperties({ ...properties, subColor: undefined });
    setAnimate(false);
    setAnimateTemp(false);
  }, [properties.color]);
  useEffect(() => {
    if (ref.current && Number.isNaN(colorData.hue)) {
      const initHue = Math.random() * 2 * Math.PI;
      const { hue: nextHue, x, y } = getColorData(ref.current, 0, 0, initHue);
      setColorData({ hue: nextHue, x, y });
    }
  }, [ref, ref.current, properties.color]);
  useEffect(() => {
    if (ref2.current && Number.isNaN(tempData.T)) {
      setTempData(getHeightTemperature(ref2.current, 0, MAX_TEMP, 293)); // 20 ºC
    }
  }, [ref2, ref2.current, properties.color]);
  const handleChange = (event:ChangeEvent<any>) => {
    const {
      value, id, checked, type,
    } = event.target;
    let result = value;
    if (type === 'checkbox') result = checked;
    setProperties({ ...properties, [id]: result });
  };

  return (
    <div className="tablaPeriodicaEditor">
      <TablaPederiodicaHeader
        animate={animate}
        setAnimate={setAnimate}
        animateTemp={animateTemp}
        setAnimateTemp={setAnimateTemp}
        colorData={colorData}
        handleChange={handleChange}
        hue={hue}
        properties={properties}
        nextref={ref}
        nextref2={ref2}
        setColorData={setColorData}
        tempData={tempData}
        setTempData={setTempData}
      />
      <div className="tablaPeriodicaContainer">
        <TablaPeriodica properties={{ ...properties, colorNumber: hue, temp: tempData.T }} />
      </div>
    </div>
  );
}
