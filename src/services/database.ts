import {
  get, onValue, ref, set,
} from 'firebase/database';
import { PreguntaTestDeQuimica } from 'types/interfaces';
import { auth, db } from './firebaseApp';

export const readDDBB = async (path:string) => {
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
  return onValue(thisRef, (snap) => setter(snap.val()), (error) => setError(error));
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

export const writeUserInfo = async (value:any, path = '') => {
  const { currentUser } = auth;
  const uid = currentUser?.uid;
  return writeDDBB(`users/${uid}/${path}`, value);
};

export const getPreguntaById = async (id:string):Promise<PreguntaTestDeQuimica> => {
  const [result] = await readDDBB(`preguntasTestDeQuimica/${id}`);
  return result;
};

export const setPreguntaById = async (setter:Function, id:string) => {
  setter(await getPreguntaById(id));
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
