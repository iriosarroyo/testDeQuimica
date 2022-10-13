import { useEffect } from 'react';
import {
  CompleteUser, FileData, FolderData, PreguntaTest,
} from 'types/interfaces';
import { getAllDocumentsAndFolders } from './documents';
import { sendLogroUpdate } from './logros';
import { getFromSocketUID } from './socket';
import Toast from './toast';

interface Param{
    name:string,
    type:(string | 'boolean' | 'string' | 'number' | 'undefined' | 'float' | 'int')[],
    optional:boolean,
    desc:string,
    default?:any,
}

export interface Comando{
    name:string,
    params:Param[],
    fn: Function,
    desc: string
}

const DEFAULT_SEARCH_PARAMS = { item: 0, stringPos: -1 };

class Commands {
  commands:Comando[] = [];

  lastSearch:string|undefined = undefined;

  lastIdSearch: string|undefined = undefined;

  searchParams:{item:number, stringPos:number} = DEFAULT_SEARCH_PARAMS;

  searchMemo:{id:string, value:string}[] = [];

  documents:(FileData|FolderData)[] = [];

  keysToSearch:(number|string|symbol)[] = [];

  searchIn:undefined|string;

  customData:{[k:string]: any} = {};

  preguntas: PreguntaTest[] | null = null;

  removeCommand(name:string) {
    this.commands = this.commands.filter((x) => x.name !== name);
  }

  updateFilesInDocs(prevPath:string, newFile:FileData) {
    this.documents = this.documents.map((x) => (('fullPath' in x && x.fullPath === prevPath) ? newFile : x));
    this.documents.sort((a, b) => a.name.localeCompare(b.name));
  }

  removeFileOrFolder(fullPath:string) {
    this.documents = this.documents.filter((x) => (!x.url.endsWith(fullPath)
      && (!('fullPath' in x) || !x.fullPath.startsWith(fullPath))));
  }

  addItemToDocs(item:FileData|FolderData) {
    if (this.documents.length === 0) return;
    this.documents = [...this.documents, item];
    this.documents.sort((a, b) => a.name.localeCompare(b.name));
  }

  updateFolder(prevPath:string, newPath:string, name:string) {
    this.documents = this.documents.map((elem) => {
      if (elem.url.endsWith(prevPath)) return { url: newPath, name };
      if (!('fullPath' in elem)) return elem;
      if (elem.fullPath.startsWith(prevPath)) return { ...elem, fullPath: `${newPath}/${elem.name}` };
      return elem;
    });
    this.documents.sort((a, b) => a.name.localeCompare(b.name));
  }

  setPreguntasTest(pregs:{[key:string]:PreguntaTest}|PreguntaTest[]) {
    const newPregs = Array.isArray(pregs) ? pregs : Object.values(pregs);
    this.preguntas = newPregs;
  }

  addCommand(name:string, desc:string, fn:Function, ...params:Param[]) {
    this.removeCommand(name); // if (this.commands.some((x) => x.name === name))
    this.commands.push({
      name, fn, params, desc,
    });
    return () => this.removeCommand(name);
  }

  addParamsToCommand(cmdName:string, ...params:Param[]) {
    const cmd = this.commands.find((x) => x.name === cmdName);
    if (cmd === undefined) return new Error(`El comando "${cmdName}" no existe`);
    cmd.params = [...cmd.params, ...params];
    return undefined;
  }

  removeTypes(cmdName:string, paramName:string, ...types:string[]) {
    const cmd = this.commands.find((x) => x.name === cmdName);
    if (cmd === undefined) throw new Error(`El comando "${cmdName}" no existe`);
    const param = cmd.params.find((x) => x.name === paramName);
    if (param === undefined) throw new Error('El parametro no existe');
    param.type = param.type.filter((x) => !types.includes(x));
  }

  addTypeToParam(cmdName:string, paramName:string, ...types:string[]) {
    const cmd = this.commands.find((x) => x.name === cmdName);
    if (cmd === undefined) throw new Error(`El comando "${cmdName}" no existe`);
    const param = cmd.params.find((x) => x.name === paramName);
    if (param === undefined) throw new Error('El parametro no existe');
    param.type = [...param.type, ...types];
    return () => { this.removeTypes(cmdName, paramName, ...types); };
  }

