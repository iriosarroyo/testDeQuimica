import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { setFilesAndFolders } from 'services/documents';
import Info from 'components/Info';
import Path from 'components/Path';
import Folders, { LoadingFolders } from 'components/Folders';
import Files, { LoadingFiles } from 'components/Files';
import MyErrorContext from 'contexts/Error';

function LoadingDocuments() {
  return (
    <>
      <LoadingFolders />
      <LoadingFiles />
    </>
  );
}

function Documentos() {
  const folderPath = useParams()['*'] ?? '';
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [info, setInfo] = useState(undefined);
  const [visibilityInfo, setVisibilityInfo] = useState(false);
  const setError = useContext(MyErrorContext);

  useEffect(() => {
    setLoading(true);
    setFilesAndFolders(folderPath, setFolders, setFiles, setError, () => setLoading(false));
  }, [folderPath]);

  const path = window.location.pathname.replace(/\/$/, '');
  return (
    <div className="mainText">
      <Path path={path} />
      {loading ? <LoadingDocuments />
        : (
          <>
            <Folders path={path} folders={folders} />
            <Files files={files} setInfo={setInfo} setVisibilityInfo={setVisibilityInfo} />
            {visibilityInfo && <Info fileData={info} visibilitySetter={setVisibilityInfo} /> }
          </>
        )}
    </div>
  );
}
export default Documentos;
