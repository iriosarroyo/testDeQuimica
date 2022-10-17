import loadable from '@loadable/component';
import LoggedIn from 'components/LoggedIn';
import MyErrorContext from 'contexts/Error';
import UserContext from 'contexts/User';
import { User } from 'firebase/auth';
import React, { useState, useEffect, useContext } from 'react';
import { setColorsCustom } from 'services/colors';
import { authState } from 'services/user';

const Login = loadable(() => import('../Login'));
const NewUserForm = loadable(() => import('../NewUserForm'));

export default function ContentApp() {
  const [user, setUser]:[any, Function] = useState<User|undefined>(undefined);
  const [loading, setLoading] = useState(false);

  const setError = useContext(MyErrorContext);
  const { userDDBB } = user ?? {};
  useEffect(() => {
    if (userDDBB?.mode) {
      document.body.dataset.mode = userDDBB?.mode;
      localStorage.setItem('mode', userDDBB?.mode);
    }
  }, [userDDBB?.mode]);

  useEffect(() => {
    if (userDDBB?.customStyles) setColorsCustom(userDDBB.customStyles);
  }, [userDDBB?.customStyles]);
  useEffect(() => authState(setUser, setError, setLoading), []);
  if (user === null) return <Login />;
  if (userDDBB || user === undefined) {
    return (
      <UserContext.Provider value={!loading ? user : undefined}>
        <LoggedIn />
      </UserContext.Provider>
    );
  }
  return <NewUserForm />;
}