  execCommand(name:string, params:string[]) {
    const cmd = this.commands.find((x) => x.name === name);
    if (cmd === undefined) return [undefined, `El comando "${name}" no existe.`];
    const [parameters, error] = Commands.checkParams(cmd, params);
    if (error !== undefined) return [undefined, error];
    return [cmd.fn(...parameters), undefined];
  }

  runCommand(value:string, user:CompleteUser) {
    const [cmd, ...params] = value.split(' ');
    const [, error] = this.execCommand(cmd.replace('/', ''), params);
    if (error !== undefined) Toast.addMsg(error, 5000);
    if (error === undefined) sendLogroUpdate('commandsExecuted', user.userDDBB.logros?.commandsExecuted);
  }

  onCustomSearch<T>(
    data:{[k:string]: T},
    params: string[],
    cb: (x: string[]) => void,
    searchIn?: string,
  ) {
    this.lastIdSearch = 'CustomSearch';
    this.keysToSearch = params;
    this.customData = data;
    this.searchIn = searchIn;
    const callback = (e: Event) => {
      const { detail } = e as CustomEvent<{result:string[]}>;
      const { result } = detail;
      cb(result);
    };
    document.addEventListener('commands:search', callback, false);
    return () => {
      document.removeEventListener('commands:search', callback);
    };
  }

  onSearchPreguntas(cb:Function) {
    this.lastIdSearch = 'EditorPreguntas';
    const callback = (e: Event) => {
      const { detail } = e as CustomEvent<{result:[]}>;
      const { result } = detail;
      cb(result);
    };
    document.addEventListener('commands:search', callback, false);
    return () => {
      document.removeEventListener('commands:search', callback);
    };
  }

  onSearchDocuments(cb:Function) {
    this.lastIdSearch = 'Documents';
    const callback = (e: Event) => {
      const { detail } = e as CustomEvent<{result:[]}>;
      const { result } = detail;
      cb(result);
    };
    document.addEventListener('commands:search', callback, false);
    return () => {
      document.removeEventListener('commands:search', callback);
    };
  }

  // eslint-disable-next-line no-undef
  onSearch(idSearch:string, idValue:string, value:string, cb:Function) {
    if (idSearch === 'Documents') return this.onSearchDocuments(cb);
    if (idSearch === 'EditorPreguntas') return this.onSearchPreguntas(cb);
    if (idSearch !== this.lastIdSearch) {
      this.searchMemo = [];
      this.lastIdSearch = idSearch;
    }
    // this.searchMemo = this.searchMemo.filter((x) => x.id !== idValue);
    this.searchMemo.push({ id: idValue, value });
    this.searchMemo.sort((a, b) => {
      if (a.id.startsWith(b.id)) return 1;
      if (b.id.startsWith(a.id)) return -1;
      return 0;
    });
    const callback = (e: Event) => {
      const { detail } = e as CustomEvent<{html:string, id: string, previousId:string}>;
      const { html, id, previousId } = detail;
      if (id === idValue) cb(html);
      if (previousId !== id && previousId === idValue) cb(value);
    };
    document.addEventListener('commands:search', callback, false);
    return () => {
      if (this.lastIdSearch === idSearch) {
        this.searchMemo = this.searchMemo.filter((x) => x.id !== idValue);
      }
      document.removeEventListener('commands:search', callback);
    };
  }

  searchHook(
    idSearch:string,
    idValue:string,
    value:string,
    cb:Function,
    params1:any[],
    params2:any[],
  ) {
    useEffect(() => this.onSearch(idSearch, idValue, value, cb), params1);
    useEffect(() => document.querySelector('#searchCursor')?.scrollIntoView(), params2);
  }

  static updateHTML(value:string, initialPos:number, length:number) {
    return `${value.slice(0, initialPos)}<span style="background-color:yellow" id="searchCursor">${
      value.slice(initialPos, initialPos + length)}</span>${value.slice(initialPos + length)}`;
  }

  static HtmlEncode(s:string) {
    const el = document.createElement('div');
    el.innerText = s;
    el.textContent = s;
    const val = el.innerHTML;
    return val;
  }

