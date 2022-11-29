import React from 'react';
import { io, Socket } from 'socket.io-client';
import Toast from './toast';
import { getUid } from './uniqueId';

let socket:Socket;
export const getSocket = () => socket;

export const disconnectSocket = () => socket && socket.disconnect();

export const getFromSocket = (listener:string, ...params:any[]) => new Promise<any>((res) => {
  const listenerFn = (...args:any[]) => {
    if (args.length === 1) res(args[0]);
    else if (args.length === 0) res(undefined);
    else res(args);
    socket.off(listener, listenerFn);
  };
  socket.on(listener, listenerFn);
  socket.emit(listener, ...params);
});

// more secure
export const getFromSocketUID = (listener:string, ...params:any[]) => new Promise<any>((res) => {
  const clientUID = getUid();
  const listenerFn = (...args:any[]) => {
    if (args.length === 1) res(args[0]);
    else if (args.length === 0) res(undefined);
    else res(args);
    socket.off(listener, listenerFn);
  };
  socket.on(`${listener}:${clientUID}`, listenerFn);
  socket.emit(listener, clientUID, ...params);
});

export const eventListenerSocket = (listener:string, cb:(...params: any[]) => any) => {
  const callback = (...params: any[]) => cb(...params);
  socket.on(listener, callback);
  return () => socket.off(listener, callback);
};

export const eventListUsers = (cb:Function) => {
  const clientUID = getUid();
  const callback = (...params: any[]) => cb(...params);
  socket.on(`allUsersData:${clientUID}`, callback);
  socket.emit('allUsersData', clientUID);
  return () => {
    socket.emit(`disconnect:${clientUID}`);
    socket.off(`allUsersData:${clientUID}`, callback);
  };
};

const SERVER_PATH = process.env.REACT_APP_SERVER ?? '';

export const createSocket = (
  tokenId:string,
  setLoading:React.Dispatch<React.SetStateAction<boolean>>,
) => new Promise((res, rej) => {
  socket = io(SERVER_PATH, { auth: { tokenId }, transports: ['websocket'] });
  let tries = 0;
  let timeout: number | undefined;
  let timeout2: number | undefined;
  let startConection: number;
  socket.on('connect', () => {
    startConection = Date.now();
    res(socket.id);
    clearTimeout(timeout2);
    setLoading(false);
  });
  socket.on('connect_error', () => {
    rej();
  });
  socket.on('disconnect', (reason) => {
    timeout2 = window.setTimeout(() => setLoading(true), 500);
    Toast.addMsg('Se ha desconectado del servidor', 3000);
    if (reason === 'io server disconnect'
    // || reason === 'io client disconnect'
    ) {
      if (Date.now() - (startConection ?? Infinity) >= 2 * 3600 * 1000) {
        return window.location.reload();
      }
      clearTimeout(timeout);
      timeout = window.setTimeout(() => { tries = 0; }, 5000);
      tries++;
      if (tries === 4) return window.location.reload();
      setTimeout(() => socket.connect(), 1000);
    }
    return undefined;
  });
  socket.on('admin:reload', () => window.location.reload());
});

type Cache = {[key:string]: any}
type Timers = {[key:string]: number};
type Listeners = {[key:string]: boolean};
type LastSet = {[key:string]: any};
const onValueGenerator = () => {
  const lastSave:Cache = {};
  const lastSet:LastSet = {};
  const timers:Timers = {};
  const listeners:Listeners = {};
  const setValueSocket = (path:string, value:any, timer = 10000) => {
    clearTimeout(timers[path]);
    timers[path] = window.setTimeout(() => {
      if (JSON.stringify(lastSave[path]) !== JSON.stringify(value)) socket.emit(path, value);
      else {
        const event = new CustomEvent(`saved:${path}`, { detail: value });
        document.dispatchEvent(event);
      }
    }, timer);
    lastSet[path] = value;
    if (listeners[path]) return value;
    socket.on(path, (val) => {
      lastSave[path] = val;
      if (JSON.stringify(lastSave[path]) === JSON.stringify(lastSet[path])) {
        const event = new CustomEvent(`saved:${path}`, { detail: val });
        document.dispatchEvent(event);
      }
    });
    listeners[path] = true;
    return value;
  };
  return { setValueSocket };
};

export const { setValueSocket } = onValueGenerator();

export const listenEditorFrasesCuriosas = (
  setter:React.Dispatch<React.SetStateAction<{[k:string]:string}|undefined>>,
) => eventListenerSocket(
  'datosCuriosos:editing',
  setter,
);
