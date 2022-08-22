/* eslint-disable no-undef */
importScripts('https://www.gstatic.com/firebasejs/9.9.3/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.9.3/firebase-messaging-compat.js');

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

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();
messaging.onBackgroundMessage(messaging, (payload) => {
  // Customize notification here
  const { body, title } = payload.notification;
  const notificationOptions = {
    body,
  };

  window.self.registration.showNotification(
    title,
    notificationOptions,
  );
});
