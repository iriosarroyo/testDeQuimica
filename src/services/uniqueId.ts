const uniqueIdFuncGen = (start:number) => {
  let inicio = start;
  return (step = 1) => {
    inicio += step;
    return inicio;
  };
};

const uniqueId = uniqueIdFuncGen(0);

export default uniqueId;
