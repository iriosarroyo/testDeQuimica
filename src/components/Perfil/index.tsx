import Button from 'components/Button';
import React, {
  FormEvent, useEffect, useMemo, useRef, useState,
} from 'react';
import { writeUserInfo } from 'services/database';
import {
  checkGroup,
  checkName, checkSurname, checkUsername, checkYear,
} from 'services/formChecks';
import { date2String } from 'services/time';
import Toast from 'services/toast';
import { CompleteUser, FormError } from 'types/interfaces';
import general from 'info/general.json';

function InputPerfil({
  title, initialValue, onChange = () => false, isDisabled, type = 'text', options, ...extra
}:
  {title:string, initialValue:string, type?:string,
    options?:(({value:string, text:string}|string)[]),
    onChange?:(val:string) => (boolean|Promise<boolean>), isDisabled?:boolean}) {
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
    [options, value],
  );
  useEffect(() => {
    const cb = (e:KeyboardEvent) => {
      if (e.code === 'Escape') setInputActive(false);
    };
    document.addEventListener('keydown', cb);
    return () => document.removeEventListener('keydown', cb);
  }, []);

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
      <Button onClick={handleClick} className="buttonInputPerfil">
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
};

type CheckFn = (val:string) => (Promise<FormError>|FormError)
function Perfil({ user, setFn = writeUserInfo }:
  {user:CompleteUser, setFn?:(val:string, path:string) => Promise<Error|undefined>}) {
  const { userDDBB, email } = user;
  const {
    name, surname, username, mobile, admin, lastTest, stars, group, year,
  } = userDDBB;
  const onChangeGen = (param:string, checkFn: CheckFn) => async (val:string) => {
    const check = await checkFn(val);
    if (check !== undefined) {
      Toast.addMsg(check.message, 3000);
      return false;
    }
    const error = await setFn(val, param);
    if (error !== undefined) {
      Toast.addMsg(error.message, 3000);
      return false;
    }
    return true;
  };
  return (
    <div>
      <h2>Mi Perfil</h2>
      {admin && <InputPerfil title="Administrador" initialValue="Eres Administrador" isDisabled />}
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
        onChange={onChangeGen('username', checkUsername)}
        {...{ max: '999999999', min: '100000000' }}
      />
      <InputPerfil title="Logros conseguidos" initialValue={`${stars}`} isDisabled />
      <InputPerfil title="Último Test de Hoy realizado" initialValue={date2String(lastTest)} isDisabled />
    </div>
  );
}

Perfil.defaultProps = {
  setFn: writeUserInfo,
};
export default Perfil;
