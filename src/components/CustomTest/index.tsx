import UserContext from 'contexts/User';
import React, { useContext, useEffect, useState } from 'react';

import gen from 'random-seed';
import { getNumOfDays } from 'services/time';
import { CompleteUser, difficultyLevels, userDDBB } from 'types/interfaces';
import {
  getPuntuacionDelTema, getProbLevel1, getProbLevel3, getProbTema,
} from 'services/probability';
import {
  filterByChildCache, readLocal,
} from 'services/database';
import Test from 'components/Test';

interface StatsPerTema{
  tema:string, punt:number, probLevel1:number, probLevel3:number
}

interface CompleteStatsPerTema extends StatsPerTema{
  probTema: number
}

const getTema = (statsPerTema:{[key:string]:CompleteStatsPerTema}, rng: gen.RandomSeed) => {
  let cumulativeProb = 0;
  const statsPerTemaArray = Object.values(statsPerTema);
  const random = rng.random();
  const tema = statsPerTemaArray.find((stats) => {
    cumulativeProb += stats.probTema;
    return random < cumulativeProb;
  })?.tema ?? statsPerTemaArray[0].tema;
  return tema;
};

const getLevel = (statsPerTema:CompleteStatsPerTema, rng: gen.RandomSeed) => {
  const { probLevel1, probLevel3 } = statsPerTema;
  const random = rng.random();
  if (random < probLevel1) return 1;
  if (random > 1 - probLevel3) return 3;
  return 2;
};

const getTemasInOrder = async (year: string) => {
  const orderTemas = await readLocal(`general/ordenDeTemas/${year}`);
  const orderTemasEntries:[string, number][] = Object.entries(orderTemas);
  orderTemasEntries.sort((a, b) => a[1] - b[1]);
  return orderTemasEntries.map((x) => x[0]);
};

const getStatPerTema = (
  level:difficultyLevels,
  [tema, dataByLevel]:[string, userDDBB['temas']['']],
):[string, StatsPerTema] => {
  const punt = getPuntuacionDelTema(dataByLevel);
  const probLevel1 = getProbLevel1(punt, level);
  const probLevel3 = getProbLevel3(punt, level);
  return [tema, {
    tema, punt, probLevel1, probLevel3,
  }];
};

const getActiveTemas = (temasInOrder:string[], statsPerTemaObj:{
  [k: string]: StatsPerTema;
}) => {
  const activeTemas:string[] = [];
  for (let i = 0; i < temasInOrder.length; i++) {
    if (i !== 0 && statsPerTemaObj[temasInOrder[i - 1]].punt < 4) break;
    activeTemas.push(temasInOrder[i]);
  }
  return activeTemas;
};

const getCompleteStats = (
  statsPerTema:[string, StatsPerTema][],
  activeTemas: string[],
  equiprobable:boolean,
) => {
  const filteredStatsPerTema = statsPerTema.filter((x) => activeTemas.includes(x[1].tema));
  const puntuaciones = filteredStatsPerTema.map((stats) => stats[1].punt);
  return Object.fromEntries(filteredStatsPerTema.map((x) => [x[0], {
    ...x[1],
    probTema: equiprobable ? 1 / activeTemas.length : getProbTema(x[1].punt, puntuaciones),
  }]));
};

const getPosibleQuestionsFor = async (
  n:number,
  completeStatsPerTema:{[k: string]: CompleteStatsPerTema},
  rng:gen.RandomSeed,
) => {
  const promises = Array(n).fill(null).map(async () => {
    const tema = getTema(completeStatsPerTema, rng);
    const level = getLevel(completeStatsPerTema[tema], rng);
    const posibleQuestions = await filterByChildCache('preguntasTestDeQuimica', 'nivelYTema', `${tema}_${level}`);
    return { tema, level, posibleQuestions };
  });
  return Promise.all(promises);
};

const getIdsWithWeights = (
  results: { tema: string; level: number; posibleQuestions: any; }[],
  temas: userDDBB['temas'],
  rng: gen.RandomSeed,
  allQuestions: boolean,
  repeatedQuestions: boolean,
) => {
  const yaPreguntado: string[] = [];

  const ids = results.map(({ tema, level, posibleQuestions }) => {
    if (!posibleQuestions) { return 'id0001'; }
    const weightedIds: string[] = allQuestions ? Object.keys(posibleQuestions) : [];
    if (!allQuestions) {
      Object.keys(posibleQuestions).forEach((id) => {
        if (!repeatedQuestions && yaPreguntado.includes(id)) { return; }
        const { aciertos, fallos } = temas[tema][`level${level}`];
        const numAc = (aciertos.match(new RegExp(id, 'g')) ?? []).length;
        const numFal = (fallos.match(new RegExp(id, 'g')) ?? []).length;
        const weight = Math.trunc((numFal + 2) / (2 ** (numAc - 1)));
        weightedIds.push(...Array(weight).fill(id));
      });
    }
    const idx = rng.intBetween(0, weightedIds.length - 1);
    const result = weightedIds[idx];
    yaPreguntado.push(result);
    return result;
  });
  return ids;
};

const getIds = async (
  n:number,
  UserDDBB: userDDBB,
  rng: gen.RandomSeed,
  temasSeleccionados:string[]|undefined = undefined,
  level:difficultyLevels = 'User',
  allQuestions = false, // Include questions with high number of correct
  repeatedQuestions = false,
) => {
  const { temas, year } = UserDDBB;
  const temasInOrder = temasSeleccionados ?? await getTemasInOrder(year);
  const statsPerTema:[string, StatsPerTema][] = Object.entries(temas)
    .map((tema) => getStatPerTema(level, tema));
  const statsPerTemaObj = Object.fromEntries(statsPerTema);
  const activeTemas = temasSeleccionados ?? getActiveTemas(temasInOrder, statsPerTemaObj);
  const completeStatsPerTema = getCompleteStats(
    statsPerTema,
    activeTemas,
    temasSeleccionados !== undefined,
  );
  const results = await getPosibleQuestionsFor(n, completeStatsPerTema, rng);
  return getIdsWithWeights(results, temas, rng, allQuestions, repeatedQuestions);
};

const getTodaysIds = async (user:CompleteUser, setter:Function) => {
  const UserDDBB = user.userDDBB;
  const ids = await getIds(5, UserDDBB, gen.create(`${getNumOfDays(Date.now())}`), undefined, 'Difícil');
  setter(new Set(ids));
};

function TestDelDia() {
  const user = useContext(UserContext)!;
  const { lastTest, unaPorUna } = user.userDDBB;
  const today = getNumOfDays(Date.now());
  const [ids, setIds] = useState<Set<string>>(new Set());
  if (lastTest && getNumOfDays(lastTest) === today) {
    return <div />;
  } // set seed
  useEffect(() => {
    getTodaysIds(user, setIds);
  }, []);
  if (ids.size === 0) return <div />;
  return <Test unaPorUna={unaPorUna} ids={ids} />;
}

export default function CustomTest({ type }:{type:string}) {
  if (type === 'testDelDia') return <TestDelDia />;
  return <div />;
}
