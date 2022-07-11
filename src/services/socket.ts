import { io, Socket } from 'socket.io-client';

let socket:Socket;
export const getSocket = () => socket;

export const disconnectSocket = () => socket && socket.disconnect();

export const getFromSocket = (listener:string, ...params:any[]) => new Promise((res) => {
  const listenerFn = (...args:any[]) => {
    if (args.length === 1) res(args[0]);
    else if (args.length === 0) res(undefined);
    else res(args);
    socket.off(listener, listenerFn);
  };
  socket.on(listener, listenerFn);
  socket.emit(listener, ...params);
});

const SERVER_PATH = /(localhost)|(192\.168\.)/.test(window.location.origin)
  ? window.location.origin.replace(':3000', ':3001')
  : 'https://testdequimicaserver.glitch.me';
export const createSocket = (tokenId:string) => {
  socket = io(SERVER_PATH, { auth: { tokenId } });
  return socket;
};

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
    }, timer);
    lastSet[path] = value;
    if (listeners[path]) return value;
    socket.on(path, (val) => {
      lastSave[path] = val;
      if (JSON.stringify(lastSave[path]) === JSON.stringify(lastSet[path])) {
        const event = new Event(`saved:${path}`);
        document.dispatchEvent(event);
      }
    });
    listeners[path] = true;
    return value;
  };
  return { setValueSocket };
};

export const { setValueSocket } = onValueGenerator();
