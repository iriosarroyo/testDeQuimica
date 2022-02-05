import Input from 'components/Input';
import MyErrorContext from 'contexts/Error';
import React, {
  ChangeEvent, FormEvent, useContext, useState,
} from 'react';
import { writeUserInfo } from 'services/database';
import checkNewUserForm from 'services/formChecks';
import { NewUserFormError, NewUserFormData } from 'types/interfaces';
import general from 'info/general.json';
import './NewUserForm.css';
import Select from 'components/Select';

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
    if (await anyErrorsInData(formDataTrim, setError, setErrorForm)) return;
    const writeError = await writeUserInfo({ ...formDataTrim, ...defaultData });
    if (writeError) setError(writeError.message);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input
        className={nameError && 'incorrectField'}
        id="name"
        onChange={handleChange}
        value={name}
        required
      />
      <Input
        className={surnameError && 'incorrectField'}
        id="surname"
        onChange={handleChange}
        value={surname}
        required
      />
      <Select
        className={yearError && 'incorrectField'}
        id="year"
        onChange={handleChange}
        options={['', ...general.cursos]}
        value={year}
        required
      />
      <Select
        className={groupError && 'incorrectField'}
        id="group"
        onChange={handleChange}
        options={['', ...general.clases]}
        value={group}
        required
      />
      <Input
        className={mobileError && 'incorrectField'}
        id="mobile"
        max="999999999"
        min="100000000"
        onChange={handleChange}
        type="number"
        value={mobile}
      />
      <Input
        className={usernameError && 'incorrectField'}
        id="username"
        onChange={handleChange}
        value={username}
        required
      />
      <button type="submit">Guardar Datos</button>
    </form>
  );
}
