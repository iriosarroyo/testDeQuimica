/* eslint-disable prefer-const */
/* eslint-disable react/button-has-type */
/* eslint-disable no-import-assign */
/* eslint-disable no-param-reassign */
import React from 'react';
/* import tabla1 from 'info/tablaPeriodica copy.json';
import tabla2 from 'info/masDatosTabla.json'; */
import './temp.css';

import elementosTabla from 'info/tablaPeriodica.json';

/* const elem = {
  radius: ['calculated',
    'empirical',
    'covalent',
    'vanderwaals'],
  conductivity: [
    'thermal',
    'electric',
  ],
  abundance: [
    'universe',
    'solar',
    'meteor',
    'crust',
    'ocean',
    'human',
  ],
  heat: [
    'specific',
    'vaporization',
    'fusion',
  ],
  quantum: [
    'l',
    'm',
    'n',
  ],

}; */

/* Object.entries(elementosTabla).forEach(([, v]) => {
  if (v.phase.toLowerCase() === 'gas') return;
  // v.density *= 1000;
  Object.entries(v).forEach(([k2]) => {
    if (!(k2 in elem)) return;
    if (elementosTabla[k][k2] === null) elementosTabla[k][k2] = {};
    elem[k2].forEach((i) => {
      if (!(i in elementosTabla[k][k2])) elementosTabla[k][k2][i] = null;
    });
  });
}); */

console.log(elementosTabla);
/*
const convertEveryElementToNumber = (obj) => {
  try {
    return Object.entries(obj)
      .reduce((acum, [key, val]) => ({ ...acum, [key]: parseFloat(val) }), {});
  } catch (e) { return null; }
};

const result = {};
Object.entries(tabla1).forEach(([key, val]) => {
  try {
    let {
      series, oxidation, radius, discover, conductivity, abundance, heat, quantum, isotopes,
    } = tabla2[val.number];
    series ??= null;
    oxidation ??= null;
    discover ??= null;
    quantum ??= null;
    isotopes ??= null;
    radius = convertEveryElementToNumber(radius);
    discover = parseInt(discover, 10);
    discover = Number.isNaN(discover) ? null : discover;
    conductivity = convertEveryElementToNumber(conductivity);
    abundance = convertEveryElementToNumber(abundance);
    heat = convertEveryElementToNumber(heat);
    result[key] = {
      ...val, series, oxidation, radius, discover, conductivity, abundance, heat, quantum, isotopes,
    };
  } catch (e) { console.error(e); }
}); */

const setMinAndMax = (curr, acum) => {
  Object.entries(curr).forEach(([key, val]) => {
    if (typeof val === 'number') {
      acum[key] ??= { min: Infinity, max: -Infinity };
      const { min, max } = acum[key];
      if (min > val) acum[key].min = val;
      if (max < val) acum[key].max = val;
    } else if (typeof val === 'object') {
      try {
        acum[key] ??= {};
        acum[key] = setMinAndMax(val, acum[key]);
      } catch (e) {
        console.log(e);
      }
    }
  });
  return acum;
};

const maxAndMin = Object.values(elementosTabla).reduce(
  (acum, curr) => setMinAndMax(curr, acum),
  {},
);
console.log(maxAndMin);
//  export default undefined; */
/* let commonProp = [];
let notIn1 = [];
let notIn2 = [];
let este1; let
  este2;

const changeResult = (x, i, table) => {
  let miValor;
  if (table === 'tabla1') miValor = este1[x];
  else miValor = este2[x];
  result[Object.values(tabla1)[i - 1].name.toLowerCase()] ??= {};
  result[Object.values(tabla1)[i - 1].name.toLowerCase()][x] = miValor;
  console.log(result);
};

const getAsString = (x) => {
  if (typeof x === 'string') return x;
  if (typeof x === 'undefined' || x === null) return `${x}`;
  if (Array.isArray(x)) return x.toString();
  if (typeof x === 'object') return JSON.stringify(x);
  return x.toString();
};

export default function Comparacion() {
  const [i, setI] = useState(0);
  useEffect(() => {
    commonProp = [];
    notIn2 = [];
    este1 = Object.values(tabla1)[i];
    este2 = tabla2[este1.number];
    const este2Keys = Object.keys(este2);
    Object.keys(este1).forEach((key) => {
      // const [key, val] = x;
      if (este2Keys.includes(key)) commonProp.push(key);
      else notIn2.push(key);
    });
    notIn1 = este2Keys.filter((x) => !commonProp.includes(x));
  }, [i]);
  return (
    <div className="hola" style={{ display: 'grid',
     gridTemplateColumns: '1fr 1fr', gridGap: '5px' }}>
      {commonProp.map((x) => (
        <>
          <div>
            <span>
              {x}
              :
              {' '}
              {getAsString(este1[x])}
            </span>
            <span>{(typeof este1[x])}</span>
            <button onClick={() => changeResult(x, i, 'tabla1')}>Añadir</button>
          </div>
          <div>
            <span>
              {x}
              :
              {' '}
              {getAsString(este2[x])}
            </span>
            <span>{(typeof este2[x])}</span>
            <button onClick={() => changeResult(x, i, 'tabla2')}>Añadir</button>
          </div>
        </>
      ))}
      {notIn2.map((x) => (
        <>
          <div>
            <span>
              {x}
              :
              {' '}
              {getAsString(este1[x])}
            </span>
            <span>{(typeof este1[x])}</span>
            <button onClick={() => changeResult(x, i, 'tabla1')}>Añadir</button>
          </div>
          <div>
            <span>
              {x}
            </span>
          </div>
        </>
      ))}
      {notIn1.map((x) => (
        <>
          <div>
            <span>
              {x}
            </span>
          </div>
          <div>
            <span>
              {x}
              :
              {' '}
              {getAsString(este2[x])}
            </span>
            <span>{(typeof este2[x])}</span>
            <button onClick={() => changeResult(x, i, 'tabla2')}>Añadir</button>
          </div>
        </>
      ))}

      <button onClick={() => setI(i - 1)}>Anterior</button>
      <button onClick={() => setI(i + 1)}>Siguiente</button>
    </div>
  );
} */
export default function Comparacion() {
  return <div />;
}
