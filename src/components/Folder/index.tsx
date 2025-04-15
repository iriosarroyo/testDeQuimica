import { Link } from 'react-router-dom';
import React, { useContext } from 'react';
import './Folder.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ContentLoader from 'react-content-loader';
import { sendLogroUpdate } from 'services/logros';
import UserContext from 'contexts/User';
import { faFolder, faLink } from '@fortawesome/free-solid-svg-icons';
import { FolderData, LinkDocs, LogrosKeys } from '../../types/interfaces';

export function LoadingFolder() {
  return (
    <li>
      <ContentLoader
        height="40px"
        preserveAspectRatio="none"
        width="100%"
        backgroundColor={
        getComputedStyle(document.body)
          .getPropertyValue('--bg2-color')
      }
        foregroundColor={
        getComputedStyle(document.body)
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
interface FolderProps {
  onContextMenu: Function
  folder: FolderData | LinkDocs
}
function Folder({
  onContextMenu, folder,
}:FolderProps) {
  const {
    name, url, isLink,
  } = folder;
  const user = useContext(UserContext)!;
  if (isLink) {
    return (
      <li>
        <a
          href={url}
          className="folder"
          target="_blank"
          rel="noreferrer"
          onContextMenu={(e) => onContextMenu(e, name, url, 'logro' in folder ? folder.logro : undefined)}
          onClick={() => ('logro' in folder) && folder.logro
          && sendLogroUpdate(folder.logro as LogrosKeys, user.userDDBB.logros?.recursos)}
        >
          <div>
            <FontAwesomeIcon icon={faLink} />
          </div>
          <div>{name}</div>
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
          <FontAwesomeIcon icon={faFolder} />
        </div>
        <div>{name}</div>
      </Link>
    </li>
  );
}

export default Folder;
