import loadable from '@loadable/component';
import LoggedIn from 'components/LoggedIn';
import MyErrorContext from 'contexts/Error';
import UserContext from 'contexts/User';
import { User } from 'firebase/auth';
import React, { useState, useEffect, useContext } from 'react';
import { authState } from 'services/user';

const Login = loadable(() => import('../Login'));
const NewUserForm = loadable(() => import('../NewUserForm'));

export default function ContentApp() {
  const [user, setUser]:[any, Function] = useState<User|undefined>(undefined);
  const setError = useContext(MyErrorContext);
  const { userDDBB } = user ?? {};
  useEffect(() => authState(setUser, setError), []);
  if (user === null) return <Login />;
  if (userDDBB || user === undefined) {
    return <UserContext.Provider value={user}><LoggedIn /></UserContext.Provider>;
  }
  return <NewUserForm />;
}
