import { RenderReaction } from 'components/Chemistry/Reaction';
import React, { useEffect, useState } from 'react';
import { balanceReaction, parseReaction } from 'services/chemBalancing';
import './AjusteReaccion.css';
import { Reaction } from 'types/chemistry';
import Button from 'components/Button';
// import { getLewisStrucuture } from 'services/lewisStructure';

export default function AjusteReaccion() {
  const [val, setVal] = useState('');
  const [er, setEr] = useState<string|null>(null);
  const [reaction, setReaction] = useState<Reaction>();
  const [color, setColor] = useState(true);
  // reaction.reactants.forEach((x) => console.log('electrons', getLewisStrucuture(x)));
  useEffect(() => {
    const parsedReaction = parseReaction(val, true);
    try {
      setReaction(balanceReaction(parsedReaction));
      setEr(null);
    } catch (e) {
      // console.error(e);
      setReaction(parsedReaction);
      setEr((e as Error).message);
    }
  }, [val]);
  console.log(reaction);
  return (
    <div className={`ajusteReaccion ${color && 'colorless'}`}>
      <h2>Ajuste de Reacciones</h2>
      <input
        className="inputAjusteReaccion"
        value={val}
        placeholder="Introduce la reacción química"
        onChange={(e) => setVal(e.target.value)}
      />
      <details className="detailsReaction">
        <summary>Más información</summary>
        Escribe la reacción en el cuadro de encima siguiendo las siguientes instrucciones.
        <ul>
          <li>
            Escribe los elementos con su símbolo,
            el uso de mayúsculas y minúsculas es importante.
            Ej., el símbolo del zinc es el Zn (no zn).
          </li>
          <li>
            Para indicar que la sustancia tiene más de un átomo de un elemento hay
            que añadir el número después del símbolo del mismo. Ej., H2 se refiere al
            hidrógeno molecular (H
            <sub>2</sub>
            ).
          </li>
          <li>
            Se deben usar los paréntesis para señalar los grupos con subíndice diferente de 1.
            Por ejemplo, en el hidróxido de hierro (II), Fe(OH)2, los paréntesis son obligatorios.
            Esto se interpretará como: Fe(OH)
            <sub>2</sub>
            .
          </li>
          <li>
            Para escribir la flecha, y así separar reactivos de productos, tienes tres opciones:
            <ul>
              <li>Usar un igual (=).</li>
              <li>Usar un guion seguido de un mayor que (-&gt;).</li>
              <li>
                Usar un menor que seguido de un guion seguido de un mayor que (&lt;-&gt;).
                En este caso aparecerá la flecha de equilibrio en vez de la flecha irreversible.
              </li>
            </ul>
          </li>
          <li>
            Para separar un compuesto de otro se usa el símbolo +.
            El algoritmo intentará reconocer cuando te refieres a una carga positiva o
            a la suma de dos compuestos.
          </li>
        </ul>
      </details>
      <h3>Reacción ajustada</h3>
      <Button className="colorChooseReaction" onClick={() => setColor((c) => !c)}>
        {!color ? 'Coloreado por el color del átomo' : 'Sin colores'}
      </Button>
      {er && (
      <div>
        Reacción sin ajustar:
        {' '}
        {er}
      </div>
      )}
      {val && reaction ? <RenderReaction reaction={reaction} /> : null}
    </div>
  );
}
