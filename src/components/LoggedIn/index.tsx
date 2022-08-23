import loadable from '@loadable/component';
import GeneralContentLoader from 'components/GeneralContentLoader';
import Header from 'components/Header';
import Navbar from 'components/Navbar';
import MyErrorContext from 'contexts/Error';
import FooterContext from 'contexts/Footer';
import FrontContext from 'contexts/Front';
import UserContext from 'contexts/User';
import { paginasAdmin } from 'info/paginas';
import shortcuts, { addShortCut, removeShortCut } from 'info/shortcuts';
import {
  getShortCut, getUser, setUser, updateLocalShortCuts,
} from 'info/shortcutTools';
import React, {
  useContext, useEffect, useState, useMemo,
} from 'react';

import {
  Route, Routes, useLocation, useNavigate,
} from 'react-router-dom';
import SearchCmd from 'services/commands';
import { setMantenimiento, writeUserInfo } from 'services/database';
import reqTokenMessaging, { messagingListener, sendNotification } from 'services/notifications';
import { connectToRoom, createRoom, exitRoom } from 'services/rooms';
import { eventListenerSocket } from 'services/socket';
import Toast from 'services/toast';

const Perfil = loadable(() => import('../Perfil'), {
  fallback: <GeneralContentLoader />,
});
const Inicio = loadable(() => import('../Inicio'), {
  fallback: <GeneralContentLoader />,
});
const Documentos = loadable(() => import('../Documentos'), {
  fallback: <GeneralContentLoader />,
});
const TablaEditor = loadable(() => import('../TablaEditor'), {
  fallback: <GeneralContentLoader />,
});
const CustomTest = loadable(() => import('../CustomTest'), {
  fallback: <GeneralContentLoader />,
});

const Ajustes = loadable(() => import('../Ajustes'), {
  fallback: <GeneralContentLoader />,
});

const Online = loadable(() => import('../Online'), {
  fallback: <GeneralContentLoader />,
});

const Puntuaciones = loadable(() => import('../Puntuaciones'), {
  fallback: <GeneralContentLoader />,
});

const Admin = loadable(() => import('../Admin'), {
  fallback: <GeneralContentLoader />,
});

const Logros = loadable(() => import('../Logros'), {
  fallback: <GeneralContentLoader />,
});
const Clasificacion = loadable(() => import('../Clasificacion'), {
  fallback: <GeneralContentLoader />,
});
const LogroComplete = loadable(() => import('../LogroCompleted'), {
  fallback: <GeneralContentLoader />,
});

const navContractDefault = window.innerWidth <= 500;
const localNavValue = localStorage.getItem('TestDeQuimica_NavContract');
const getInitialNavValue = () => {
  if (localNavValue === null) return navContractDefault;
  return localNavValue === 'true';
};
const initialNavValue = getInitialNavValue();

const addLoggedInCommands = (navigate:Function, setError:Function) => {
  const cmds = [
    SearchCmd.addCommand(
      'joinGroup',
      'Únete a un grupo online.',
      (room:string) => {
        const user = getUser();
        navigate('/online');
        if (user === undefined) return undefined;
        if (user.userDDBB.room !== undefined) return Toast.addMsg('Ya estás en un grupo', 5000);
        return connectToRoom(user, room).catch((err) => setError(err));
      },
      {
        name: 'codigo',
        desc: 'Escribe el código del grupo',
        optional: false,
        type: ['string'],
      },
    ),
    SearchCmd.addCommand(
      'createGroup',
      'Crea un grupo online.',
      () => {
        const user = getUser();
        navigate('/online');
        if (user === undefined) return undefined;
        if (user.userDDBB.room !== undefined) return Toast.addMsg('Ya estás en un grupo', 5000);
        return createRoom(user, setError);
      },
    ),
    SearchCmd.addCommand(
      'exitGroup',
      'Sal del grupo online.',
      () => {
        const user = getUser();
        if (user === undefined) return undefined;
        if (user.userDDBB.room === undefined) return Toast.addMsg('No estás en ningún grupo', 5000);
        return exitRoom(user).catch((err) => setError(err));
      },
    ),
    SearchCmd.addCommand(
      'mode',
      'Cambiar el modo de la página',
      async (mode:string) => {
        const error = await writeUserInfo(mode === 'default' ? 'null' : mode, 'mode');
        localStorage.setItem('mode', mode);
        if (error) setError(error);
        else Toast.addMsg(`Modo cambiado a ${mode}`, 5000);
      },
      {
        name: 'modo',
        desc: 'Elige el estilo',
        optional: false,
        type: ['dark', 'light', 'default'],
      },
    ),
    SearchCmd.addCommand(
      'setVelocity',
      'Cambia la velocidad de los mensajes del pie',
      async (velocity:number) => {
        const error = await writeUserInfo(velocity, 'velocidad');
        if (error) setError(error);
        else Toast.addMsg(`La velocidad ha cambiado a ${velocity}.`, 5000);
      },
      {
        name: 'velocidad',
        desc: 'Velocidad del mensaje (debe ser mayor que 0).',
        optional: false,
        type: ['number'],
      },
    ),
  ];
  return () => cmds.forEach((cmd) => cmd());
};

