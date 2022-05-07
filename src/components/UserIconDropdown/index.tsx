import { faGear, faRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from 'components/Button';
import React, { MutableRefObject } from 'react';
import { NavLink } from 'react-router-dom';
import { logOut } from 'services/user';

export default function UserIconDropdown({ nextref }:{nextref:MutableRefObject<any>}) {
  return (
    <div ref={nextref} className="dropUserIcon">
      <NavLink title="Ajustes" to="/ajustes">
        <FontAwesomeIcon icon={faGear} />
      </NavLink>
      <Button onClick={logOut} title="Cerrar Sesión">
        <FontAwesomeIcon icon={faRightFromBracket} />
      </Button>
    </div>
  );
}
