import React from 'react';
import { MyUser } from 'types/interfaces';

const defaultUserContext:MyUser = undefined;
const UserContext = React.createContext(defaultUserContext);

export default UserContext;
