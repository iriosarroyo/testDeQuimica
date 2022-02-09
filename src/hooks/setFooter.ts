import FooterContext from 'contexts/Footer';
import React, { useContext, useEffect } from 'react';

const setFooter = (children:React.ReactElement, params:any[] = []) => {
  const setTheFooter = useContext(FooterContext);
  useEffect(() => setTheFooter(children), params);
};

export default setFooter;
