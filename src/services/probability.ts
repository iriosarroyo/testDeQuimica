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

export const getProbLevel3 = (punt: number, type:difficultyLevels = 'User') => {
  if (type === 'Fácil' || type === 'Medio') return 0;
  if (type === 'Difícil') return 1;
  return getUserProbLevel3(punt);
};
export const getProbLevel1 = (punt: number, type:difficultyLevels = 'User') => {
  if (type === 'Difícil' || type === 'Medio') return 0;
  if (type === 'Fácil') return 1;
  return getUserProbLevel1(punt);
};
// Prob level 2 is 1-probLevel3-probLevel1

export const getProbTema = (punt:number, puntuacionDeTodos:number[]) => {
  const FACTOR = 10; // Number to reduce difference of probabilities
  const inverse = 1 / (punt + FACTOR);
  const totalInverse = puntuacionDeTodos.reduce((acum, cur) => acum + 1 / (cur + FACTOR), 0);
  return inverse / totalInverse;
};

const getRawPuntuacion = (aciertos:number, fallos:number) => {
  const punt = Math.max(0, aciertos * 0.25 - (fallos * 0.25) / 5);
  const bonusPor10 = Math.trunc(aciertos / 10) * 0.5;
  const bonusPor100 = Math.trunc(aciertos / 100) * 1;
  return punt + bonusPor10 + bonusPor100;
};

const countAciertosYFallos = (
  { aciertos, fallos }:userDDBB['temas'][''][''],
) => {
  const aciertosCount = (aciertos.match(/;/g) ?? []).length;
  const fallosCount = (fallos.match(/;/g) ?? []).length;
  return { aciertos: aciertosCount, fallos: fallosCount };
};

export const getPuntuacionLevel1 = (aciertosYFallos:userDDBB['temas']['']['']) => {
  const { aciertos, fallos } = countAciertosYFallos(aciertosYFallos);
  return Math.min(2, getRawPuntuacion(aciertos, fallos));
};
export const getPuntuacionLevel2 = (aciertosYFallos:userDDBB['temas']['']['']) => {
  const { aciertos, fallos } = countAciertosYFallos(aciertosYFallos);
  return Math.min(6, getRawPuntuacion(aciertos, fallos));
};
const getPuntuacionLevel3 = (aciertosYFallos:userDDBB['temas']['']['']) => {
  const { aciertos, fallos } = countAciertosYFallos(aciertosYFallos);
  return Math.min(10, getRawPuntuacion(aciertos, fallos));
};

export const getPuntuacionDelTema = (puntPorLevel:userDDBB['temas']['']) => {
  const level1 = getPuntuacionLevel1(puntPorLevel.level1);
  const level2 = getPuntuacionLevel2(puntPorLevel.level2);
  const level3 = getPuntuacionLevel3(puntPorLevel.level3);
  return Math.min(10, level1 + level2 + level3);
};

export const getPuntuacionMedia = (puntuaciones:userDDBB['temas'], round = 2) => {
  const arra = Object.values(puntuaciones);
  const average = arra.reduce((acum, curr) => acum + getPuntuacionDelTema(curr), 0) / arra.length;
  return Math.round(average * 10 ** round) / 10 ** round;
};

export const getTemasInOrder = async (year: string) => {
  const orderTemas = await readLocal(`general/ordenDeTemas/${year}`);
  const orderTemasEntries:[string, number][] = Object.entries(orderTemas);
  orderTemasEntries.sort((a, b) => a[1] - b[1]);
  return orderTemasEntries.map((x) => x[0]);
};
