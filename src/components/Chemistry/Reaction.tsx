import { round } from 'mathjs';
import React, { Fragment } from 'react';
import { Molecule, Reaction } from 'types/chemistry';
import RenderMolecule from './Molecule';

export default undefined;

function Compound({ molecule, coef, state }:
    {molecule:Molecule, coef: number|null|undefined, state:string|null|undefined}) {
  return (
    <span className="compound">
      {coef !== null && round(coef ?? 0, 2) !== 1 && round(coef ?? 0, 2)}
      {' '}
      <RenderMolecule molecule={molecule} type="Complete" />
      {' '}
      {state && (
      <>
        (
        {state}
        )
      </>
      )}
    </span>
  );
}

export function RenderReaction({ reaction }:{reaction:Reaction}) {
  const {
    coefProd, coefReact, products, reactants, stateProd, stateReact, symbol,
  } = reaction;
  return (
    <div className="reaction">
      {reactants.map((molec, idx) => (
        // eslint-disable-next-line react/no-array-index-key
        <Fragment key={`Reactant${idx}`}>
          {idx !== 0 && ' + '}
          <Compound
            molecule={molec}
            coef={coefReact[idx]}
            state={stateReact[idx]}
          />
        </Fragment>
      ))}
      {symbol ? <>&#8644;</> : <>&#8594;</>}
      {products?.map((molec, idx) => (
        // eslint-disable-next-line react/no-array-index-key
        <Fragment key={`Product${idx}`}>
          {idx !== 0 && ' + '}
          <Compound
            molecule={molec}
            coef={coefProd?.[idx]}
            state={stateProd?.[idx]}
          />
        </Fragment>
      ))}
    </div>
  );
}
