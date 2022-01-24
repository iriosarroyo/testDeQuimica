import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { MouseEvent } from 'react';
import { determineContentType } from '../../services/toolsForData';
import { FileData } from '../../types/interfaces';

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
    <a href={url} target="_blank" rel="noreferrer">
      <div>
        <FontAwesomeIcon icon={`file-${format}`} />
      </div>
      <div>
        {name}
      </div>
      <button type="button" onClick={handleClick}>
        <FontAwesomeIcon icon="info-circle" />
      </button>
    </a>
  );
}

export default File;
