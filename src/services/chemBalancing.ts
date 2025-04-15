import {
  dotDivide, dotMultiply, fraction, gcd, lcm, round, subtract,
} from 'mathjs';
import general from 'info/general.json';
import tablaPeriodica from 'info/tablaPeriodica.json';
import {
  AdjustedReaction, Atom, Molecule, MoleculeNoOxidation, Reaction,
} from 'types/chemistry';

const getCharge = (molecule:string) => {
  if (!['[', '+', '-'].some((x) => molecule.includes(x))) return 0;
  const REGEX_CHARGE = /\[(?<ch1>[0-9]*)(?<sign1>(?:\+|-)?)(?<ch2>[0-9]*)\]|(?<sign2>\+|-)(?<ch3>[0-9]*)\s*$/;
  const match = molecule.match(REGEX_CHARGE);
  if (!match || !match.groups) return 0;
  const {
    ch1, ch2, ch3, sign1, sign2,
  } = match.groups;
  let chargeVal = '1';
  if (sign1 !== undefined) {
    if (ch1) chargeVal = ch1;
    if (ch2) chargeVal = ch2;
    return Number(`${sign1}${chargeVal}`);
  }
  if (ch3) chargeVal = ch3;
  return Number(`${sign2}${chargeVal}`);
};

const addOxidationNumbers = (molecule:MoleculeNoOxidation):Molecule => {
  const { atoms, charge } = molecule;
  const res = molecule as Molecule; // We add oxNums in the following code
  if (atoms.length === 1) res.oxNums = [charge / atoms[0].num];
  res.oxNums = [];
  return res;
};

export const getAtomsOfMolec = (molecule:string) => {
  const REGEX_ELEM = /(?<elem>[A-Z][a-z]?|e)(?<num>[0-9]*)|\((?<grp>.+)\)(?<grpNum>[0-9]+)/g;
  const matches = molecule.matchAll(REGEX_ELEM);
  let currMatch = matches.next();
  const result:MoleculeNoOxidation = {
    atoms: [],
    charge: getCharge(molecule),
  };
  while (!currMatch.done) {
    const { groups } = currMatch.value;
    if (!groups) throw Error('Expecting some groups'); // If it matches, it should always have gruops
    if (groups.grpNum !== undefined) {
      result.atoms.push({
        elem: groups.grp,
        num: Number(groups.grpNum),
        atoms: getAtomsOfMolec(groups.grp).atoms,
      });
    } else {
      result.atoms.push({ elem: groups.elem, num: Math.max(Number(groups.num), 1) });
    }
    currMatch = matches.next();
  }
  return addOxidationNumbers(result);
};

export const getTotalAtoms = (
  atoms:Atom[],
  result:{[k:string]:number} = {},
  factor = 1,
) => {
  atoms.forEach(({ elem, num, atoms: grpAtoms }) => {
    if (elem === 'e') return undefined;
    if (grpAtoms) return getTotalAtoms(grpAtoms, result, factor * num);
    // eslint-disable-next-line no-param-reassign
    result[elem] = (result[elem] ?? 0) + factor * num;
    return undefined;
  });
  return result;
};

const { translations } = general;
const symbol2Name = translations.symbol2Name as {[k:string]: keyof typeof tablaPeriodica};

export const sorterByElectNeg = ([a]:[string, number], [b]:[string, number]) => {
  if (!(a in translations.symbol2Name && b in translations.symbol2Name)) {
    // throw Error('Element not in dictionary');
  }
  const elemA = symbol2Name[a];
  const elemB = symbol2Name[b];
  const electroA = tablaPeriodica[elemA]?.electronegativity_pauling;
  const electroB = tablaPeriodica[elemB]?.electronegativity_pauling;
  if (!electroA) return -1;
  if (!electroB) return 1;
  return electroA - electroB;
};

export const getFormula = (molecule:string, empirical = false) => {
  const { atoms, charge } = getAtomsOfMolec(molecule);
  const totalAtom = getTotalAtoms(atoms);
  const totalAtomVals = Object.values(totalAtom);
  let gcdNumAtoms = 1;
  if (empirical) gcdNumAtoms = totalAtomVals.length > 1 ? gcd(...totalAtomVals) : totalAtomVals[0];
  const totalAtomEntries = Object.entries(totalAtom);
  totalAtomEntries.sort(sorterByElectNeg);
  let result = '';
  totalAtomEntries.forEach(([atom, num]) => {
    const newSubIdx = num / gcdNumAtoms;
    result += `${atom}${newSubIdx > 1 ? newSubIdx : ''}`;
  });
  if (charge !== 0) result += `[${charge !== 1 ? Math.abs(charge) : ''}${charge < 0 ? '-' : '+'}]`;
  return result;
};

