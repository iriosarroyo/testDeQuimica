import Input from 'components/Input';
import MyErrorContext from 'contexts/Error';
import React, {
  ChangeEvent, FormEvent, useContext, useState,
} from 'react';
import { writeDDBB, writeUserInfo } from 'services/database';
import checkNewUserForm from 'services/formChecks';
import { NewUserFormError, NewUserFormData } from 'types/interfaces';
import general from 'info/general.json';
import './NewUserForm.css';
import Select from 'components/Select';
import { defaultUserTemas } from 'info/defaultData';
import { UserErrorEditing, WriteDDBBError } from 'services/errores';
import { auth } from 'services/firebaseApp';

const defaultFormState:NewUserFormData = {
  group: '',
  mobile: '',
  name: '',
  surname: '',
  username: '',
  year: '',
};

const defaultErrorState:NewUserFormError = {
  groupError: undefined,
  mobileError: undefined,
  nameError: undefined,
  surnameError: undefined,
  usernameError: undefined,
  yearError: undefined,
};

const defaultData = {
  velocidad: 1,
  unaPorUna: true,
  temas: defaultUserTemas,
  logros: { mensajes: { value: 0 } },
  stars: 0,
};

const anyErrorsInData = async (data:NewUserFormData, setError:Function, setErrorForm:Function) => {
  const errors = await checkNewUserForm(data);
  const errorsArray = Object.values(errors);
  if (errorsArray.every((x) => x === undefined)) return false;
  const esteError = errorsArray.find((x) => x !== undefined);
  setErrorForm(errors);
  setError(esteError);
  return true;
};

export default function NewUserForm() {
  const [formData, setFormData] = useState(defaultFormState);
  const [formDataTrim, setFormDataTrim] = useState(defaultFormState);
  const [errorForm, setErrorForm] = useState(defaultErrorState);
  const setError = useContext(MyErrorContext);
  const {
    group,
    mobile,
    name,
    surname,
    username,
    year,
  } = formData;

  const {
    groupError,
    mobileError,
    nameError,
    surnameError,
    usernameError,
    yearError,
  } = errorForm;

  const handleChange = (event:ChangeEvent<any>) => {
    const { value, id } = event.target;
    setFormData({ ...formData, [id]: value });
    setFormDataTrim({ ...formDataTrim, [id]: value.trim() });
  };

  const handleSubmit = async (event:FormEvent) => {
    event.preventDefault();
    if (await anyErrorsInData(formDataTrim, setError, setErrorForm)) return undefined;
    const writeUser = await writeDDBB(`nombresUsuarios/${formDataTrim.username}`, auth.currentUser?.uid);
    if (writeUser) return setError(new WriteDDBBError());
    const writeError = await writeUserInfo({ ...formDataTrim, ...defaultData });
    if (writeError) setError(new UserErrorEditing('los nuevos datos'));
    return undefined;
  };

  return (
    <form onSubmit={handleSubmit} className="newUserForm">
      <div>
        <h2>Nuevo Usuario</h2>
        <div>
          Para poder acceder al contenido de la página es necesario que
          introduzcas tus datos.

        </div>
      </div>
      <div className="newUserInputs">
        <div className="newUserGroup">
          <strong>Nombre</strong>
          <Input
            className={nameError && 'incorrectField'}
            id="name"
            onChange={handleChange}
            value={name}
            required
          />
        </div>
        <div className="newUserGroup">
          <strong>Apellidos</strong>
          <Input
            className={surnameError && 'incorrectField'}
            id="surname"
            onChange={handleChange}
            value={surname}
            required
          />
        </div>
        <div className="newUserGroup">
          <strong>Curso</strong>
          <Select
            className={yearError && 'incorrectField'}
            id="year"
            onChange={handleChange}
            options={['', ...general.cursos]}
            value={year}
            required
          />
        </div>
        <div className="newUserGroup">
          <strong>Clase</strong>
          <Select
            className={groupError && 'incorrectField'}
            id="group"
            onChange={handleChange}
            options={['', ...general.clases]}
            value={group}
            required
          />
        </div>
        <div className="newUserGroup">
          <strong>Móvil (opcional)</strong>
          <Input
            className={mobileError && 'incorrectField'}
            id="mobile"
            max="999999999"
            min="100000000"
            onChange={handleChange}
            type="number"
            value={mobile}
          />
        </div>
        <div className="newUserGroup">
          <strong>Nombre de usuario</strong>
          <Input
            className={usernameError && 'incorrectField'}
            id="username"
            onChange={handleChange}
            value={username}
            required
          />
        </div>
      </div>
      <button type="submit">Guardar Datos</button>
    </form>
  );
}