  static createRegExp(value:string) {
    let finalVal = Commands.HtmlEncode(value.replace(/[-[\]{}()*+?.,\\^$|#]/g, '\\$&'));
    finalVal = finalVal.replace(/á|a/gi, '(á|a|&aacute;)').replace(/é|(?<!&.acut)e/gi, '(é|e|&eacute;)').replace(/í|i/gi, '(í|i|&iacute;)')
      .replace(/ó|o/gi, '(ó|o|&oacute;)')
      .replace(/ú|ü|(?<!&.ac)u/gi, '(ú|ü|u|&uacute;|&uuml;)')
      .replace(/n|ñ/gi, '(n|ñ|&ntilde;)')
      .replace(' ', '( |(&nbsp;))');
    return new RegExp(`(${finalVal})(?![^<]*>)`, 'i');
  }

  search(value:string):{html:string, id:string}|undefined {
    if (value === '') return undefined;
    const notSearched = this.searchMemo.slice(this.searchParams.item);
    let searchResult:number|undefined;
    let searchLength:number = 0;
    const elemFound = notSearched.find((elem, i) => {
      const input = i === 0
        ? elem.value.slice(this.searchParams.stringPos + 1) : elem.value;
      const { 0: res, index: searchIdx } = input.match(Commands.createRegExp(value)) ?? { 0: '', index: -1 };
      if (searchIdx === -1) return false;
      searchLength = res.length;
      searchResult = i === 0 ? searchIdx! + this.searchParams.stringPos + 1 : searchIdx!;
      this.searchParams = { stringPos: searchResult, item: i + this.searchParams.item };
      return true;
    });
    if (elemFound !== undefined && searchResult !== undefined) {
      return {
        html: Commands.updateHTML(elemFound.value, searchResult, searchLength),
        id: elemFound.id,
      };
    }
    if (this.searchParams === DEFAULT_SEARCH_PARAMS) return undefined;
    this.searchParams = DEFAULT_SEARCH_PARAMS;
    return this.search(value);
  }

  async runPreguntasSearch(val:string) {
    if (this.preguntas === null) {
      this.preguntas = Object.values((await getFromSocketUID('main:allQuestions'))?.[0] as {[key:string]:PreguntaTest});
    }
    const result = val === '' ? [] : this.preguntas.filter((preg) => {
      const regexp = Commands.createRegExp(val);
      const {
        id, level, tema, pregunta, year, opciones,
      } = preg;
      const searchIn = [
        id,
        level,
        tema,
        pregunta,
        year,
        ...Object.values(opciones).map(({ value }) => value),
      ];
      return searchIn.some((item) => regexp.test(item));
    }).map(({ id }) => id);
    const event = new CustomEvent('commands:search', { detail: { result } });
    document.dispatchEvent(event);
  }

  runCustomSearch(val:string) {
    const keysOfObject = Object.keys(this.customData);
    const regExp = Commands.createRegExp(val);
    const result = val === '' ? keysOfObject : keysOfObject
      .filter((key) => {
        const data = this.searchIn === undefined
          ? this.customData[key] : this.customData[key]?.[this.searchIn];
        return this.keysToSearch
          .some((key2) => regExp.test(data?.[key2]));
      });
    const event = new CustomEvent('commands:search', { detail: { result } });
    document.dispatchEvent(event);
  }

  async runDocumentSearch(value:string) {
    if (this.documents.length === 0) {
      this.documents = await getAllDocumentsAndFolders();
      this.documents.sort((a, b) => a.name.localeCompare(b.name));
    }
    const result = value === '' ? null : this.documents.filter((doc) => Commands.createRegExp(value).test(doc.name));
    const event = new CustomEvent('commands:search', { detail: { result } });
    document.dispatchEvent(event);
  }

  runSearch(value:string) {
    if (this.lastIdSearch === 'Documents') {
      this.runDocumentSearch(value);
      return;
    }
    if (this.lastIdSearch === 'EditorPreguntas') {
      this.runPreguntasSearch(value);
      return;
    }
    if (this.lastIdSearch === 'CustomSearch') {
      this.runCustomSearch(value);
      return;
    }
    const previousId = this.searchMemo[this.searchParams.item]?.id;
    if (value !== this.lastSearch) {
      this.searchParams = DEFAULT_SEARCH_PARAMS;
      this.lastSearch = value;
    }
    const searchResult = this.search(value);
    if (searchResult === undefined && value !== '') Toast.addMsg('No se han encontrado resultados', 3000);
    const { html, id } = searchResult ?? { html: '', id: undefined };
    const event = new CustomEvent('commands:search', { detail: { html, id, previousId } });
    document.dispatchEvent(event);
  }

  runSearchOrCommand(value:string, user:CompleteUser, onlySearch?:boolean) {
    const trimmed = value.replace(/\s+$/, '');
    if (trimmed.startsWith('/') && !onlySearch) return this.runCommand(trimmed, user);
    if (!trimmed.startsWith('/')) return this.runSearch(value);
    return undefined;
  }

  static checkParams(cmd:Comando, params:string[]):[any[], undefined]|[undefined, string] {
    const { params: cmdParams } = cmd;
    if (cmdParams.length < params.length) return [undefined, `Demasiados parámetros, el máximo número es de ${cmdParams.length}.`];
    const compulsoryParams = cmdParams.filter((x) => !x.optional);
    if (compulsoryParams.length > params.length) return [undefined, `Muy pocos parámetros, el mínimo número es de ${compulsoryParams.length}.`];
    const finalParams = params.concat(cmdParams.slice(params.length)
      .filter((x) => x.default !== undefined).map((x) => x.default));
    const usedParams = cmdParams.slice(0, finalParams.length);

    try {
      return [usedParams.map((p, i) => Commands.transformParam(p, finalParams[i])), undefined];
    } catch (e) {
      if (e instanceof Error) return [undefined, e.message];
      return [undefined, 'Ha ocurrido un error inesperado'];
    }
  }

  static transformParam(cmdParam:Param, param:string) {
    const { type, name } = cmdParam;
    if (type.includes('boolean') && ['true', 'false'].includes(param)) return param === 'true';
    if (type.includes('undefined') && param === 'undefined') return undefined;
    const float = parseFloat(param);
    if ((type.includes('number') || type.includes('float')) && !Number.isNaN(float)) return float;
    const int = parseInt(param, 10);
    if ((type.includes('number') || type.includes('int')) && !Number.isNaN(int)) return int;
    if (type.includes('string')) return param.replace(/-/g, ' ');
    if (type.includes(param) && !['boolean', 'number', 'int', 'float'].includes(param)) return param;
    throw new Error(`El tipo del parámetro "${name}" no es correcto, debe ser ${type.join(', ')}.`);
  }

  runAutoComplete(value:string, index:number) {
    const elements = value.replace(/^\s*\//, '').split(' ');
    const [possibleAutocompletes] = this.getAutoComplete(value);
    elements.splice(-1);
    return `/${elements.join(' ')}${elements.length === 0 ? '' : ' '}${possibleAutocompletes[index].text} `;
  }

  getAutoComplete(value:string):[{ text: string, desc: string, cmd?: Comando }[], string] {
    if (!value.startsWith('/')) return [[], ''];
    const [cmd, ...params] = value.replace(/^(\s*\/)/, '').split(' ');
    if (params.length === 0) {
      const result = this.commands.filter((x) => x.name.startsWith(cmd)).map((x) => ({ text: x.name, desc: '', cmd: x }));
      result.sort((a, b) => a.text.localeCompare(b.text));
      return result.length === 1 && result[0].text === cmd ? [[], ''] : [result, 'Elige el comando para ejecutar'];
    }
    const currCmd = this.commands.find((x) => x.name === cmd);
    if (currCmd === undefined) return [[], ''];
    const currParam = currCmd.params[params.length - 1];
    if (currParam === undefined) return [[], ''];
    return [Commands.getPossibilitiesFromType(currParam.type)
      .filter((x) => x.text.startsWith(params[params.length - 1])
      && (x.text !== params[params.length - 1] || x.text === '')), currParam.desc];
  }

  static getPossibilitiesFromType(type:string[]) {
    const posibilities = [];
    if (type.includes('boolean')) posibilities.push({ text: 'true', desc: 'boolean' }, { text: 'false', desc: 'boolean' });
    if (type.includes('undefined')) posibilities.push({ text: 'undefined', desc: 'undefined' });
    if (type.includes('number')) posibilities.push({ text: '', desc: 'number' });
    if (type.includes('int')) posibilities.push({ text: '', desc: 'int' });
    if (type.includes('float')) posibilities.push({ text: '', desc: 'float' });
    if (type.includes('string')) posibilities.push({ text: '', desc: 'string' });
    return posibilities.concat(type.filter((x) => !['boolean', 'undefined', 'number', 'int', 'float', 'string'].includes(x))
      .map((text) => ({ text, desc: '' })));
  }
}

const SearchCmd = new Commands();
export default SearchCmd;
