import { RenderReaction } from 'components/Chemistry/Reaction';
import React, { useState } from 'react';
import { balanceReaction, parseReaction } from 'services/chemBalancing';
import { getLewisStrucuture } from 'services/lewisStructure';

export default function AjusteReaccion() {
  const [val, setVal] = useState('');
  let reaction = parseReaction(val, true);
  reaction.reactants.forEach((x) => console.log('electrons', getLewisStrucuture(x)));
  try {
    reaction = balanceReaction(reaction);
  } catch (e) {
    // console.error(e);
  }
  return (
    <div>
      <input value={val} onChange={(e) => setVal(e.target.value)} />
      <RenderReaction reaction={reaction} />
    </div>
  );
}
