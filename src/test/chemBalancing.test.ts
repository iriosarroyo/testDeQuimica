/* eslint-disable no-undef */
import {
  balanceReaction,
  getAtomsOfMolec, getFormula, getMolecularMass, getTotalAtoms, parseReaction, rowEchelon,
} from '../services/chemBalancing';

test('Test getting elements output structure', () => {
  expect(getAtomsOfMolec('H2SO4')).toBeDefined();
  expect(getAtomsOfMolec('H2SO4')).toHaveProperty('atoms');
  expect(getAtomsOfMolec('H2SO4')).toHaveProperty('charge');
  expect(getAtomsOfMolec('H2SO4')).toStrictEqual({
    atoms: [{ elem: 'H', num: 2 }, { elem: 'S', num: 1 }, { elem: 'O', num: 4 }],
    charge: 0,
  });
  expect(getAtomsOfMolec('H2')).toStrictEqual({
    atoms: [{ elem: 'H', num: 2 }],
    charge: 0,
  });
  expect(getAtomsOfMolec('H2O')).toStrictEqual({
    atoms: [{ elem: 'H', num: 2 }, { elem: 'O', num: 1 }],
    charge: 0,
  });
  expect(getAtomsOfMolec('NaCl')).toStrictEqual({
    atoms: [{ elem: 'Na', num: 1 }, { elem: 'Cl', num: 1 }],
    charge: 0,
  });
  expect(getAtomsOfMolec('C2H4O')).toStrictEqual({
    atoms: [{ elem: 'C', num: 2 }, { elem: 'H', num: 4 }, { elem: 'O', num: 1 }],
    charge: 0,
  });
  expect(getAtomsOfMolec('CH3COOH')).toStrictEqual({
    atoms: [{ elem: 'C', num: 1 }, { elem: 'H', num: 3 }, { elem: 'C', num: 1 }, { elem: 'O', num: 1 }, { elem: 'O', num: 1 }, { elem: 'H', num: 1 }],
    charge: 0,
  });
  expect(getAtomsOfMolec('Na2C10H14N2O8')).toStrictEqual({
    atoms: [{ elem: 'Na', num: 2 }, { elem: 'C', num: 10 }, { elem: 'H', num: 14 }, { elem: 'N', num: 2 }, { elem: 'O', num: 8 }],
    charge: 0,
  });
  expect(getAtomsOfMolec('Al(NO3)3')).toStrictEqual({
    atoms: [{ elem: 'Al', num: 1 }, {
      elem: 'NO3',
      num: 3,
      atoms: [{ elem: 'N', num: 1 }, { elem: 'O', num: 3 }],
    }],
    charge: 0,
  });
  expect(getAtomsOfMolec('Al2(SO4)3')).toStrictEqual({
    atoms: [{ elem: 'Al', num: 2 }, {
      elem: 'SO4',
      num: 3,
      atoms: [{ elem: 'S', num: 1 }, { elem: 'O', num: 4 }],
    }],
    charge: 0,
  });
  expect(getAtomsOfMolec('(NH4)2CO3')).toStrictEqual({
    atoms: [{
      elem: 'NH4',
      num: 2,
      atoms: [{ elem: 'N', num: 1 }, { elem: 'H', num: 4 }],
    }, { elem: 'C', num: 1 }, { elem: 'O', num: 3 },
    ],
    charge: 0,
  });
  expect(getAtomsOfMolec('(CH3CNOH)2')).toStrictEqual({
    atoms: [{
      elem: 'CH3CNOH',
      num: 2,
      atoms: [{ elem: 'C', num: 1 }, { elem: 'H', num: 3 },
        { elem: 'C', num: 1 }, { elem: 'N', num: 1 },
        { elem: 'O', num: 1 }, { elem: 'H', num: 1 },
      ],
    },
    ],
    charge: 0,
  });
  expect(getAtomsOfMolec('(CH3CNOH)20')).toStrictEqual({
    atoms: [{
      elem: 'CH3CNOH',
      num: 20,
      atoms: [{ elem: 'C', num: 1 }, { elem: 'H', num: 3 },
        { elem: 'C', num: 1 }, { elem: 'N', num: 1 },
        { elem: 'O', num: 1 }, { elem: 'H', num: 1 },
      ],
    },
    ],
    charge: 0,
  });
  expect(getAtomsOfMolec('(CH3(CN)3OH)2')).toStrictEqual({
    atoms: [{
      elem: 'CH3(CN)3OH',
      num: 2,
      atoms: [{ elem: 'C', num: 1 }, { elem: 'H', num: 3 },
        { elem: 'CN', num: 3, atoms: [{ elem: 'C', num: 1 }, { elem: 'N', num: 1 }] },
        { elem: 'O', num: 1 }, { elem: 'H', num: 1 },
      ],
    },
    ],
    charge: 0,
  });
  expect(getAtomsOfMolec('(CH3(C5N10)3OH)2')).toStrictEqual({
    atoms: [{
      elem: 'CH3(C5N10)3OH',
      num: 2,
      atoms: [{ elem: 'C', num: 1 }, { elem: 'H', num: 3 },
        { elem: 'C5N10', num: 3, atoms: [{ elem: 'C', num: 5 }, { elem: 'N', num: 10 }] },
        { elem: 'O', num: 1 }, { elem: 'H', num: 1 },
      ],
    },
    ],
    charge: 0,
  });
  expect(getAtomsOfMolec(' (CH3(C5N10)3OH)2 ')).toStrictEqual({
    atoms: [{
      elem: 'CH3(C5N10)3OH',
      num: 2,
      atoms: [{ elem: 'C', num: 1 }, { elem: 'H', num: 3 },
        { elem: 'C5N10', num: 3, atoms: [{ elem: 'C', num: 5 }, { elem: 'N', num: 10 }] },
        { elem: 'O', num: 1 }, { elem: 'H', num: 1 },
      ],
    },
    ],
    charge: 0,
  });
});

