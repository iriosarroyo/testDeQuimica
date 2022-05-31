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
  const infoDisplayed = visibilityInfo ? 'displayedInfoDocs' : '';

  useEffect(() => {
    setLoading(true);
    setVisibilityInfo(false);
    setFilesAndFolders(folderPath, setFolders, setFiles, setError, () => setLoading(false));
  }, [folderPath]);

  const path = window.location.pathname.replace(/\/$/, '');
  return (
    <div className={`displayDocs ${infoDisplayed}`}>
      <Path path={path} />
      <div className="foldersAndFilesContainer">
        {// eslint-disable-next-line no-nested-ternary
        loading ? <LoadingDocuments />
          : (
            folderPath === ''
              ? <Folders path="/documentos" folders={['Documentos', ':__RECURSOS_QUÍMICA__:']} />
              : (
                <>
                  <Folders path={path} folders={folders} />
                  <Files files={files} setInfo={setInfo} setVisibilityInfo={setVisibilityInfo} />
                </>
              )

          )
}
      </div>
      {visibilityInfo && <Info fileData={info} visibilitySetter={setVisibilityInfo} /> }
    </div>
  );
}
export default Documentos;
