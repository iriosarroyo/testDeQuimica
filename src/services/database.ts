import {
  equalTo,
  get,
  onChildAdded,
  onChildChanged,
  onValue, orderByChild, orderByKey, push, query, ref, remove, set, ThenableReference, update,
} from 'firebase/database';
import { PATHS_DDBB } from 'info/paths';
import React from 'react';
import { PreguntaTest } from 'types/interfaces';
import { auth, db } from './firebaseApp';
import { getFromSocketUID } from './socket';
import Toast from './toast';

export const readDDBB = async (path:string):Promise<[any, Error|undefined]> => {
  const thisRef = ref(db, path);
  try {
    const result = await get(thisRef).then((snap) => snap.val());
    return [result, undefined];
  } catch (e) {
    if (e instanceof Error) return [undefined, e];
    return [undefined, new Error()];
  }
};

export const onValueDDBB = (path:string, setter:Function, setError:Function) => {
  const thisRef = ref(db, path);
  return onValue(
    thisRef,
    (snap) => setter(snap.val()),
    (error) => { setError(error); },
  );
};

export const onChildAddedDDBB = (path:string, setter:Function, setError:Function) => {
  const thisRef = ref(db, path);
  return onChildAdded(thisRef, (snap) => setter(snap.val()), (error) => setError(error));
};

export const onChildChangedDDBB = (path:string, setter:Function, setError:Function) => {
  const thisRef = ref(db, path);
  return onChildChanged(thisRef, (snap) => setter(snap.val()), (error) => setError(error));
};

export const writeDDBB = async (path:string, value:any):Promise<Error|undefined> => {
  const thisRef = ref(db, path);
  try {
    await set(thisRef, value);
  } catch (e) {
    if (e instanceof Error) return e;
  }
  return undefined;
};

export const changeAllChildren = async (path:string, value:any) => {
  const thisRef = ref(db, path);
  try {
    (await get(thisRef)).forEach((child) => {
      update(child.ref, value);
    });
    return undefined;
  } catch (e) {
    return e;
  }
};

export const updateDDBB = async (path:string, value:any):Promise<Error|undefined> => {
  const thisRef = ref(db, path);
  try {
    await update(thisRef, value);
  } catch (e) {
    if (e instanceof Error) return e;
  }
  return undefined;
};

export const deleteDDBB = async (path:string):Promise<Error|undefined> => {
  const thisRef = ref(db, path);
  try {
    await remove(thisRef);
  } catch (e) {
    if (e instanceof Error) return e;
  }
  return undefined;
};

export const pushDDBB = async (path:string, value:any)
:Promise<[ThenableReference|undefined, Error|undefined]> => {
  const thisRef = ref(db, path);
  try {
    return [push(thisRef, value), undefined];
  } catch (e) {
    if (e instanceof Error) return [undefined, e];
  }
  return [undefined, undefined];
};

export const writeUserInfo = async (value:any, path = '') => {
  const { currentUser } = auth;
  const uid = currentUser?.uid;
  return writeDDBB(`users/${uid}/${path}`, value);
};

export const getPreguntaById = async (id:string):Promise<PreguntaTest> => {
  const [result] = await readDDBB(`${PATHS_DDBB.preguntas}/${id}`);
  return result;
};
export const getRespuestaById = async (id:string):Promise<string> => {
  const q = query(ref(db, 'respuestas'), orderByKey(), equalTo(id));
  const result = get(q).then((snap) => snap.val()[id]);
  return result;
};

export const setPreguntaById = async (setter:Function, id:string) => {
  setter(await getPreguntaById(id));
};

export const setMultiplePregsByIds = async (setter:Function, ids:Set<string>) => {
  const uniqueIds = Array.from(ids).filter((id, idx, self) => self.indexOf(id) === idx);
  const promises = uniqueIds.map(getPreguntaById);
  const preguntas = await Promise.all(promises);
  setter(preguntas);
};

export const getAnswers = async (setter:Function, ids:string[]) => {
  const promises = ids.map(getRespuestaById);
  const respuestas = await Promise.all(promises);
  setter(Object.fromEntries(ids.map((id, idx) => [id, respuestas[idx]])));
};

export const getInicio = async () => {
  const [currentInicio, error] = await readDDBB('inicio/active');
  if (error) return [undefined, error];
  return readDDBB(`inicio/opciones/${currentInicio}`);
};

export const getInicioWithSetters = async (setValue:Function, setError:Function) => {
  const [inicio, error] = await getInicio();
  if (error) return setError(error);
  return setValue(inicio);
};

export const getFrasesCuriosasWithSetters = async (callback:Function, setError:Function) => {
  const [active] = await readDDBB(PATHS_DDBB.activeDatosCuriosos);
  if (!active) return callback(null);
  const [frases, error] = await readDDBB(PATHS_DDBB.datosCuriosos);
  if (error) return setError(error);
  return callback(frases && Object.values(frases));
};

export const listenFrasesCuriosas = (
  setter:React.Dispatch<React.SetStateAction<[string, string][]|undefined>>,
) => onValueDDBB(
  PATHS_DDBB.datosCuriosos,
  (val:{[k:string]:string}) => setter(Object.entries(val ?? {})),
  (val:Error) => Toast.addMsg(val.message, 3000),
);

export const listenActiveFrasesCuriosas = (
  setter:React.Dispatch<React.SetStateAction<boolean|undefined>>,
) => onValueDDBB(
  PATHS_DDBB.activeDatosCuriosos,
  setter,
  (val:Error) => Toast.addMsg(val.message, 3000),
);

export const existsInDDBB = (path:string) => {
  const thisRef = ref(db, path);
  return get(thisRef).then((snap) => snap.exists());
};

export const filterByChild = (path: string, child:string, equal:string) => {
  const thisRef = ref(db, path);
  const q = query(thisRef, orderByChild(child), equalTo(equal));
  return get(q).then((snap) => snap.val());
};

const cache:{[key:string]:{[key:string]:{[key:string]:any}}} = {};
export const filterByChildCache = (path: string, child:string, equal:string) => {
  if (cache?.[path]?.[child]?.[equal]) return cache[path][child][equal];
  const result = filterByChild(path, child, equal);
  cache[path] ??= {};
  cache[path][child] ??= {};
  cache[path][child][equal] = result;
  return result;
};

export const updateLocal = (path:string, def: any = null) => readDDBB(path)
  .then(([val]) => {
    const value = val === null ? def : val;
    localStorage.setItem(`DDBB:${path}`, JSON.stringify(value));
    return value;
  });

export const readLocal = async (path:string) => {
  const result = localStorage.getItem(`DDBB:${path}`);
  const ddbbVal = updateLocal(path);
  if (result === null) return ddbbVal;
  return JSON.parse(result);
};

export const readLocalSync = (path:string, def:any) => {
  const result = localStorage.getItem(`DDBB:${path}`);
  if (result === null) return def;
  return JSON.parse(result);
};

export const readWithSetter = async (path:string, setValue:Function, setError?:Function) => {
  const [val, err] = await readDDBB(path);
  if (err && setError) return setError(err);
  return setValue(val);
};

export const setMantenimiento = (state:boolean) => getFromSocketUID('main:mantenimiento', state);

export const getPreguntasYRespuestas = () => Promise.all([
  readDDBB(PATHS_DDBB.preguntas).then((x) => x[0]),
  readDDBB(PATHS_DDBB.respuestas).then((x) => x[0]),
]);
