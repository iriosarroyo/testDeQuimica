import Button from 'components/Button';
import React, {
  FormEvent, MouseEventHandler, useContext, useEffect, useMemo, useRef, useState,
} from 'react';
import { writeUserInfo } from 'services/database';
import {
  checkGroup,
  checkMobile,
  checkName, checkSurname, checkUsername, checkYear,
} from 'services/formChecks';
import { date2String } from 'services/time';
import Toast from 'services/toast';
import { CompleteUser, FormError } from 'types/interfaces';
import general from 'info/general.json';
import './Perfil.css';
import { removeUser } from 'services/user';
import Logros from 'components/Logros';
import FrontContext from 'contexts/Front';
import { getPuntuacionMedia } from 'services/probability';
import Puntuaciones from 'components/Puntuaciones';
import UserContext from 'contexts/User';

function InputPerfil({
  title, initialValue, onChange = () => false, isDisabled, type = 'text', options, onContextMenu, ...extra
}:
  {title:string, initialValue:string, type?:string,
    options?:(({value:string, text:string}|string)[]),
    onChange?:(val:string) => (boolean|Promise<boolean>), isDisabled?:boolean
  , onContextMenu?:MouseEventHandler}) {
  const [inputActive, setInputActive] = useState(false);
  const refInput = useRef<HTMLInputElement>(null);
  const refSelect = useRef<HTMLSelectElement>(null);
  const [value, setValue] = useState(initialValue);
  const text = useMemo(
    () => {
      const result = options?.find((opt) => typeof opt !== 'string' && opt.value === initialValue);
      if (result === undefined || typeof result === 'string') return initialValue;
      return result.text;
    },
    [options, initialValue],
  );
  useEffect(() => {
    const cb = (e:KeyboardEvent) => {
      if (e.code === 'Escape') setInputActive(false);
    };
    document.addEventListener('keydown', cb);
    return () => document.removeEventListener('keydown', cb);
  }, []);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    if (inputActive) {
      refInput.current?.focus();
      refSelect.current?.focus();
    }
  }, [inputActive]);

  const handleClick = () => {
    if (isDisabled) {
      Toast.addMsg('Este campo no se puede editar', 3000);
      return;
    }
    setInputActive(true);
  };
  const handleSubmit = async (e:FormEvent) => {
    e.preventDefault();
    if (await onChange(value)) setInputActive(false);
  };
  return (
    <div className="inputPerfil">
      <h3>{title}</h3>
      <Button
        onClick={handleClick}
        onContextMenu={onContextMenu}
        className={`buttonInputPerfil ${isDisabled ? 'disabledInputPerfil' : ''}`}
      >
        {
          inputActive
            ? (
              <form onSubmit={handleSubmit}>
                {
                  options === undefined
                    ? (
                      <input
                        ref={refInput}
                        type={type}
                        value={value}
                        onBlur={() => setInputActive(false)}
                        onChange={(e) => setValue(e.currentTarget.value)}
              // eslint-disable-next-line react/jsx-props-no-spreading
                        {...extra}
                      />
                    )
                    : (
                      <select
                        ref={refSelect}
                        value={value}
                        onBlur={() => setInputActive(false)}
                        onChange={async (e) => {
                          const newVal = e.currentTarget.value;
                          if (await onChange(newVal)) {
                            setValue(newVal);
                          }
                        }}
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        {...extra}
                      >
                        {
                      options.map((elem) => {
                        const val = typeof elem === 'string' ? elem : elem.value;
                        return (
                          <option key={val} value={val}>
                            {typeof elem === 'string' ? elem : elem.text}
                          </option>
                        );
                      })
                        }
                      </select>
                    )
                }
              </form>
            )
            : <div>{text}</div>
        }
      </Button>
    </div>
  );
}

InputPerfil.defaultProps = {
  isDisabled: false,
  onChange: () => false,
  type: 'text',
  options: undefined,
  onContextMenu: () => {},
};

