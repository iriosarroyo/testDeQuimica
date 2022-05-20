import { FullMetadata } from 'firebase/storage';
import {
  ChangeEventHandler, Dispatch, MouseEventHandler, SetStateAction,
} from 'react';
import maxAndMin from 'info/maxAndMinTabla.json';
import { User } from 'firebase/auth';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import tablaJSON from 'info/tablaPeriodica.json';

export interface FolderData{
    name:string,
    url:string
}

export interface FileData extends FullMetadata{
    url:string
}

/* export interface MyErrorContextType{
    error:string|undefined,
    setError:Dispatch<SetStateAction<undefined>>|void
  } */
export type MyErrorContextType = Dispatch<SetStateAction<undefined>> |
                                 Dispatch<SetStateAction<string>> |
                                 void |
                                 any

interface FormErrorObject{
    message: string,
    code: string,
    name: string
}

export type FormError = undefined | FormErrorObject

export interface NewUserFormData{
    group: string,
    mobile: string,
    name: string,
    surname: string,
    username: string,
    year: string,
  }
export interface NewUserFormError{
    groupError: FormError,
    mobileError: FormError,
    nameError: FormError,
    surnameError: FormError,
    usernameError: FormError,
    yearError: FormError,
  }

export interface FieldProps{
  className?:string | undefined,
  id?:string | undefined,
  onChange:ChangeEventHandler,
  required?:boolean,
  value: string,
}

export interface InputProps extends FieldProps{
  max?:string,
  min?:string,
  type?:string,
}

export interface SelectProps extends FieldProps{
  options:({value:string, text:string}|string)[]
}

type keysOfTabla = keyof typeof tablaJSON;
export type PeriodicElement = typeof tablaJSON[keysOfTabla]
type isObject<T> = T extends {[key:string]:number} ? keyof T : never;
type periodicKeys = keyof PeriodicElement
export type subPeridicTypes = isObject<PeriodicElement[periodicKeys]>
export type radius = PeriodicElement['radius']
/*
export interface PeriodicElement {
  'cpk-hex':string | null
  atomic_mass:number,
  appearance:string,
  category:string,
  boil:number|null,
  density:number|null,
  electron_affinity:number|null,
  electronegativity_pauling:number|null,
  melt:number|null,
  molar_heat:number|null,
  name:string,
  number:number,
  symbol:string,
  xpos:number,
  ypos:number,
}
*/
export type LimitsPerElement = typeof maxAndMin;
type keyMinMax = keyof LimitsPerElement;
type hasChildren<T> = T extends {min:number, max:number} ? never : keyof T
type withChildren = hasChildren<LimitsPerElement[keyMinMax]>

export type GradientColorsTypes = keyof LimitsPerElement & keyof PeriodicElement
export type subColorsType = withChildren & subPeridicTypes
export type ColorMode = 'category' | 'cpk' | 'phases' | GradientColorsTypes;

export interface ElementoPeriodicoProps {
  colorMode:ColorMode,
  subColorMode: subColorsType | undefined,
  colorNumber: number,
  elementData:PeriodicElement,
  h:number,
  handleClick: MouseEventHandler,
  invert:boolean,
  log:boolean
  temp:number,
  w:number,
}

export interface OpcionTest{
  id:string,
  value:string,
}

export interface OpcionGroupTest{
  [id:string]:OpcionTest
}

export interface PreguntaTestDeQuimica{
  done:boolean,
  opciones:OpcionGroupTest,
  id:string,
  pregunta: string,
  tema:string,
  year:string,
  nivelYTema:string,
  /* answer?:string,
  active?:boolean,
  'inView'?:boolean, */

}

export interface userDDBB{
  room: string,
  group:string,
  mobile:string,
  name:string,
  surname:string,
  username:string,
  velocidad:number,
  year:string,
  mode: string,
  unaPorUna: boolean,
  shortcuts:{[key:string]:string}
  notificaciones: boolean
  lastTest: number,
  temas: {[key:string]:{[key:string]:{aciertos:string, fallos:string, enBlanco:string}}}
}

export interface CompleteUser extends User{
  userDDBB:userDDBB,
}

export type MyUser = CompleteUser | undefined

export interface Shortcut{
  id:string,
  shortcut: string,
  description: string,
  default:string,
  shift?:boolean,
  action: 'goTo' | 'showFront',
  url?:string,
  // eslint-disable-next-line no-undef
  element?: () => JSX.Element
}

export interface PaginaObject extends Shortcut{
  url:string,
  text:string,
  icon:IconProp,
}

export type Paginas = PaginaObject[];

export type difficultyLevels = 'Fácil'|'Medio'|'Difícil'|'User'|'Administrador';
export interface RoomData{
  adminStats:{
    temas:userDDBB['temas']
    year:userDDBB['year']
  },
  chat: 'Sí' | 'No',
  corregirOnClick: 'Sí' | 'No',
  difficulty: difficultyLevels,
  endTime: number,
  goBack: 'Sí' | 'No',
  inBlanco: 'Sí' | 'No',
  mode:'Puntos'|'Aciertos'|'Fallos',
  numPregs: number,
  repetidas: 'Sí' | 'No',
  showPunt: 'Sí' | 'No',
  tema: 'Administrador' | 'Personalizado',
  temasPersonalizados:{[key:string]:string},
  timePerQuestion: number,
  timingMode: 'Sin Temporizador' | 'Temporizador Global' | 'Temporizador por Pregunta',
  type:'Público' | 'Privado',
}

export interface RoomMember{
  ready:boolean,
  done:boolean,
  value?:string
}

export interface Answer{
  current: string,
  final?: string
}
