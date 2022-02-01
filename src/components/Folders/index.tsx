import Folder from 'components/Folder';
import React from 'react';

export default function Folders({ folders, path }:{folders:string[], path:string}) {
  return (
    <div>
      {folders.map((name:string) => {
        const url = `${path}/${name}`;
        return <Folder key={url} name={name} url={url} />;
      })}
    </div>
  );
}
