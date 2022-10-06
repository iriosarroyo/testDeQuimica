import React from 'react';

export const defaultFechasContext = {
  statsDate: 'Hoy', statsCompDate: 'Mes pasado',
};
const FechasContext = React.createContext(defaultFechasContext);

export default FechasContext;
