import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';
import './Path.css';
import { faAngleRight } from '@fortawesome/free-solid-svg-icons';

function Path({ path, isSearch, admin }:{path:string, isSearch: boolean, admin:boolean}) {
  const descendants = path.split('/').slice(admin ? 2 : 1);
  return (
    <ul className="unlisted path">
      {descendants.map((desc, idx) => {
        const thisPath = descendants.slice(1, idx + 1).join('/');
        return (
          <li key={thisPath} className="pathItem">
            <Link to={thisPath}>{idx === 0 ? 'Inicio' : desc}</Link>
            {idx === descendants.length - 1 ? undefined : <FontAwesomeIcon icon={faAngleRight} />}
          </li>
        );
      })}
      {isSearch ? '(búsqueda)' : ''}
    </ul>
  );
}
export default Path;
