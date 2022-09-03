import { FormError, NewUserFormData } from 'types/interfaces';
import errors from 'info/errors.json';
import general from 'info/general.json';
import { getFromSocketUID } from './socket';

export const checkName = (name:string):FormError => {
  if (name.length < 1 || name.length > 30) return errors.NameLength;
  return undefined;
};

export const checkSurname = (surname:string):FormError => {
  if (surname.length < 1 || surname.length > 100) return errors.SurnameLength;
  if (surname.split(/\s/g).length < 2) return errors.SurnameNumber;
  return undefined;
};

export const checkYear = (year:string):FormError => {
  const permittedYears = general.cursos.map(({ value }) => value);
  if (!permittedYears.includes(year)) return errors.PermittedYear;
  return undefined;
};

export const checkGroup = (group:string):FormError => {
  if (!general.clases.includes(group)) return errors.PermittedGroup;
  return undefined;
};

export const checkMobile = (mobile:string):FormError => {
  if (mobile === '') return undefined;
  const numberMobile = parseInt(mobile, 10);
  if (Number.isNaN(numberMobile)) return errors.MobileNumber;
  if (numberMobile < 100000000 || numberMobile > 999999999) return errors.MobileLength;
  return undefined;
};

export const checkUsername = async (username:string):Promise<FormError> => {
  if (username.length < 1 || username.length > 20) return errors.UsernameLength;
  if (await getFromSocketUID('main:isUsernameInDDBB', username)) return errors.UsernameExists;
  return undefined;
};

const checkNewUserForm = async ({
  name, surname, year, group, username, mobile,
}:NewUserFormData) => {
  const nameError = checkName(name);
  const surnameError = checkSurname(surname);
  const yearError = checkYear(year);
  const groupError = checkGroup(group);
  const usernameError = await checkUsername(username);
  const mobileError = checkMobile(mobile);
  return {
    nameError, surnameError, yearError, groupError, usernameError, mobileError,
  };
};

export default checkNewUserForm;
