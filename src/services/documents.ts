import { FirebaseError } from 'firebase/app';
import {
  getDownloadURL, getMetadata, listAll, ref, StorageReference,
} from 'firebase/storage';
import { FormEvent } from 'react';
import { FileData, FolderData } from 'types/interfaces';
import SearchCmd from './commands';
import { stg } from './firebaseApp';
import { getFromSocket, getFromSocketUID, getSocket } from './socket';
import Toast from './toast';

export const getFile = async (fullPath:string) => {
  const reference = ref(stg, fullPath);
  const [url, metadata] = await Promise.all([
    getDownloadURL(reference),
    getMetadata(reference),
  ]);
  return { url, ...metadata };
};

const getFilesDataFromList = async (items:StorageReference[]) => {
  const filesPromises = items.map(async (thisRef:StorageReference) => {
    const [url, metadata] = await Promise.all([
      getDownloadURL(thisRef),
      getMetadata(thisRef),
    ]);
    return { url, ...metadata };
  });
  return Promise.all(filesPromises);
};
const getFilesDataFromListMultiplePromise = (items:StorageReference[]) => {
  const filesPromises = items.map(async (thisRef:StorageReference) => {
    const [url, metadata] = await Promise.all([
      getDownloadURL(thisRef),
      getMetadata(thisRef),
    ]);
    return { url, ...metadata };
  });
  return filesPromises;
};

export const getItemsFromPath = async (path:string) => {
  const reference = ref(stg, path);
  const { prefixes, items } = await listAll(reference);
  const folders = prefixes.map((pre) => pre.name);
  const files = await getFilesDataFromList(items);
  return { folders, files };
};

export const getAllDocumentsAndFolders = async (
  path?:string,
  result:(Promise<FileData>|FolderData)[] = [{ name: 'Documentos', url: 'Documentos' }, { name: ':__RECURSOS_QUÍMICA__:', url: '' }],
) => {
  const reference = ref(stg, path ?? 'Documentos');
  const { prefixes, items } = await listAll(reference);
  const folders = prefixes.map((pre) => ({ name: pre.name, url: pre.fullPath }));
  result.push(...folders);
  const folderPromises = folders.map((folder) => getAllDocumentsAndFolders(folder.url, result));
  const filesPromises = getFilesDataFromListMultiplePromise(items);
  result.push(...filesPromises);
  await Promise.all(folderPromises);
  return Promise.all(result);
};

export const setFilesAndFolders = async (
  path:string,
  setFolders:Function,
  setFiles:Function,
  setError:Function,
  onEnd?:Function,
) => {
  try {
    const { folders, files } = await getItemsFromPath(path);
    setFolders(folders);
    setFiles(files);
    if (onEnd) onEnd();
  } catch (error) {
    if (error instanceof FirebaseError) setError(error);
  }
};

export const renameFile = async (
  e:FormEvent,
  path:string,
  newname:string,
  onEnd?:Function,
  files?:FileData[],
) => {
  e.preventDefault();
  const prevFiles = files ?? SearchCmd.documents.filter((x) => ('fullPath' in x)) as FileData[];
  if (prevFiles.some((file) => file.fullPath === path.replace(/(\/[^/]+)$/, `/${newname}`))) {
    return Toast.addMsg('Ya existe un archivo con ese nombre.', 3000);
  }
  if (newname === '') return Toast.addMsg('El nombre no es válido', 3000);
  const result = await getFromSocket('documents:renameFile', path, newname);
  if (result === undefined) Toast.addMsg('El archivo no se pudo renombrar', 3000);
  else if (onEnd) onEnd(result);
  return undefined;
};

