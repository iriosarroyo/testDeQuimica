import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from 'components/Button';
import React, { MouseEvent } from 'react';
import { determineContentType } from '../../services/toolsForData';
import { FileData } from '../../types/interfaces';
import './File.css';

function File({ fileData, infoSetter, visibilitySetter }:
    {fileData:FileData, infoSetter:Function, visibilitySetter:Function}) {
  const { url, name, contentType = '' } = fileData;
  const format = determineContentType(contentType);
  const handleClick = (event:MouseEvent) => {
    event.preventDefault();
    infoSetter(fileData);
    visibilitySetter(true);
  };
  return (
    <a className="file" href={url} target="_blank" rel="noreferrer">
      <div className="iconFile">
        <FontAwesomeIcon icon={`file-${format}`} />
      </div>
      <div className="nameFile">
        {name}
      </div>
      <Button className="infoFile" onClick={handleClick}>
        <FontAwesomeIcon icon="info-circle" />
      </Button>
      <div className="tooltipFile">{name}</div>
    </a>
  );
}

export default File;
