import loadable from '@loadable/component';
import GeneralContentLoader from 'components/GeneralContentLoader';
import Header from 'components/Header';
import Navbar from 'components/Navbar';
import FooterContext from 'contexts/Footer';
import { addShortCut, removeShortCut } from 'info/shortcuts';
import { getShortCut } from 'info/shortcutTools';
import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { initialNavValue, LOCAL_NAV } from 'services/menus';

interface ParamGeneralStructure {
    user: any,
}
const LoggedIn = loadable(() => import('../LoggedIn'), { fallback: <GeneralContentLoader /> });

export default function GeneralStructure({ user }:ParamGeneralStructure) {
  const [childrenFooter, setChildrenFooter] = useState(null);
  const [navContract, setNav] = useState(initialNavValue);

  const { pathname } = useLocation();
  useEffect(() => setChildrenFooter(null), [pathname]);

  const handleClick = useMemo(() => {
    const fn = () => {
      localStorage.setItem(LOCAL_NAV, `${!navContract}`);
      setNav(!navContract);
    };
    removeShortCut('navMenu');
    addShortCut({
      action: () => { fn(); },
      description: <>Expande o contrae el menú lateral.</>,
      id: 'navMenu',
      get shortcut() {
        return getShortCut(this);
      },
      default: 'Ctrl+Alt+Z',
    });
    return fn;
  }, [navContract]);

  return (
    <div className={`loggedIn ${navContract ? 'menuContracted' : ''}`}>
      <FooterContext.Provider value={setChildrenFooter}>
        <Header click={handleClick} />
        <Navbar />
        <main className="principal">
          {user && user.userDDBB ? <LoggedIn /> : <GeneralContentLoader />}
        </main>
        <footer className="myFooter">{childrenFooter}</footer>
      </FooterContext.Provider>
    </div>
  );
}
