import { PATHS_DDBB } from 'info/paths';
import gen from 'random-seed';
import { PreguntaTest, UserDDBB } from 'types/interfaces';
import { filterByChildCache } from './database';
import { QuestionError } from './errores';
import {
  getPreguntaWeight,
  getProbLevel1, getProbLevel2, getProbLevel3, getProbTema, getPuntuacionDelTema, getTemasInOrder,
} from './probability';
import { getNumOfDays } from './time';

type UserData = {temas?:UserDDBB['temas'], year:UserDDBB['year']}
interface PreguntasGenParams {
    userData:UserData,
    seed?: number| string,
    allQuestions?: boolean,
    overwriteTemas?:string[],
    overwriteLevels?:{'1':number, '2':number, '3':number}
}

const weightedProbability = <T>(rng: gen.RandomSeed, weights:[T, number][], sum = 1) => {
  const rnd = rng.floatBetween(0, sum);
  let acum = 0;
  return (weights.find(([, prob]) => {
    acum += prob;
    return rnd <= acum;
  }) ?? weights[weights.length - 1])[0];
};

const getActiveTemasWithPunt = async (
  temas:UserDDBB['temas'],
  year:string,
  overwriteTemas?:string[],
  factor = 1,
) => {
  const order = overwriteTemas ?? await getTemasInOrder(year);
  const temasWithPunt:[string, number][] = [];
  for (let i = 0; i < order.length; i++) {
    const punt = Math.min(10, getPuntuacionDelTema(temas?.[order[i]]) * factor);
    temasWithPunt.push([order[i], punt]);
    if (!overwriteTemas && (factor !== 1 ? punt === 0 : punt < 4)) break;
  }
  return temasWithPunt;
};

/**
 *
 * @param temas array with [topic, score] elements
 */
const getProbsTemasLevels = (
  temas:[string, number][],
  overwriteLevels:PreguntasGenParams['overwriteLevels'],
  temasEquiprobable = false,
):[string, number][] => {
  const puntPerTema = temas.map(([, punt]) => punt);
  return temas.flatMap(([tema, punt]) => {
    const probTema = temasEquiprobable ? 1 / temas.length : getProbTema(punt, puntPerTema);
    return [
      [`${tema}_1`, probTema * (overwriteLevels?.[1] ?? getProbLevel1(punt))],
      [`${tema}_2`, probTema * (overwriteLevels?.[2] ?? getProbLevel2(punt))],
      [`${tema}_3`, probTema * (overwriteLevels?.[3] ?? getProbLevel3(punt))],
    ];
  });
};

type PregsPerLevel = {[k:string]:{[k:string]:PreguntaTest}}
type WeightsPregsPerLevel = {[k:string]:[{[k:string]:number}, number]|undefined}

// Modifies weightsPregsPerLevel and pregsPerLevel
const calculateWeightPerQuestion = async (
  levelYTema:string,
  allQuestions:boolean|undefined,
  temas:UserDDBB['temas'],
  weightsPregsPerLvl:WeightsPregsPerLevel,
  pregsPerLvl:PregsPerLevel,
  previousIds:Set<string>,
) => {
  const weightsPregsPerLevel = weightsPregsPerLvl;
  const pregsPerLevel = pregsPerLvl;
  const [tema, level] = levelYTema.split('_');
  const posibleQuestions:{[k:string]:PreguntaTest} = await filterByChildCache(PATHS_DDBB.preguntas, 'nivelYTema', levelYTema);
  pregsPerLevel[levelYTema] = posibleQuestions;
  let totalWeight = 0;
  const weightsArray = Object.keys(posibleQuestions ?? {}).map((id) => {
    if (previousIds.has(id)) return [id, 0]; // Filter afterwards
    const thisQuesWeight = allQuestions ? 1 : getPreguntaWeight(temas?.[tema]?.[`level${level}`], id);
    totalWeight += thisQuesWeight;
    return [id, thisQuesWeight];
  }).filter(([, w]) => w !== 0); // remove weightes with 0
  weightsPregsPerLevel[levelYTema] = [Object.fromEntries(weightsArray), totalWeight];
};

