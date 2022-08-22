import logrosJSON from 'info/logros.json';
import { MouseEvent } from 'react';
import {
  CompleteUser, Logro, Logros, LogrosKeys, userDDBB,
} from 'types/interfaces';
import { getFromSocket } from './socket';
import { getNumOfDays } from './time';

export const logros:Logros[] = Object.values(logrosJSON) as Logros[];
export const getLogrosFrom = (username:string) => getFromSocket('main:getLogrosFromUser', username);

export const sendLogroUpdate = (logroKey:LogrosKeys, previousValue:Logro, ...params:any[]) => (
  getFromSocket('main:updateLogros', logroKey, previousValue, ...params)
);

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
  user:userDDBB,
  isTestDeHoy:boolean,
  numDePregs:number,
  punt:number,
) => {
  sendLogroUpdate('testsDone', user.logros?.testsDone);
  sendLogroUpdate('preguntasDone', user.logros?.preguntasDone, numDePregs);
  if (isTestDeHoy) sendLogroUpdate('testDeHoySeguidos', user.logros?.testDeHoySeguidos, getNumOfDays(Date.now()));
  if (isTestDeHoy && punt === 5) sendLogroUpdate('testDeHoyMaxPunt', user.logros?.testDeHoyMaxPunt);
  if (!isTestDeHoy) sendLogroUpdate('onlineDone', user.logros?.onlineDone);
};
