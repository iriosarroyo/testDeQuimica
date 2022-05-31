import {
  faAngleLeft, faAngleRight, faCalculator, faTable,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from 'components/Button';
import Constantes from 'components/Constantes';
import Pregunta from 'components/Pregunta';
import TablaPeriodica from 'components/TablaPeriodica';
import Temporizador, { Cronometro } from 'components/Temporizador';
import MyErrorContext from 'contexts/Error';
import FooterContext from 'contexts/Footer';
import FrontContext from 'contexts/Front';
import UserContext from 'contexts/User';
import setFooter from 'hooks/setFooter';
import React, {
  useEffect, useRef, useState,
  RefObject,
  useContext,
  useMemo,
} from 'react';

import {
  getAnswers, onValueDDBB, pushDDBB, readWithSetter, updateDDBB, writeDDBB, writeUserInfo,
} from 'services/database';
import { createIntersectionObserver } from 'services/elemenstInViewPort';
import { GrupoNoPermission } from 'services/errores';
import { Answer, PreguntaTestDeQuimica, userDDBB } from 'types/interfaces';
import './Test.css';

function Cuadrado({
  answer, setActive, inView, idx, pregHTML, setOffset, correcta, preventPrevious, corregido,
}:{
    idx: number,
    preventPrevious:boolean,
    setActive:(i:number)=>void,
    inView:boolean,
    pregHTML: HTMLDivElement | undefined
    setOffset: Function,
    answer:string|undefined,
    correcta:string,
    corregido:boolean,
  }) {
  let className = 'testCuadrado';
  if (answer && correcta === undefined) className += ' answeredCuadrado';
  if (inView) className += ' activeCuadrado';
  if (correcta !== undefined && answer === correcta) className += ' correctCuadrado';
  else if (correcta !== undefined && answer !== '') className += ' incorrectCuadrado';
  const handleClick = () => {
    if (preventPrevious && !corregido) return;
    if (pregHTML) pregHTML.scrollIntoView({ behavior: 'smooth' });
    setActive(idx);
    setOffset(0);
  };
  return <Button className={className} onClick={handleClick}>{idx + 1}</Button>;
}

const LIMIT = 9;
let startGlobal = 0;

function CuadradoGroup({
  preguntas, inView, refs, setActive, max, min, answers, corrAnswers, preventPrevious, corregido,
}:{preguntas:PreguntaTestDeQuimica[],
  inView: {[key:string]:boolean},
  refs: RefObject<HTMLDivElement[]>,
  corrAnswers:{[key:string]:string},
  preventPrevious:boolean, corregido: boolean,
  setActive:(idx:number)=>void, max:number, min:number, answers:{[k:string]:Answer|undefined} }) {
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
            answer={answers[preg.id]?.final ?? answers[preg.id]?.current}
            correcta={corrAnswers[preg.id]}
            key={preg.id}
            idx={idx + start}
            pregHTML={refs.current?.[idx + start]}
            inView={inView[preg.id]}
            setActive={setActive}
            setOffset={setOffset}
            preventPrevious={preventPrevious}
            corregido={corregido}
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

const eventNextAndBefore = (goNext:Function, goPrev: Function) => {
  const listener = (e:KeyboardEvent) => {
    if (e.key === 'ArrowRight') goNext();
    if (e.key === 'ArrowLeft') goPrev();
  };
  document.addEventListener('keydown', listener);
  return () => document.removeEventListener('keydown', listener);
};

const stateGoToSiguiente = () => {
  let goToSiguiente:Function = () => {};
  return {
    setStateSiguiente: (fn:Function) => { goToSiguiente = fn; },
    getStateSiguiente: () => goToSiguiente,
  };
};

const { setStateSiguiente, getStateSiguiente } = stateGoToSiguiente();

let inViewGlobal:{[key:string]:boolean};
function TestFooter({
  preguntas,
  setActive,
  onNext,
  showOnEnd,
  onEnd,
  thisRef, refs, active, unaPorUna, corregirExamen, answers, corrAnswers, corregido,
  preventPrevious, inBlanco, setValue,
}:
  {preguntas:PreguntaTestDeQuimica[],
  thisRef:RefObject<HTMLDivElement>,
  refs: RefObject<HTMLDivElement[]>,
   setActive:(idx:number)=>void,
   active:number,
   unaPorUna: boolean,
   corregirExamen:Function,
   answers:{[k:string]:Answer|undefined},
   corrAnswers:{[key:string]:string},
   corregido:boolean,
   preventPrevious:boolean,
   onNext:Function|undefined,
   showOnEnd:boolean,
  onEnd:Function,
  inBlanco:boolean,
  setValue:Function
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
    const lastId = preguntas[preguntas.length - 1]?.id;
    if (preventPrevious && preguntas.length > 0 && answers[lastId]?.current === undefined) {
      if (onNext) setValue(inBlanco ? '' : '', lastId);
      else if (active !== preguntas.length - 1) setValue('', preguntas[active].id);
    }
    if (!unaPorUna) refs.current?.[firstDisplayed + 1].scrollIntoView({ behavior: 'smooth' });
    else if (!onNext) setActive(Math.min(active + 1, preguntas.length - 1));
    else onNext(preguntas, active, setActive, corregido);
  };

  setStateSiguiente(goToSiguiente);

  useEffect(() => eventNextAndBefore(
    goToSiguiente,
    () => (preventPrevious && !corregido) || setActive(Math.max(active - 1, 0)),
  ));

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
        corrAnswers={corrAnswers}
        answers={answers}
        inView={inView}
        max={lastDisplayed}
        min={firstDisplayed}
        preguntas={preguntas}
        refs={refs}
        setActive={setActive}
        preventPrevious={preventPrevious}
        corregido={corregido}
      />

      <div>
        {
        corregido || preguntas.length === 0
          ? showOnEnd && <Button className="testButtonFooter" onClick={() => onEnd()}>Volver al grupo</Button>
          : <Button className="testButtonFooter" onClick={() => corregirExamen()}>Corregir</Button>
}
        <Button className="testButtonFooter" onClick={goToSiguiente}>Siguiente</Button>
      </div>
    </div>
  );
}

const stateTime = () => {
  let time:number;
  return {
    setStateTime: (t:number) => { time = t; },
    getStateTime: () => time,
  };
};

const { setStateTime, getStateTime } = stateTime();

function HeaderTest({
  time, startTime, corregir, corregido, value, showPunt, timerToSiguiente,
}:
  {time:number|undefined, timerToSiguiente:number|undefined,
    startTime:number, corregir:Function, corregido:boolean, value:string, showPunt:boolean}) {
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
          {
          time
            ? (
              <Temporizador
                alert
                className="testBarObject"
                final={time}
                format="hours"
                onEnd={timerToSiguiente !== undefined ? getStateSiguiente() : corregir}
                startAt={startTime}
                stateTime={setStateTime}
                restart={timerToSiguiente}
                stop={corregido}
              />
            )
            : <Cronometro className="testBarObject" startAt={startTime} stateTime={setStateTime} stop={corregido} />
        }
        </div>
        <div className="testBarChild">
          {(corregido || showPunt) && <div className="testBarObject">{value}</div>}
        </div>
      </div>
    </section>
  );
}