// Modifies weightsPregsPerLevel and previousIds
const pickQuestion = (
  rng: gen.RandomSeed,
  levelYTema:string,
  weightsPregsPerLvl:WeightsPregsPerLevel,
  pregsPerLevel:PregsPerLevel,
  previousIds:Set<string>,
) => {
  const weightsPregsPerLevel = weightsPregsPerLvl;
  const [levelYTemaWeights, levelYTemaTotalWeight] = weightsPregsPerLevel[levelYTema]!;
  const pregId = weightedProbability(
    rng,
    Object.entries(levelYTemaWeights),
    levelYTemaTotalWeight,
  );
  previousIds.add(pregId);
  weightsPregsPerLevel[levelYTema]![1] -= levelYTemaWeights[pregId]; // Remove from total
  delete levelYTemaWeights[pregId]; // delete because 0: no work, gets last elem if every is 0
  return pregsPerLevel[levelYTema][pregId];
};

const NUM_OF_TRIES = 1000; // try 1000 times to get question

// factor multiplies puntuation by that factor, so new topics are more probable
// and more difficult questions are also more probable
const prepareVarsForGen = async (
  temas:UserDDBB['temas'],
  year:UserDDBB['year'],
  overwriteTemas:PreguntasGenParams['overwriteTemas'],
  overwriteLevels: PreguntasGenParams['overwriteLevels'],
  factor = 1,
) => {
  const activeTemas = await getActiveTemasWithPunt(temas, year, overwriteTemas, factor);
  const weights = getProbsTemasLevels(activeTemas, overwriteLevels, overwriteTemas !== undefined);
  const weightsPregsPerLevel:WeightsPregsPerLevel = {};
  const pregsPerLevel:PregsPerLevel = {};
  return { weights, weightsPregsPerLevel, pregsPerLevel };
};

const FACTOR = 0.5;

const preguntasGen = async (
  {
    userData,
    seed = getNumOfDays(Date.now()),
    overwriteTemas,
    overwriteLevels,
    allQuestions,
  }:PreguntasGenParams,
) => {
  const rng = gen.create(`${seed}`);
  const { temas, year } = userData;
  const previousIds:Set<string> = new Set();
  let restart = 1;
  let { pregsPerLevel, weights, weightsPregsPerLevel } = await prepareVarsForGen(
    temas,
    year,
    overwriteTemas,
    overwriteLevels,
  );
  async function* generator() {
    while (true) {
      let question;
      for (let i = 0; i < NUM_OF_TRIES; i++) {
        const levelYTema = weightedProbability(rng, weights);
        if (!(levelYTema in weightsPregsPerLevel)) {
          // We can't do this in parallel due to the rng
          // eslint-disable-next-line no-await-in-loop
          await calculateWeightPerQuestion(
            levelYTema,
            allQuestions,
            temas,
            weightsPregsPerLevel,
            pregsPerLevel,
            previousIds,
          );
        }
        try {
          question = pickQuestion(
            rng,
            levelYTema,
            weightsPregsPerLevel,
            pregsPerLevel,
            previousIds,
          );
          break;
        } catch {
          // New iteration if error
        }
      }
      if (question === undefined) {
        if (overwriteTemas || overwriteLevels) throw new QuestionError();
        // eslint-disable-next-line no-await-in-loop
        ({ pregsPerLevel, weights, weightsPregsPerLevel } = await prepareVarsForGen(
          temas,
          year,
          overwriteTemas,
          overwriteLevels,
          1 + restart * FACTOR,
        ));
        if (restart === 5) throw new QuestionError();
        restart++;
        // eslint-disable-next-line no-continue
        continue;
      }
      yield question;
    }
  }

  const useGen = generator();
  const getNextQuestion = () => useGen.next().then((x) => {
    if (x.done) throw new QuestionError();
    return x.value;
  });
  return getNextQuestion;
};

export const getNQuestions = async (n:number, param:PreguntasGenParams) => {
  const getNextQuestion = await preguntasGen(param);
  return [await Promise.all(Array(n).fill(null).map(getNextQuestion)), getNextQuestion];
};

export const getNQuestionsWithSetters = async (
  setter:Function,
  setError:Function,
  n:number,
  param:PreguntasGenParams,
  setterNextQuestion?:(a:any) => any,
) => {
  try {
    const [preguntas, getNext]:any[] = await getNQuestions(n, param);
    setter(preguntas);
    if (setterNextQuestion) setterNextQuestion(() => getNext);
  } catch (e) {
    setError(e);
  }
};

export default preguntasGen;
