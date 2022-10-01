import {
  deleteUser,
  GoogleAuthProvider, onAuthStateChanged, reauthenticateWithCredential, signInWithPopup,
  signOut, User, UserCredential,
} from 'firebase/auth';
import React from 'react';
import { onValueDDBB, readDDBB } from './database';
import { SocketError } from './errores';
import { auth } from './firebaseApp';
import { createSocket, disconnectSocket, getFromSocketUID } from './socket';
import Toast from './toast';

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

export const authState = (
  setUser:Function,
  setError:Function,
  setLoading:React.Dispatch<React.SetStateAction<boolean>>,
) => {
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
          await user.getIdToken().then((token) => createSocket(token, setLoading));
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

export const removeUser = async () => {
  if (!window.confirm('¿Estás seguro de querer eliminar tu cuenta, se perderán todos tus datos?')) return;
  if (auth.currentUser === null) return;
  const deleteProvider = new GoogleAuthProvider();
  if (auth.currentUser.email) {
    deleteProvider.setCustomParameters({ login_hint: auth.currentUser.email });
  }
  const data = (await signInWithPopup(auth, deleteProvider)) as UserCredential;
  if (data?.user === undefined) return;
  const credential = GoogleAuthProvider.credentialFromResult(data);
  if (credential === null) return;
  const result = await reauthenticateWithCredential(auth.currentUser, credential);
  if (!await getFromSocketUID('main:deleteUserFromDDBB', auth.currentUser.uid)) {
    Toast.addMsg('No se ha podido eliminar el usuario de la base de datos', 3000);
    return;
  }
  deleteUser(result.user);
};
