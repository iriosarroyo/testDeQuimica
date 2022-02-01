import {
  GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut,
} from 'firebase/auth';
import { readDDBB } from './database';
import { auth } from './firebaseApp';

export const getUserFromDDBB = (setUser:Function) => {
  const { currentUser } = auth;
  if (!currentUser) return setUser(currentUser);
  const { uid } = currentUser;
  return readDDBB(`users/${uid}`, setUser, currentUser);
};
const provider = new GoogleAuthProvider();
export const logIn = async () => signInWithPopup(auth, provider)
  .then(({ user }) => user)
  .catch((e) => {
    console.error(e);
    return null;
  });

export const authState = (setUser:Function) => {
  onAuthStateChanged(auth, () => getUserFromDDBB(setUser));
};

export const logOut = () => {
  signOut(auth);
};
