import loadable from '@loadable/component';
import GeneralStructure from 'components/GeneralStructure';
import MyErrorContext from 'contexts/Error';
import UserContext from 'contexts/User';
import React, { useState, useEffect, useContext } from 'react';
import { setColorsCustom } from 'services/colors';
import { authState } from 'services/user';
import { MyUser } from 'types/interfaces';

const Login = loadable(() => import('../Login'));
const NewUserForm = loadable(() => import('../NewUserForm'));

export default function ContentApp() {
  const [user, setUser] = useState<MyUser>(undefined);
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
        <GeneralStructure />
      </UserContext.Provider>
    );
  }
  return <NewUserForm />;
}
