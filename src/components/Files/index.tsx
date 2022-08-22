import React from 'react';
import { FileData } from 'types/interfaces';
import File, { LoadingFile } from 'components/File';
import './Files.css';

export function LoadingFiles() {
  return (
    <ul className="unlisted fileGroup">
      <LoadingFile />
      <LoadingFile />
      <LoadingFile />
    </ul>
  );
}

export default function Files({
  files, setInfo, setVisibilityInfo, onContextMenu,
}:
    {files:FileData[], setInfo:Function, setVisibilityInfo:Function, onContextMenu:Function}) {
  return (
    <ul className="unlisted fileGroup">
      {files.map((file:FileData) => (
        <File
          key={file.fullPath}
          fileData={{ ...file }}
          infoSetter={setInfo}
          visibilitySetter={setVisibilityInfo}
          onContextMenu={onContextMenu}
        />
      ))}
    </ul>
  );
}
