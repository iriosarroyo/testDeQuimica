import React, {
  ChangeEvent,
  DragEvent,
  FormEvent,
  MouseEvent,
  useContext, useEffect, useMemo, useRef, useState,
} from 'react';
import { useLocation, useParams } from 'react-router-dom';
import {
  createFolder,
  deleteFile, deleteFolder, fileToBuffer, getFile, renameFolder, setFilesAndFolders, uploadFile,
} from 'services/documents';
import Info from 'components/Info';
import Path from 'components/Path';
import Folders, { LoadingFolders } from 'components/Folders';
import Files, { LoadingFiles } from 'components/Files';
import MyErrorContext from 'contexts/Error';
import SearchCmd from 'services/commands';
import { FileData, FolderData } from 'types/interfaces';
import Button from 'components/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCloudArrowUp, faFileUpload, faFolderPlus, faTrash,
} from '@fortawesome/free-solid-svg-icons';
import FrontContext from 'contexts/Front';
import ContextMenu from 'components/ContextMenu';

function LoadingDocuments() {
  return (
    <>
      <LoadingFolders />
      <LoadingFiles />
    </>
  );
}

function EditForm({
  title, buttonText, onSubmit, initValue,
}:
  {title:string, buttonText:string, onSubmit:Function, initValue?:string}) {
  const [value, setValue] = useState(initValue ?? '');
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    window.setTimeout(() => ref.current?.focus(), 100);
  }, [ref.current]);
  return (
    <div className="editFormDocs">
      <h4>{title}</h4>
      <form onSubmit={(e) => onSubmit(e, value)}>
        <input ref={ref} type="text" value={value} onChange={(e) => setValue(e.currentTarget.value)} placeholder="Nombre" />
        <Button type="submit">{buttonText}</Button>
      </form>
    </div>
  );
}
EditForm.defaultProps = {
  initValue: '',
};

function CreateFolderForm({ path, onFolderCreation }:{path:string, onFolderCreation:Function}) {
  const setFront = useContext(FrontContext);
  const onSent = (nam:string) => {
    setFront({
      elem: null, cb: () => {},
    });
    onFolderCreation(nam);
  };
  return (
    <EditForm buttonText="Crear Carpeta" title="Nueva Carpeta" onSubmit={(e:FormEvent, value:string) => createFolder(e, path, value, onSent)} />
  );
}

function RenameFolderForm({
  prevPath, path, onFolderRename, name, folders,
}:
  {prevPath:string, path:string, onFolderRename:Function, name:string,
    folders:string[]|undefined}) {
  const setFront = useContext(FrontContext);
  const onSent = (...params:string[]) => {
    setFront({
      elem: null, cb: () => {},
    });
    onFolderRename(...params);
  };
  return (
    <EditForm
      buttonText="Renombrar Carpeta"
      title="Editar Carpeta"
      initValue={name}
      onSubmit={(e:FormEvent, value:string) => (
        renameFolder(e, prevPath, path, value, onSent, folders))}
    />
  );
}

const uploadState = (subido:boolean, progress: number, max:number) => {
  if (subido) return 'Archivo Guardado';
  if (progress === 0) return 'Preparando archivo';
  if (progress === max) return 'Guardando archivo';
  return 'Subiendo Archivo';
};

function UploadProgress({ name, id, setUploads }:
  {name:string, id:string,
     setUploads:React.Dispatch<React.SetStateAction<{key:string, name:string}[]>>}) {
  const [progress, setProgress] = useState(0);
  const [max, setMax] = useState<number|null>(null);
  const [subido, setSubido] = useState(false);
  const deleteItem = () => {
    setUploads((prevUploads) => prevUploads.filter((elem) => elem.key !== id));
  };
  useEffect(() => {
    const cb = (e:Event) => {
      const { detail } = e as CustomEvent<number>;
      if (max === null) setMax(detail);
      setProgress((prev) => prev + 1);
    };
    const cb2 = () => {
      setSubido(true);
      window.setTimeout(deleteItem, 5000);
    };
    document.addEventListener(`document:fragment:${id}`, cb);
    document.addEventListener(`document:uploaded:${id}`, cb2);
    return () => {
      document.removeEventListener(`document:fragment:${id}`, cb);
      document.removeEventListener(`document:uploaded:${id}`, cb2);
    };
  }, []);
  return (
    <div className="uploadProgress" title={name}>
      <strong className="uploadProgressName">{name}</strong>
      <div className="uploadProgressBar">
        <div style={{ width: `${(progress / (max ?? 100)) * 100}%` }} />
      </div>
      <div className="uploadProgressState">
        {
          uploadState(subido, progress, max ?? 100)
        }
      </div>
      <Button className="uploadProgressDelete" onClick={deleteItem}>
        <FontAwesomeIcon icon={faTrash} />
      </Button>
    </div>
  );
}

