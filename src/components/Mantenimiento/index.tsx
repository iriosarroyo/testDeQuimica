import React, { useEffect, useState } from 'react';
import { ReactComponent as Logo } from 'logo.svg';
import './Mantenimiento.css';
import { auth } from 'services/firebaseApp';
import { useLocation } from 'react-router-dom';
import { logIn } from 'services/user';
import Toast from 'services/toast';
import { getFromSocketUID } from 'services/socket';
import ContentApp from 'components/ContentApp';

export default function Mantenimiento() {
  const { pathname } = useLocation();
  const [admin, setAdmin] = useState(false);
  const changeAdmin = async () => {
    setAdmin(!!(await getFromSocketUID('user:isAdmin')));
  };
  useEffect(() => {
    if (pathname === '/logIn' && auth.currentUser === null) {
      logIn((msg:any) => Toast.addMsg(msg.msg, 3000));
    }
  }, [pathname]);
  useEffect(() => {
    if (auth.currentUser !== null) changeAdmin();
  }, []);
  if (admin) return <ContentApp />;
  return (
    <div className="mantenimiento">
      <Logo />
      <h1>Página en Mantenimiento</h1>
      <p>
        La página se encuentra actualmente en mantenimiento.
        Inténtalo de nuevo más tarde.
      </p>
      <p>
        La página se acutalizará automaticamente una vez se termine el mantenimiento.
      </p>
    </div>
  );
}
