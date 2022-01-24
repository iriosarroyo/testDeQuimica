import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';

function Path({ path }:{path:string}) {
  const descendants = path.split('/').slice(1);
  return (
    <>
      {descendants.map((desc, idx) => {
        const thisPath = descendants.slice(1, idx + 1).join('/');
        return (
          <div key={thisPath}>
            <Link to={thisPath}>{desc}</Link>
            {idx === descendants.length - 1 ? undefined : <FontAwesomeIcon icon="angle-right" />}
          </div>
        );
      })}
    </>
  );
}
export default Path;