function FilesAndFolders({
  filesAndFolders, setInfo, setVisibilityInfo, admin, onContextMenu,
}:
  {filesAndFolders:(FileData|FolderData)[],
setInfo:Function, setVisibilityInfo:Function, admin: boolean, onContextMenu:Function}) {
  const initValue:[FileData[], FolderData[]] = [[], []];
  const [files, folders] = useMemo(() => filesAndFolders.reduce((acum, curr) => {
    const [acumFiles, acumFolders] = acum;
    const isFile = ('bucket' in curr);
    const newFiles = isFile ? [...acumFiles, curr] : acumFiles;
    const newFolder = isFile ? acumFolders : [...acumFolders, curr];
    return [newFiles, newFolder];
  }, initValue), [filesAndFolders]);
  const path = admin ? '/admin/documentos' : '/documentos';
  return (
    <>
      <Folders path={path} folders={folders} onContextMenu={onContextMenu} />
      <Files
        files={files}
        setInfo={setInfo}
        setVisibilityInfo={setVisibilityInfo}
        onContextMenu={onContextMenu}
      />
    </>
  );
}
interface StateContextMenuDocs extends React.CSSProperties{
  type: 'folder' | 'file',
  path: string,
  name: string,
}

function ContextMenuDocs({
  setContextMenu, state, removeFile, removeFolder, renameFold,
}:
  {setContextMenu:Function, state:StateContextMenuDocs,
     removeFile:Function, renameFold:Function, removeFolder:Function}) {
  const {
    type, path, name, ...style
  } = state;
  return (
    <ContextMenu
      classOfElem=".file, .folder"
      items={type === 'file' ? [{ text: `Eliminar ${name}`, action: () => removeFile(name, path) }]
        : [{ text: `Renombrar ${name}`, action: () => renameFold(name, path) }, { text: `Eliminar ${name}`, action: () => removeFolder(name, path) }]}
      setContextMenu={setContextMenu}
      style={style}
    />
  );
}

