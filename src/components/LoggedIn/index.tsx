import loadable from '@loadable/component';
import GeneralContentLoader from 'components/GeneralContentLoader';
import Header from 'components/Header';
import Navbar from 'components/Navbar';
import FooterContext from 'contexts/Footer';
import UserContext from 'contexts/User';
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
const TestDeHoy = loadable(() => import('../Test'), {
  fallback: <GeneralContentLoader />,
});

const Ajustes = loadable(() => import('../Ajustes'), {
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
  const location = useLocation();
  const handleClick = () => {
    localStorage.setItem('TestDeQuimica_NavContract', `${!navContract}`);
    setNav(!navContract);
  };
  useEffect(() => setChildrenFooter(null), [location.pathname]);

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
                <Route path="/testDeHoy" element={<TestDeHoy unaPorUna={!!user?.userDDBB.unaPorUna} />} />
                <Route path="/ajustes" element={<Ajustes />} />
              </Routes>
            )
            : <GeneralContentLoader />}
        </main>
        <footer className="myFooter">{childrenFooter}</footer>
      </FooterContext.Provider>
    </div>
  );
}
