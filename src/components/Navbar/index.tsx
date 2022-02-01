import React from 'react';
import { NavLink } from 'react-router-dom';
import { logOut } from 'services/user';
import './Navbar.css';

function Navbar() {
  return (
    <nav className="menu">
      <NavLink to="/inicio">Inicio</NavLink>
      <NavLink to="/documentos">Documentos</NavLink>
      <NavLink to="/perfil">Perfil</NavLink>
      <button type="button" onClick={logOut}>Cerrar Sesión</button>
    </nav>
  );
}

export default Navbar;
