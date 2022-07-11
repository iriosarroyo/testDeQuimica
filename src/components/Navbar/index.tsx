import NavItem from 'components/NavItem';
import UserContext from 'contexts/User';
import paginas, { paginasAdmin } from 'info/paginas';
import React, { useContext } from 'react';
import './Navbar.css';

function Navbar() {
  const user = useContext(UserContext);
  const admin = Boolean(user) && user?.userDDBB.admin;
  return (
    <nav className="menu">
      <ul className="unlisted menuListContainer">
        {paginas.map((x) => <NavItem key={x.url} item={x} />)}
        {
          admin && (
          <>
            <hr />
            <hr />
            <strong className="adminTitle">Administrador</strong>
            {paginasAdmin.map((x) => <NavItem key={x.url} item={x} />)}
          </>
          )
        }
      </ul>
    </nav>
  );
}

export default Navbar;
