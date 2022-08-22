import { getToken, onMessage } from 'firebase/messaging';
import React from 'react';
import { messaging } from './firebaseApp';
import { getFromSocket, getSocket } from './socket';

const requestPermission = (curso:string) => {
  Notification.requestPermission().then((permission) => {
    // eslint-disable-next-line no-use-before-define
    if (permission === 'granted') reqTokenMessaging(curso);
  });
};

const reqTokenMessaging = (curso:string) => getToken(messaging, {
  vapidKey: 'BMqChm2QrRhm3r8HOSLPRolCkd5lv-f-_Ahmo9AGKiX5g_Bw_r5TiqFt-Rek53TLxs2Heq6bUWKiWpzCmYGbzwE',
}).then((currentToken) => {
  if (currentToken) {
    getSocket().emit('firebase:messaging:token', currentToken, ['all', curso]);
  } else {
    requestPermission(curso);
  }
});

export const messagingListener = (setFront:Function) => onMessage(messaging, (payload) => {
  setFront({
    elem: (
      <div>
        <h3 className="headerNotificacion">Nueva Notificación</h3>
        <h4 className="titleNotificacion">{payload.notification?.title}</h4>
        <div className="bodyNotificacion">{payload.notification?.body}</div>
      </div>),
    cb: () => {},
  });
});

export const sendNotification = (title:string, body:string, topic:string) => getFromSocket('firebase:messaging:notification', title, body, topic);

export default reqTokenMessaging;
