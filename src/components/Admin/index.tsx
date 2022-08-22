import loadable from '@loadable/component';
import GeneralContentLoader from 'components/GeneralContentLoader';
import UserContext from 'contexts/User';
import React, { useContext } from 'react';
import { Route, Routes } from 'react-router-dom';

const InicioEditor = loadable(() => import('../InicioEditor'), {
  fallback: <GeneralContentLoader />,
});
const QuestionEditor = loadable(() => import('../QuestionEditor'), {
  fallback: <GeneralContentLoader />,
});
const TemasOrdering = loadable(() => import('../TemasOrdering'), {
  fallback: <GeneralContentLoader />,
});
const Documentos = loadable(() => import('../Documentos'), {
  fallback: <GeneralContentLoader />,
});

export default function Admin() {
  const user = useContext(UserContext)!;
  if (!user.userDDBB.admin) return null;
  return (
    <Routes>
      <Route path="editarPreguntas" element={<QuestionEditor />} />
      <Route path="editarInicio" element={<InicioEditor />} />
      <Route path="ordenarTemas" element={<TemasOrdering />} />
      <Route path="documentos/*" element={<Documentos admin />} />
    </Routes>
  );
}
