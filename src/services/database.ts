import { onValue, ref, set } from 'firebase/database';
import { auth, db } from './firebaseApp';

export const readDDBB = (path:string, setter:Function, extraData = {}) => {
  const extra = extraData ?? {};
  const thisRef = ref(db, path);
  onValue(thisRef, (snapshot) => {
    const result = snapshot.val();
    setter({ result, ...extra });
  }, () => setter({ result: null, ...extra }));
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
  console.log({ uid });
  return writeDDBB(`users/${uid}/${path}`, value);
};
