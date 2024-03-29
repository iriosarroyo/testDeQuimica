import { faCircle, faSquare } from '@fortawesome/free-regular-svg-icons';
import { faCircleDot, faSquareCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from 'components/Button';
import ShortcutKey from 'components/ShortcutKey';
import FrontContext from 'contexts/Front';
import UserContext from 'contexts/User';
import shortcuts from 'info/shortcuts';
import React, {
  ChangeEvent, KeyboardEvent, useContext, useEffect, useRef, useState,
} from 'react';
import { writeUserInfo } from 'services/database';
import Toast from 'services/toast';
import { MyUser, Shortcut } from 'types/interfaces';
import './Ajustes.css';
import CustomColors from './CustomColors';

const saveParamGen = (param:string) => {
  let lastTimeout:number;
  return (velocity:number) => {
    if (lastTimeout) clearTimeout(lastTimeout);
    lastTimeout = window.setTimeout(() => writeUserInfo(velocity, param), 500);
  };
};

const saveVel = saveParamGen('velocidad');
const saveNum = saveParamGen('numOfSquares');

const FUN_KEYS = ['F2', 'F4', 'F8', 'F9'];
const PERMITTED_KEYS = ['Q', 'W', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ñ',
  'Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '-', ...FUN_KEYS];
const COMB_KEYS = ['Control', 'Shift', 'Alt', 'Meta', 'Escape'];

function ShortCutsPopUp({ shortcut }:{shortcut:Shortcut}) {
  const ref = useRef<HTMLInputElement>(null);
  const handleKeyDown = (e:KeyboardEvent<HTMLInputElement>) => {
    if (COMB_KEYS.includes(e.key)) return undefined;
    e.stopPropagation();
    if (!PERMITTED_KEYS.includes(e.key.toUpperCase())) return Toast.addMsg('Combinación no permitida.', 5000);
    const sc = FUN_KEYS.includes(e.key) ? e.key : `Ctrl+Alt+${e.key.toUpperCase()}`;
    writeUserInfo(sc, `shortcuts/${shortcut.id}`);
    return localStorage.setItem(`shortcut-${shortcut.id}`, sc);
  };
  const handleFocusOut = () => {
    if (ref && ref.current) ref.current.focus();
  };
  useEffect(() => {
    if (ref && ref.current) ref.current.focus();
  }, []);
  if (shortcut.default === undefined || shortcut.shortcut === undefined) return null;
  return (
    <div>
      <h3>Cambia el atajo de teclado</h3>
      <em>Pulsa una tecla para cambiar el siguiente atajo de teclado</em>
      <div>
        <strong>Descripción: </strong>
        <span>{shortcut.description}</span>
      </div>
      <div>
        <strong>Atajo por defecto: </strong>
        <span><ShortcutKey shortcut={shortcut.default} /></span>
      </div>
      <div>
        <strong>Atajo actual: </strong>
        <span><ShortcutKey shortcut={shortcut.shortcut} /></span>
      </div>
      <input type="text" ref={ref} onBlur={handleFocusOut} onKeyDown={handleKeyDown} readOnly className="oculto" />
    </div>
  );
}

const CHECKED_ICON = faCircleDot;
const UNCHECKED_ICON = faCircle;
const LIMIT = 9;

export default function Ajustes() {
  const user = useContext<MyUser>(UserContext);
  const setPopUp = useContext(FrontContext);
  const mode = user?.userDDBB?.mode ?? 'null';
  const unaPorUna = user?.userDDBB?.unaPorUna ?? true;
  const [vel, setVel] = useState<number|string>(user?.userDDBB?.velocidad ?? 1);
  const [num, setNum] = useState<number|string>((user?.userDDBB?.numOfSquares ?? LIMIT) + 1);
  const [overwrite, setOverwrite] = useState<boolean>(false);
  const [numLocal, setNumLocal] = useState<number|string>(() => {
    const local = localStorage.getItem('testDeQuimica:maxNumOfSquares');
    if (local === null) return num;
    return Number(local) + 1;
  });
  const [shortId, setShortId] = useState<string|null>(null);
  const notificaciones = user?.userDDBB?.notificaciones ?? true;

  useEffect(() => {
    setVel(user?.userDDBB?.velocidad ?? 1);
  }, [user?.userDDBB?.velocidad]);

  useEffect(() => {
    setNum((user?.userDDBB?.numOfSquares ?? LIMIT) + 1);
  }, [user?.userDDBB?.numOfSquares]);

  const localMaxNum = localStorage.getItem('testDeQuimica:maxNumOfSquares');
  useEffect(() => {
    if (localMaxNum === null) {
      setNumLocal(num);
    } else {
      setNumLocal(Number(localMaxNum) + 1);
    }
  }, [num, localMaxNum]);

  useEffect(() => {
    setOverwrite(localMaxNum !== null);
  }, [localMaxNum]);
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

  const handleNumCuadrados = (e:ChangeEvent<HTMLInputElement>) => {
    let newNum:number|'' = parseInt(e.target.value, 10);
    if (Number.isNaN(newNum)) newNum = '';
    if (newNum < 1) newNum = 1;
    setNum(newNum);
    saveNum(newNum === '' ? 0 : newNum - 1);
  };

  const handleNumCuadradosLocal = (e:ChangeEvent<HTMLInputElement>) => {
    if (localStorage.getItem('testDeQuimica:maxNumOfSquares') === null) return;
    let newNum:number|'' = parseInt(e.target.value, 10);
    if (Number.isNaN(newNum)) newNum = '';
    if (newNum < 1) newNum = 1;
    setNumLocal(newNum);
    localStorage.setItem('testDeQuimica:maxNumOfSquares', `${newNum === '' ? 0 : newNum - 1}`);
    writeUserInfo(newNum, 'localNumOfSquares');
  };

  const handleNotificaciones = (e:ChangeEvent<HTMLInputElement>) => {
    const newNot = e.target.checked;
    writeUserInfo(newNot, 'notificaciones');
  };

  const handleClick = (shortcut:Shortcut) => {
    setShortId(shortcut.id);
  };

  const handleOverwrite = () => {
    setOverwrite((currOver) => {
      if (!currOver) localStorage.setItem('testDeQuimica:maxNumOfSquares', `${user?.userDDBB?.numOfSquares ?? LIMIT}`);
      else localStorage.removeItem('testDeQuimica:maxNumOfSquares');
      writeUserInfo(LIMIT, 'localNumOfSquares');
      return !currOver;
    });
  };

  useEffect(() => {
    const short = shortcuts.find((x) => x.id === shortId);
    if (short) setPopUp({ elem: <ShortCutsPopUp shortcut={short} />, cb: () => setShortId(null) });
    else setPopUp({ elem: null, cb: () => {} });
  }, [shortId, user?.userDDBB.shortcuts]);
  return (
    <div className="ajustes">
      <div>
        <h3 className="titleAjustes">Modo</h3>
        <form className="formAjuste">
          <label htmlFor="darkMode">
            <input type="radio" id="darkMode" onChange={handleChange} name="mode" value="dark" checked={mode === 'dark'} />
            <FontAwesomeIcon icon={
              mode === 'dark' ? CHECKED_ICON : UNCHECKED_ICON
            }
            />
            <span>Modo Oscuro</span>
          </label>
          <label htmlFor="lightMode">
            <input type="radio" id="lightMode" onChange={handleChange} name="mode" value="light" checked={mode === 'light'} />
            <FontAwesomeIcon icon={
              mode === 'light' ? CHECKED_ICON : UNCHECKED_ICON
            }
            />
            <span>Modo Claro</span>
          </label>
          <label htmlFor="customMode">
            <input type="radio" id="customMode" onChange={handleChange} name="mode" value="custom" checked={mode === 'custom'} />
            <FontAwesomeIcon icon={
              mode === 'custom' ? CHECKED_ICON : UNCHECKED_ICON
            }
            />
            <span>Modo Personalizado</span>
          </label>
          <label htmlFor="defaultMode">
            <input type="radio" id="defaultMode" onChange={handleChange} name="mode" value="null" checked={mode === 'null'} />
            <FontAwesomeIcon icon={
              mode === 'null' ? CHECKED_ICON : UNCHECKED_ICON
            }
            />
            <span>Modo por defecto (se usará el del sistema)</span>
          </label>
          {mode === 'custom' && <CustomColors />}
        </form>
      </div>
      <div>
        <h3 className="titleAjustes">Mostrar preguntas</h3>
        <form className="formAjuste">
          <label htmlFor="unaPorUna">
            <input type="radio" id="unaPorUna" onChange={handleUnaPorUna} name="unaPorUna" value="true" checked={unaPorUna} />
            <FontAwesomeIcon icon={
              unaPorUna ? CHECKED_ICON : UNCHECKED_ICON
            }
            />
            <span>De una en una (solo se mostrará una preguntá a la vez).</span>
          </label>
          <label htmlFor="enBloque">
            <input type="radio" id="enBloque" onChange={handleUnaPorUna} name="unaPorUna" value="false" checked={!unaPorUna} />
            <FontAwesomeIcon icon={
              !unaPorUna ? CHECKED_ICON : UNCHECKED_ICON
            }
            />
            <span>En Bloque (Se mostrarán todas las preguntas a la vez).</span>
          </label>
        </form>
      </div>
      <div>
        <h3 className="titleAjustes">Velocidad de mensajes</h3>
        <div>
          Determina la velocidad de los mensajes de los piés de página.
          (Medido en px avanzados en 10ms)
        </div>
        <input className="styledInputAjustes" type="number" min="0" step="0.5" value={vel} onChange={handleVelocidad} />
      </div>
      <div>
        <h3 className="titleAjustes">Número de cuadrados</h3>
        <div>
          Determina el número de cuadrados que aparecen en el pie de página de los tests.
        </div>
        <form className="formAjuste">
          <label htmlFor="globalNum">
            <strong>Global</strong>
            <input className="styledInputAjustes" id="globalNum" type="number" min="1" step="1" value={num} onChange={handleNumCuadrados} />
          </label>
          <label htmlFor="localOverwrite">
            <input className="styledInputAjustes" id="localOverwrite" type="checkbox" onChange={handleOverwrite} checked={overwrite} hidden />
            <FontAwesomeIcon
              icon={overwrite ? faSquareCheck : faSquare}
            />
            <span>
              Sobreescribir global
              {' '}
              (si está marcado en este navegador se usará la configuración local)
            </span>
          </label>
          <label htmlFor="localNum" className={!overwrite ? 'disabledAjustes' : ''}>
            <strong>Local</strong>
            <input className="styledInputAjustes" id="localNum" type="number" min="1" step="1" value={numLocal} onChange={handleNumCuadradosLocal} disabled={!overwrite} />
          </label>
        </form>
      </div>
      <div hidden>
        <h3 className="titleAjustes">Notificaciones</h3>
        <div>
          Activa las notificaciones (color azul) o desactívalas
        </div>
        <input type="checkbox" checked={notificaciones} onChange={handleNotificaciones} />
      </div>
      <div>
        <h3 className="titleAjustes">Atajos de teclado</h3>
        <ul className="unlisted">
          <li className="shortcutAjusteElement">
            <strong>Descripción</strong>
            <strong>Atajo de teclado</strong>
          </li>
          {shortcuts.map((shortcut) => (
            shortcut.shortcut ? (
              <li key={shortcut.id}>
                <Button className="shortcutAjusteElement shortcutCombination" onClick={() => handleClick(shortcut)}>
                  <div>{shortcut.description}</div>
                  <div>
                    <ShortcutKey shortcut={shortcut.shortcut} />
                  </div>
                </Button>
              </li>
            ) : null
          ))}
        </ul>
      </div>
    </div>
  );
}
