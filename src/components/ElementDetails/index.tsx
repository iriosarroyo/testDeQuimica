import React, { MouseEventHandler } from 'react';
import { PeriodicElement } from 'types/interfaces';
import './ElementDetails.css';

const getValueAsString = (val:any) => {
  if (typeof val === 'string') return val;
  if (val === null || val === undefined) return 'No Data';
  if (Array.isArray(val)) return val.join(' / ');
  // eslint-disable-next-line no-use-before-define
  if (typeof val === 'object') return parseObjectToDiv(val);
  return val.toString();
};

function parseObjectToDiv(obj:{}) {
  return Object.entries(obj).map(([key, val]) => (
    <div className="elementDetails" key={key}>
      <span>{key}</span>
      <span>{getValueAsString(val)}</span>
    </div>
  ));
}
export default function ElementDetails({ elementData, goBack }:
  {elementData:PeriodicElement, goBack:MouseEventHandler}) {
  return (
    <div>
      {parseObjectToDiv(elementData)}
      <button type="button" onClick={goBack}>Volver</button>
    </div>
  );
}
