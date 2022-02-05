import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';
import './Path.css';

function Path({ path }:{path:string}) {
  const descendants = path.split('/').slice(1);
  return (
    <ul className="unlisted path">
      {descendants.map((desc, idx) => {
        const thisPath = descendants.slice(1, idx + 1).join('/');
        return (
          <li key={thisPath} className="pathItem">
            <Link to={thisPath}>{desc}</Link>
            {idx === descendants.length - 1 ? undefined : <FontAwesomeIcon icon="angle-right" />}
          </li>
        );
      })}
    </ul>
  );
}
export default Path;
