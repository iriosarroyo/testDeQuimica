import React from 'react';
import './App.css';
import { Route, Routes } from 'react-router-dom';
import loadable from '@loadable/component';
import Inicio from '../Inicio';
import Navbar from '../Navbar';
import Documentos from '../Documentos';

const Perfil = loadable(() => import('../Perfil'));

function App() {
  return (
    <div className="App">
      <Navbar />
      <main className="principal">
        <Routes>
          <Route path="/inicio" element={<Inicio />} />
          <Route path="/documentos/*" element={<Documentos />} />
          <Route path="/perfil" element={<Perfil />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
