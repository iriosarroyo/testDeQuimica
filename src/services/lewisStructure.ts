import { Atom, LewisStructure, Molecule } from 'types/chemistry';
import tablaPeriodica from 'info/tablaPeriodica.json';
import general from 'info/general.json';

const { symbol2Name } = general.translations;

const getNumberOfValenceElectrons = (molecule:Molecule|Atom[]) => {
  let atoms = molecule as Atom[];
  let charge = 0;
  if (!Array.isArray(molecule)) ({ atoms, charge } = molecule);
  const totalValElec = atoms.reduce((acum, { num, elem, atoms: complex }):number => {
    if (complex) return acum + getNumberOfValenceElectrons(complex);
    const name = symbol2Name[elem as keyof typeof symbol2Name] as keyof typeof tablaPeriodica;
    return acum + num * (tablaPeriodica[name]?.shells.at(-1) ?? 0);
  }, 0);
    // Negative charge more electrons
  return totalValElec - charge;
};

const getCentralAtom = (molecule:Molecule):Atom|undefined => {
  const { atoms } = molecule;
  let lessElectronegative = atoms[0];
  let lowestElectronegativity = Infinity;
  atoms.forEach((atom) => {
    const name = symbol2Name[atom.elem as keyof typeof symbol2Name] as keyof typeof tablaPeriodica;
    const electronegativity = tablaPeriodica[name]?.electronegativity_pauling ?? Infinity;
    if (lowestElectronegativity > electronegativity) {
      lowestElectronegativity = electronegativity;
      lessElectronegative = atom;
    }
  });
  lessElectronegative.num -= 1;
  return lessElectronegative;
};

export const getLewisStrucuture = (molecule:Molecule) => {
  const structure = { connections: [], central: '', freeElectrons: 0 } as LewisStructure;
  let nElectrons = getNumberOfValenceElectrons(molecule);
  structure.central = getCentralAtom(molecule)?.elem ?? '';
  const numAtoms = molecule.atoms.reduce((acum, curr): number => acum + curr.num, 0);
  nElectrons -= 2 * numAtoms;
  molecule.atoms.forEach((atom) => {
    for (let i = 0; i < atom.num; i++) {
      structure.connections.push({
        elem: atom.elem,
        freeElectrons: atom.elem === tablaPeriodica.hydrogen.symbol ? 0 : Math.min(6, nElectrons),
        order: 1, // start with single bonds
      });
      nElectrons -= structure.connections.at(-1)?.freeElectrons ?? 0;
    }
  });
  structure.freeElectrons = nElectrons;
};

export default undefined;
