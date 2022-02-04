import React from 'react';
import { FileData } from 'types/interfaces';
import File from 'components/File';
import './Files.css';

export default function Files({ files, setInfo, setVisibilityInfo }:
    {files:FileData[], setInfo:Function, setVisibilityInfo:Function}) {
  return (
    <div className="fileGroup">
      {files.map((file:FileData) => (
        <File
          key={file.fullPath}
          fileData={{ ...file }}
          infoSetter={setInfo}
          visibilitySetter={setVisibilityInfo}
        />
      ))}
    </div>
  );
}
