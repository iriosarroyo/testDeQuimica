import { FullMetadata } from 'firebase/storage';
import {
  ChangeEventHandler, Dispatch, MouseEventHandler, SetStateAction,
} from 'react';
import maxAndMin from 'info/maxAndMinTabla.json';
import { User } from 'firebase/auth';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import tablaJSON from 'info/tablaPeriodica.json';
import logrosJSON from 'info/logros.json';
import { apps } from 'services/determineApp';

export interface FolderData{
    name:string,
    url:string,
    isLink?:boolean
}

export interface LinkDocs extends FolderData{
  logro?:string,
  isLink: boolean
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

export interface PreguntaTest{
  done:boolean,
  opciones:OpcionGroupTest,
  id:string,
  pregunta: string,
  tema:string,
  year:string,
  nivelYTema:string,
  level:'1'|'2'|'3',
  /* answer?:string,
  active?:boolean,
  'inView'?:boolean, */

}

export type LogrosIds = keyof typeof logrosJSON;
export type LogrosKeys = 'numberOf10' | 'testDeHoySeguidos' | 'mensajes' | 'formulario' | 'recursos'
| 'downloadedDocs' | 'testsDone' | 'onlineDone' | 'testDeHoyMaxPunt' | 'preguntasDone'
| 'groupsCreated' | 'groupsJoined' | 'commandsExecuted'
export const logrosTypes = ['General', 'Test De Hoy', 'Documentos', 'Online'] as const;
export type LogrosTypes = typeof logrosTypes[number];
export type Logro = {value:number, data?:any}|undefined
export interface userDDBB{
  admin: boolean|undefined,
  editor?:boolean,
  room: string|undefined,
  group:string,
  mobile:string,
  name:string,
  surname:string,
  username:string,
  velocidad:number,
  year:string,
  mode: string|undefined,
  unaPorUna: boolean,
  shortcuts:{[key:string]:string}|undefined,
  notificaciones: boolean|undefined,
  lastTest: number|undefined,
  stars:number,
  logros:{[key in LogrosKeys]:Logro}|undefined
  temas: {[key:string]:{[key:string]:{aciertos:string, fallos:string, enBlanco:string}}}
}

export interface CompleteUser extends User{
  userDDBB:userDDBB,
}

export interface UserDDBBAdmin extends userDDBB{
  connected:boolean,
  lastConnection: undefined|number
}

export interface UserForAdmin extends User{
  userDDBB:UserDDBBAdmin
}

export type MyUser = CompleteUser | undefined

export interface Logros{
  description:string,
  id:LogrosIds,
  name:string,
  stars:number,
  key:LogrosKeys,
  value:number,
  type: LogrosTypes,
  available?:(keyof typeof apps)[]
}

export interface Shortcut{
  id:string,
  shortcut: string|undefined,
  // eslint-disable-next-line no-undef
  description: JSX.Element,
  default?:string,
  shift?:boolean,
  action: 'goTo' | 'showFront'| ((shift?:boolean) => void),
  url?:string,
  // eslint-disable-next-line no-undef
  element?: () => JSX.Element
}

export interface PaginaObject extends Shortcut{
  url:string,
  text:string,
  icon?:IconProp,
  visible?:boolean|(() => boolean)
  // eslint-disable-next-line no-undef
  component: JSX.Element
  paths:string[]
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

export interface TestStats{
    n_blank: number,
    n_correct: number,
    n_incorrect: number,
    n_incorrect_per_id: {[k:string]: number}
    n_questions: number,
    n_tests: number,
    sum_score: number,
    sum_defScore: number,
    sum_time: number,
    ave_score: number|null,
    ave_defScore: number|null,
    ave_time: number|null,
    ave_defScore_exam: number|null,
    ave_score_exam:number|null,
    most_common_incorrect: {max: number|null, argsmax:string[]},
    uids: Set<string>,
    statsPerUser: {[k:string]:TestStats&{fullName:string,}},
    notDoneTest?:string[]
}

export interface TimeStats {
    sum_timeConnected: number,
    num_connections:number,
    ave_timeConnected:number|null,
    ave_per_user_timeConnected:number|null
    uids:Set<string>
    timesPerUser:{[k:string]:TimeStats&{fullName:string,}}
    timesPerDay:{[k:string]:TimeStats}
    notActive?:string[],
}

export interface Stats{
  statsTestDeHoy:TestStats,
  statsOnline:TestStats,
  statsTime:TimeStats,
  statsTests:TestStats
}