test('Test charges of output', () => {
  expect(getAtomsOfMolec('Na+')).toStrictEqual({
    atoms: [{ elem: 'Na', num: 1 }],
    charge: 1,
  });
  expect(getAtomsOfMolec('Na[+]')).toStrictEqual({
    atoms: [{ elem: 'Na', num: 1 }],
    charge: 1,
  });
  expect(getAtomsOfMolec('Na[1]')).toStrictEqual({
    atoms: [{ elem: 'Na', num: 1 }],
    charge: 1,
  });
  expect(getAtomsOfMolec('Mg[+2]')).toStrictEqual({
    atoms: [{ elem: 'Mg', num: 1 }],
    charge: 2,
  });
  expect(getAtomsOfMolec('Mg[2]')).toStrictEqual({
    atoms: [{ elem: 'Mg', num: 1 }],
    charge: 2,
  });
  expect(getAtomsOfMolec('Mg+2')).toStrictEqual({
    atoms: [{ elem: 'Mg', num: 1 }],
    charge: 2,
  });
  expect(getAtomsOfMolec('Mg[2+]')).toStrictEqual({
    atoms: [{ elem: 'Mg', num: 1 }],
    charge: 2,
  });
  expect(getAtomsOfMolec('Cl-')).toStrictEqual({
    atoms: [{ elem: 'Cl', num: 1 }],
    charge: -1,
  });
  expect(getAtomsOfMolec('Cl[-]')).toStrictEqual({
    atoms: [{ elem: 'Cl', num: 1 }],
    charge: -1,
  });
  expect(getAtomsOfMolec('O[-2]')).toStrictEqual({
    atoms: [{ elem: 'O', num: 1 }],
    charge: -2,
  });
  expect(getAtomsOfMolec('O[2-]')).toStrictEqual({
    atoms: [{ elem: 'O', num: 1 }],
    charge: -2,
  });
  expect(getAtomsOfMolec('O-2')).toStrictEqual({
    atoms: [{ elem: 'O', num: 1 }],
    charge: -2,
  });
  expect(getAtomsOfMolec('O2-')).toStrictEqual({
    atoms: [{ elem: 'O', num: 2 }],
    charge: -1,
  });
  expect(getAtomsOfMolec('O2+')).toStrictEqual({
    atoms: [{ elem: 'O', num: 2 }],
    charge: 1,
  });
  expect(getAtomsOfMolec('CH3COO-')).toStrictEqual({
    atoms: [{ elem: 'C', num: 1 }, { elem: 'H', num: 3 }, { elem: 'C', num: 1 }, { elem: 'O', num: 1 }, { elem: 'O', num: 1 }],
    charge: -1,
  });
  expect(getAtomsOfMolec('(CH3(C5N10)3OH)2[+2]')).toStrictEqual({
    atoms: [{
      elem: 'CH3(C5N10)3OH',
      num: 2,
      atoms: [{ elem: 'C', num: 1 }, { elem: 'H', num: 3 },
        { elem: 'C5N10', num: 3, atoms: [{ elem: 'C', num: 5 }, { elem: 'N', num: 10 }] },
        { elem: 'O', num: 1 }, { elem: 'H', num: 1 },
      ],
    },
    ],
    charge: 2,
  });
});

