import Button from 'components/Button';
import ShortcutKey from 'components/ShortcutKey';
import FrontContext from 'contexts/Front';
import UserContext from 'contexts/User';
import shortcuts from 'info/shortcuts';
import React, {
  ChangeEvent, KeyboardEvent, useContext, useEffect, useRef, useState,
} from 'react';
import { writeUserInfo } from 'services/database';
import { MyUser, Shortcut } from 'types/interfaces';
import './Ajustes.css';

const saveVelGen = () => {
  let lastTimeout:number;
  return (velocity:number) => {
    if (lastTimeout) clearTimeout(lastTimeout);
    lastTimeout = window.setTimeout(() => writeUserInfo(velocity, 'velocidad'), 500);
  };
};

const saveVel = saveVelGen();

const PERMITTED_KEYS = ['Q', 'W', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ñ',
  'Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '-'];

function ShortCutsPopUp({ shortcut }:{shortcut:Shortcut}) {
  const ref = useRef<HTMLInputElement>(null);
  const handleKeyDown = (e:KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (!PERMITTED_KEYS.includes(e.key.toUpperCase())) return;
    writeUserInfo(`Ctrl+Alt+${e.key.toUpperCase()}`, `shortcuts/${shortcut.id}`);
    localStorage.setItem(`shortcut-${shortcut.id}`, `Ctrl+Alt+${e.key.toUpperCase()}`);
  };
  const handleFocusOut = () => {
    if (ref && ref.current) ref.current.focus();
  };
  useEffect(() => {
    if (ref && ref.current) ref.current.focus();
  }, []);
  return (
    <div>
      <h3>Cambia el atajo de teclado</h3>
      <em>Pulsa una tecla para cambiar el siguiente atajo de teclado</em>
      <div>
        <strong>Descripción: </strong>
        <span dangerouslySetInnerHTML={{ __html: shortcut.description }} />
      </div>
      <div>
        <strong>Atajo por defecto: </strong>
        <span><ShortcutKey shortcut={shortcut.default} /></span>
      </div>
      <div>
        <strong>Atajo por actual: </strong>
        <span><ShortcutKey shortcut={shortcut.shortcut} /></span>
      </div>
      <input type="text" ref={ref} onBlur={handleFocusOut} onKeyDown={handleKeyDown} readOnly className="oculto" />
    </div>
  );
}

export default function Ajustes() {
  const user = useContext<MyUser>(UserContext);
  const setPopUp = useContext(FrontContext);
  const mode = user?.userDDBB?.mode ?? 'null';
  const unaPorUna = user?.userDDBB?.unaPorUna ?? true;
  const [vel, setVel] = useState<number|string>(user?.userDDBB?.velocidad ?? 1);
  const [shortId, setShortId] = useState<string|null>(null);
  const notificaciones = user?.userDDBB?.notificaciones ?? true;

  useEffect(() => {
    setVel(user?.userDDBB?.velocidad ?? 1);
  }, [user?.userDDBB?.velocidad]);

  const handleChange = (e:ChangeEvent<HTMLInputElement>) => {
    const newMode = e.target.value;
    writeUserInfo(newMode, 'mode');
    localStorage.setItem('mode', newMode);
  };

  const handleUnaPorUna = (e:ChangeEvent<HTMLInputElement>) => {
    const newUna = e.target.value === 'true';
    writeUserInfo(newUna, 'unaPorUna');
  };

  const handleVelocidad = (e:ChangeEvent<HTMLInputElement>) => {
    let newVel:number|string = parseFloat(e.target.value);
    if (Number.isNaN(newVel)) newVel = '';
    if (newVel < 0) newVel = 0;
    setVel(newVel);
    saveVel(newVel === '' ? 0 : Number(newVel));
  };

  const handleNotificaciones = (e:ChangeEvent<HTMLInputElement>) => {
    const newNot = e.target.checked;
    writeUserInfo(newNot, 'notificaciones');
  };

  const handleClick = (shortcut:Shortcut) => {
    setShortId(shortcut.id);
  };

  useEffect(() => {
    const short = shortcuts.find((x) => x.id === shortId);
    if (short) setPopUp({ elem: <ShortCutsPopUp shortcut={short} />, cb: () => setShortId(null) });
    else setPopUp({ elem: null, cb: () => {} });
  }, [shortId, user?.userDDBB.shortcuts]);

  return (
    <div className="ajustes">
      <div>
        <h3>Modo</h3>
        <form>
          <label htmlFor="darkMode">
            <input type="radio" id="darkMode" onChange={handleChange} name="mode" value="dark" checked={mode === 'dark'} />
            Modo Oscuro
          </label>
          <label htmlFor="lightMode">
            <input type="radio" id="lightMode" onChange={handleChange} name="mode" value="light" checked={mode === 'light'} />
            Modo Claro
          </label>
          <label htmlFor="defaultMode">
            <input type="radio" id="lightMode" onChange={handleChange} name="mode" value="null" checked={mode === 'null'} />
            Modo por defecto (se usará el del sistema)
          </label>
        </form>
      </div>
      <div>
        <h3>Mostrar preguntas</h3>
        <form>
          <label htmlFor="unaPorUna">
            <input type="radio" id="unaPorUna" onChange={handleUnaPorUna} name="unaPorUna" value="true" checked={unaPorUna} />
            De una en una (solo se mostrará una preguntá a la vez).
          </label>
          <label htmlFor="enBloque">
            <input type="radio" id="enBloque" onChange={handleUnaPorUna} name="unaPorUna" value="false" checked={!unaPorUna} />
            En Bloque (Se mostrarán todas las preguntas a la vez).
          </label>
        </form>
      </div>
      <div>
        <h3>Velocidad de mensajes</h3>
        <div>
          Determina la velocidad de los mensajes de los piés de página.
          (Medido en px avanzados en 10ms)
        </div>
        <input type="number" min="0" step="0.5" value={vel} onChange={handleVelocidad} />
      </div>
      <div>
        <h3>Notificaciones</h3>
        <div>
          Activa las notificaciones (color azul) o desactívalas
        </div>
        <input type="checkbox" checked={notificaciones} onChange={handleNotificaciones} />
      </div>
      <div>
        <h3>Atajos de teclado</h3>
        <ul className="unlisted">
          {shortcuts.map((shortcut) => (
            <li key={shortcut.id}>
              <Button className="shortcutCombination" onClick={() => handleClick(shortcut)}>
                <ShortcutKey shortcut={shortcut.shortcut} />
              </Button>
              <div dangerouslySetInnerHTML={{ __html: shortcut.description }} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
