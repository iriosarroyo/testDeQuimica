/* eslint-disable no-redeclare */
import React, { useEffect, useState } from 'react';

type CbAsync<T, R> = (
    result:T,
     setter:React.Dispatch<React.SetStateAction<R|null>>) => void

export function useAsync<T>(promise:Promise<T>, effects:any[], cb:CbAsync<T, T>):
     [T, React.Dispatch<React.SetStateAction<T|null>>];
export function useAsync<T, R>(promise:Promise<T>, effects:any[], cb:CbAsync<T, R>):
[R, React.Dispatch<React.SetStateAction<R|null>>];

export function useAsync<T>(
  promise: Promise<T>,
  effects:any[] = [],
  cb: CbAsync<T, T> = (
    res:T,
    set,
  ) => { set(res); },
) {
  const [value, setValue] = useState<T|null>(null);
  useEffect(() => {
    promise.then((res) => cb(res, setValue));
  }, effects);
  return [value, setValue];
}

export function useEvent<T>(
  onEvent:(set:React.Dispatch<React.SetStateAction<T|undefined>>) => () => any,
  effects:any[] = [],
):[T|undefined, React.Dispatch<React.SetStateAction<T|undefined>>] {
  const [value, setValue] = useState<T|undefined>(undefined);
  useEffect(() => onEvent(setValue), effects);
  return [value, setValue];
}

export function useDOMEvent(ev:string, cb:(e:Event) => any, effects = []) {
  return useEvent(() => {
    document.addEventListener(ev, cb);
    return () => document.removeEventListener(ev, cb);
  }, effects);
}
