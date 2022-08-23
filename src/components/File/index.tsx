import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from 'components/Button';
import UserContext from 'contexts/User';
import React, { MouseEvent, useContext } from 'react';
import ContentLoader from 'react-content-loader';
import { getIconForFile } from 'services/documents';
import { updateDownloadedDocs } from 'services/logros';
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

function File({
  fileData, infoSetter, visibilitySetter, onContextMenu,
}:
    {fileData:FileData, infoSetter:Function, visibilitySetter:Function, onContextMenu:Function}) {
  const user = useContext(UserContext)!;
  const {
    url, name, contentType = '', fullPath,
  } = fileData;
  const format = determineContentType(contentType);
  const handleClick = (event:MouseEvent) => {
    event.preventDefault();
    infoSetter(fileData);
    visibilitySetter(true);
  };
  return (
    <li>
      <a
        className="file"
        href={url}
        target="_blank"
        rel="noreferrer"
        onClick={(e) => updateDownloadedDocs(e, user, name)}
        onContextMenu={(e) => { onContextMenu(e, name, fullPath, 'file'); }}
      >
        <div className="iconFile">
          <FontAwesomeIcon icon={getIconForFile(format)} />
        </div>
        <div className="nameFile">
          {name}
        </div>
        <Button className="infoFile" onClick={handleClick}>
          <FontAwesomeIcon icon={faInfoCircle} />
        </Button>
        <div className="tooltipFile">{name}</div>
      </a>
    </li>
  );
}

export default File;
