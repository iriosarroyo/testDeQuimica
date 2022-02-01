import React from 'react';
import { MyErrorContextType } from 'types/interfaces';

const defaultErrorContext:MyErrorContextType = () => {};
// const defaultErrorContext:MyErrorContextType = { error: undefined, setError: () => {} };
const MyErrorContext = React.createContext(defaultErrorContext);

export default MyErrorContext;
