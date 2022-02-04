import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { NavLink } from 'react-router-dom';

export default function NavItem({ url, text, icon }:{url:string, text:string, icon:IconProp}) {
  return (
    <NavLink title={text} to={url}>
      <div className="menuIcon">
        <FontAwesomeIcon icon={icon} />
      </div>
      <div className="menuText">{text}</div>
    </NavLink>
  );
}
