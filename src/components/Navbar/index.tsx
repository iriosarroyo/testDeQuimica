import NavItem from 'components/NavItem';
import React from 'react';
import './Navbar.css';

function Navbar() {
  return (
    <nav className="menu">
      <ul className="unlisted">
        <NavItem url="/" text="Inicio" icon="home" />
        <NavItem url="/documentos" text="Documentos" icon="archive" />
        <NavItem url="/testDeHoy" text="Test de Hoy" icon="calendar-day" />
      </ul>
    </nav>
  );
}

export default Navbar;
