/* eslint-disable no-undef */
import { balanceReaction, parseReaction } from 'services/chemBalancing';
import {
  bisectionMethod, brentsMethod, equilibrium, secantMethod,
} from 'services/equilibrium';

test('Test bisection', () => {
  expect(bisectionMethod((x) => x, -5, 5).x).toBeCloseTo(0, 1);
  expect(bisectionMethod((x) => x ** 2 - 1, 0, 100).x).toBeCloseTo(1, 1);
  expect(secantMethod((x) => x, -5, 5).x).toBeCloseTo(0, 1);
  expect(secantMethod((x) => x ** 2 - 1, 0, 100).x).toBeCloseTo(1, 1);
  expect(brentsMethod((x) => x ** 2 - 1, 0, 100).x).toBeCloseTo(1, 1);
  expect(brentsMethod((x) => x, -5, 5).x).toBeCloseTo(0, 1);
});

test('Equilibrium', () => {
  const reaction = balanceReaction(parseReaction('H2->H2', true));
  expect(equilibrium(reaction, [1], [0], 1)).toStrictEqual({
    usedOrFormedProd: [0.5],
    usedOrFormedReact: [-0.5],
    equilibriumProd: [0.5],
    equilibriumReact: [0.5],
  });
  expect(equilibrium(reaction, [1], [1], 1)).toStrictEqual({
    usedOrFormedProd: [0],
    usedOrFormedReact: [0],
    equilibriumProd: [1],
    equilibriumReact: [1],
  });
  expect(equilibrium(reaction, [0], [1], 1)).toStrictEqual({
    usedOrFormedProd: [-0.5],
    usedOrFormedReact: [0.5],
    equilibriumProd: [0.5],
    equilibriumReact: [0.5],
  });

  expect(equilibrium(reaction, [1], [0], Infinity)).toStrictEqual({
    usedOrFormedProd: [1],
    usedOrFormedReact: [-1],
    equilibriumProd: [1],
    equilibriumReact: [0],
  });
  expect(equilibrium(reaction, [0], [1], Infinity)).toStrictEqual({
    usedOrFormedProd: [0],
    usedOrFormedReact: [0],
    equilibriumProd: [1],
    equilibriumReact: [0],
  });
  expect(equilibrium(reaction, [0.5], [0.5], Infinity)).toStrictEqual({
    usedOrFormedProd: [0.5],
    usedOrFormedReact: [-0.5],
    equilibriumProd: [1],
    equilibriumReact: [0],
  });
  expect(equilibrium(reaction, [0], [1], 2)).toStrictEqual({
    usedOrFormedProd: [-0.33],
    usedOrFormedReact: [0.33],
    equilibriumProd: [0.67],
    equilibriumReact: [0.33],
  });
  expect(equilibrium(reaction, [0], [1], 0)).toStrictEqual({
    usedOrFormedProd: [-1],
    usedOrFormedReact: [1],
    equilibriumProd: [0],
    equilibriumReact: [1],
  });
  expect(equilibrium(reaction, [9e99], [0], Infinity)).toStrictEqual({
    usedOrFormedProd: [9e99],
    usedOrFormedReact: [-9e99],
    equilibriumProd: [9e99],
    equilibriumReact: [0],
  });
  expect(equilibrium(balanceReaction(parseReaction('AB->A+B')), [2], [0, 0], 1)).toStrictEqual({
    usedOrFormedProd: [1, 1],
    usedOrFormedReact: [-1],
    equilibriumProd: [1, 1],
    equilibriumReact: [1],
  });

  expect(equilibrium(
    balanceReaction(parseReaction('H2 + I2 <-> 2HI')),
    [0, 0],
    [4],
    25,
  )).toStrictEqual({
    usedOrFormedProd: [-1.1],
    usedOrFormedReact: [0.57, 0.57],
    equilibriumProd: [2.9],
    equilibriumReact: [0.57, 0.57],
  });
  expect(equilibrium(
    balanceReaction(parseReaction('AgCH3COO(s) <-> Ag++CH3COO-')),
    [0.1],
    [0, 0],
    3.73e-3,
  )).toStrictEqual({
    usedOrFormedProd: [6.1e-2, 6.1e-2],
    usedOrFormedReact: [-6.1e-2],
    equilibriumProd: [6.1e-2, 6.1e-2],
    equilibriumReact: [parseFloat((0.1 - 6.1e-2).toPrecision(2))],
  });
  expect(equilibrium(
    balanceReaction(parseReaction('AgCH3COO(s) <-> Ag++CH3COO-')),
    [0.1],
    [0, 0],
    1e-6,
  )).toStrictEqual({
    usedOrFormedProd: [1e-3, 1e-3],
    usedOrFormedReact: [-1e-3],
    equilibriumProd: [1e-3, 1e-3],
    equilibriumReact: [0.099],
  });
  expect(equilibrium(
    balanceReaction(parseReaction('4NH3 + O2 -> N2O4 + H2O')),
    [0, 0],
    [3.6, 3.6],
    3.06e-6,
  )).toStrictEqual({
    usedOrFormedProd: [-1, -3],
    usedOrFormedReact: [2, 3.5],
    equilibriumProd: [2.6, 0.6],
    equilibriumReact: [2, 3.5],
  });
});
