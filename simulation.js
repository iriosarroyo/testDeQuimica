const probabilityGen = (max, deviation) => {
  const root2PI = Math.sqrt(2 * Math.PI);
  const div = 1 / (deviation * root2PI);
  const sqDeviationBy2 = 2 * deviation ** 2;
  const probWithoutNormalizing = (x) => div * Math.E ** (-((x - max) ** 2 / sqDeviationBy2));
  const maximum = probWithoutNormalizing(max);
  return (x) => probWithoutNormalizing(x) / maximum;
};

const probLevel3 = probabilityGen(10, 3.5);
const probLevel1 = probabilityGen(0, 0.3);
/* const probLevel2 = (x) => 1 - probLevel3(x) - probLevel1(x); */

const usersProbabilityOfSuccess = [
  0,
  0.1,
  0.25,
  0.33,
  0.5,
  0.67,
  0.75,
  0.9,
  1,
];

usersProbabilityOfSuccess.forEach((x, i) => {
  let aciertos = 0;
  let fallos = 0;
  let puntuacion = 0;
  let pregunta2 = true;
  let pregunta3 = true;
  let pregunta250 = true;
  let pregunta350 = true;
  let pregunta2100 = true;
  let pregunta3100 = true;
  while (puntuacion < 10) {
    let lev1 = 0;
    let lev2 = 0;
    let lev3 = 0;
    for (let j = 0; j < 5; j++) {
      const random = Math.random();
      if (random < probLevel1(puntuacion)) lev1 += 1;
      else if (random > 1 - probLevel3(puntuacion)) lev3 += 1;
      else lev2 += 1;

      const random2 = Math.random();
      if (random2 < x) {
        aciertos++;
      } else {
        fallos++;
      }
    }
    if (puntuacion > 4 && lev1) console.log('Hay preguntas de nivel 1');
    if (pregunta2 && lev2 > 0) {
      console.log(`primera pregunta ${i} de 2 en ${puntuacion} con ${aciertos + fallos}`);
      pregunta2 = false;
    }
    if (pregunta3 && lev3 > 0) {
      console.log(`primera pregunta ${i} de 3 en ${puntuacion} con ${aciertos + fallos}`);
      pregunta3 = false;
    }
    if (pregunta250 && lev2 > 2) {
      console.log(`50% ${i} de 2 en ${puntuacion} con ${aciertos + fallos}`);
      pregunta250 = false;
    }
    if (pregunta350 && lev3 > 2) {
      console.log(`50%  ${i} de 3 en ${puntuacion} con ${aciertos + fallos}`);
      pregunta350 = false;
    }
    if (pregunta2100 && lev2 === 5) {
      console.log(`100% ${i} de 2 en ${puntuacion} con ${aciertos + fallos}`);
      pregunta2100 = false;
    }
    if (pregunta3100 && lev3 === 5) {
      console.log(`100% ${i} de 3 en ${puntuacion} con ${aciertos + fallos}`);
      pregunta3100 = false;
    }
    if (aciertos + fallos > 1000) break;
    puntuacion = Math.min(Math.max(0, aciertos * 0.25 - (fallos * 0.25) / 5)
    + Math.trunc(aciertos / 10) * 0.5 + Math.trunc(aciertos / 100) * 1, 10);
  }
  console.log(`${i} ha hecho ${aciertos + fallos} preguntas`);
});
