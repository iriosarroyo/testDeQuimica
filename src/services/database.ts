import { onValue, ref } from 'firebase/database';
import { db } from './firebaseApp';

export const readDDBB = (path:string, setter:Function, extraData = {}) => {
  const extra = extraData ?? {};
  const thisRef = ref(db, path);
  onValue(thisRef, (snapshot) => {
    const result = snapshot.val();
    setter({ result, ...extra });
  }, () => setter({ result: null, ...extra }));
};

export const writeDDBB = () => {};
