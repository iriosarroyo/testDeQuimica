import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from 'components/Button';
import React, { MouseEvent } from 'react';
import ContentLoader from 'react-content-loader';
import { determineContentType } from '../../services/toolsForData';
import { FileData } from '../../types/interfaces';
import './File.css';

export function LoadingFile() {
  return (
    <li>
      <ContentLoader
        className="file"
        height="40px"
        preserveAspectRatio="none"
        width="100%"
        backgroundColor={
        getComputedStyle(document.documentElement)
          .getPropertyValue('--bg-color')
      }
        foregroundColor={
        getComputedStyle(document.documentElement)
          .getPropertyValue('--font2-color')
      }
        viewBox="0 0 100 100"
      >
        <rect x="0" y="0" height="100" width="100" />
      </ContentLoader>
    </li>
  );
}

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
    <li>
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
    </li>
  );
}

export default File;
