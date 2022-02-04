import loadable from '@loadable/component';
import MyErrorContext from 'contexts/Error';
import React, { useState, useEffect, useContext } from 'react';
// import { authState } from 'services/user';

const Login = loadable(() => import('../Login'));
const LoggedIn = loadable(() => import('../LoggedIn'));
const NewUserForm = loadable(() => import('../NewUserForm'));
const Header = loadable(() => import('../Header'));

export default function ContentApp() {
  const [user, setUser]:[any, Function] = useState(undefined);
  const setError = useContext(MyErrorContext);
  const { userDDBB } = user ?? {};
  useEffect(() => {
    if (user) setError(undefined);
    setUser({ userDDBB: true });
    // authState(setUser, setError);
  }, []);
  console.log({ user });
  if (user === undefined) return <Header />;
  if (user === null) return <Login />;
  if (userDDBB) return <LoggedIn />;
  return <NewUserForm />;
}
