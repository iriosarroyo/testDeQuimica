import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from 'components/Button';
import UserContext from 'contexts/User';
import React, { useContext, useEffect, useState } from 'react';
import { getIconForFile, renameFile } from 'services/documents';
import { updateDownloadedDocs } from 'services/logros';
import { determineContentType, sizeToString } from '../../services/toolsForData';
import { FileData } from '../../types/interfaces';

const dictionaryIcon = {
  image: 'Imagen',
  pdf: 'PDF',
  word: 'Word',
  powerpoint: 'Powerpoint',
  alt: 'Formato desconocido',
};

function Info({
  fileData, visibilitySetter, admin, onFileUpdate, files,
}:
    {fileData:FileData|undefined, visibilitySetter:Function, admin:boolean,
       onFileUpdate:Function, files:FileData[]|undefined}) {
  if (fileData === undefined) return null;
  const {
    name, contentType, size, timeCreated, updated, url, fullPath,
  } = { ...fileData };
  const user = useContext(UserContext)!;
  const [nameValue, setNameValue] = useState(name);
  useEffect(() => setNameValue(name), [name]);
  const format = contentType ?? '';
  const formatDecodified = determineContentType(format);
  const formatIcon:IconProp = getIconForFile(formatDecodified);
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
          { !admin ? <div className="dataInfo">{name}</div>
            : (
              <form
                className="infoChangeFileName"
                onSubmit={(e) => renameFile(
                  e,
                  fullPath,
                  nameValue,
                  (newpath:string) => onFileUpdate(fullPath, newpath),
                  files,
                )}
              >
                <input type="text" value={nameValue} onChange={(e) => setNameValue(e.currentTarget.value)} />
                <Button type="submit">Guardar Nombre</Button>
              </form>
            )}
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
          <a className="dataInfo" href={url} target="_blank" rel="noreferrer" onClick={(e) => updateDownloadedDocs(e, user, name)}>{url}</a>
        </li>
      </ul>
    </aside>
  );
}

export default Info;
