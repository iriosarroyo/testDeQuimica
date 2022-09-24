import { difficultyLevels, userDDBB } from 'types/interfaces';
import { readLocal } from './database';

const probabilityLevelGen = (max:number, deviation:number) => {
  const root2PI = Math.sqrt(2 * Math.PI);
  const div = 1 / (deviation * root2PI);
  const sqDeviationBy2 = 2 * deviation ** 2;
  const probWithoutNormalizing = (x:number) => div * Math.E ** (-((x - max) ** 2 / sqDeviationBy2));
  const maximum = probWithoutNormalizing(max);
  return (x: number) => probWithoutNormalizing(x) / maximum;
};

const getUserProbLevel3 = probabilityLevelGen(10, 3.5); // Tested numbers
const getUserProbLevel1 = probabilityLevelGen(0, 0.3); // Tested numbers

export const MAX_PUNT_NIV_1 = 2;
export const MAX_PUNT_NIV_2 = 6;
export const MAX_PUNT_NIV_3 = 10;
export const VAL_PUNT_ACIERTO = 0.25;
export const VAL_PUNT_FALLO = 0.05;
export const EXTRA_PER_10 = 0.5;
export const EXTRA_PER_100 = 1;

export const round = (num:number, digits = 2) => Math.round(num * 10 ** digits) / 10 ** digits;

export const getProbLevel1 = (punt: number, type:difficultyLevels = 'User') => {
  if (type === 'Difícil' || type === 'Medio') return 0;
  if (type === 'Fácil') return 1;
  return round(getUserProbLevel1(punt), 8);
};

export const getProbLevel3 = (punt: number, type:difficultyLevels = 'User') => {
  if (type === 'Fácil' || type === 'Medio') return 0;
  if (type === 'Difícil') return 1;
  return round(Math.min(getUserProbLevel3(punt), 1 - getProbLevel1(punt)), 8);
};
// Prob level 2 is 1-probLevel3-probLevel1

export const getProbLevel2 = (
  punt: number,
  type:difficultyLevels = 'User',
) => round(Math.max(0, 1 - getProbLevel1(punt, type) - getProbLevel3(punt, type)), 8);

export const getProbTema = (punt:number, puntuacionDeTodos:number[]) => {
  const FACTOR = 10; // Number to reduce difference of probabilities
  const inverse = 1 / (punt + FACTOR);
  const totalInverse = puntuacionDeTodos.reduce((acum, cur) => acum + 1 / (cur + FACTOR), 0);
  return inverse / totalInverse;
};

export const getBonus10 = (aciertos:number) => Math.trunc(aciertos / 10) * EXTRA_PER_10;
export const getBonus100 = (aciertos:number) => Math.trunc(aciertos / 100) * EXTRA_PER_100;

const getRawPuntuacion = (aciertos:number, fallos:number) => {
  const punt = Math.max(0, aciertos * VAL_PUNT_ACIERTO - (fallos * VAL_PUNT_FALLO));
  const bonusPor10 = getBonus10(aciertos);
  const bonusPor100 = getBonus100(aciertos);
  return punt + bonusPor10 + bonusPor100;
};

export const count = (str:string, sep = ';') => str.match(RegExp(sep, 'g'))?.length ?? 0;

const countAciertosYFallos = (
  { aciertos, fallos }:userDDBB['temas'][''][''],
) => {
  const aciertosCount = count(aciertos);
  const fallosCount = count(fallos);
  return { aciertos: aciertosCount, fallos: fallosCount };
};

export const getPuntuacionLevel1 = (aciertosYFallos:userDDBB['temas']['']['']) => {
  const { aciertos, fallos } = countAciertosYFallos(aciertosYFallos);
  return Math.min(MAX_PUNT_NIV_1, getRawPuntuacion(aciertos, fallos));
};
export const getPuntuacionLevel2 = (aciertosYFallos:userDDBB['temas']['']['']) => {
  const { aciertos, fallos } = countAciertosYFallos(aciertosYFallos);
  return Math.min(MAX_PUNT_NIV_2, getRawPuntuacion(aciertos, fallos));
};
export const getPuntuacionLevel3 = (aciertosYFallos:userDDBB['temas']['']['']) => {
  const { aciertos, fallos } = countAciertosYFallos(aciertosYFallos);
  return Math.min(MAX_PUNT_NIV_3, getRawPuntuacion(aciertos, fallos));
};

export const getPuntuacionDelTema = (puntPorLevel:userDDBB['temas']['']) => {
  const level1 = getPuntuacionLevel1(puntPorLevel.level1);
  const level2 = getPuntuacionLevel2(puntPorLevel.level2);
  const level3 = getPuntuacionLevel3(puntPorLevel.level3);
  return Math.min(10, level1 + level2 + level3);
};

export const getAllPuntuaciones = (temas: userDDBB['temas']) : {[k:string]: number} => {
  const puntEntries = Object.entries(temas).map(([k, v]) => ([k, getPuntuacionDelTema(v)]));
  return Object.fromEntries(puntEntries);
};

export const getPuntuacionMedia = (puntuaciones:userDDBB['temas'], digits = 2) => {
  const arra = Object.values(puntuaciones);
  const average = arra.reduce((acum, curr) => acum + getPuntuacionDelTema(curr), 0) / arra.length;
  return round(average, digits);
};

export const getTemasInOrder = async (year: string) => {
  const orderTemas = await readLocal(`general/ordenDeTemas/${year}`);
  const orderTemasEntries:[string, number][] = Object.entries(orderTemas);
  orderTemasEntries.sort((a, b) => a[1] - b[1]);
  return orderTemasEntries.map((x) => x[0]);
};

export const getProbTemaWithoutTemasInOrder = async (tema:string, temas:userDDBB['temas'], year:string) => {
  const temasInOrder = await getTemasInOrder(year);
  const puntOfActive:number[] = [];
  const activeTemas:string[] = [];
  const everyPunt = getAllPuntuaciones(temas);
  for (let i = 0; i < temasInOrder.length; i++) {
    if (i !== 0 && everyPunt[temasInOrder[i - 1]] < 4) break;
    puntOfActive.push(everyPunt[temasInOrder[i]]);
    activeTemas.push(temasInOrder[i]);
  }
  if (!activeTemas.includes(tema)) return 0;
  return round(getProbTema(everyPunt[tema], puntOfActive), 8);
};
