// REMEMBER GOING TO ORDERING TEMAS AND CHANGE SOMETHING FOR EVERY YEAR WHEN UPDATING "TEMAS"

import { readLocalSync, updateLocal } from 'services/database';
import { getApp } from 'services/determineApp';
import { PATHS_DDBB } from './paths';

const TEMAS_APPS = {
  quimica: {
    tema1: 'Tema 1',
    tema2: 'Tema 2',
    tema3: 'Tema 3',
    tema4: 'Tema 4',
    tema5: 'Tema 5',
    tema6: 'Tema 6',
    tema7: 'Tema 7',
    tema8: 'Tema 8',
    tema9: 'Temas 9 y 10',
  },
  fisica: {
    tema1: 'Tema 1',
    tema2: 'Tema 2',
    tema3: 'Tema 3',
    tema4: 'Tema 4',
    tema5: 'Tema 5',
    tema6: 'Tema 6',
    tema7: 'Tema 7',
    tema8: 'Tema 8',
    tema9: 'Tema 9',
    tema10: 'Tema 10',
  },
  biologia: {
    tema1: 'Tema 1',
    tema2: 'Tema 2',
    tema3: 'Tema 3',
    tema4: 'Tema 4',
    tema5: 'Tema 5',
    tema6: 'Tema 6',
    tema7: 'Tema 7',
    tema8: 'Tema 8',
    tema9: 'Tema 9',
    tema10: 'Tema 10',
  },
} as const;

const TEMAS = TEMAS_APPS[getApp() as keyof typeof TEMAS_APPS];

export const getTemas = ():typeof TEMAS => readLocalSync(PATHS_DDBB.temas, TEMAS);
export const updateTemas = () => updateLocal(PATHS_DDBB.temas, TEMAS);
const getDefaultTemasOrder = () => Object.keys(getTemas()).map((x, i) => [x, i]);

export const getTemasOrderDDBB = (year:string) => readLocalSync(`${PATHS_DDBB.temasOrden}/${year}`, getDefaultTemasOrder());
export const updateTemasOrderDDBB = (year:string) => updateLocal(`${PATHS_DDBB.temasOrden}/${year}`, getDefaultTemasOrder());
let temasOrder:{[k:string]:number};

export const getTemasOrder = () => {
  if (temasOrder === undefined) {
    temasOrder = Object.fromEntries(Object.keys(getTemas())
      .map((key) => [key, parseInt(key.slice(4), 10)]));
  }
  return temasOrder;
};

export const getDefaultTemasSelection = () => Object.fromEntries(
  Object.keys(getTemas()).map((key) => [key, 'Sí']),
);

export const DEFAULT_LEVELS = {
  level1: {
    aciertos: '',
    fallos: '',
    enBlanco: '',
  },
  level2: {
    aciertos: '',
    fallos: '',
    enBlanco: '',
  },
  level3: {
    aciertos: '',
    fallos: '',
    enBlanco: '',
  },
};

/* export const getDefaultUserTemas = () => Object.fromEntries(
  Object.keys(TEMAS).map((key) => [key, {
    level1: {
      aciertos: '',
      fallos: '',
      enBlanco: '',
    },
    level2: {
      aciertos: '',
      fallos: '',
      enBlanco: '',
    },
    level3: {
      aciertos: '',
      fallos: '',
      enBlanco: '',
    },
  }]),
); */
