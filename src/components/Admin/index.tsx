import UserContext from 'contexts/User';
import { paginasAdmin } from 'info/paginas';
import MyRoutes from 'MyRoutes';
import React, { useContext } from 'react';
import { Routes } from 'react-router-dom';

export default function Admin() {
  const user = useContext(UserContext)!;
  if (!user.userDDBB.admin) return null;
  return (
    <Routes>
      {MyRoutes({ pags: paginasAdmin, remove: '/admin' })}
    </Routes>
  );
}
