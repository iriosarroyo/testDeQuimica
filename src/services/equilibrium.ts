import { AdjustedReaction } from 'types/chemistry';

const MAX_ITER = 1000;
type SolverReturn = {x:number, y:number}

const calcTermInvQuad = (
  x:number,
  valX:number,
  valY:number,
  valZ:number,
) => (x * valY * valZ) / ((valX - valY) * (valX - valZ));
const invQuadInterpol = (
  a:number,
  b:number,
  c:number,
  valA:number,
  valB:number,
  valC:number,
) => (calcTermInvQuad(a, valA, valB, valC)
+ calcTermInvQuad(b, valB, valA, valC)
+ calcTermInvQuad(c, valC, valA, valB));

// https://en.wikipedia.org/wiki/Brent%27s_method
export const brentsMethod = (
  fn: (x:number) => number,
  left:number,
  right:number,
  maxIter:number = MAX_ITER,
  convergence = 0,
):SolverReturn => {
  let [a, b] = [left, right];
  let valA = fn(a);
  let valB = fn(b);
  if (valA * valB > 0) throw Error('Root not bracketed');
  if (Math.abs(valA) < Math.abs(valB)) [a, b] = [b, a]; // swap
  let c = a;
  let d:number = c; // Won't be use in the first iteration, mflag is set
  let s:number;
  let mflag = true;
  for (let i = 0; i < maxIter; i++) {
    valA = fn(a);
    valB = fn(b);
    const valC = fn(c);
    if (Math.abs(valA) < Math.abs(valB)) [a, b, valA, valB] = [b, a, valB, valA];
    if (valB === 0 || Math.abs(b - a) <= convergence) return { x: b, y: valB };
    if (valA !== valC && valB !== valC) s = invQuadInterpol(a, b, c, valA, valB, valC);
    else s = b - (valB * (b - a)) / (valB - valA); // secant
    if (!((3 * a + b) / 4 < s && s < b) // s not between (3a+b)/4 and b
      || (mflag && Math.abs(s - b) >= Math.abs(b - c) / 2)
      || (!mflag && Math.abs(s - b) >= Math.abs(c - d) / 2)
      || (mflag && Math.abs(b - c) < convergence)
      || (!mflag && Math.abs(c - d) < convergence)
    ) {
      s = (a + b) / 2;
      mflag = true;
    } else mflag = false;
    const valS = fn(s);
    d = c;
    c = b;
    if (valA * valS < 0) b = s;
    else a = s;
  }
  return { x: b, y: fn(b) };
};

export const secantMethod = (
  fn: (x:number) => number,
  a:number,
  b:number,
  maxIter = MAX_ITER,
  n: number = 0,
):SolverReturn => {
  const aVal = fn(a);
  const bVal = fn(b);
  const middle = a - aVal * ((b - a) / (bVal - aVal));
  const currVal = fn(middle);
  if (currVal === 0 || n >= maxIter) return { x: middle, y: currVal };
  const [newA, newB] = fn(a) * currVal > 0 ? [middle, b] : [a, middle];
  return secantMethod(fn, newA, newB, maxIter, n + 1);
};
export const bisectionMethod = (
  fn: (x:number) => number,
  a:number,
  b:number,
  maxIter = MAX_ITER,
  n: number = 0,
):SolverReturn => {
  const middle = (a + b) / 2;
  const currVal = fn(middle);
  if (currVal === 0 || n >= maxIter) return { x: middle, y: currVal };
  const [newA, newB] = fn(a) * currVal > 0 ? [middle, b] : [a, middle];
  return bisectionMethod(fn, newA, newB, maxIter, n + 1);
};

const solveEquation = (fn:(x:number) => number, lower:number, upper:number, maxIter:number) => {
  const { x, y } = brentsMethod(fn, lower, upper, maxIter);
  if (y === 0) return { valX: x, error: 0, method: 'Brent' };
  const { x: xSec, y: ySec } = secantMethod(fn, lower, upper, maxIter);
  if (ySec === 0) return { valX: xSec, error: 0, method: 'Secant' };
  const { x: xBis, y: yBis } = bisectionMethod(fn, lower, upper, maxIter);
  if (yBis === 0) return { valX: xBis, error: 0, method: 'Bisect' };
  const [absYBre, absYSec, absYBis] = [Math.abs(y), Math.abs(ySec), Math.abs(yBis)];
  if (absYBre <= absYSec && absYBre <= absYBis) return { valX: x, error: absYBre, method: 'Brent' };
  if (absYSec <= absYBis) return { valX: xSec, error: absYSec, method: 'Secant' };
  return { valX: xBis, error: absYBis, method: 'Bisect' };
};

const calcQ = (
  concReact:number[],
  concProd:number[],
  coefReact:number[],
  coefProd:number[],
  stateReact:(string|null)[],
  stateProd:(string|null)[],
  notContributingStates:Set<string|null>,
) => {
  const calcComp = (coef:number[], states:(string|null)[]) => (
    (total:number, curr:number, idx:number) => {
      if (notContributingStates.has(states[idx])) return total;
      return total * curr ** coef[idx];
    }
  );
  const num = concProd.reduce(calcComp(coefProd, stateProd), 1);
  const den = concReact.reduce(calcComp(coefReact, stateReact), 1);
  return num / den;
};

const STATES_NOT_IN_KC = new Set<string|null>(['l', 's']);
const STATES_NOT_IN_KP = new Set<string|null>(['l', 's', 'ac', 'aq']);

export const equilibrium = (
  reaction: AdjustedReaction,
  concReact:number[],
  concProd:number[],
  K:number,
  type: 'Kc' | 'Kp' | 'Keq' = 'Keq',
) => {
  const {
    coefReact, coefProd, stateReact, stateProd,
  } = reaction;
  const notContributingStates = type === 'Kp' ? STATES_NOT_IN_KP : STATES_NOT_IN_KC;
  const Q = calcQ(
    concReact,
    concProd,
    coefReact,
    coefProd,
    stateReact,
    stateProd,
    notContributingStates,
  );
  const direction = Q < K ? 1 : -1;

  const molLimit = Math.min(...(Q < K ? concReact : concProd)
    .map((x, idx) => x / (Q < K ? coefReact : coefProd)[idx]));

  const calcComponent = (coef:number[], states:(string|null)[], x:number, react:number = -1) => (
    (total:number, curr:number, idx:number) => {
      if (notContributingStates.has(states[idx])) return total;
      return total * (curr + react * direction * coef[idx] * x) ** coef[idx];
    }
  );
  const fn = (x:number) => {
    const calcReacts = concReact.reduce(calcComponent(coefReact, stateReact, x), 1);
    const calcProds = concProd.reduce(calcComponent(coefProd, stateProd, x, 1), 1);
    return (Number.isFinite(K) ? 1 : 0) * calcProds - (Number.isFinite(K) ? K : 1) * calcReacts;
  };
  const { valX } = solveEquation(fn, 0, molLimit, Number.isFinite(K) ? MAX_ITER : 1000);
  const usedOrFormedReact = coefReact.map((x) => parseFloat((-direction * x * valX)
    .toPrecision(2)));
  const usedOrFormedProd = coefProd.map((x) => parseFloat((direction * x * valX).toPrecision(2)));
  return {
    usedOrFormedProd,
    usedOrFormedReact,
    equilibriumProd: concProd.map((n, idx) => parseFloat((n + usedOrFormedProd[idx])
      .toPrecision(2))),
    equilibriumReact: concReact.map((n, idx) => parseFloat((n + usedOrFormedReact[idx])
      .toPrecision(2))),
  };
};