type CheckFn = (val:string) => (Promise<FormError>|FormError)
function Perfil({ user, setFn = writeUserInfo, isAdmin }:
  {user?:CompleteUser,
    setFn?:(val:any, path:string) => Promise<Error|undefined>,
  isAdmin?:boolean}) {
  const setFront = useContext(FrontContext);
  const userDefault = useContext(UserContext)!;
  const { userDDBB, email } = user ?? userDefault;
  const {
    name, surname, username, mobile, admin, lastTest, stars, group, year, logros, temas, editor,
  } = userDDBB;
  const onChangeGen = (param:string, checkFn: CheckFn) => async (val:string) => {
    const check = await checkFn(val);
    if (check !== undefined) {
      Toast.addMsg(check.message, 3000);
      return false;
    }
    const error = await setFn(val, param);
    if (error !== undefined && error !== null) {
      Toast.addMsg(error.message, 3000);
      return false;
    }
    return true;
  };

  const onChangeStars = async (val:string) => {
    const num = parseInt(val, 10);
    if (Number.isNaN(num) || num < 0) {
      Toast.addMsg('Número de estrellas no válido', 3000);
      return false;
    }
    const error = await setFn(num, 'stars');
    if (error !== undefined && error !== null) {
      Toast.addMsg(error.message, 3000);
      return false;
    }
    return true;
  };
  return (
    <div className="perfilContainerContainer">
      <div className="perfilContainer">
        {isAdmin || <h2>Mi Perfil</h2>}
        <p>Cuando cambies un campo, pulsa Enter para guardar.</p>
        {isAdmin && <p>Puedes hacer click derecho sobre algunos campos.</p>}
        {admin && <InputPerfil title="Administrador" initialValue={`${isAdmin ? 'Es' : 'Eres'} Administrador`} isDisabled />}
        {editor && <InputPerfil title="Editor" initialValue={`${isAdmin ? 'Es' : 'Eres'} Editor`} isDisabled />}
        <InputPerfil title="Nombre" initialValue={name} onChange={onChangeGen('name', checkName)} />
        <InputPerfil title="Apellidos" initialValue={surname} onChange={onChangeGen('surname', checkSurname)} />
        <InputPerfil title="Correo electrónico" initialValue={email ?? ''} isDisabled />
        <InputPerfil title="Nombre de Usuario" initialValue={username} onChange={onChangeGen('username', checkUsername)} />
        <InputPerfil title="Curso" initialValue={year} options={general.cursos} onChange={onChangeGen('year', checkYear)} />
        <InputPerfil title="Clase" initialValue={group} options={general.clases} onChange={onChangeGen('group', checkGroup)} />
        <InputPerfil
          title="Móvil"
          initialValue={mobile}
          type="number"
          onChange={onChangeGen('mobile', checkMobile)}
          {...{ max: '999999999', min: '100000000' }}
        />
        <InputPerfil
          title="Logros conseguidos"
          initialValue={`${stars}`}
          isDisabled={!isAdmin}
          onChange={onChangeStars}
          onContextMenu={(e) => {
            e.preventDefault();
            setFront({
              elem: <Logros
                starsAndLogros={{ logros, stars, username }}
              />,
              cb: () => {},
            });
          }}
          type="number"
          {...{ min: '0' }}
        />
        <InputPerfil title="Último Test de Hoy realizado" initialValue={date2String(lastTest)} isDisabled />
        {
          isAdmin
          && (
          <InputPerfil
            title="Puntuación Media"
            onContextMenu={(e) => {
              e.preventDefault();
              setFront({
                elem: <Puntuaciones user={user ?? userDefault} />,
                cb: () => {},
              });
            }}
            initialValue={`${getPuntuacionMedia(temas)}`}
            isDisabled
          />
          )
        }
      </div>
      <div className="footerPerfil">
        <Button className="buttonPerfil" onClick={() => removeUser()}>Eliminar Cuenta</Button>
        { isAdmin && !admin
          && <Button className="buttonPerfil" onClick={() => setFn(true, 'admin')}>Hacer Administrador</Button>}
        { isAdmin
          && (
          <Button className="buttonPerfil" onClick={() => setFn(!editor, 'editor')}>
            {editor ? 'Revocar' : 'Hacer'}
            {' '}
            Editor
          </Button>
          )}
      </div>
    </div>
  );
}

Perfil.defaultProps = {
  setFn: writeUserInfo,
  isAdmin: false,
  user: undefined,
};
export default Perfil;