export const renameFolder = async (
  e:FormEvent,
  prevPath:string,
  path:string,
  newname:string,
  onEnd?:Function,
  folders?:string[]|FolderData[],
) => {
  e.preventDefault();
  const prevFolders = folders ?? SearchCmd.documents;
  if (prevFolders.some((folder) => (typeof folder === 'string' ? folder === newname : folder.url === `${path}/${newname}`))) {
    return Toast.addMsg('Ya existe una carpeta con ese nombre.', 3000);
  }
  if (newname === '') return Toast.addMsg('El nombre no es válido', 3000);
  const result = await getFromSocketUID('documents:renameFolder', prevPath, path, newname);
  if (result === undefined) Toast.addMsg('La carpeta no se pudo renombrar', 3000);
  else if (onEnd) onEnd(prevPath, path, newname);
  return undefined;
};

export const createFolder = async (
  e:FormEvent,
  path:string,
  name:string,
  onEnd?:Function,
  folders?:string[]|FolderData[],
) => {
  e.preventDefault();
  const prevFolders = folders ?? SearchCmd.documents;
  if (prevFolders.some((folder) => (typeof folder === 'string' ? folder === name : folder.url === `${path}/${name}`))) {
    return Toast.addMsg('Ya existe una carpeta con ese nombre.', 3000);
  }
  if (name === '') return Toast.addMsg('El nombre no es válido', 3000);
  const result = await getFromSocket('documents:createFolder', path, name);
  if (result === undefined) Toast.addMsg('No se pudo crear la carpeta', 3000);
  else if (onEnd) onEnd(name);
  return undefined;
};

export const deleteFolder = async (fullPath:string, onEnd?:Function) => {
  const result = await getFromSocketUID('documents:deleteFolder', fullPath);
  if (result === undefined) Toast.addMsg('No se pudo eliminar la carpeta', 3000);
  else if (onEnd) onEnd(fullPath);
  return undefined;
};

export const deleteFile = async (fullPath:string, onEnd?:Function) => {
  const result = await getFromSocketUID('documents:deleteFile', fullPath);
  if (result === undefined) Toast.addMsg('No se pudo eliminar el archivo', 3000);
  else if (onEnd) onEnd(fullPath);
  return undefined;
};

export const fileToBuffer = (file:File):Promise<ArrayBuffer> => new Promise((res, rej) => {
  const reader = new FileReader();
  reader.addEventListener('load', (e) => {
    if (e.target && e.target.result && typeof e.target.result !== 'string') {
      res(e.target.result);
    } else rej();
  });
  reader.readAsArrayBuffer(file);
});

const MAX_UPLOAD_SIZE = 1e5;
export const uploadFile = async (
  path:string,
  name:string,
  data:ArrayBuffer,
  key:string,
  onEnd?:Function,
) => {
  const binArra = new Uint8Array(data);
  const numOfFragments = Math.ceil(binArra.length / MAX_UPLOAD_SIZE);
  const id = await getFromSocketUID('documents:uploadFile', `${path}/${name}`, numOfFragments);
  const onErrorEv = `documents:uploadError:${id}`;
  const onSuccessEv = `documents:uploadSuccess:${id}`;
  const onErrorCb = () => {
    Toast.addMsg(`El archivo ${name} no se pudo subir`, 3000);
    getSocket().off(onErrorEv, onErrorCb);
    // eslint-disable-next-line no-use-before-define
    getSocket().off(onSuccessEv, onSuccessCb);
  };

  function onSuccessCb(result:any) {
    if (onEnd) onEnd(result);
    const ev = new Event(`document:uploaded:${key}`);
    document.dispatchEvent(ev);
    getSocket().off(onErrorEv, onErrorCb);
    getSocket().off(onSuccessEv, onSuccessCb);
  }
  getSocket().on(onErrorEv, onErrorCb);
  getSocket().on(onSuccessEv, onSuccessCb);
  Array(numOfFragments).fill(null).forEach((_, idx) => {
    getFromSocket(
      `documents:uploadFragment:${id}:${idx}`,
      binArra.slice(idx * MAX_UPLOAD_SIZE, (idx + 1) * MAX_UPLOAD_SIZE),
    ).then((res) => {
      if (res) {
        const ev = new CustomEvent(`document:fragment:${key}`, {
          detail: numOfFragments,
        });
        document.dispatchEvent(ev);
      }
    });
  });
};
