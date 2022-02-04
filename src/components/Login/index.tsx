import { logIn } from 'services/user';
import React, { useContext } from 'react';
import MyErrorContext from 'contexts/Error';

export default function Login() {
  const setError = useContext(MyErrorContext);
  return <button type="button" onClick={() => logIn(setError)}>Iniciar Sesión</button>;
}