test('Getting total atoms', () => {
  expect(getTotalAtoms(getAtomsOfMolec('H2').atoms)).toStrictEqual({ H: 2 });
  expect(getTotalAtoms(getAtomsOfMolec('H2SO4').atoms)).toStrictEqual({ H: 2, S: 1, O: 4 });
  expect(getTotalAtoms(getAtomsOfMolec('Na+').atoms)).toStrictEqual({ Na: 1 });
  expect(getTotalAtoms(getAtomsOfMolec('C6H12O6').atoms)).toStrictEqual({ C: 6, H: 12, O: 6 });
  expect(getTotalAtoms(getAtomsOfMolec('CH3COOH').atoms)).toStrictEqual({ C: 2, H: 4, O: 2 });
  expect(getTotalAtoms(getAtomsOfMolec('(CH3(C5N10)3OH)2').atoms)).toStrictEqual({
    C: 32, H: 8, O: 2, N: 60,
  });
  expect(getTotalAtoms(getAtomsOfMolec('(CH3CNOH)2').atoms)).toStrictEqual({
    C: 4, H: 8, O: 2, N: 2,
  });
  expect(getTotalAtoms(getAtomsOfMolec('Al(NO3)3').atoms)).toStrictEqual({
    N: 3, O: 9, Al: 1,
  });
  expect(getTotalAtoms(getAtomsOfMolec('Al2(SO4)3').atoms)).toStrictEqual({
    S: 3, O: 12, Al: 2,
  });
  expect(getTotalAtoms(getAtomsOfMolec('(NH4)2CO3').atoms)).toStrictEqual({
    C: 1, O: 3, N: 2, H: 8,
  });
});

