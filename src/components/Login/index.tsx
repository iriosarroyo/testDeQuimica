import { logIn } from 'services/user';
import React from 'react';

export default function Login() {
  return <button type="button" onClick={logIn}>Iniciar Sesión</button>;
}
