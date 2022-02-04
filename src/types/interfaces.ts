import { FullMetadata } from 'firebase/storage';
import {
  ChangeEventHandler, Dispatch, MouseEventHandler, SetStateAction,
} from 'react';
import maxAndMin from 'info/maxAndMinTabla.json';

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

export interface PeriodicElement {
  'cpk-hex':string | null
  atomic_mass:number,
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

export type LimitsPerElement = typeof maxAndMin
export type GradientColorsTypes = keyof LimitsPerElement & keyof PeriodicElement
export type ColorMode = 'cpk' | 'phases' | GradientColorsTypes;

export interface ElementoPeriodicoProps {
  colorMode:ColorMode,
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
  year:string
}