export const getMolecularMass = (molecule:Molecule) => {
  const atoms = getTotalAtoms(molecule.atoms);
  return Object.entries(atoms).reduce((sum, [atom, number]) => (
    sum + number * tablaPeriodica[symbol2Name[atom]].atomic_mass
  ), 0);
};

const getStoichiometricCoef = (molecule:string, explicit1:boolean) => {
  const REGEX_COEF = /^\s*(?<coef>[0-9.,]+)/;
  const coef = molecule.match(REGEX_COEF)?.groups?.coef;
  if (explicit1 && (coef === null || coef === undefined)) return null;
  return Number(coef?.replace(',', '.') ?? 1);
};

const getStateMolec = (molecule:string) => {
  const REGEX_STAT = /\(\s*(?<state>[a-z]+)\s*\)/;
  return molecule.match(REGEX_STAT)?.groups?.state ?? null;
};

export const parseReaction = (reaction:string, explicit1 = false):Reaction => {
  const SPLIT_BY_SUM_REGEX = /\+(?=\s*[0-9.,]*[A-Z(e])/;
  const compentsOfReaction = reaction.split(/=|->|<->/) // The split divides the reaction into reactants and products (parts)
    .map((part) => part.split(SPLIT_BY_SUM_REGEX));
  const [reactants, products] = compentsOfReaction.map((part) => part.map(getAtomsOfMolec));
  const [coefReact, coefProd] = compentsOfReaction.map((part) => part
    .map((comp) => getStoichiometricCoef(comp, explicit1)));
  const [stateReact, stateProd] = compentsOfReaction.map((part) => part.map(getStateMolec));
  return {
    reactants,
    products,
    coefReact,
    coefProd,
    stateReact,
    stateProd,
    symbol: reaction.includes('<->'),
  };
};

const symmetricDiff = (set1:Set<any>, set2:Set<any>) => {
  const symDiff = new Set();
  set1.forEach((val) => { if (!set2.has(val)) symDiff.add(val); });
  set2.forEach((val) => { if (!set1.has(val)) symDiff.add(val); });
  return symDiff;
};

// it modifies the original matrix
const swapRows = (matrix:number[][], i:number, j:number) => {
  const temp = matrix[i];
  // eslint-disable-next-line no-param-reassign
  matrix[i] = matrix[j];
  // eslint-disable-next-line no-param-reassign
  matrix[j] = temp;
};

export const rowEchelon = (matrix:number[][]) => {
  let lead = 0;
  const rowCount = matrix.length;
  const columnCount = matrix[0].length;
  const echelon = matrix;
  for (let r = 0; r < rowCount; r++) {
    if (columnCount <= lead) return echelon;
    let i = r;
    while (echelon[i][lead] === 0) {
      i += 1;
      if (rowCount === i) {
        i = r;
        lead += 1;
        if (columnCount === lead) return echelon;
      }
    }
    if (i !== r) swapRows(echelon, i, r);
    echelon[r] = dotDivide(echelon[r], echelon[r][lead]);
    for (let j = 0; j < rowCount; j++) {
      if (j !== r) echelon[j] = subtract(echelon[j], dotMultiply(echelon[r], echelon[j][lead]));
    }
    lead += 1;
  }
  return echelon;
};

const solveSystem = (coefMatrix: number[][], colMatrix: number[]) => {
  const numOfSolutions = coefMatrix[0].length;
  if (numOfSolutions > coefMatrix.length) throw Error('Infinite solutions');
  const amplifiedMatrix = coefMatrix.slice();
  amplifiedMatrix.forEach((_, idx) => amplifiedMatrix[idx].push(colMatrix[idx]));
  const echelon = rowEchelon(amplifiedMatrix);
  const solutions = echelon.slice(0, numOfSolutions).map((x) => x.at(-1) ?? NaN);
  console.log({ echelon, numOfSolutions, solutions });
  return solutions;
};

export const balanceReaction = (reaction: Reaction):AdjustedReaction => {
  const {
    reactants, products, coefReact, coefProd, stateProd,
  } = reaction;
  if (reactants === undefined || products === undefined
    || coefReact === undefined || coefProd === undefined) {
    throw Error('Faltan reactivos o productos');
  }
  const atomsReact = reactants.map(({ atoms }) => getTotalAtoms(atoms));
  const chargeReact = reactants.map(({ charge }) => charge);
  const atomsProd = products.map(({ atoms }) => getTotalAtoms(atoms));
  const chargeProd = products.map(({ charge }) => charge);
  const setAtomsReact = new Set(atomsReact.flatMap(Object.keys));
  const setAtomsProd = new Set(atomsProd.flatMap(Object.keys));

  const symDiffAtoms = symmetricDiff(setAtomsProd, setAtomsReact);
  if (symDiffAtoms.size > 0) {
    throw Error('No hay los mismos átomos en los reactivos y productos');
  }
  let fixedMolecule:{[k:string]:number};
  let fixedCharge:number;
  const notUndefinedCoefReact = coefReact.findIndex((x) => x !== null);
  const notUndefinedCoefProd = coefProd.findIndex((x) => x !== null);
  let usingProd = false;
  let coefficientFixed = 1;
  if (notUndefinedCoefReact !== -1) {
    [fixedMolecule] = atomsReact.splice(notUndefinedCoefReact, 1);
    [fixedCharge] = chargeReact.splice(notUndefinedCoefReact, 1);
    coefficientFixed = coefReact[notUndefinedCoefReact]!;
  } else if (notUndefinedCoefProd !== -1) {
    [fixedMolecule] = atomsProd.splice(notUndefinedCoefProd, 1);
    [fixedCharge] = chargeProd.splice(notUndefinedCoefProd, 1);
    coefficientFixed = coefProd[notUndefinedCoefProd]!;
    usingProd = true;
  } else {
    [fixedMolecule] = atomsReact.splice(0, 1);
    [fixedCharge] = chargeReact.splice(0, 1);
  }
  const matrixCoef:number[][] = [];
  const matrixSol:number[] = [];
  setAtomsReact.forEach((atom) => {
    matrixCoef.push(atomsReact.map((comp) => comp[atom] ?? 0)
      .concat(atomsProd.map((comp) => -(comp[atom] ?? 0))));
    matrixSol.push((usingProd ? 1 : -1) * coefficientFixed * (fixedMolecule[atom] ?? 0));
  });
  matrixCoef.push(chargeReact.concat(chargeProd.map((c) => -c)));
  matrixSol.push((usingProd ? 1 : -1) * coefficientFixed * fixedCharge);
  // console.log(matrixCoef);
  const coeffSol = solveSystem(matrixCoef, matrixSol);
  // This is not the real type of denominators, but lcm typing is wrong
  const denominators = coeffSol.map((x) => fraction(Number(x)).d) as [number];
  const minCoeff = notUndefinedCoefProd === -1 && notUndefinedCoefReact === -1
    ? lcm(...denominators, 1) : 1;
  const coeffSolNorm = notUndefinedCoefProd === -1 && notUndefinedCoefReact === -1
    ? dotMultiply(coeffSol, minCoeff) : coeffSol;
  const newCoefProd = coeffSolNorm.splice(atomsReact.length).map((x) => round(x, 2));
  const newCoefReact = coeffSolNorm.map((x) => round(x, 2));
  if (usingProd) newCoefProd.splice(notUndefinedCoefProd, 0, round(coefficientFixed * minCoeff, 2));
  else {
    newCoefReact.splice(
      notUndefinedCoefReact === -1 ? 0 : notUndefinedCoefReact,
      0,
      round(coefficientFixed * minCoeff, 2),
    );
  }
  const chargeReactAfter = newCoefReact.reduce(
    (acum, coef, i) => acum + coef * reactants[i].charge,
    0,
  );
  const chargeProdAfter = newCoefProd.reduce(
    (acum, coef, i) => acum + coef * products[i].charge,
    0,
  );
  if (chargeReactAfter !== chargeProdAfter) throw new Error('Cargas no ajustadas');
  return {
    ...reaction,
    stateProd: stateProd ?? newCoefProd.map(() => null),
    coefReact: newCoefReact as number[],
    coefProd: newCoefProd as number[],

  };
};