test('Getting Molecular and Empirical formula', () => {
  expect(getFormula('H2')).toBe('H2');
  expect(getFormula('H2', true)).toBe('H');
  expect(getFormula('H2SO4')).toBe('H2SO4');
  expect(getFormula('H2SO4', true)).toBe('H2SO4');
  expect(getFormula('Na+')).toBe('Na[+]');
  expect(getFormula('Na+', true)).toBe('Na[+]');
  expect(getFormula('C6H12O6')).toBe('H12C6O6');
  expect(getFormula('C6H12O6', true)).toBe('H2CO');
  expect(getFormula('CH3COOH')).toBe('H4C2O2');
  expect(getFormula('CH3COOH', true)).toBe('H2CO');
  expect(getFormula('(CH3(C5N10)3OH)2')).toBe('H8C32N60O2');
  expect(getFormula('(CH3(C5N10)3OH)2', true)).toBe('H4C16N30O');
  expect(getFormula('(CH3CNOH)2')).toBe('H8C4N2O2');
  expect(getFormula('(CH3CNOH)2', true)).toBe('H4C2NO');
  expect(getFormula('Al(NO3)3')).toBe('AlN3O9');
  expect(getFormula('Al(NO3)3', true)).toBe('AlN3O9');
  expect(getFormula('Al2(SO4)3')).toBe('Al2S3O12');
  expect(getFormula('Al2(SO4)3', true)).toBe('Al2S3O12');
  expect(getFormula('(NH4)2CO3')).toBe('H8CN2O3');
  expect(getFormula('(NH4)2CO3', true)).toBe('H8CN2O3');
  expect(getFormula('HeO', true)).toBe('HeO');
  expect(getFormula('OHe', true)).toBe('HeO');
});

