import React, { ReactElement, useEffect, useState } from 'react';
import './App.css';
import MyError from 'components/MyError';
import MyErrorContext from 'contexts/Error';
import ContentApp from 'components/ContentApp';
import shortcuts from 'info/shortcuts';
import { Shortcut } from 'types/interfaces';
import { useNavigate } from 'react-router-dom';
import loadable from '@loadable/component';
import FrontContext from 'contexts/Front';

const Front = loadable(() => import('../Front'));

const goTo = (shortcut:Shortcut, navigate:Function, shift:boolean) => {
  if (!shortcut.url) return undefined;
  if (shift) return window.open(shortcut.url, '_blank');
  return navigate(shortcut.url);
};

const showFront = (shortcut:Shortcut, show:Function) => {
  if (shortcut.element) show(shortcut.element());
};

const executeShortcut = (shortcut:Shortcut, functions:{[key:string]:Function}, shift = false) => {
  const { navigate, setFrontElement } = functions;
  if (shortcut.action === 'goTo') return goTo(shortcut, navigate, shift);
  if (shortcut.action === 'showFront') return showFront(shortcut, setFrontElement);
  return undefined;
};

const handleKeyDown = (event:KeyboardEvent, functions:{[key:string]:Function}) => {
  const ctrl = event.ctrlKey ? 'Ctrl+' : '';
  const shift = event.shiftKey ? 'Shift+' : '';
  const alt = event.altKey ? 'Alt+' : '';
  const key = event.key.toUpperCase();
  const keyCommand = `${ctrl}${shift}${alt}${key}`;

  const result = shortcuts.find((x) => x.shortcut === keyCommand);
  if (result) return executeShortcut(result, functions);
  const resultShift = shortcuts.find((x) => x.shift && x.shift === keyCommand);
  if (resultShift) return executeShortcut(resultShift, functions, true);
  return undefined;
};

function App() {
  const [error, setError] = useState(undefined);
  const [frontElement, setFrontElement] = useState<ReactElement|null>(null);
  const navigate = useNavigate();
  const functions = { navigate, setFrontElement };
  useEffect(() => document.addEventListener(
    'keydown',
    (event) => handleKeyDown(event, functions),
  ), []);

  return (
    <MyErrorContext.Provider value={setError}>
      <FrontContext.Provider value={setFrontElement}>
        <div className="App">
          <ContentApp />
          {error && <MyError error={error} setError={setError} />}
          {frontElement && <Front setChildren={setFrontElement}>{frontElement}</Front>}
        </div>
      </FrontContext.Provider>
    </MyErrorContext.Provider>

  );
}

export default App;
