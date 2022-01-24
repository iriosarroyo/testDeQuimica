import { FullMetadata } from "firebase/storage";

export interface FolderData{
    name:string,
    url:string
}

export interface FileData extends FullMetadata{
    url:string
}