import loadable from '@loadable/component';
import GeneralContentLoader from 'components/GeneralContentLoader';
import UserContext from 'contexts/User';
import React, { useContext } from 'react';
import { Route, Routes } from 'react-router-dom';

const InicioEditor = loadable(() => import('../InicioEditor'), {
  fallback: <GeneralContentLoader />,
});

export default function Admin() {
  const user = useContext(UserContext)!;
  if (!user.userDDBB.admin) return null;
  return (
    <Routes>
      <Route path="editarPreguntas" element={<div>Hello</div>} />
      <Route path="editarInicio" element={<InicioEditor />} />
    </Routes>
  );
}
