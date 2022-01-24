import React from 'react';
import { determineContentType, sizeToString } from '../../services/toolsForData';
import { FileData } from '../../types/interfaces';

function Info({ fileData, visibilitySetter }:
    {fileData:FileData|undefined, visibilitySetter:Function}) {
  if (fileData === undefined) return null;
  const {
    name, contentType, size, timeCreated, updated, url,
  } = { ...fileData };
  const format = contentType ?? '';
  const handleClick = () => {
    visibilitySetter(false);
  };
  return (
    <div>
      <button type="button" onClick={handleClick}>Close</button>
      <div>
        <div>Nombre:</div>
        <div>{name}</div>
      </div>
      <div>
        <div>Formato:</div>
        <div>{determineContentType(format)}</div>
      </div>
      <div>
        <div>Tamaño:</div>
        <div>{sizeToString(size)}</div>
      </div>
      <div>
        <div>Fecha de creación:</div>
        <div>{new Date(timeCreated).toLocaleString()}</div>
      </div>
      <div>
        <div>Fecha de modificación:</div>
        <div>{new Date(updated).toLocaleString()}</div>
      </div>
      <div>
        <div>URL:</div>
        <a href={url}>{url}</a>
      </div>
    </div>
  );
}

export default Info;
