import loadable from '@loadable/component';
import GeneralContentLoader from 'components/GeneralContentLoader';
import Header from 'components/Header';
import Navbar from 'components/Navbar';
import FooterContext from 'contexts/Footer';
import UserContext from 'contexts/User';
import { getAuth } from 'firebase/auth';
import shortcuts from 'info/shortcuts';
import { setUser, updateLocalShortCuts } from 'info/shortcutTools';
import React, { useContext, useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';

const Perfil = loadable(() => import('../Perfil'), {
  fallback: <GeneralContentLoader />,
});
const Inicio = loadable(() => import('../Inicio'), {
  fallback: <GeneralContentLoader />,
});
const Documentos = loadable(() => import('../Documentos'), {
  fallback: <GeneralContentLoader />,
});
const TablaEditor = loadable(() => import('../TablaEditor'), {
  fallback: <GeneralContentLoader />,
});
const CustomTest = loadable(() => import('../CustomTest'), {
  fallback: <GeneralContentLoader />,
});

const Ajustes = loadable(() => import('../Ajustes'), {
  fallback: <GeneralContentLoader />,
});

const Online = loadable(() => import('../Online'), {
  fallback: <GeneralContentLoader />,
});

const navContractDefault = window.innerWidth <= 500;
const localNavValue = localStorage.getItem('TestDeQuimica_NavContract');
const getInitialNavValue = () => {
  if (localNavValue === null) return navContractDefault;
  return localNavValue === 'true';
};
const initialNavValue = getInitialNavValue();

export default function LoggedIn() {
  const user = useContext(UserContext);
  const [navContract, setNav] = useState(initialNavValue);
  const [childrenFooter, setChildrenFooter] = useState(null);

  setUser(user);
  console.log(user?.uid, getAuth());
  const location = useLocation();
  const handleClick = () => {
    localStorage.setItem('TestDeQuimica_NavContract', `${!navContract}`);
    setNav(!navContract);
  };
  useEffect(() => setChildrenFooter(null), [location.pathname]);

  useEffect(() => {
    updateLocalShortCuts(shortcuts);
  }, []);

  return (
    <div className={`loggedIn ${navContract ? 'menuContracted' : ''}`}>
      <FooterContext.Provider value={setChildrenFooter}>
        <Header click={handleClick} />
        <Navbar />
        <main className="principal">
          {user
            ? (
              <Routes>
                <Route path="/" element={<Inicio />} />
                <Route path="/documentos/*" element={<Documentos />} />
                <Route path="/perfil" element={<Perfil />} />
                <Route path="/tablaPeriodica" element={<TablaEditor />} />
                <Route path="/testDeHoy" element={<CustomTest room="testDelDia" />} />
                <Route path="/ajustes" element={<Ajustes />} />
                <Route path="/online" element={<Online />} />
              </Routes>
            )
            : <GeneralContentLoader />}
        </main>
        <footer className="myFooter">{childrenFooter}</footer>
      </FooterContext.Provider>
    </div>
  );
}
