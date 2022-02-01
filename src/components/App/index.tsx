import React, { useEffect, useState } from 'react';
import './App.css';
import { Route, Routes } from 'react-router-dom';
import loadable from '@loadable/component';
import MyError from 'components/MyError';
import MyErrorContext from 'contexts/Error';
import { authState } from 'services/user';
import NewUserForm from 'components/NewUserForm';
import Inicio from '../Inicio';
import Navbar from '../Navbar';
import Documentos from '../Documentos';

const Perfil = loadable(() => import('../Perfil'));
const Login = loadable(() => import('../Login'));

function App() {
  const [error, setError] = useState(undefined);
  const [user, setUser]:[any, Function] = useState(undefined);
  useEffect(() => {
    authState(setUser);
  }, []);
  return (
    <MyErrorContext.Provider value={setError}>
      <div className="App">
        {user === undefined && 'No está definido'}
        {user === null && <Login />}
        {user
      && (
        user.result
          ? (
            <>
              <Navbar />
              <main className="principal">
                <Routes>
                  <Route path="/" element={<Inicio />} />
                  <Route path="/documentos/*" element={<Documentos />} />
                  <Route path="/perfil" element={<Perfil />} />
                </Routes>
              </main>
            </>
          ) : <NewUserForm />)}
        {error && <MyError error={error} setError={setError} />}

      </div>
    </MyErrorContext.Provider>

  );
}

export default App;
