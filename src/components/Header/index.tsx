/* import { faBars } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; */
import Button from 'components/Button';
import Search from 'components/Search';
import UserIcon from 'components/UserIcon';
import React, { MouseEventHandler } from 'react';
import { Logo } from 'services/determineApp';
import './Header.css';

export default function Header({ click }:{click?:MouseEventHandler}) {
  return (
    <header className="generalHeader">
      <Button title="Expande o contrae el menú" onClick={click} className="iconContainer">
        {/*  <FontAwesomeIcon icon={faBars} width="100px" /> */}
        <Logo />
      </Button>
      <Search />
      <UserIcon />
    </header>
  );
}

Header.defaultProps = { click: () => {} };
