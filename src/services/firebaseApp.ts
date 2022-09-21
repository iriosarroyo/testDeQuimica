import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getMessaging, Messaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: 'AIzaSyDpqJ3rKKbu4PEAui93s0wkmjgeytu0vf4',
  authDomain: 'test-de-quimica.firebaseapp.com',
  databaseURL: 'https://test-de-quimica.firebaseio.com',
  projectId: 'test-de-quimica',
  storageBucket: 'test-de-quimica.appspot.com',
  messagingSenderId: '589609378466',
  appId: '1:589609378466:web:66e4774fd2103838',
  measurementId: 'G-G18235H145',
};
export const msgToken = 'BJpiUdJsYrYGjBJ0YHGARVlvOeSkBhaeF4X9p2VvQr7_Q0eGvUXPdfUFLIkgOn4q0UDmkEiOyzix26GhSAxwLsg';
export const app = initializeApp(firebaseConfig);
export const stg = getStorage(app);
export const auth = getAuth(app);
export const db = getDatabase(app);
let msg:Messaging;
try {
  msg = getMessaging(app);
} catch {
  msg = { app } as Messaging;
}

export const messaging = msg;
