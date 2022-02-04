import {
  GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut, User,
} from 'firebase/auth';
import { onValueDDBB, readDDBB } from './database';
import { auth } from './firebaseApp';

export const getUserFromDDBB = async (setUserDDBB:Function, setError:Function, path = '') => {
  const { currentUser } = auth;
  if (!currentUser) return setUserDDBB(undefined);
  const { uid } = currentUser;
  const [result, error] = await readDDBB(`users/${uid}/${path}`);
  if (error !== undefined) return setError(error);
  return setUserDDBB(result);
};

export const onValueUser = (user:User, setUserDDBB:Function, setError:Function, path = '') => {
  const { uid } = user;
  return onValueDDBB(`users/${uid}/${path}`, setUserDDBB, setError);
};
const provider = new GoogleAuthProvider();
export const logIn = async (setError:Function) => signInWithPopup(auth, provider)
  .catch((e) => setError(e));

export const authState = (setUser:Function, setError:Function) => {
  let off = () => {};
  onAuthStateChanged(
    auth,
    (user) => {
      if (!user) {
        setUser(user);
        off();
        off = () => {};
      } else off = onValueUser(user, (userDDBB:any) => setUser({ userDDBB, ...user }), setError);
    },
    (error) => setError(error),
  );
};

export const logOut = () => {
  signOut(auth);
};
