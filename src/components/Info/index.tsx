import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from 'components/Button';
import React from 'react';
import { determineContentType, sizeToString } from '../../services/toolsForData';
import { FileData } from '../../types/interfaces';

const dictionaryIcon = {
  image: 'Imagen',
  pdf: 'PDF',
  word: 'Word',
  powerpoint: 'Powerpoint',
  alt: 'Formato desconocido',
};

function Info({ fileData, visibilitySetter }:
    {fileData:FileData|undefined, visibilitySetter:Function}) {
  if (fileData === undefined) return null;
  const {
    name, contentType, size, timeCreated, updated, url,
  } = { ...fileData };
  const format = contentType ?? '';
  const formatDecodified = determineContentType(format);
  const formatIcon:IconProp = `file-${formatDecodified}`;
  const translatedIcon = dictionaryIcon[formatDecodified];
  const handleClick = () => {
    visibilitySetter(false);
  };
  return (
    <aside className="infoDocs">
      <Button onClick={handleClick}>
        <FontAwesomeIcon icon={faTimes} />
      </Button>
      <ul className="unlisted">
        <li>
          <strong className="titleInfo">Nombre:</strong>
          <div className="dataInfo">{name}</div>
        </li>
        <li>
          <strong className="titleInfo">Formato:</strong>
          <div className="dataInfo">
            <FontAwesomeIcon icon={formatIcon} />
            {translatedIcon}
          </div>
        </li>
        <li>
          <strong className="titleInfo">Tamaño:</strong>
          <div className="dataInfo">{sizeToString(size)}</div>
        </li>
        <li>
          <strong className="titleInfo">Fecha de creación:</strong>
          <div className="dataInfo">{new Date(timeCreated).toLocaleString()}</div>
        </li>
        <li>
          <strong className="titleInfo">Fecha de modificación:</strong>
          <div className="dataInfo">{new Date(updated).toLocaleString()}</div>
        </li>
        <li>
          <strong className="titleInfo">URL:</strong>
          <a className="dataInfo" href={url} target="_blank" rel="noreferrer">{url}</a>
        </li>
      </ul>
    </aside>
  );
}

export default Info;
