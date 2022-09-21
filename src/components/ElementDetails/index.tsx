import React from 'react';
import { PeriodicElement } from 'types/interfaces';
import './ElementDetails.css';
import general from 'info/general.json';

const SIN_DATOS = null;

const translations = general.translations as {[k:string]:{[k:string]:string}};
const getValueAsString = (val:any, parent:string) => {
  if (typeof val === 'string') return val;
  if (val === null || val === undefined) return SIN_DATOS;
  if (Array.isArray(val)) return val;
  // eslint-disable-next-line no-use-before-define
  if (typeof val === 'object') return parseObjectToDiv(val, parent);
  return val.toString();
};

function getReactElem(key:string, text:any, units:string) {
  if (text === SIN_DATOS) return text;
  if (key === 'ionization_energies' || key === 'shells') {
    return (
      <>
        {text.map((val:any, i:number) => {
          const title = translations[key]?.index?.replace('$index', `${i + 1}`);
          const unit = translations[key]?.units_index ?? '';
          return (
            <div key={title} className="placeholderForKey">
              <span className="titleDetailsElem">{title}</span>
              <span>{`${val.toString().replace('.', ',')} ${unit}`}</span>
            </div>
          );
        })}
      </>
    );
  }
  if (key === 'cpk-hex') {
    return (
      <>
        <div id="colorDetails" style={{ backgroundColor: `#${text}` }} />
        <label htmlFor="colorDetails">
          #
          {text}
        </label>
      </>
    );
  }
  if (key === 'oxidation') {
    const numsOx = text.split(',');
    return numsOx.map((elem:string, i:number) => {
      const end = i === numsOx.length - 1 ? '' : ',';
      const k = `${elem}_${i}`;
      return (elem.includes('c') ? (
        <strong key={k}>
          {elem.replace('c', '')}
          {end}
          &nbsp;
        </strong>
      ) : (
        <span className="notBreak" key={k}>
          {elem}
          {end}
          &nbsp;
        </span>
      ));
    });
  }
  if (key === 'source' || key === 'spectral_img') return <a href={text} rel="noreferrer">{text}</a>;
  if (key.includes('electron_configuration')) {
    const start = `${text}`.match(/^[^\d]+/)?.[0];
    const matches = `${text}`.matchAll(/(\d[spdf])(\d+)/g);
    let item;
    const result = [];
    // eslint-disable-next-line no-cond-assign
    while (((item = matches.next(), !item.done))) {
      const [, val, exp] = item.value;
      result.push(
        <span key={val + exp} className="notBreak">
          {val}
          <sup>{exp}</sup>
        </span>,
      );
    }
    return (
      <div>
        {start}
        {result.map((elem) => (
          <span key={elem.key} className="notBreak">
            {elem}
            {' '}
          </span>
        ))}
      </div>
    );
  }
  const txtTrans = translations.elementosTabla[text];
  if (txtTrans) return txtTrans;
  return translations[text]
  ?? ['string', 'number'].includes(typeof text) ? `${text.toString().replace('.', ',')} ${units}` : text;
}

function parseObjectToDiv(obj:{name?:string}, parent?:string) {
  return Object.entries(obj).map(([key, val]) => {
    const keyVal = parent === undefined ? translations[key]?.default : translations[parent]?.[key];
    const units = parent === undefined ? translations[key]?.units : translations[parent]?.[`units_${key}`];
    const unitsText = ['1', undefined, 'año'].includes(units) || key === 'category' ? '' : units;
    const text = getValueAsString(val, key);
    const reactElem = getReactElem(key, text, unitsText);
    if (text === SIN_DATOS) return null;
    if (parent !== undefined) {
      return (
        <div key={parent + key} className="placeholderForKey">
          <span className="titleDetailsElem">{keyVal}</span>
          <span>{reactElem}</span>
        </div>
      );
    }
    return (
      <div className="elementDetails" key={key}>
        <span className="titleDetailsElem">{keyVal === undefined ? <h2>{key}</h2> : keyVal}</span>
        {
          typeof val === 'object'
            ? reactElem
            : <span>{reactElem}</span>
        }
      </div>
    );
  });
}
export default function ElementDetails({ elementData }:
  {elementData:PeriodicElement}) {
  return (
    <div>
      {parseObjectToDiv(elementData)}
    </div>
  );
}
