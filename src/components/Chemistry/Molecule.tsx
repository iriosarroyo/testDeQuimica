import { gcd } from 'mathjs';
import React, { Fragment } from 'react';
import { getTotalAtoms, sorterByElectNeg } from 'services/chemBalancing';
import { Atom, Molecule } from 'types/chemistry';
import general from 'info/general.json';
import tablaPeriodica from 'info/tablaPeriodica.json';

const { translations } = general;

function RenderAtom({ atom }:{atom:Atom}) {
  if (atom.num < 1) return null;
  const elemName = translations.symbol2Name[atom.elem as keyof typeof translations.symbol2Name];
  const hsl = tablaPeriodica[elemName as keyof typeof tablaPeriodica]?.['cpk-hex'];
  return (
    <span
      style={{ color: `#${hsl}` }}
    >
      {atom.elem}
      {atom.num > 1 && (
      <sub>{atom.num}</sub>
      )}
    </span>
  );
}

function CompleteMolecule({ atoms, prefix = '' }:{atoms:Atom[], prefix?:string}) {
  return (
    <>
      {atoms.map((atom, idx) => {
        if (atom.atoms) {
          return (
            <Fragment key={prefix + atom.elem}>
              (
              <CompleteMolecule atoms={atom.atoms} prefix={prefix + atom.elem} />
              )
              {atom.num !== 1 && <sub>{atom.num}</sub>}
            </Fragment>
          );
        }
        // eslint-disable-next-line react/no-array-index-key
        return <RenderAtom key={`${atom.elem}_${idx}`} atom={atom} />;
      })}
    </>
  );
}

CompleteMolecule.defaultProps = {
  prefix: '',
};

function EmpOrMolecFormula({ atoms, empirical }:{atoms:Atom[], empirical:boolean}) {
  const totalAtoms = getTotalAtoms(atoms);
  const totalAtomsVals = Object.values(totalAtoms);
  let gcdNumAtoms = 1;
  if (empirical) {
    gcdNumAtoms = totalAtomsVals.length > 1 ? gcd(...totalAtomsVals)
      : totalAtomsVals[0];
  }
  const totalAtomsEntries = Object.entries(totalAtoms);
  totalAtomsEntries.sort(sorterByElectNeg);
  return (
    <>
      {totalAtomsEntries.map(([atom, num]) => (
        <RenderAtom
          key={atom}
          atom={{ elem: atom, num: num / gcdNumAtoms }}
        />
      ))}
    </>
  );
}

export default function RenderMolecule({ molecule, type }:
    {molecule:Molecule, type:'Empirical'|'Molecular'|'Complete'}) {
  const { charge, atoms } = molecule;

  return (
    <div className="molecule">
      {type === 'Complete' ? <CompleteMolecule atoms={atoms} />
        : <EmpOrMolecFormula atoms={atoms} empirical={type === 'Empirical'} />}
      {charge !== 0 && (
      <sup>
        {`${Math.abs(charge) !== 1 ? Math.abs(charge) : ''}${charge < 0 ? '-' : '+'}`}
      </sup>
      )}
    </div>
  );
}
