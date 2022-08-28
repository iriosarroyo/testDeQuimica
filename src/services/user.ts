import {
  GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut, User,
} from 'firebase/auth';
import { onValueDDBB, readDDBB } from './database';
import { SocketError } from './errores';
import { auth } from './firebaseApp';
import { createSocket, disconnectSocket } from './socket';

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
  .catch((e) => (e.code === 'auth/popup-closed-by-user' || setError(e)));

export const authState = (setUser:Function, setError:Function) => {
  let off = () => {};
  const offAuth = onAuthStateChanged(
    auth,
    async (user) => {
      if (!user) {
        setUser(user);
        off();
        off = () => {};
      } else {
        try {
          await user.getIdToken().then(createSocket);
        } catch {
          setError(new SocketError());
          return;
        }
        const setValueOff = onValueUser(
          user,
          (userDDBB:any) => setUser({ userDDBB, ...user }),
          setError,
        );
        off = () => {
          setValueOff();
          disconnectSocket();
        };
      }
    },
    (error) => setError(error),
  );
  return () => { off(); offAuth(); };
};

export const logOut = () => {
  signOut(auth);
};
