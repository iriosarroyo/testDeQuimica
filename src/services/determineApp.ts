import { ReactComponent as LogoQuimica } from 'logo_QuimiTest.svg';
import { ReactComponent as LogoFisica } from 'logo_FisiTest.svg';
import { ReactComponent as LogoBiologia } from 'logo_BioTest.svg';

const logos = {
  QuimiTest: LogoQuimica,
  FisiTest: LogoFisica,
  BioTest: LogoBiologia,
};

export const Logo = logos[process.env.REACT_APP_NAME as keyof typeof logos ?? 'QuimiTest'];

export const apps = {
  quimica: 'QuimiTest',
  fisica: 'FisiTest',
  biologia: 'BioTest',
};
const isApp = (app:keyof typeof apps) => apps[app] === process.env.REACT_APP_NAME;
export default isApp;
