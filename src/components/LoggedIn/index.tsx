import loadable from '@loadable/component';
import GeneralContentLoader from 'components/GeneralContentLoader';
import MyErrorContext from 'contexts/Error';
import FrontContext from 'contexts/Front';
import UserContext from 'contexts/User';
import {
  forceReloadAllUsers, forceReloadUser, mantenimientoCommand,
  notificationCommand, sendDisconnectAllUsers, sendDisconnectUser,
} from 'info/myCommands';
import paginas, { paginasAdmin } from 'info/paginas';
import shortcuts from 'info/shortcuts';
import { getUser, setUser, updateLocalShortCuts } from 'info/shortcutTools';
import MyRoutes from 'MyRoutes';
import React, {
  useContext, useEffect,
} from 'react';

import {
  Route, Routes, useNavigate,
} from 'react-router-dom';
import SearchCmd from 'services/commands';
import { setMantenimiento, writeUserInfo } from 'services/database';
import { onLogroComplete } from 'services/logros';
import reqTokenMessaging, { messagingListener, sendNotification } from 'services/notifications';
import { connectToRoom, createRoom, exitRoom } from 'services/rooms';
import Toast from 'services/toast';

const Admin = loadable(() => import('../Admin'), {
  fallback: <GeneralContentLoader />,
});
const EditorRole = loadable(() => import('../EditorRole'), {
  fallback: <GeneralContentLoader />,
});

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
        type: ['dark', 'light', 'custom', 'default'],
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
let pushedAdmin = false;
export default function LoggedIn() {
  const user = useContext(UserContext);
  const setError = useContext(MyErrorContext);
  const setFront = useContext(FrontContext);
  const navigate = useNavigate();
  setUser(user);
  useEffect(
    () => (user === undefined ? undefined : addLoggedInCommands(navigate, setError)),
    [user === undefined],
  );
  /* if (user?.userDDBB) {
    getProbByPreg(user.userDDBB).then(console.log);
  } */
  useEffect(() => {
    if (user?.userDDBB.admin && !pushedAdmin) {
      pushedAdmin = true; shortcuts.push(...paginasAdmin);
    }
  }, [user?.userDDBB.admin]);

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
        offTypes = SearchCmd.addTypeToParam(
          'goTo',
          'url',
          ...(paginasAdmin.map((x) => x.icon && x.url.slice(1)).filter((x) => x) as string[]),
        );
      } catch (e) {
        setError(e);
      }
      // Turn into array
      const offSend = notificationCommand(sendNotification);
      const offMantenimiento = mantenimientoCommand(setMantenimiento);
      let offDisconnect = () => {};
      sendDisconnectUser().then((res) => { offDisconnect = res; });
      let offReload = () => {};
      forceReloadUser().then((res) => { offReload = res; });
      const offDisconnectAll = sendDisconnectAllUsers();
      const offReloadAll = forceReloadAllUsers();
      return () => {
        offTypes(); offSend(); offMantenimiento(); offDisconnect();
        offReload(); offDisconnectAll(); offReloadAll();
      };
    }

    return undefined;
  }, [user?.userDDBB.admin]);
  useEffect(() => {
    let result = () => {};
    if (user?.userDDBB) {
      result = onLogroComplete(setFront);
    }
    return result;
  }, [user?.userDDBB === undefined]);

  return (
    <Routes>
      {MyRoutes({ pags: paginas })}
      <Route path="/admin/*" element={<Admin />} />
      <Route path="/editor/*" element={<EditorRole />} />
    </Routes>
  );
}