test('parseReaction', () => {
  expect(parseReaction('H2 + O2 -> H2O')).toStrictEqual({
    reactants: [getAtomsOfMolec('H2'), getAtomsOfMolec('O2')],
    products: [getAtomsOfMolec('H2O')],
    coefReact: [1, 1],
    coefProd: [1],
    stateReact: [null, null],
    stateProd: [null],
    symbol: false,
  });
  expect(parseReaction('H2 + O2 = H2O')).toStrictEqual({
    reactants: [getAtomsOfMolec('H2'), getAtomsOfMolec('O2')],
    products: [getAtomsOfMolec('H2O')],
    coefReact: [1, 1],
    coefProd: [1],
    stateReact: [null, null],
    stateProd: [null],
    symbol: false,
  });
  expect(parseReaction('H2 + O2 <-> H2O')).toStrictEqual({
    reactants: [getAtomsOfMolec('H2'), getAtomsOfMolec('O2')],
    products: [getAtomsOfMolec('H2O')],
    coefReact: [1, 1],
    coefProd: [1],
    stateReact: [null, null],
    stateProd: [null],
    symbol: true,
  });
  expect(parseReaction('Na+ + Cl- <-> NaCl')).toStrictEqual({
    reactants: [getAtomsOfMolec('Na+'), getAtomsOfMolec('Cl-')],
    products: [getAtomsOfMolec('NaCl')],
    coefReact: [1, 1],
    coefProd: [1],
    stateReact: [null, null],
    stateProd: [null],
    symbol: true,
  });
  expect(parseReaction('Na++Cl-<->NaCl')).toStrictEqual({
    reactants: [getAtomsOfMolec('Na+'), getAtomsOfMolec('Cl-')],
    products: [getAtomsOfMolec('NaCl')],
    coefReact: [1, 1],
    coefProd: [1],
    stateReact: [null, null],
    stateProd: [null],
    symbol: true,
  });
  expect(parseReaction('Na++Cl-->NaCl')).toStrictEqual({
    reactants: [getAtomsOfMolec('Na+'), getAtomsOfMolec('Cl-')],
    products: [getAtomsOfMolec('NaCl')],
    coefReact: [1, 1],
    coefProd: [1],
    stateReact: [null, null],
    stateProd: [null],
    symbol: false,
  });
  expect(parseReaction('Na+++Cl-->NaCl')).toStrictEqual({
    reactants: [getAtomsOfMolec('Na+'), getAtomsOfMolec('Cl-')],
    products: [getAtomsOfMolec('NaCl')],
    coefReact: [1, 1],
    coefProd: [1],
    stateReact: [null, null],
    stateProd: [null],
    symbol: false,
  });
  expect(parseReaction('Cl-+Na+<->NaCl')).toStrictEqual({
    reactants: [getAtomsOfMolec('Cl-'), getAtomsOfMolec('Na+')],
    products: [getAtomsOfMolec('NaCl')],
    coefReact: [1, 1],
    coefProd: [1],
    stateReact: [null, null],
    stateProd: [null],
    symbol: true,
  });
  expect(parseReaction('CO2+6H2O->6O2+C6H12O6')).toStrictEqual({
    reactants: [getAtomsOfMolec('CO2'), getAtomsOfMolec('H2O')],
    products: [getAtomsOfMolec('O2'), getAtomsOfMolec('C6H12O6')],
    coefReact: [1, 6],
    coefProd: [6, 1],
    stateReact: [null, null],
    stateProd: [null, null],
    symbol: false,
  });
  expect(parseReaction('2H2 + O2 = 2H2O')).toStrictEqual({
    reactants: [getAtomsOfMolec('H2'), getAtomsOfMolec('O2')],
    products: [getAtomsOfMolec('H2O')],
    coefReact: [2, 1],
    coefProd: [2],
    stateReact: [null, null],
    stateProd: [null],
    symbol: false,
  });
  expect(parseReaction('H2 + 0.5O2 = H2O')).toStrictEqual({
    reactants: [getAtomsOfMolec('H2'), getAtomsOfMolec('O2')],
    products: [getAtomsOfMolec('H2O')],
    coefReact: [1, 0.5],
    coefProd: [1],
    stateReact: [null, null],
    stateProd: [null],
    symbol: false,
  });
  expect(parseReaction('H2 + 0,5O2 = H2O')).toStrictEqual({
    reactants: [getAtomsOfMolec('H2'), getAtomsOfMolec('O2')],
    products: [getAtomsOfMolec('H2O')],
    coefReact: [1, 0.5],
    coefProd: [1],
    stateReact: [null, null],
    stateProd: [null],
    symbol: false,
  });
  expect(parseReaction('Ca+2+CO3-2=CaCO3')).toStrictEqual({
    reactants: [getAtomsOfMolec('Ca[2+]'), getAtomsOfMolec('CO3[2-]')],
    products: [getAtomsOfMolec('CaCO3')],
    coefReact: [1, 1],
    coefProd: [1],
    stateReact: [null, null],
    stateProd: [null],
    symbol: false,
  });
  expect(parseReaction('Ca[+2]+CO3[-2]=CaCO3')).toStrictEqual({
    reactants: [getAtomsOfMolec('Ca[2+]'), getAtomsOfMolec('CO3[2-]')],
    products: [getAtomsOfMolec('CaCO3')],
    coefReact: [1, 1],
    coefProd: [1],
    stateReact: [null, null],
    stateProd: [null],
    symbol: false,
  });
  expect(parseReaction('Ca[2+]+CO3[2-]=CaCO3')).toStrictEqual({
    reactants: [getAtomsOfMolec('Ca[2+]'), getAtomsOfMolec('CO3[2-]')],
    products: [getAtomsOfMolec('CaCO3')],
    coefReact: [1, 1],
    coefProd: [1],
    stateReact: [null, null],
    stateProd: [null],
    symbol: false,
  });
  expect(parseReaction('4Fe(s)+3O2(aq)=2Fe2O3(s)')).toStrictEqual({
    reactants: [getAtomsOfMolec('Fe'), getAtomsOfMolec('O2')],
    products: [getAtomsOfMolec('Fe2O3')],
    coefReact: [4, 3],
    coefProd: [2],
    stateReact: ['s', 'aq'],
    stateProd: ['s'],
    symbol: false,
  });
  expect(parseReaction('CH3CH2OH (l) + O2 (g) -> CH3COOH (aq) + H2O (l)')).toStrictEqual({
    reactants: [getAtomsOfMolec('CH3CH2OH'), getAtomsOfMolec('O2')],
    products: [getAtomsOfMolec('CH3COOH'), getAtomsOfMolec('H2O')],
    coefReact: [1, 1],
    coefProd: [1, 1],
    stateReact: ['l', 'g'],
    stateProd: ['aq', 'l'],
    symbol: false,
  });
  expect(parseReaction('CH3CH2OH (l) + O2 (g) -> CH3COOH (aq) + H2O (l)', true)).toStrictEqual({
    reactants: [getAtomsOfMolec('CH3CH2OH'), getAtomsOfMolec('O2')],
    products: [getAtomsOfMolec('CH3COOH'), getAtomsOfMolec('H2O')],
    coefReact: [null, null],
    coefProd: [null, null],
    stateReact: ['l', 'g'],
    stateProd: ['aq', 'l'],
    symbol: false,
  });
  expect(parseReaction('2S( l)    + 3O2 (g ) + H2O    (l) ->  2 H2SO4 ( aq  )')).toStrictEqual({
    reactants: [getAtomsOfMolec('S'), getAtomsOfMolec('O2'), getAtomsOfMolec('H2O')],
    products: [getAtomsOfMolec('H2SO4')],
    coefReact: [2, 3, 1],
    coefProd: [2],
    stateReact: ['l', 'g', 'l'],
    stateProd: ['aq'],
    symbol: false,
  });
});

