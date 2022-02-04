import { FirebaseError } from 'firebase/app';
import {
  getDownloadURL, getMetadata, listAll, ref, StorageReference,
} from 'firebase/storage';
import { stg } from './firebaseApp';

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

export const getItemsFromPath = async (path:string) => {
  const reference = ref(stg, path);
  const { prefixes, items } = await listAll(reference);
  const folders = prefixes.map((pre) => pre.name);
  const files = await getFilesDataFromList(items);
  return { folders, files };
};

export const setFilesAndFolders = async (
  path:string,
  setFolders:Function,
  setFiles:Function,
  setError:Function,
) => {
  try {
    const { folders, files } = await getItemsFromPath(path);
    setFolders(folders);
    setFiles(files);
  } catch (error) {
    if (error instanceof FirebaseError) setError(error);
  }
};

export default undefined;
