import { PATHS_DDBB } from 'info/paths';
import { getTemas } from 'info/temas';
import { DifficultyLevels, userDDBB } from 'types/interfaces';
import { filterByChildCache, readLocal } from './database';

const probabilityLevelGen = (max:number, deviation:number) => {
  const root2PI = Math.sqrt(2 * Math.PI);
  const div = 1 / (deviation * root2PI);
  const sqDeviationBy2 = 2 * deviation ** 2;
  const probWithoutNormalizing = (x:number) => div * Math.E ** (-((x - max) ** 2 / sqDeviationBy2));
  const maximum = probWithoutNormalizing(max);
  return (x: number) => probWithoutNormalizing(x) / maximum;
};

export const getUserProbLevel3 = probabilityLevelGen(10, 3.5); // Tested numbers
const getUserProbLevel1 = probabilityLevelGen(0, 0.3); // Tested numbers

export const MAX_PUNT_NIV_1 = 2;
export const MAX_PUNT_NIV_2 = 6;
export const MAX_PUNT_NIV_3 = 10;
export const VAL_PUNT_ACIERTO = 0.25;
export const VAL_PUNT_FALLO = 0.05;
export const EXTRA_PER_10 = 0.5;
export const EXTRA_PER_100 = 1;

const ROUND_DECIMALS = 8;

export const round = (num:number, digits = 2) => Math.round(num * 10 ** digits) / 10 ** digits;

export const getProbLevel1 = (punt: number, type:DifficultyLevels = 'User') => {
  if (type === 'Difícil' || type === 'Medio') return 0;
  if (type === 'Fácil') return 1;
  return round(getUserProbLevel1(punt), ROUND_DECIMALS);
};

export const getProbLevel3 = (punt: number, type:DifficultyLevels = 'User') => {
  if (type === 'Fácil' || type === 'Medio') return 0;
  if (type === 'Difícil') return 1;
  return round(Math.min(getUserProbLevel3(punt), 1 - getProbLevel1(punt)), ROUND_DECIMALS);
  // return round(Math.min(1, 1 - getProbLevel1(punt)), 8);
};
// Prob level 2 is 1-probLevel3-probLevel1

export const getProbLevel2 = (
  punt: number,
  type:DifficultyLevels = 'User',
) => round(Math.max(0, 1 - getProbLevel1(punt, type) - getProbLevel3(punt, type)), ROUND_DECIMALS);

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

type AciertosYFallos = NonNullable<NonNullable<userDDBB['temas']>['']>['']

const countAciertosYFallos = (
  { aciertos, fallos }:AciertosYFallos,
) => {
  const aciertosCount = count(aciertos);
  const fallosCount = count(fallos);
  return { aciertos: aciertosCount, fallos: fallosCount };
};

export const getPuntuacionLevel1 = (aciertosYFallos:AciertosYFallos) => {
  const { aciertos, fallos } = countAciertosYFallos(aciertosYFallos);
  return Math.min(MAX_PUNT_NIV_1, getRawPuntuacion(aciertos, fallos));
};
export const getPuntuacionLevel2 = (aciertosYFallos:AciertosYFallos) => {
  const { aciertos, fallos } = countAciertosYFallos(aciertosYFallos);
  return Math.min(MAX_PUNT_NIV_2, getRawPuntuacion(aciertos, fallos));
};
export const getPuntuacionLevel3 = (aciertosYFallos:AciertosYFallos) => {
  const { aciertos, fallos } = countAciertosYFallos(aciertosYFallos);
  return Math.min(MAX_PUNT_NIV_3, getRawPuntuacion(aciertos, fallos));
};

export const getPuntuacionDelTema = (puntPorLevel:NonNullable<userDDBB['temas']>['']) => {
  if (puntPorLevel === undefined) return 0; // Return puntuación 0 si no existe el elemento
  const level1 = getPuntuacionLevel1(puntPorLevel.level1);
  const level2 = getPuntuacionLevel2(puntPorLevel.level2);
  const level3 = getPuntuacionLevel3(puntPorLevel.level3);
  return Math.min(10, level1 + level2 + level3);
};

export const getAllPuntuaciones = (temas: userDDBB['temas']) : {[k:string]: number} => {
  const puntEntries = Object.keys(getTemas()).map((key) => ([key,
    getPuntuacionDelTema(temas?.[key])]));
  return Object.fromEntries(puntEntries);
};

export const getPuntuacionMedia = (puntuaciones:userDDBB['temas'], digits = 2) => {
  if (puntuaciones === undefined) return 0;
  const arra = Object.keys(getTemas());
  const average = arra
    .reduce((acum, curr) => acum + getPuntuacionDelTema(puntuaciones[curr]), 0) / arra.length;
  return round(average, digits);
};

export const getTemasInOrder = async (year: string) => {
  const orderTemas = await readLocal(`${PATHS_DDBB.temasOrden}/${year}`);
  const orderTemasEntries = Object.keys(getTemas());
  orderTemasEntries.sort((a, b) => (orderTemas[a] ?? Infinity) - (orderTemas[b] ?? Infinity));
  return orderTemasEntries;
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

export const getPreguntaWeight = (aciertosYFallos:AciertosYFallos|undefined, id:string) => {
  const { aciertos, fallos } = aciertosYFallos ?? { aciertos: '', fallos: '' };
  const numAc = count(aciertos, id);
  const numFal = count(fallos, id);
  return Math.trunc((numFal + 2) / (2 ** (numAc - 1)));
};

const getActiveTemasWithPunt = async (
  temas:userDDBB['temas'],
  year:string,
  overwriteTemas?:string[],
  preventBreak = true,
  factor = 1,
) => {
  const order = overwriteTemas ?? await getTemasInOrder(year);
  const temasWithPunt:[string, number][] = [];
  for (let i = 0; i < order.length; i++) {
    const punt = Math.min(10, getPuntuacionDelTema(temas?.[order[i]]) * factor);
    temasWithPunt.push([order[i], punt]);
    if (!overwriteTemas && (factor !== 1 ? punt === 0 : punt < 4) && !preventBreak) break;
  }
  return temasWithPunt;
};

const FNs = {
  1: getProbLevel1,
  2: getProbLevel2,
  3: getProbLevel3,
};

export const getProbByPreg = async (user:userDDBB) => {
  const { year, temas } = user;
  const levels = ['1', '2', '3'];
  const resultad = (await Promise.all((await getActiveTemasWithPunt(temas, year)).map(
    ([tema, punt], _, result) => {
      const probTema = getProbTema(punt, result.map(([, v]) => v));
      return Promise.all(levels.map(async (lev) => {
        const probLevel = FNs[lev as unknown as keyof typeof FNs](punt);
        const levelYTema = `${tema}_${lev}`;
        const posibleQuestions = (await filterByChildCache(PATHS_DDBB.preguntas, 'nivelYTema', levelYTema)) ?? {};
        let total = 0;
        return Object.keys(posibleQuestions)
          .map((id) => {
            const w = getPreguntaWeight(temas?.[tema]?.[`level${lev}`], id);
            total += w;
            return [id, probTema * probLevel * w];
          }).map(([id, val]) => [id, Number(val) / total]);
      }));
    },
  ))).flat(2);
  return resultad;
};
