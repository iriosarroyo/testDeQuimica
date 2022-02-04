import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { setFilesAndFolders } from 'services/documents';
import Info from 'components/Info';
import Path from 'components/Path';
import Folders from 'components/Folders';
import Files from 'components/Files';
import MyErrorContext from 'contexts/Error';

function Documentos() {
  const folderPath = useParams()['*'] ?? '';
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [info, setInfo] = useState(undefined);
  const [visibilityInfo, setVisibilityInfo] = useState(false);
  const setError = useContext(MyErrorContext);

  useEffect(() => {
    setFilesAndFolders(folderPath, setFolders, setFiles, setError);
  }, [folderPath]);

  const path = window.location.pathname.replace(/\/$/, '');
  return (
    <div className="mainText">
      <Path path={path} />
      <Folders path={path} folders={folders} />
      <Files files={files} setInfo={setInfo} setVisibilityInfo={setVisibilityInfo} />
      {visibilityInfo && <Info fileData={info} visibilitySetter={setVisibilityInfo} /> }
    </div>
  );
}
export default Documentos;
