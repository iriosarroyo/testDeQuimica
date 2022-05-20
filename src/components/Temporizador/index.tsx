import React, { useEffect, useMemo, useState } from 'react';
import { time2String } from 'services/time';

const stopState = () => {
  let stop = false;
  return {
    setStopState: (val:boolean) => { stop = val; },
    getStopState: () => stop,
  };
};

const { setStopState, getStopState } = stopState();

const REFRESH_TIMER = 300; // msec
const timer = (initial:number, changeTime:Function, restart:number|undefined) => {
  let start = Date.now() + initial;
  let timeout: number;
  const interval = () => {
    const timePassed = start - Date.now();
    changeTime(timePassed);
    if (getStopState()) return;
    if (timePassed < 0 && restart !== undefined) {
      start = Date.now() + restart;
    } else if (timePassed < 0) return;
    timeout = window.setTimeout(interval, REFRESH_TIMER);
  };
  interval();
  return () => clearTimeout(timeout);
};

const crono = (changeTime:Function, startAt:number = 0) => {
  const start = Date.now() - startAt;
  let timeout: number;
  const interval = () => {
    const timePassed = Date.now() - start;
    changeTime(timePassed);
    if (getStopState()) return;
    timeout = window.setTimeout(interval, REFRESH_TIMER);
  };
  interval();
  return () => clearTimeout(timeout);
};

export default function Temporizador({
  initial, className, alert, format, final, onEnd, startAt, stateTime, restart, stop = false,
}:
    {
      initial?:number,
      restart?:number
       className:string,
        alert:boolean,
        stop?:boolean,
         format:'hours'|'minutes'|'seconds', final?:number, onEnd?:Function, stateTime?:Function, startAt?:number}) {
  const inicio = useMemo(
    () => initial ?? ((final ?? Date.now() + 3000) - Date.now()),
    [final, initial],
  );
  const [time, setTime] = useState(inicio);
  const [fwTime, setFwTime] = useState(startAt);
  if (stateTime) stateTime(fwTime);
  const [timeString, dateTime] = time2String(time, format);
  useEffect(() => setStopState(stop), [stop]);
  useEffect(() => {
    if (onEnd && time < 0) onEnd();
  }, [time < 0]);
  useEffect(() => {
    const off1 = timer(inicio, setTime, restart);
    let off2 = () => {};
    if (stateTime && startAt !== undefined) off2 = crono(setFwTime, startAt);
    return () => ((off1(), off2()));
  }, [inicio, startAt, restart]);

  return <time className={`${className} ${alert && time < 10000 && 'noTimeLeft'}`} dateTime={dateTime}>{timeString}</time>;
}

Temporizador.defaultProps = {
  stateTime: undefined,
  startAt: undefined,
  initial: undefined,
  final: undefined,
  onEnd: undefined,
  restart: undefined,
  stop: false,
};

export function Cronometro({
  className, startAt, stateTime, stop,
}:
   { className: string, startAt:number, stateTime:Function, stop:boolean }) {
  const [time, setTime] = useState(startAt);
  const [timeString, dateTime] = time2String(time, 'hours');
  stateTime(time);
  useEffect(() => setStopState(stop), [stop]);
  useEffect(() => {
    crono(setTime, startAt);
  }, [startAt]);
  return <time className={className} dateTime={dateTime}>{timeString}</time>;
}
