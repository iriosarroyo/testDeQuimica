const uniqueIdFuncGen = (start:number) => {
  let inicio = start;
  return (step = 1) => {
    inicio += step;
    return inicio;
  };
};

const uniqueId = uniqueIdFuncGen(0);

const ID_LENGTH = 32;
const validStarting = 'qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM';
const validChars = 'qwertyuiopasdfghjklzxcvbnm-_1234567890QWERTYUIOPASDFGHJKLZXCVBNM';
export const idForOpt = (optsIds:string[]):string => {
  let id = validStarting[Math.floor(validStarting.length * Math.random())];
  while (id.length < ID_LENGTH) {
    id += validChars[Math.floor(validChars.length * Math.random())];
  }
  if (optsIds.includes(id)) return idForOpt(optsIds);
  return id;
};

const usedUIDS:string[] = [];
export const getUid = (idLength = 32):string => {
  let id = validStarting[Math.floor(validStarting.length * Math.random())];
  while (id.length < idLength) {
    id += validChars[Math.floor(validChars.length * Math.random())];
  }
  if (usedUIDS.includes(id)) return getUid();
  usedUIDS.push(id);
  return id;
};
export default uniqueId;
