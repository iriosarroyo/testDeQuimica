import Folder, { LoadingFolder } from 'components/Folder';
import React from 'react';
import { FolderData } from 'types/interfaces';
import './Folders.css';

export function LoadingFolders() {
  return (
    <ul className="unlisted folderGroup">
      <LoadingFolder />
      <LoadingFolder />
      <LoadingFolder />
    </ul>
  );
}

export default function Folders({ folders, path, onContextMenu }:
  {folders:string[]|FolderData[], path:string, onContextMenu:Function}) {
  return (
    <ul className="unlisted folderGroup">
      {folders.map((folder:string|FolderData) => {
        if (typeof folder === 'string') {
          const url = `${path}/${folder}`;
          return <Folder key={url} name={folder} url={url} onContextMenu={onContextMenu} />;
        }
        const { url, name } = folder;
        return <Folder key={url} name={name} url={`${path}/${url}`} onContextMenu={onContextMenu} />;
      })}
    </ul>
  );
}
