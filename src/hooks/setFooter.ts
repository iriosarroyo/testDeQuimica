import FooterContext from 'contexts/Footer';
import React, { useContext, useEffect } from 'react';

const setFooter = (children:React.ReactElement) => {
  const setTheFooter = useContext(FooterContext);
  useEffect(() => setTheFooter(children), []);
};

export default setFooter;
