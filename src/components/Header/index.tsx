import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from 'components/Button';
import Search from 'components/Search';
import UserIcon from 'components/UserIcon';
import React, { MouseEventHandler } from 'react';
import './Header.css';

export default function Header({ click }:{click?:MouseEventHandler}) {
  return (
    <header className="generalHeader">
      <Button onClick={click} className="iconContainer">
        <FontAwesomeIcon icon="bars" width="100px" />
      </Button>
      <Search />
      <UserIcon />
    </header>
  );
}

Header.defaultProps = { click: () => {} };