export default function LoggedIn() {
  const user = useContext(UserContext);
  const setError = useContext(MyErrorContext);
  const setFront = useContext(FrontContext);
  const [navContract, setNav] = useState(initialNavValue);
  const [childrenFooter, setChildrenFooter] = useState(null);
  const navigate = useNavigate();
  setUser(user);
  useEffect(
    () => (user === undefined ? undefined : addLoggedInCommands(navigate, setError)),
    [user === undefined],
  );
  useEffect(() => {
    if (user?.userDDBB.admin) shortcuts.push(...paginasAdmin);
  }, [user?.userDDBB.admin]);
  const location = useLocation();
  const handleClick = useMemo(() => {
    const fn = () => {
      localStorage.setItem('TestDeQuimica_NavContract', `${!navContract}`);
      setNav(!navContract);
    };
    removeShortCut('navMenu');
    addShortCut({
      action: () => { fn(); },
      description: 'Expande o contrae el menú lateral.',
      id: 'navMenu',
      get shortcut() {
        return getShortCut(this);
      },
      default: 'Ctrl+Alt+Z',
    });
    return fn;
  }, [navContract]);
  useEffect(() => setChildrenFooter(null), [location.pathname]);
  useEffect(() => {
    updateLocalShortCuts(shortcuts);
  }, []);

  useEffect(() => {
    if (user?.userDDBB.year !== undefined) {
      reqTokenMessaging(user?.userDDBB.year).then(() => messagingListener(setFront));
    }
  }, [user?.userDDBB.year]);

  useEffect(() => {
    if (user?.userDDBB.admin) {
      let offTypes:Function = () => {};
      try {
        offTypes = SearchCmd.addTypeToParam('goTo', 'url', ...paginasAdmin.map((x) => x.url.slice(1)));
      } catch (e) {
        setError(e);
      }
      const offSend = SearchCmd.addCommand(
        'sendNotification',
        'Envía una notificación a los usuarios de la página.',
        sendNotification,
        {
          name: 'titulo',
          desc: 'Título de la notificación.',
          optional: false,
          type: ['string'],
        },
        {
          name: 'cuerpo',
          desc: 'Cuerpo de la notificación.',
          optional: false,
          type: ['string'],
        },
        {
          name: 'grupo',
          desc: 'Indica el grupo al que mandarle la notificación. Por defecto es a todos.',
          optional: true,
          type: ['all', 'eso3', 'eso4', 'bach1', 'bach2'],
          default: 'all',
        },
      );

      const offMantenimiento = SearchCmd.addCommand(
        'setMantenimiento',
        'Modifica el estado de mantenimiento de la página',
        setMantenimiento,
        {
          name: 'estado',
          desc: 'Activa (true) o desactiva (false) el estado de mantenimiento.',
          optional: false,
          type: ['boolean'],
        },
      );
      return () => { offTypes(); offSend(); offMantenimiento(); };
    }

    return undefined;
  }, [user?.userDDBB.admin]);

  useEffect(() => {
    let result = () => {};
    if (user?.userDDBB) {
      result = eventListenerSocket('onLogroCompletion', (logroId:string) => {
        setFront({
          elem: <LogroComplete logroId={logroId} />,
          cb: () => {},
        });
      });
    }
    return result;
  }, [user?.userDDBB === undefined]);

  return (
    <div className={`loggedIn ${navContract ? 'menuContracted' : ''}`}>
      <FooterContext.Provider value={setChildrenFooter}>
        <Header click={handleClick} />
        <Navbar />
        <main className="principal">
          {user
            ? (
              <Routes>
                <Route path="/" element={<Inicio />} />
                <Route path="/documentos/*" element={<Documentos />} />
                <Route path="/perfil" element={<Perfil />} />
                <Route path="/tablaPeriodica" element={<TablaEditor />} />
                <Route path="/testDeHoy" element={<CustomTest room="testDelDia" />} />
                <Route path="/ajustes" element={<Ajustes />} />
                <Route path="/online" element={<Online />} />
                <Route path="/puntuaciones" element={<Puntuaciones />} />
                <Route path="/logros" element={<Logros starsAndLogros={user.userDDBB} />} />
                <Route path="/clasificacion" element={<Clasificacion />} />
                <Route path="/admin/*" element={<Admin />} />
              </Routes>
            )
            : <GeneralContentLoader />}
        </main>
        <footer className="myFooter">{childrenFooter}</footer>
      </FooterContext.Provider>
    </div>
  );
}