const addUserQuestions = () => {
  let ableToAdd = false;

  return {
    setAbleToAdd: () => { ableToAdd = true; },
    executeAddUser: (
      temas: userDDBB['temas'],
      preguntas:PreguntaTestDeQuimica[],
      answers:{[key:string]:Answer|undefined},
      corrAnswers:{[key:string]:string},
    ) => {
      if (!ableToAdd) return;
      const newTemas = JSON.parse(JSON.stringify(temas)); // Deep copy
      preguntas.forEach(({ nivelYTema, id }) => {
        const [tema, nivel] = nivelYTema.split('_');
        if (answers[id]?.current === '' || answers[id]?.current === undefined) newTemas[tema][`level${nivel}`].enBlanco += `${id};`;
        else if (answers[id]?.current === corrAnswers[id]) newTemas[tema][`level${nivel}`].aciertos += `${id};`;
        else newTemas[tema][`level${nivel}`].fallos += `${id};`;
      });
      console.log(newTemas, answers, corrAnswers);
      writeUserInfo(newTemas, 'temas');
      ableToAdd = false;
    },
  };
};

const { executeAddUser, setAbleToAdd } = addUserQuestions();

export default function Test({
  preguntas, unaPorUna, time, corregirOnClick, path, onNext, startTime = 0,
  onEnd = () => {}, showEndButton = false, puntType, notInBlanco = !false, showPunt = false,
  preventPrevious = false, timerToSiguiente,
}:
  {
    corregirOnClick?:boolean,
    notInBlanco?:boolean,
    onEnd?:Function,
    onNext?:Function,
    path:string,
    preguntas:PreguntaTestDeQuimica[],
    preventPrevious?:boolean,
    puntType?:'Puntos'|'Aciertos'|'Fallos'
    showEndButton?:boolean
    showPunt?:boolean,
    startTime?:number,
    time?:number|undefined,
    timerToSiguiente?:number,
    unaPorUna:boolean,
  }) {
  const setError = useContext(MyErrorContext);
  const { uid, userDDBB: user } = useContext(UserContext)!;
  const [answers, setAnswers] = useState<{[key:string]:Answer|undefined}>({});
  const [corrAnswers, setCorrAnswers] = useState<{[key:string]:string}>({});
  const [active, setActive] = useState<number>(0);
  const [corregido, setCorregido] = useState<boolean>(false);
  const childrenRef = useRef<HTMLDivElement[]>([]);
  const thisRef = useRef<HTMLDivElement>(null);
  const allCorrected = useMemo(
    () => preguntas.length > 0 && preguntas.every(({ id }) => corrAnswers[id] !== undefined),
    [corrAnswers, preguntas],
  );

  const calcPunt = useMemo(() => {
    const { aciertos: ac, fallos: fa } = Object.entries(corrAnswers)
      .reduce(({ fallos, aciertos }, [id, ans]) => {
        if (ans === answers[id]?.final) return { fallos, aciertos: aciertos + 1 };
        if (answers[id]?.final !== '') return { fallos: fallos + 1, aciertos };
        return { fallos, aciertos };
      }, { fallos: 0, aciertos: 0 });
    if (puntType === 'Aciertos') return ac;
    if (puntType === 'Fallos') return fa;
    return Math.round((ac - fa * 0.33) * 100) / 100;
  }, [corrAnswers]);

  const corregirExamen = () => {
    if (preguntas.length === 0) return undefined;
    const allSended = preguntas.every(({ id }) => answers[id]?.final !== undefined
    && answers[id]?.final !== null);
    if (corregido) return undefined;
    if (allSended) return setCorregido(true);
    const lastAnswers = preguntas.map(({ id }) => {
      const answer = answers[id] ?? { current: '' };
      return [id, { ...answer, final: answer.current === '' && notInBlanco ? 'notInBlanco' : answer.current }];
    });
    setAbleToAdd();
    const respondido = Object.fromEntries(lastAnswers);
    writeDDBB(`${path}/preguntas`, respondido);
    pushDDBB(`stats/${uid}/history`, {
      preguntas: respondido,
      time: getStateTime(),
      done: Date.now(),
      type: path.includes('room') ? 'Rooms' : 'Test de Hoy',
    });
    if (path.includes('room')) writeDDBB(`${path.replace(/activeTest/g, 'members')}/done`, true);
    return setCorregido(true);
  };

  useEffect(() => {
    if (!preventPrevious) return undefined;
    const numAnswers = Object.values(answers).length;
    console.log(numAnswers, answers);
    if (!onNext) return setActive(numAnswers);
    if (preguntas.length < numAnswers) onNext(preguntas, active, setActive, corregido);
    if (preguntas.length > 0 && preguntas.length === numAnswers && path.includes('room')) {
      readWithSetter(`${path.replace(/activeTest/g, 'members')}/done`, (val:boolean) => {
        if (val) setCorregido(true);
      });
    }
    return undefined;
  }, [preguntas]);

  const setValue = (value:string, id:string) => {
    const resp = { current: value };
    if (!corregirOnClick) return writeDDBB(`${path}/preguntas/${id}`, resp);
    const allButOneCorrected = preguntas.length > 0
    && preguntas.filter(({ id: thisId }) => corrAnswers[thisId] === undefined).length === 1;
    if (allButOneCorrected && !corregido && !onNext) return corregirExamen();
    return writeDDBB(`${path}/preguntas/${id}`, { ...resp, final: value });
  };

  if (allCorrected && !corregido && !onNext)corregirExamen();

  useEffect(() => {
    if (allCorrected) executeAddUser(user.temas, preguntas, answers, corrAnswers);
  }, [corrAnswers, corregido]);

  useEffect(() => { setStateTime(startTime); }, [time, startTime]);

  useEffect(() => {
    if (allCorrected || preguntas.length === 0 || corregido) return;
    updateDDBB(path, {
      time: getStateTime(),
    });
  }, [answers, active, preguntas]);

  useEffect(() => {
    const answersWithoutCorrect = Object.keys(answers)
      .filter((id) => answers[id]?.final !== undefined && corrAnswers[id] === undefined);
    getAnswers((val:{}) => {
      setCorrAnswers({ ...corrAnswers, ...val });
    }, answersWithoutCorrect);
  }, [answers]);

  useEffect(() => {
    if (path.includes('room')) writeDDBB(`${path.replace(/activeTest/g, 'members')}/value`, `${calcPunt} ${puntType}`);
  }, [corrAnswers]);

  setFooter(
    <TestFooter
      active={active}
      answers={answers}
      corrAnswers={corrAnswers}
      corregido={corregido}
      corregirExamen={corregirExamen}
      onEnd={onEnd}
      onNext={onNext}
      preguntas={preguntas}
      preventPrevious={preventPrevious}
      refs={childrenRef}
      setActive={setActive}
      showOnEnd={showEndButton}
      thisRef={thisRef}
      unaPorUna={!!unaPorUna}
      inBlanco={notInBlanco}
      setValue={setValue}
    />,
    [preguntas, thisRef, childrenRef.current, active, unaPorUna, answers, corregido,
      preventPrevious, corrAnswers, onNext, onEnd, showEndButton, notInBlanco],
  );
  const setHTMLFooter = useContext(FooterContext);
  useEffect(() => onValueDDBB(`${path}/preguntas`, (val:any) => setAnswers(val ?? {}), () => {
    setError(new GrupoNoPermission());
    if (path.includes('room')) writeUserInfo(null, 'room');
    setHTMLFooter(null);
  }), []);

  useEffect(() => {
    childrenRef.current = childrenRef.current.slice(0, preguntas.length);
  }, [preguntas]);
  const activeId = preguntas[active]?.id;
  return (
    <div className="test" ref={thisRef}>
      {preguntas.length === 0
      || (
      <HeaderTest
        time={time}
        startTime={startTime}
        corregir={corregirExamen}
        corregido={corregido}
        value={`${calcPunt} ${puntType}`}
        showPunt={showPunt}
        timerToSiguiente={timerToSiguiente}
      />
      )}
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
                  answer={answers[preg.id]?.current}
                  correctAnswer={corrAnswers[preg.id]}
                  notInBlanco={notInBlanco}
                />
              ) : null
          ))
        }
      </section>
    </div>
  );
}

Test.defaultProps = {
  time: undefined,
  startTime: 0,
  corregirOnClick: false,
  preventPrevious: false,
  onNext: undefined,
  onEnd: () => {},
  showEndButton: false,
  puntType: 'Puntos',
  notInBlanco: false,
  showPunt: false,
  timerToSiguiente: undefined,
};
