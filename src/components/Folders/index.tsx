import Folder from 'components/Folder';
import React from 'react';
import './Folders.css';

export default function Folders({ folders, path }:{folders:string[], path:string}) {
  return (
    <ul className="unlisted folderGroup">
      {folders.map((name:string) => {
        const url = `${path}/${name}`;
        return <Folder key={url} name={name} url={url} />;
      })}
    </ul>
  );
}
