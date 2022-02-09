import NavItem from 'components/NavItem';
import paginas from 'info/paginas';
import React from 'react';
import './Navbar.css';

function Navbar() {
  return (
    <nav className="menu">
      <ul className="unlisted menuListContainer">
        {paginas.map((x) => <NavItem key={x.url} item={x} />)}
      </ul>
    </nav>
  );
}

export default Navbar;
