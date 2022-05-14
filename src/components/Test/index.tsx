import {
  faAngleLeft, faAngleRight, faCalculator, faTable,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from 'components/Button';
import Constantes from 'components/Constantes';
import Pregunta from 'components/Pregunta';
import TablaPeriodica from 'components/TablaPeriodica';
import FrontContext from 'contexts/Front';
import setFooter from 'hooks/setFooter';
import React, {
  useEffect, useRef, useState,
  RefObject,
  useContext,
} from 'react';

import { setMultiplePregsByIds } from 'services/database';
import { createIntersectionObserver } from 'services/elemenstInViewPort';
import { time2String } from 'services/time';
import { PreguntaTestDeQuimica } from 'types/interfaces';
import './Test.css';

const REFRESH_TIMER = 500; // msec
const timer = (initial:number, changeTime:Function) => {
  const start = Date.now() + initial;
  const interval = () => {
    const timePassed = start - Date.now();
    changeTime(timePassed);
    setTimeout(interval, REFRESH_TIMER);
  };
  interval();
};

function Temporizador({ initial }:{initial:number}) {
  const [time, setTime] = useState(initial);
  const [timeString, dateTime] = time2String(time);

  useEffect(() => {
    timer(time, setTime);
  }, []);

  return <time className={`testBarObject ${time < 10000 && 'noTimeLeft'}`} dateTime={dateTime}>{timeString}</time>;
}

function Cuadrado({
  preg, setActive, inView, idx, pregHTML, setOffset,
}:{
    preg:PreguntaTestDeQuimica,
    idx: number,
    setActive:(i:number)=>void,
    inView:boolean,
    pregHTML: HTMLDivElement | undefined
    setOffset: Function
  }) {
  const { answer } = preg;
  let className = 'testCuadrado';
  if (answer) className += ' answeredCuadrado';
  if (inView) className += ' activeCuadrado';
  const handleClick = () => {
    if (pregHTML) pregHTML.scrollIntoView({ behavior: 'smooth' });
    setActive(idx);
    setOffset(0);
  };
  return <Button className={className} onClick={handleClick}>{idx + 1}</Button>;
}

const LIMIT = 9;
let startGlobal = 0;

function CuadradoGroup({
  preguntas, inView, refs, setActive, max, min,
}:{preguntas:PreguntaTestDeQuimica[],
  inView: {[key:string]:boolean},
  refs: RefObject<HTMLDivElement[]>
  setActive:(idx:number)=>void, max:number, min:number, }) {
  const [offset, setOffset] = useState(0);
  const inicio = min - Math.trunc((LIMIT - (max - min)) / 2) + offset * LIMIT;
  let start = Math.max(Math.min(Math.max(inicio, 0), preguntas.length - LIMIT - 1), 0);
  if (!Number.isFinite(start)) start = startGlobal;
  startGlobal = start;
  const end = start + LIMIT + 1;
  return (
    <div className="testNavegacion">
      {start > 0
        ? (
          <Button className="testDobleCuadrado offsetleft" onClick={() => setOffset(offset - 1)}>
            <FontAwesomeIcon icon={faAngleLeft} />
          </Button>
        ) : null}
      <div className="testCuadradosContainer">
        {preguntas.slice(start, end).map((preg, idx) => (
          <Cuadrado
            preg={preg}
            key={preg.id}
            idx={idx + start}
            pregHTML={refs.current?.[idx + start]}
            inView={inView[preg.id]}
            setActive={setActive}
            setOffset={setOffset}
          />
        ))}
      </div>
      { end < preguntas.length
        ? (
          <Button className="testDobleCuadrado offsetright" onClick={() => setOffset(offset + 1)}>
            <FontAwesomeIcon icon={faAngleRight} />
          </Button>
        ) : null}
    </div>
  );
}

let inViewGlobal:{[key:string]:boolean};
function TestFooter({
  preguntas, setActive, thisRef, refs, active, unaPorUna,
}:
  {preguntas:PreguntaTestDeQuimica[],
  thisRef:RefObject<HTMLDivElement>,
  refs: RefObject<HTMLDivElement[]>,
   setActive:(idx:number)=>void,
   active:number,
   unaPorUna: boolean,
  }) {
  const [observer, setObserver] = useState<IntersectionObserver|undefined>(undefined);
  const [inView, setInView] = useState<{[key:string]:boolean}>({});
  inViewGlobal = inView;
  const displayedQuestions = preguntas
    .map((preg, idx) => [idx, preg])
    .filter(([, preg]) => typeof preg !== 'number' && inView[preg.id])
    .map(([idx]) => (typeof idx === 'number' ? idx : 0));
  const firstDisplayed = Math.min(...displayedQuestions);
  const lastDisplayed = Math.max(...displayedQuestions);

  const goToSiguiente = () => {
    if (!unaPorUna) refs.current?.[firstDisplayed + 1].scrollIntoView({ behavior: 'smooth' });
    else setActive(Math.min(active + 1, preguntas.length - 1));
  };
  // eslint-disable-next-line no-undef
  const observerCb:IntersectionObserverCallback = (entries) => {
    if (unaPorUna) inViewGlobal = {};
    const viewIds = entries.reduce((acum, x) => ({ ...acum, [x.target.id]: x.isIntersecting }), {});
    setInView({ ...inViewGlobal, ...viewIds });
  };
  useEffect(() => {
    if (!thisRef || !thisRef.current) return undefined;
    if (observer) observer.disconnect();
    setObserver(createIntersectionObserver(thisRef.current, observerCb));
    return () => observer?.disconnect();
  }, [thisRef, unaPorUna]);

  useEffect(() => {
    if (!observer) return undefined;
    if (refs && refs.current) {
      refs.current.forEach((ref) => {
        if (!ref) return;
        observer.unobserve(ref);
        observer.observe(ref);
      });
    }
    return () => observer.disconnect();
  }, [observer, refs, refs.current, active, unaPorUna]);
  return (
    <div>
      <CuadradoGroup
        inView={inView}
        max={lastDisplayed}
        min={firstDisplayed}
        preguntas={preguntas}
        refs={refs}
        setActive={setActive}
      />
      <div>
        <Button className="testButtonFooter">Corregir</Button>
        <Button className="testButtonFooter" onClick={goToSiguiente}>Siguiente</Button>
      </div>
    </div>
  );
}

function HeaderTest() {
  const setFront = useContext(FrontContext);
  const setConstantes = () => setFront({ elem: <Constantes />, cb: () => {} });
  const setTabla = () => setFront({ elem: <TablaPeriodica properties={{ color: 'phases', temp: 293 }} />, cb: () => {} });
  return (
    <section className="testBar">
      <div className="testBarGroup">
        <div className="testBarChild">
          <Button className="testBarObject" onClick={setConstantes}>
            <FontAwesomeIcon icon={faCalculator} />
            Constantes
          </Button>
        </div>

        <div className="testBarChild">
          <Button className="testBarObject" onClick={setTabla}>
            <FontAwesomeIcon icon={faTable} />
            Tabla Periódica
          </Button>
        </div>
      </div>
      <div className="testBarGroup">
        <div className="testBarChild">
          <Temporizador initial={15 * 60 * 1000} />
        </div>
        <div className="testBarChild">
          <div className="testBarObject">9,34 puntos</div>
        </div>
      </div>
    </section>
  );
}

export default function Test({ ids, unaPorUna }:{ids?:Set<string>, unaPorUna:boolean}) {
  const [preguntas, setPreguntas] = useState<PreguntaTestDeQuimica[]>([]);
  const [active, setActive] = useState<number>(0);
  const childrenRef = useRef<HTMLDivElement[]>([]);
  const thisRef = useRef<HTMLDivElement>(null);
  const setValue = (value:string, idx:number) => {
    const newPreguntas = preguntas.slice();
    newPreguntas[idx] = { ...newPreguntas[idx], answer: value };
    setPreguntas(newPreguntas);
  };
  setFooter(
    <TestFooter
      preguntas={preguntas}
      setActive={setActive}
      refs={childrenRef}
      thisRef={thisRef}
      active={active}
      unaPorUna={!!unaPorUna}
    />,
    [preguntas, thisRef, childrenRef.current, active, unaPorUna],
  );

  useEffect(() => {
    setMultiplePregsByIds(setPreguntas, ids ?? new Set<string>());
  }, [ids]);

  useEffect(() => {
    childrenRef.current = childrenRef.current.slice(0, preguntas.length);
  }, [preguntas]);
  const activeId = preguntas[active]?.id;
  return (
    <div className="test" ref={thisRef}>
      <HeaderTest />
      <section className="testPreguntasContainer">
        {
          preguntas.map((preg, idx) => (
            !unaPorUna || preg.id === activeId
              ? (
                <Pregunta
                  idx={idx}
                  myRef={(el:HTMLDivElement) => { childrenRef.current[idx] = el; }}
                  key={preg.id}
                  objPreg={preg}
                  setValue={setValue}
                />
              ) : null
          ))
        }
      </section>
    </div>
  );
}

Test.defaultProps = {
  ids: new Set([
    'id0001',
    'id0111',
    'id0222',
    'id0333',
    'id0444',
    'id0005',
    'id0115',
    'id0225',
    'id0335',
    'id0445',
    'id0051',
    'id0151',
    'id0252',
    'id0353',
    'id0454',
    'id0501',
    'id0511',
    'id0522',
    'id0533',
    'id0544',
    'id0006',
    'id0116',
    'id0226',
    'id0336',
    'id0446',
    'id0061',
    'id0661',
    'id0161',
    'id0661',
    'id0262',
    'id0662',
    'id0363',
    'id0663',
    'id0464',
    'id0664',
  ]),
};
