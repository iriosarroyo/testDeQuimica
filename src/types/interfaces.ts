import { FullMetadata } from 'firebase/storage';
import { Dispatch, SetStateAction } from 'react';

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
    msg: string,
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
