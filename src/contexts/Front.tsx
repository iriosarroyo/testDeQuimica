import React from 'react';
import { FrontContextType } from 'types/interfaces';

const defaultFrontContext:FrontContextType = () => {};
const FrontContext = React.createContext(defaultFrontContext);

export default FrontContext;
