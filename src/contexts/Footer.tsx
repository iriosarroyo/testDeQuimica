import React from 'react';

const defaultFooterContext:Function = () => {};
// const defaultErrorContext:MyErrorContextType = { error: undefined, setError: () => {} };
const FooterContext = React.createContext(defaultFooterContext);

export default FooterContext;
