import { Link } from 'react-router-dom';
import React from 'react';
import './Folder.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FolderData } from '../../types/interfaces';

function Folder({ name, url }:FolderData) {
  return (
    <Link className="folder" to={url}>
      <div>
        <FontAwesomeIcon icon="folder" />
      </div>
      <div>{name}</div>
    </Link>
  );
}

export default Folder;
