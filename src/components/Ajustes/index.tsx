import UserContext from 'contexts/User';
import shortcuts from 'info/shortcuts';
import React, { ChangeEvent, useContext, useState } from 'react';
import { writeUserInfo } from 'services/database';
import { MyUser } from 'types/interfaces';

const saveVelGen = () => {
  let lastTimeout:number;
  return (velocity:number) => {
    if (lastTimeout) clearTimeout(lastTimeout);
    lastTimeout = window.setTimeout(() => writeUserInfo(velocity, 'velocidad'), 500);
  };
};

const saveVel = saveVelGen();

export default function Ajustes() {
  const user = useContext<MyUser>(UserContext);
  const mode = user?.userDDBB?.mode ?? 'null';
  const unaPorUna = user?.userDDBB?.unaPorUna ?? true;
  const [vel, setVel] = useState<number|string>(user?.userDDBB?.velocidad ?? 1);
  const notificaciones = user?.userDDBB?.notificaciones ?? true;

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
      {shortcuts.map((shortcut) => (
        <li key={shortcut.shortcut}>
          <div className="shortcutCombination">
            {shortcut.shortcut.split('+').map((key, i, shcuts) => (
              <span key={key}>
                <kbd>{key}</kbd>
                {i === shcuts.length - 1 ? '' : '+'}
              </span>
            ))}
          </div>
        </li>
      ))}
    </div>
  );
}
