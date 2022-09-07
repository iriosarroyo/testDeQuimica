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

export const eventListenerSocket = (listener:string, cb:Function) => {
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

const SERVER_PATH = /(localhost)|(192\.168\.)/.test(window.location.origin)
  ? window.location.origin.replace(':3000', ':3001')
  : 'https://testdequimicaserver.glitch.me';

export const createSocket = (
  tokenId:string,
  setLoading:React.Dispatch<React.SetStateAction<boolean>>,
) => new Promise((res, rej) => {
  console.log('trying to connect');
  socket = io(SERVER_PATH, { auth: { tokenId }, transports: ['websocket'] });
  let tries = 0;
  let timeout: number | undefined;
  socket.on('connect', () => {
    res(socket.id);
    setLoading(false);
  });
  socket.on('connect_error', (...data) => {
    console.log(...data);
    rej();
  });
  socket.on('disconnect', (reason) => {
    setLoading(true);
    Toast.addMsg('Se ha desconectado del servidor', 3000);
    console.log('reason', reason);
    if (reason === 'io server disconnect'
    // || reason === 'io client disconnect'
    ) {
      clearTimeout(timeout);
      timeout = window.setTimeout(() => { tries = 0; }, 5000);
      tries++;
      if (tries === 4) return window.location.reload();
      setTimeout(() => socket.connect(), 1000);
    }
    return undefined;
  });
  const pleaseDisconnectMe = () => socket.emit('disconnectUser');
  console.log(pleaseDisconnectMe);
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
