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

export const getItemsFromPath = async (path:string, setFolders:Function, setFiles:Function) => {
  const reference = ref(stg, path);
  const { prefixes, items } = await listAll(reference);
  const folders = prefixes.map((pre) => pre.name);
  const files = await getFilesDataFromList(items);
  setFolders(folders);
  setFiles(files);
};

export default undefined;
