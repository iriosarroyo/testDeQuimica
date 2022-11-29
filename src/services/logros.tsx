import loadable from '@loadable/component';
import GeneralContentLoader from 'components/GeneralContentLoader';
import logrosJSON from 'info/logros.json';
import React, { MouseEvent } from 'react';
import {
  CompleteUser, Logro, Logros, LogrosKeys, UserDDBB,
} from 'types/interfaces';
import isApp from './determineApp';
import { getAllPuntuaciones } from './probability';
import { eventListenerSocket, getFromSocket } from './socket';
import { getNumOfDays } from './time';

const LogroComplete = loadable(() => import('components/LogroCompleted'), {
  fallback: <GeneralContentLoader />,
});

export const logros:Logros[] = (Object.values(logrosJSON) as Logros[])
  .filter((x) => x.available === undefined || x.available.some((val) => isApp(val)));
export const getLogrosFrom = (username:string) => getFromSocket('main:getLogrosFromUser', username);

export const sendLogroUpdate = (logroKey:LogrosKeys, previousValue:Logro, ...params:any[]) => {
  if (logros.find((x) => x.key === logroKey) === undefined) return Promise.resolve(false);
  return getFromSocket('main:updateLogros', logroKey, previousValue, ...params);
};

const getStarsFromAllUsers = () => getFromSocket('main:starsFromAllUsers');

export const getStarsWithSetters = async (setter:Function) => {
  const usersAndStars = await getStarsFromAllUsers();
  setter(usersAndStars);
};

export const updateDownloadedDocs = (e:MouseEvent, user:CompleteUser, name:string) => {
  if ((e.target as HTMLElement).closest('.infoFile') === null) {
    sendLogroUpdate('downloadedDocs', user.userDDBB.logros?.downloadedDocs);
    if (/f(o|ó)rmula/i.test(name) && /olimpiada/i.test(name)) {
      sendLogroUpdate('formulario', user.userDDBB.logros?.formulario);
    }
  }
};

export const updateLogrosTest = (
  user:UserDDBB,
  isTestDeHoy:boolean,
  numDePregs:number,
  punt:number,
  temas: UserDDBB['temas'],
) => {
  sendLogroUpdate('testsDone', user.logros?.testsDone);
  sendLogroUpdate('preguntasDone', user.logros?.preguntasDone, numDePregs);
  sendLogroUpdate('numberOf10', user.logros?.numberOf10, getAllPuntuaciones(temas));
  if (isTestDeHoy) sendLogroUpdate('testDeHoySeguidos', user.logros?.testDeHoySeguidos, getNumOfDays(Date.now()));
  if (isTestDeHoy && punt === 5) sendLogroUpdate('testDeHoyMaxPunt', user.logros?.testDeHoyMaxPunt);
  if (!isTestDeHoy) sendLogroUpdate('onlineDone', user.logros?.onlineDone);
};

const logroCompEvClosure = () => {
  let frontFn = (a:any) => { (() => a)(); };
  const ids:string[] = [];
  let activeId:string|undefined;

  const setActiveId = (id:string | undefined) => { activeId = id; };
  const showNextLogro = () => {
    if (activeId !== undefined || ids.length === 0) return;
    [activeId] = ids;
    const onEnd = () => {
      setActiveId(undefined);
      showNextLogro();
    };
    frontFn({
      elem: <LogroComplete logroId={ids[0]} fn={onEnd} />,
      cb: onEnd,
    });
    ids.shift();
  };

  const onLogroComplete = (setFront: any) => eventListenerSocket('onLogroCompletion', (logroId:string) => {
    frontFn = setFront;
    ids.push(logroId);
    showNextLogro();
  });

  return onLogroComplete;
};

export const onLogroComplete = logroCompEvClosure();