function Documentos({ admin }:{admin?:boolean}) {
  const folderPath = useParams()['*'] ?? '';
  const setFront = useContext(FrontContext);
  const filesRef = useRef<HTMLInputElement>(null);
  const [folders, setFolders] = useState<string[]>([]);
  const [files, setFiles] = useState<FileData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [dragging, setDragging] = useState(0);
  const [info, setInfo] = useState<FileData|undefined>(undefined);
  const [visibilityInfo, setVisibilityInfo] = useState(false);
  const [contextMenu, setContextMenu] = useState<StateContextMenuDocs|null>(null);
  const [search, setSearch] = useState<(FileData|FolderData)[]|null>(null);
  const [uploadsInProgress, setUploads] = useState<{name:string, key:string}[]>([]);
  const setError = useContext(MyErrorContext);
  const infoDisplayed = visibilityInfo ? 'displayedInfoDocs' : '';
  useEffect(() => SearchCmd.onSearch('Documents', 'Docs', '', setSearch));
  useEffect(() => {
    setLoading(true);
    setVisibilityInfo(false);
    setFilesAndFolders(folderPath, setFolders, setFiles, setError, () => setLoading(false));
  }, [folderPath]);

  const onUpdateFile = async (prevFullPath:string, newFullPath:string, moved:boolean = false) => {
    const newFileData = await getFile(newFullPath);

    setSearch((prevSearch) => (prevSearch
      && prevSearch.map((x) => ((('fullPath' in x) && x.fullPath === prevFullPath) ? newFileData : { ...x }))));

    setInfo((prevInfo) => (prevInfo && prevInfo.fullPath === prevFullPath
      ? newFileData : prevInfo));
    if (!moved) {
      setFiles((prevFiles) => prevFiles
        .map((x) => (x.fullPath === prevFullPath ? newFileData : { ...x })));
    } else {
      setFiles((prevFiles) => prevFiles.filter((x) => (x.fullPath === prevFullPath)));
    }
    SearchCmd.updateFilesInDocs(prevFullPath, newFileData);
  };

  const onFolderAddition = (name:string) => {
    setFolders((prevFolders) => {
      const newFolders = [...prevFolders.filter((fol) => fol !== name), name];
      newFolders.sort();
      return newFolders;
    });
    SearchCmd.addItemToDocs({ url: `${folderPath}/${name}`, name });
  };

  const removeFolder = (name:string, path:string) => {
    if (window.confirm(`¿Está seguro de querer eliminar la carpeta ${name}?`)) {
      deleteFolder(path, (fullPath:string) => {
        setFolders((prevFolders) => prevFolders.filter((folder) => `${folderPath}/${folder}` !== fullPath));
        setSearch((prevSearch) => prevSearch && prevSearch.filter((elem) => elem.url !== fullPath && (!('fullPath' in elem)
         || !elem.fullPath.startsWith(fullPath))));
        SearchCmd.removeFileOrFolder(fullPath);
      });
    }
  };

  const removeFile = (name:string, path:string) => {
    if (window.confirm(`¿Está seguro de querer eliminar el archivo ${name}?`)) {
      deleteFile(path, (fullPath:string) => {
        setFiles((prevFiles) => prevFiles.filter((file) => file.fullPath !== fullPath));
        setSearch((prevSearch) => prevSearch && prevSearch.filter((elem) => !('fullPath' in elem) || elem.fullPath !== fullPath));
        setInfo((prevInfo) => (prevInfo
        && ((prevInfo.fullPath === fullPath) ? undefined : prevInfo)));
        setVisibilityInfo(false);
        SearchCmd.removeFileOrFolder(fullPath);
      });
    }
  };
  const onFolderRename = (prevPath:string, newPath:string, name:string) => {
    setFolders((prevFolders) => prevFolders.map((folder) => (`${folderPath}/${folder}` === prevPath ? name : folder)));
    setSearch((prevSearch) => prevSearch && prevSearch.map((elem) => {
      if (elem.url === prevPath) return { url: newPath, name };
      if (!('fullPath' in elem)) return elem;
      if (elem.fullPath.startsWith(prevPath)) return { ...elem, fullPath: `${newPath}/${elem.name}` };
      return elem;
    }));
    SearchCmd.updateFolder(prevPath, newPath, name);
  };
  const renameFolderPopUp = (name:string, path:string) => {
    const originalPath = path.replace(new RegExp(`/${name}$`), '');
    setFront({
      elem: <RenameFolderForm folders={search === null ? folders : undefined} path={originalPath} prevPath={`${originalPath}/${name}`} name={name} onFolderRename={onFolderRename} />,
      cb: () => {},
      unableFocus: true,
    });
  };

  const uploadFilesToPath = async (dropFile:FileList) => {
    const now = Date.now();
    const buffersPromise = Array(dropFile.length).fill(null)
      .map((_, idx) => {
        setUploads((prevValue) => [...prevValue, { name: dropFile[idx].name, key: `${dropFile[idx].name}_${now}` }]);
        return fileToBuffer(dropFile[idx]);
      });
    const buffers = await Promise.all(buffersPromise);
    buffers.forEach((buffer, idx) => {
      uploadFile(folderPath, dropFile[idx].name, buffer, `${dropFile[idx].name}_${now}`, async (fullPath:string) => {
        const newFileData = await getFile(fullPath);
        setFiles((prevFiles) => {
          const newFiles = [...prevFiles.filter((x) => x.fullPath !== newFileData.fullPath),
            newFileData];
          newFiles.sort((a, b) => a.name.localeCompare(b.name));
          return newFiles;
        });
        SearchCmd.removeFileOrFolder(newFileData.fullPath);
        SearchCmd.addItemToDocs(newFileData);
      });
    });
  };

  const handleDragLeave = () => {
    if (!admin || search !== null || folderPath === '') return;
    setDragging((prevVal) => prevVal - 1);
  };
  const handleDrop = (e:DragEvent<HTMLDivElement>) => {
    if (!admin || search !== null || folderPath === '') return;
    e.preventDefault();
    e.stopPropagation();
    handleDragLeave();
    const { files: dropFile } = e.dataTransfer;
    uploadFilesToPath(dropFile);
  };

  const handleDragEnter = () => {
    console.log('dragEnter');
    if (!admin || search !== null || folderPath === '') return;
    setDragging((prevVal) => prevVal + 1);
  };

  const handleFileChange = (e:ChangeEvent<HTMLInputElement>) => {
    if (e.currentTarget.files) uploadFilesToPath(e.currentTarget.files);
  };

  const handleDragOver = (e:DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const path = window.location.pathname.replace(/\/$/, '');
  const loc = useLocation();
  useEffect(() => {
    setSearch(null);
  }, [loc]);

  const handleContextMenu = (e:MouseEvent<HTMLElement>, name:string, thisPath:string, type:'folder' |'file') => {
    if (!admin) return;
    e.preventDefault();
    setContextMenu({
      top: `${e.clientY}px`,
      left: `${e.clientX}px`,
      name,
      path: thisPath,
      type,
    });
  };

  return (
    <div
      className={`displayDocs ${infoDisplayed}`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {dragging && (
      <div className="draggingActive">
        <FontAwesomeIcon icon={faCloudArrowUp} />
        <span>Subir Archivo</span>
      </div>
      )}
      <Path path={path} isSearch={search !== null} admin={!!admin} />
      <div className="foldersAndFilesContainer">
        {// eslint-disable-next-line no-nested-ternary
        loading ? <LoadingDocuments />
          // eslint-disable-next-line no-nested-ternary
          : search !== null ? (
            <FilesAndFolders
              filesAndFolders={search}
              setInfo={setInfo}
              setVisibilityInfo={setVisibilityInfo}
              admin={!!admin}
              onContextMenu={handleContextMenu}
            />
          ) : (
            folderPath === ''
              ? (
                <Folders
                  path={admin ? '/admin/documentos' : '/documentos'}
                  folders={['Documentos', ':__RECURSOS_QUÍMICA__:']}
                  onContextMenu={handleContextMenu}
                />
              )
              : (
                <>
                  {
                    (admin && search === null && folderPath !== '') && (
                      <div className="documentsEdition">
                        <Button
                          className="createFolderButton"
                          onClick={() => setFront({
                            elem: <CreateFolderForm
                              onFolderCreation={onFolderAddition}
                              path={folderPath}
                            />,
                            cb: () => {},
                            unableFocus: true,
                          })}
                        >
                          <FontAwesomeIcon icon={faFolderPlus} />
                          <span>Crear Carpeta</span>
                        </Button>
                        <input ref={filesRef} type="file" multiple hidden onChange={handleFileChange} />
                        <Button
                          className="uploadFilesButton"
                          onClick={() => {
                            filesRef.current?.click();
                          }}
                        >
                          <FontAwesomeIcon icon={faFileUpload} />
                          <span>Subir archivos</span>
                        </Button>
                      </div>
                    )
                }
                  <Folders
                    path={path}
                    folders={folders}
                    onContextMenu={handleContextMenu}
                  />
                  <Files
                    files={files}
                    setInfo={setInfo}
                    setVisibilityInfo={setVisibilityInfo}
                    onContextMenu={handleContextMenu}

                  />
                  {uploadsInProgress.length !== 0 && (
                  <div className="uploadProgressContainer">
                    {uploadsInProgress.map((elem) => (
                      <UploadProgress
                        key={elem.key}
                        name={elem.name}
                        id={elem.key}
                        setUploads={setUploads}
                      />
                    ))}
                  </div>
                  )}
                </>
              )

          )
}
      </div>
      {visibilityInfo && (
      <Info
        admin={!!admin}
        fileData={info}
        visibilitySetter={setVisibilityInfo}
        onFileUpdate={onUpdateFile}
        files={search === null ? files : undefined}
      />
      ) }

      {contextMenu && (
      <ContextMenuDocs
        setContextMenu={setContextMenu}
        state={contextMenu}
        removeFile={removeFile}
        removeFolder={removeFolder}
        renameFold={renameFolderPopUp}
      />
      )}

    </div>
  );
}

Documentos.defaultProps = {
  admin: false,
};
export default Documentos;
