import React, {
  ReactElement, useEffect, useMemo, useState,
} from 'react';
import './App.css';
import MyErrorContext from 'contexts/Error';
import ContentApp from 'components/ContentApp';
import shortcuts from 'info/shortcuts';
import { FrontContextType, Shortcut } from 'types/interfaces';
import { NavigateFunction, useNavigate } from 'react-router-dom';
import loadable from '@loadable/component';
import FrontContext from 'contexts/Front';
import SearchCmd from 'services/commands';
import paginas from 'info/paginas';
import Toast from 'services/toast';
import { onValueDDBB } from 'services/database';
import { arrowsEvent, createSwipeEvent } from 'services/customEvents';
import GeneralContentLoader from 'components/GeneralContentLoader';
import { onChangeFullscreen } from 'services/elemenstInViewPort';
import Button from 'components/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExpand } from '@fortawesome/free-solid-svg-icons';
import { setColorsCustom } from 'services/colors';
import { ErrorBoundary } from 'react-error-boundary';

const Front = loadable(() => import('../Front'), {
  fallback: <GeneralContentLoader />,
});

const Mantenimiento = loadable(() => import('../Mantenimiento'), {
  fallback: <GeneralContentLoader />,
});

const MyError = loadable(() => import('../MyError'), {
  fallback: <GeneralContentLoader />,
});

const goTo = (shortcut:Shortcut, navigate:NavigateFunction, shift:boolean) => {
  if (!shortcut.url) return undefined;
  if (shift) return window.open(shortcut.url, '_blank');
  return navigate(shortcut.url);
};

const showFront = (shortcut:Shortcut, show:FrontContextType) => {
  if (shortcut.element) show({ elem: shortcut.element(), cb: () => {} });
};

const executeShortcut = (
  shortcut:Shortcut,
  functions:[NavigateFunction, FrontContextType],
  shift = false,
) => {
  const [navigate, setFrontElement] = functions;
  if (shortcut.action === 'goTo') return goTo(shortcut, navigate, shift);
  if (shortcut.action === 'showFront') return showFront(shortcut, setFrontElement);
  if (typeof shortcut.action === 'function') return shortcut.action(shift);
  return undefined;
};

const handleKeyDown = (event:KeyboardEvent, functions:[NavigateFunction, FrontContextType]) => {
  const ctrl = event.ctrlKey ? 'Ctrl+' : '';
  const shift = event.shiftKey;
  const alt = event.altKey ? 'Alt+' : '';
  const key = event.key.toUpperCase();
  const keyCommand = `${ctrl}${alt}${key}`;
  if (shift) {
    const resultShift = shortcuts.find((x) => x.shift && x.shortcut === keyCommand);
    if (resultShift) return executeShortcut(resultShift, functions, true);
  } else {
    const result = shortcuts.find((x) => x.shortcut === keyCommand);
    if (result) return executeShortcut(result, functions);
  }
  return undefined;
};

const goToCommand = (navigate:NavigateFunction) => (path:string, newPage:boolean) => {
  const finalPath = `/${path === 'inicio' ? '' : path}`;
  if (newPage) return window.open(finalPath, '_blank');
  return navigate(finalPath);
};

const getPosiblePaths = () => paginas.map((x) => (!x.icon ? null : x.url.slice(1)))
  .filter((x) => x) as string[];
const addCommands = (navigate:NavigateFunction, show:FrontContextType) => {
  const cmdsOff = [SearchCmd.addCommand(
    'goTo',
    'Ve a un apartado de la página web.',
    goToCommand(navigate),
    {
      name: 'url',
      optional: false,
      type: getPosiblePaths(),
      desc: ' Elige el apartado de la página al que navegar.',
    },

    {
      name: 'nuevaPestaña',
      optional: true,
      type: ['boolean'],
      default: 'false',
      desc: 'Decide si abrirlo en una nueva pestaña.',
    },
  ),

  SearchCmd.addCommand(
    'show',
    'Muestra en pantalla la tabla periódica, constantes...',
    (id:string) => {
      const sc = shortcuts.find((x) => x.id === id);
      if (sc !== undefined) showFront(sc, show);
    },
    {
      name: 'elemento',
      desc: 'Elige el elemento a mostrar.',
      optional: false,
      type: shortcuts.filter((x) => x.action === 'showFront').map((x) => x.id),
    },
  ),
  SearchCmd.addCommand(
    'version',
    'Muestra la version de la página web',
    () => Toast.addMsg(`Versión ${process.env.REACT_APP_VERSION}`, 5000),
  )];
  return () => cmdsOff.forEach((off) => off());
};

function FallbackError({ error }: { error: Error }) {
  return (
    <div>
      <p>
        Ha ocurrido un error inesperado.
      </p>
      <p>
        Por favor, recarga la página.
        Si el error persiste contacta con el administrador.
      </p>
      <p>
        Error:
        {error.message}
      </p>
      <p>
        Stack:
        {error.stack}
      </p>
    </div>
  );
}

function App() {
  const [error, setError] = useState<Error|undefined>(undefined);
  const [toast, setToast] = useState<string|undefined>(undefined);
  const [buttonFullScreen, setButtonFullscreen] = useState(false);
  const [mantenimiento, setMantenimiento] = useState(false);
  const [frontElement, setFrontElement] = useState<{elem:ReactElement|null,
    cb:() => any, unableFocus?:boolean}>({ elem: null, cb: () => {} });
  const { elem, cb, unableFocus } = frontElement;
  const navigate = useNavigate();
  const functions:[NavigateFunction, FrontContextType] = [navigate, setFrontElement];
  Toast.setterFn = (val:string|undefined) => setToast(val);
  useMemo(() => addCommands(navigate, setFrontElement), []);
  useEffect(
    () => {
      const callback = (event:KeyboardEvent) => handleKeyDown(event, functions);
      document.addEventListener('keydown', callback);
      return () => document.removeEventListener('keydown', callback);
    },
    [],
  );

  useEffect(() => {
    const unSubRight = createSwipeEvent('swiperight', -100);
    const unSubLeft = createSwipeEvent('swipeleft', 100);
    const unSubArrows = arrowsEvent();
    return () => { unSubRight(); unSubLeft(); unSubArrows(); };
  }, []);

  useEffect(() => onValueDDBB('mantenimiento', setMantenimiento, setError), []);

  document.body.dataset.mode = localStorage.getItem('mode') ?? 'null';
  setColorsCustom(JSON.parse(localStorage.getItem('styles:customStyles') ?? '{}'));

  useEffect(() => onChangeFullscreen(setButtonFullscreen), []);

  return (
    <ErrorBoundary FallbackComponent={FallbackError}>
      <MyErrorContext.Provider value={setError}>
        <FrontContext.Provider value={setFrontElement}>
          <div className="App">
            {buttonFullScreen && (
            <Button
              className="buttonFullscreen"
              onClick={() => {
                document.body.requestFullscreen();
                setButtonFullscreen(false);
              }}
            >
              <FontAwesomeIcon icon={faExpand} />
            </Button>
            )}
            {mantenimiento ? <Mantenimiento /> : <ContentApp />}
            {error && <MyError error={error} setError={setError} />}
            {elem && (
            <Front
              setChildren={setFrontElement}
              cb={cb}
              unableFocus={unableFocus}
            >
              {elem}
            </Front>
            )}
            {toast && <div className="toast">{toast}</div>}
          </div>
        </FrontContext.Provider>
      </MyErrorContext.Provider>
    </ErrorBoundary>

  );
}

export default App;
