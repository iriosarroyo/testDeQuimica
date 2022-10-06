import Stats from 'components/Stats';
import UserListWrapper from 'components/UserListWrapper';
import React from 'react';

export default function StatsAdmin() {
  return <UserListWrapper Child={Stats} path="/admin/estadisticas" defaultText="Resumen" />;
}
