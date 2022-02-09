import React from 'react';
import { MyErrorContextType } from 'types/interfaces';

const defaultErrorContext:MyErrorContextType = () => {};
const MyErrorContext = React.createContext(defaultErrorContext);

export default MyErrorContext;
