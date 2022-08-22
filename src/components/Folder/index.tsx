import { Link } from 'react-router-dom';
import React, { useContext } from 'react';
import './Folder.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ContentLoader from 'react-content-loader';
import { sendLogroUpdate } from 'services/logros';
import UserContext from 'contexts/User';
import { FolderData } from '../../types/interfaces';

export function LoadingFolder() {
  return (
    <li>
      <ContentLoader
        height="40px"
        preserveAspectRatio="none"
        width="100%"
        backgroundColor={
        getComputedStyle(document.documentElement)
          .getPropertyValue('--bg2-color')
      }
        foregroundColor={
        getComputedStyle(document.documentElement)
          .getPropertyValue('--font2-color')
      }
        style={{ borderRadius: '25px' }}
        viewBox="0 0 100 100"
      >
        <rect x="0" y="0" height="100" width="100" />
      </ContentLoader>
    </li>
  );
}
interface FolderProps extends FolderData{
  onContextMenu: Function
}
function Folder({ name, url, onContextMenu }:FolderProps) {
  const user = useContext(UserContext)!;
  if (name === ':__RECURSOS_QUÍMICA__:') {
    return (
      <li>
        <a
          href="https://drive.google.com/drive/folders/182DASWji_7fG5crgsYvONkjsZQWaRfsi"
          className="folder"
          target="_blank"
          rel="noreferrer"
          onClick={() => sendLogroUpdate('recursos', user.userDDBB.logros?.recursos)}
        >
          <div>
            <FontAwesomeIcon icon="folder" />
          </div>
          <div>Recursos Química</div>
        </a>
      </li>
    );
  }
  return (
    <li>
      <Link
        className="folder"
        to={url}
        onContextMenu={(e) => onContextMenu(e, name, url.replace('/admin/documentos/', ''), 'folder')}
      >
        <div>
          <FontAwesomeIcon icon="folder" />
        </div>
        <div>{name}</div>
      </Link>
    </li>
  );
}

export default Folder;
