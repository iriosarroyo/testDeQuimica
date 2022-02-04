import Button from 'components/Button';
import React, { MutableRefObject } from 'react';
import { logOut } from 'services/user';

export default function UserIconDropdown({ nextref }:{nextref:MutableRefObject<any>}) {
  return (
    <div ref={nextref} className="dropUserIcon">
      <Button>Config</Button>
      <Button onClick={logOut}>Cerrar Sesión</Button>
    </div>
  );
}
