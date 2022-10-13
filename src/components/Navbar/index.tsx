import NavItem from 'components/NavItem';
import UserContext from 'contexts/User';
import paginas, { paginasAdmin, paginasEditor } from 'info/paginas';
import React, { useContext } from 'react';
import { Paginas } from 'types/interfaces';
import './Navbar.css';

function NavList({ paginas: pags }:{paginas:Paginas}) {
  return (
    <>
      {pags.map((pag) => {
        const isVisible = typeof pag.visible === 'function' ? pag.visible() : pag.visible;
        if (!isVisible) return null;
        return <NavItem key={pag.url} item={pag} />;
      })}
    </>
  );
}

function Navbar() {
  const user = useContext(UserContext);
  const admin = Boolean(user) && user?.userDDBB.admin;
  const editor = Boolean(user) && user?.userDDBB.editor;
  return (
    <nav className="menu">
      <ul className="unlisted menuListContainer">
        <NavList paginas={paginas} />
        {
          !admin && editor && (
          <>
            <hr />
            <hr />
            <strong className="adminTitle">Editor</strong>
            <NavList paginas={paginasEditor} />
          </>
          )
        }
        {
          admin && (
          <>
            <hr />
            <hr />
            <strong className="adminTitle">Administrador</strong>
            <NavList paginas={paginasAdmin} />
          </>
          )
        }
      </ul>
    </nav>
  );
}

export default Navbar;
