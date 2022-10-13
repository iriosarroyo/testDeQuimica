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
          return <Folder key={url} folder={{ name: folder, url }} onContextMenu={onContextMenu} />;
        }
        const { url, isLink } = folder;
        return <Folder key={url} folder={{ ...folder, url: isLink ? url : `${path}/${url}` }} onContextMenu={isLink ? () => {} : onContextMenu} />;
      })}
    </ul>
  );
}
