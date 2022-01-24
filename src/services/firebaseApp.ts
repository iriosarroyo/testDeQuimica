import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyCKHffDCCEKPpxgKOTGck_qAqS4BphXp-4',
  authDomain: 'testdequimica-bcf90.firebaseapp.com',
  databaseURL: 'https://testdequimica-bcf90-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'testdequimica-bcf90',
  storageBucket: 'testdequimica-bcf90.appspot.com',
  messagingSenderId: '87974476070',
  appId: '1:87974476070:web:aaec0f6560c50f4fe269e7',
  measurementId: 'G-GEV2TR27PC',
};
export const app = initializeApp(firebaseConfig);
export const stg = getStorage(app);
export const auth = getAuth(app);
