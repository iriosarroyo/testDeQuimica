/* eslint-disable no-undef */
importScripts('https://www.gstatic.com/firebasejs/9.9.3/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.9.3/firebase-messaging-compat.js');

const posibleConfigs = {
  'test-de-quimica': {
    apiKey: 'AIzaSyDpqJ3rKKbu4PEAui93s0wkmjgeytu0vf4',
    authDomain: 'test-de-quimica.firebaseapp.com',
    databaseURL: 'https://test-de-quimica.firebaseio.com',
    projectId: 'test-de-quimica',
    storageBucket: 'test-de-quimica.appspot.com',
    messagingSenderId: '589609378466',
    appId: '1:589609378466:web:66e4774fd2103838',
    measurementId: 'G-G18235H145',
  },
  'test-de-biologia': {
    apiKey: 'AIzaSyDvgpGUFOfAblf5lnblxnECBiQKbFGdy6Q',
    authDomain: 'test-de-biologia.firebaseapp.com',
    databaseURL: 'https://test-de-biologia-default-rtdb.europe-west1.firebasedatabase.app',
    projectId: 'test-de-biologia',
    storageBucket: 'test-de-biologia.appspot.com',
    messagingSenderId: '530085322906',
    appId: '1:530085322906:web:aad85712886996b2873f23',
    measurementId: 'G-DH4SVKJ5RZ',
  },
  'test-de-fisica': {
    apiKey: 'AIzaSyBApunkAfsnIhSjxffInfuDeuYMhCEF58o',
    authDomain: 'test-de-fisica.firebaseapp.com',
    databaseURL: 'https://test-de-fisica-default-rtdb.europe-west1.firebasedatabase.app',
    projectId: 'test-de-fisica',
    storageBucket: 'test-de-fisica.appspot.com',
    messagingSenderId: '381421060654',
    appId: '1:381421060654:web:3f00999da6bfdcf7b215bf',
    measurementId: 'G-NV73KVL1E9',
  },
  get localhost() {
    return this['test-de-quimica'];
  },
  get 192() {
    return this['test-de-quimica'];
  },
};

const firebaseConfig = posibleConfigs[globalThis.location.hostname.replace(/\..+/, '')];

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
