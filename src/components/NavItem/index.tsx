import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { NavLink } from 'react-router-dom';
import { PaginaObject } from 'types/interfaces';

export default function NavItem({ item }:{item:PaginaObject}) {
  const { text, url, icon } = item;
  if (!icon) return null;
  return (
    <li>
      <NavLink
        title={text}
        to={url}
      >
        <div className="menuIcon">
          <FontAwesomeIcon icon={icon} />
        </div>
        <div className="menuText">{text}</div>
      </NavLink>
    </li>
  );
}
