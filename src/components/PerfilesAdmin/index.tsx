import Perfil from 'components/Perfil';
import UserListWrapper from 'components/UserListWrapper';
import React from 'react';

export default function PerfilesAdmin() {
  return <UserListWrapper Child={Perfil} path="/admin/perfiles" />;
}
