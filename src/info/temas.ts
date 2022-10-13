// REMEMBER GOING TO ORDERING TEMAS AND CHANGE SOMETHING FOR EVERY YEAR WHEN UPDATING "TEMAS"
export const TEMAS:{[k:string]:string} = {
  tema1: 'Tema 1',
  tema2: 'Tema 2',
  tema3: 'Tema 3',
  tema4: 'Tema 4',
  tema5: 'Tema 5',
  tema6: 'Tema 6',
  tema7: 'Tema 7',
  tema8: 'Tema 8',
  tema9: 'Temas 9 y 10',
};

let temasOrder:{[k:string]:number};

export const getTemasOrder = () => {
  if (temasOrder === undefined) {
    temasOrder = Object.fromEntries(Object.keys(TEMAS)
      .map((key) => [key, parseInt(key.slice(4), 10)]));
  }
  return temasOrder;
};

export const getDefaultTemasSelection = () => Object.fromEntries(
  Object.keys(TEMAS).map((key) => [key, 'Sí']),
);

export const getDefaultUserTemas = () => Object.fromEntries(
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
);
