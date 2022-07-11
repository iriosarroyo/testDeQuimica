importScripts('https://www.gstatic.com/firebasejs/9.2.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.2.0/firebase-messaging-compat.js');

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
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  // Customize notification here
  const notificationTitle = 'Background Message Title';
  const notificationOptions = {
    body: 'Background Message body.',
    icon: '/firebase-logo.png',
  };

  window.self.registration.showNotification(
    notificationTitle,
    notificationOptions,
  );
});
