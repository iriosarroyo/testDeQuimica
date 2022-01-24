import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getItemsFromPath } from 'services/documents';
import { FileData } from 'types/interfaces';
import File from 'components/File';
import Folder from 'components/Folder';
import Info from 'components/Info';
import Path from 'components/Path';

function Documentos() {
  const folderPath = useParams()['*'] ?? '';
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [info, setInfo] = useState(undefined);
  const [visibilityInfo, setVisibilityInfo] = useState(false);

  useEffect(() => {
    getItemsFromPath(folderPath, setFolders, setFiles);
  }, [folderPath]);

  const path = window.location.pathname.replace(/\/$/, '');
  return (
    <>
      <Path path={path} />
      {folders.map((name:string) => {
        const url = `${path}/${name}`;
        return <Folder key={url} name={name} url={url} />;
      })}
      {files.map((file:FileData) => (
        <File
          key={file.fullPath}
          fileData={{ ...file }}
          infoSetter={setInfo}
          visibilitySetter={setVisibilityInfo}
        />
      ))}
      {visibilityInfo ? <Info fileData={info} visibilitySetter={setVisibilityInfo} /> : null}
    </>
  );
}
export default Documentos;
