import loadable from '@loadable/component';
import Header from 'components/Header';
import Navbar from 'components/Navbar';
import FooterContext from 'contexts/Footer';
import React, { useState } from 'react';
import { Route, Routes } from 'react-router-dom';

const Perfil = loadable(() => import('../Perfil'));
const Inicio = loadable(() => import('../Inicio'));
const Documentos = loadable(() => import('../Documentos'));
const TablaEditor = loadable(() => import('../TablaEditor'));
const TestDeHoy = loadable(() => import('../Test'));

export default function LoggedIn() {
  const [navContract, setNav] = useState(false);
  const [childrenFooter, setChildrenFooter] = useState(null);
  return (
    <div className={`loggedIn ${navContract ? 'menuContracted' : ''}`}>
      <FooterContext.Provider value={setChildrenFooter}>
        <Header click={() => setNav(!navContract)} />
        <Navbar />
        <main className="principal">
          <Routes>
            <Route path="/" element={<Inicio />} />
            <Route path="/documentos/*" element={<Documentos />} />
            <Route path="/perfil" element={<Perfil />} />
            <Route path="/tablaPeriodica" element={<TablaEditor />} />
            <Route path="/testDeHoy" element={<TestDeHoy />} />
          </Routes>
        </main>
        <footer className="myFooter">{childrenFooter}</footer>
      </FooterContext.Provider>
    </div>
  );
}
