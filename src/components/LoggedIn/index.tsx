import loadable from '@loadable/component';
import GeneralContentLoader from 'components/GeneralContentLoader';
import MyErrorContext from 'contexts/Error';
import FrontContext from 'contexts/Front';
import UserContext from 'contexts/User';
import {
  changeModeCmd,
  createGroupCmd,
  exitGroupCmd,
  forceReloadAllUsers, forceReloadUser, joinGroupCmd, mantenimientoCommand,
  notificationCommand, sendDisconnectAllUsers, sendDisconnectUser,
  setMaxNumOfSquaresCmd, setVelocityCmd,
} from 'info/myCommands';
import paginas, { paginasAdmin } from 'info/paginas';
import shortcuts from 'info/shortcuts';
import { setUser, updateLocalShortCuts } from 'info/shortcutTools';
import MyRoutes from 'MyRoutes';
import React, {
  useContext, useEffect,
} from 'react';

import {
  NavigateFunction,
  Route, Routes, useNavigate,
} from 'react-router-dom';
import SearchCmd from 'services/commands';
import { setMantenimiento } from 'services/database';
import { onLogroComplete } from 'services/logros';
import reqTokenMessaging, { messagingListener, sendNotification } from 'services/notifications';
import { MyErrorContextType } from 'types/interfaces';

const Admin = loadable(() => import('../Admin'), {
  fallback: <GeneralContentLoader />,
});
const EditorRole = loadable(() => import('../EditorRole'), {
  fallback: <GeneralContentLoader />,
});

const addLoggedInCommands = (navigate:NavigateFunction, setError:MyErrorContextType) => {
  const cmds = [
    joinGroupCmd(navigate, setError),
    createGroupCmd(navigate, setError),
    exitGroupCmd(setError),
    changeModeCmd(setError),
    setVelocityCmd(setError),
    setMaxNumOfSquaresCmd(setError),
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
        setError(e as Error);
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