test('balanceReaction', () => {
  expect(balanceReaction(parseReaction('Fe+Cu+2->Fe+3+Cu', true))).toStrictEqual({
    reactants: [getAtomsOfMolec('Fe'), getAtomsOfMolec('Cu[2+]')],
    products: [getAtomsOfMolec('Fe[3+]'), getAtomsOfMolec('Cu')],
    coefReact: [2, 3],
    coefProd: [2, 3],
    stateReact: [null, null],
    stateProd: [null, null],
    symbol: false,
  });
  expect(balanceReaction(parseReaction('H2 + O2 -> H2O', true))).toStrictEqual({
    reactants: [getAtomsOfMolec('H2'), getAtomsOfMolec('O2')],
    products: [getAtomsOfMolec('H2O')],
    coefReact: [2, 1],
    coefProd: [2],
    stateReact: [null, null],
    stateProd: [null],
    symbol: false,
  });
  expect(balanceReaction(parseReaction('Na+ + Cl- <-> NaCl', true))).toStrictEqual({
    reactants: [getAtomsOfMolec('Na+'), getAtomsOfMolec('Cl-')],
    products: [getAtomsOfMolec('NaCl')],
    coefReact: [1, 1],
    coefProd: [1],
    stateReact: [null, null],
    stateProd: [null],
    symbol: true,
  });
  expect(balanceReaction(parseReaction('H2 + 0.5O2 = H2O', true))).toStrictEqual({
    reactants: [getAtomsOfMolec('H2'), getAtomsOfMolec('O2')],
    products: [getAtomsOfMolec('H2O')],
    coefReact: [1, 0.5],
    coefProd: [1],
    stateReact: [null, null],
    stateProd: [null],
    symbol: false,
  });
  expect(balanceReaction(parseReaction('CO2+6H2O->6O2+C6H12O6', true))).toStrictEqual({
    reactants: [getAtomsOfMolec('CO2'), getAtomsOfMolec('H2O')],
    products: [getAtomsOfMolec('O2'), getAtomsOfMolec('C6H12O6')],
    coefReact: [6, 6],
    coefProd: [6, 1],
    stateReact: [null, null],
    stateProd: [null, null],
    symbol: false,
  });
  expect(balanceReaction(parseReaction('1H2 + O2 = H2O', true))).toStrictEqual({
    reactants: [getAtomsOfMolec('H2'), getAtomsOfMolec('O2')],
    products: [getAtomsOfMolec('H2O')],
    coefReact: [1, 0.5],
    coefProd: [1],
    stateReact: [null, null],
    stateProd: [null],
    symbol: false,
  });
  expect(balanceReaction(parseReaction('Ca+2+CO3-2=CaCO3', true))).toStrictEqual({
    reactants: [getAtomsOfMolec('Ca[2+]'), getAtomsOfMolec('CO3[2-]')],
    products: [getAtomsOfMolec('CaCO3')],
    coefReact: [1, 1],
    coefProd: [1],
    stateReact: [null, null],
    stateProd: [null],
    symbol: false,
  });

  expect(balanceReaction(parseReaction('C2H10O8N14S30 -> CH5O4N7S15', true))).toStrictEqual({
    reactants: [getAtomsOfMolec('C2H10O8N14S30')],
    products: [getAtomsOfMolec('CH5O4N7S15')],
    coefReact: [1],
    coefProd: [2],
    stateReact: [null],
    stateProd: [null],
    symbol: false,
  });

  expect(balanceReaction(parseReaction('Fe(s)+O2(aq)=2Fe2O3(s)', true))).toStrictEqual({
    reactants: [getAtomsOfMolec('Fe'), getAtomsOfMolec('O2')],
    products: [getAtomsOfMolec('Fe2O3')],
    coefReact: [4, 3],
    coefProd: [2],
    stateReact: ['s', 'aq'],
    stateProd: ['s'],
    symbol: false,
  });
  expect(balanceReaction(parseReaction('CH3CH2OH (l) + O2 (g) -> CH3COOH (aq) + H2O (l)', true))).toStrictEqual({
    reactants: [getAtomsOfMolec('CH3CH2OH'), getAtomsOfMolec('O2')],
    products: [getAtomsOfMolec('CH3COOH'), getAtomsOfMolec('H2O')],
    coefReact: [1, 1],
    coefProd: [1, 1],
    stateReact: ['l', 'g'],
    stateProd: ['aq', 'l'],
    symbol: false,
  });
  expect(balanceReaction(parseReaction('KMnO4+Na2SO3+H2SO4->MnO2+Na2SO4+K2SO4+H2O', true))).toStrictEqual({
    reactants: [getAtomsOfMolec('KMnO4'), getAtomsOfMolec('Na2SO3'), getAtomsOfMolec('H2SO4')],
    products: [getAtomsOfMolec('MnO2'), getAtomsOfMolec('Na2SO4'), getAtomsOfMolec('K2SO4'), getAtomsOfMolec('H2O')],
    coefReact: [2, 3, 1],
    coefProd: [2, 3, 1, 1],
    stateReact: Array(3).fill(null),
    stateProd: Array(4).fill(null),
    symbol: false,
  });
  expect(balanceReaction(parseReaction('2S( l)    + 3O2 (g ) + H2O    (l) ->  2 H2SO4 ( aq  )', true))).toStrictEqual({
    reactants: [getAtomsOfMolec('S'), getAtomsOfMolec('O2'), getAtomsOfMolec('H2O')],
    products: [getAtomsOfMolec('H2SO4')],
    coefReact: [2, 3, 2],
    coefProd: [2],
    stateReact: ['l', 'g', 'l'],
    stateProd: ['aq'],
    symbol: false,
  });
});

test('Row echelon', () => {
  expect(rowEchelon([[1, 3, -1], [0, 1, 7]])).toStrictEqual([[1, 0, -22], [0, 1, 7]]);
  expect(rowEchelon([[1, 3, -1], [0, 1, 7], [1, 3, -1], [1, 4, 6]]))
    .toStrictEqual([[1, 0, -22], [0, 1, 7], [0, 0, 0], [0, 0, 0]]);
});

test('Molecular Mass', () => {
  expect(getMolecularMass(getAtomsOfMolec('H2'))).toBeCloseTo(2, 0);
  expect(getMolecularMass(getAtomsOfMolec('H2O'))).toBeCloseTo(18, 0);
  expect(getMolecularMass(getAtomsOfMolec('C6H12O6'))).toBeCloseTo(180, 0);
  expect(getMolecularMass(getAtomsOfMolec('Fe'))).toBeCloseTo(56, 0);
});
