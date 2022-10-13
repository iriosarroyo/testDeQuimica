import UserContext from 'contexts/User';
import { paginasEditor } from 'info/paginas';
import MyRoutes from 'MyRoutes';
import React, { useContext } from 'react';
import { Routes } from 'react-router-dom';

export default function Admin() {
  const user = useContext(UserContext)!;
  const { admin, editor } = user.userDDBB;
  if (admin) return null;
  if (!editor) return null;
  return (
    <Routes>
      {MyRoutes({ pags: paginasEditor, remove: '/editor' })}
    </Routes>
  );
}
