import MyErrorContext from 'contexts/Error';
import React, {
  ChangeEvent, FormEvent, useContext, useState,
} from 'react';
import checkNewUserForm from 'services/formChecks';
import { NewUserFormError, NewUserFormData } from 'types/interfaces';
import './NewUserForm.css';

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
    const errors = await checkNewUserForm(formDataTrim);
    const errorsArray = Object.values(errors);
    if (errorsArray.some((x) => x !== undefined)) {
      setErrorForm(errors);
      const msg = errorsArray.find((x) => x !== undefined)?.msg;
      return setError(msg);
    }
    return console.log(formDataTrim);
  };
  return (
    <form onSubmit={handleSubmit}>
      <input type="text" className={nameError && 'incorrectField'} id="name" onChange={handleChange} value={name} required />
      <input type="text" className={surnameError && 'incorrectField'} id="surname" onChange={handleChange} value={surname} required />
      <select id="year" className={yearError && 'incorrectField'} onChange={handleChange} value={year} required>
        <option value=""> </option>
        <option value="eso3">3º ESO</option>
        <option value="eso4">4º ESO</option>
        <option value="bach1">1º bachillerato</option>
        <option value="bach2">2º bachillerato</option>
      </select>
      <select id="group" className={groupError && 'incorrectField'} onChange={handleChange} value={group} required>
        <option value=""> </option>
        <option value="A">A</option>
        <option value="B">B</option>
        <option value="C">C</option>
        <option value="D">D</option>
        <option value="E">E</option>
        <option value="F">F</option>
        <option value="G">G</option>
      </select>
      <input
        className={mobileError && 'incorrectField'}
        type="number"
        min="100000000"
        max="999999999"
        id="mobile"
        onChange={handleChange}
        value={mobile}
      />
      <input type="text" className={usernameError && 'incorrectField'} id="username" onChange={handleChange} value={username} required />
      <button type="submit">Guardar Datos</button>
    </form>
  );
}
