export const linearInterpolation = (
  val:number,
  minVal:number = 0,
  maxVal:number = 1,
  toMinVal:number = 0,
  toMaxVal:number = 1,
) => {
  if (val >= maxVal) return toMaxVal;
  if (val <= minVal) return toMinVal;
  return ((toMaxVal - toMinVal) / (maxVal - minVal)) * (val - minVal) + toMinVal;
};

export const logarithmicInterpolation = (
  val:number,
  minVal:number = 0,
  maxVal:number = 1,
  toMinVal:number = 0,
  toMaxVal:number = 1,
  log = Math.E,
) => {
  // Remove 0 and negative values due to log. 10 and 10000 are arbitrary.
  const nuevaEscala = linearInterpolation(val, minVal, maxVal, 10, 10000);
  const logMin = Math.log(10) / Math.log(log);
  const logMax = Math.log(10000) / Math.log(log);
  const logVal = Math.log(nuevaEscala) / Math.log(log);
  return linearInterpolation(logVal, logMin, logMax, toMinVal, toMaxVal);
};

export const inverseLogInterpolation = (
  val:number,
  minVal:number = 0,
  maxVal:number = 1,
  toMinVal:number = 0,
  toMaxVal:number = 1,
  log = Math.E,
) => {
  // Remove 0 and negative values due to log. 10 and 10000 are arbitrary.
  const logMin = Math.log(10) / Math.log(log);
  const logMax = Math.log(10000) / Math.log(log);
  const nuevaEscala = linearInterpolation(val, minVal, maxVal, logMin, logMax);
  return linearInterpolation(log ** nuevaEscala, log ** logMin, log ** logMax, toMinVal, toMaxVal);
};
