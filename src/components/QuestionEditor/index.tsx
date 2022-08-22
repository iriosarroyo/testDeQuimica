import React, {
  ChangeEvent, FormEvent, useEffect, useState,
} from 'react';
import editorSetUp from 'services/editorSetUp';
import { Editor } from '@tinymce/tinymce-react';
import GeneralContentLoader from 'components/GeneralContentLoader';
import { OpcionGroupTest, PreguntaTestDeQuimica } from 'types/interfaces';
import Button from 'components/Button';
import { getFromSocket, getFromSocketUID } from 'services/socket';
import { idForOpt } from 'services/uniqueId';
import setFooter from 'hooks/setFooter';
import deepEqual from 'services/deepEqual';
import SearchCmd from 'services/commands';
import Toast from 'services/toast';
import './QuestionEditor.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faAdd, faCheckCircle, faCircleXmark, faFloppyDisk, faSpinner,
} from '@fortawesome/free-solid-svg-icons';
import { faCircle } from '@fortawesome/free-regular-svg-icons';

function InlineEditor({ onChange, initValue }:
  {onChange:(text:string) => void, initValue:string}) {
  const [value, setValue] = useState(initValue);
  useEffect(() => setValue(initValue), [initValue]);
  const handleChange = (text:string) => {
    setValue(text);
    if (value !== text) onChange(text);
  };
  return (
    <Editor
      apiKey="m6t3xlqm61ck0rs6rwpjljwyy23zyz0neghtxujisl42v67b"
      onEditorChange={handleChange}
      value={value}
      inline
      init={{
        setup: editorSetUp,
        resize: false,
        menubar: false,
        forced_root_block: 'div',
        plugins: [
          'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
          'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
          'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount',
        ],
        toolbar: 'undo redo | superscript subscript | insertArrow insertDoubleArrow |'
        + 'bold italic underline | '
        + 'bullist numlist outdent indent | '
        + 'removeformat | blocks | help',
        content_style: '',
        content_langs: [
          { title: 'Spanish', code: 'es' },
        ],
      }}
    />
  );
}

function Categorias({ categorias, onChange }:{categorias:string, onChange:Function}) {
  const [newValue, setNewValue] = useState('');
  const onInputChange = (event:ChangeEvent<HTMLInputElement>) => {
    setNewValue(event.currentTarget.value);
  };

  const onDelete = (idx:number) => {
    const cateArra = categorias.split('; ');
    cateArra.splice(idx, 1);
    onChange(cateArra.join('; '));
  };

  const onSubmit = (e:FormEvent) => {
    e.preventDefault();
    const newCategorias = categorias === '' ? newValue : `${categorias}; ${newValue}`;
    onChange(newCategorias);
    setNewValue('');
  };
  return (
    <div className="editorQuestionGroup">
      <h4 className="inlineTitle">Categorías:</h4>
      {categorias !== '' && categorias.split('; ').map((x, i) => {
        const key = `${x}_${i}`;
        return (
          <span key={key} className="categoryQuestionEditor">
            {x}
            <Button onClick={() => onDelete(i)} className="removeQuestionEditor">
              <FontAwesomeIcon icon={faCircleXmark} />
            </Button>
          </span>
        );
      })}
      <form onSubmit={onSubmit}>
        <input className="inputCategoriasEditor" type="text" id="categoria" value={newValue} onChange={onInputChange} placeholder="Añada una categoría" />
      </form>
    </div>
  );
}

function Options({
  opciones, correcta, onChangeText, onChangeCorrecta,
}:
  {opciones:OpcionGroupTest, correcta:string, onChangeText:Function, onChangeCorrecta:Function}) {
  const opcionesValues = Object.values(opciones);
  const onChangeOpt = (value:string, id:string) => {
    onChangeText({ ...opciones, [id]: { id, value } });
  };

  const removeOpt = (id:string) => {
    onChangeText(Object.fromEntries(Object.entries(opciones).filter(([key]) => key !== id)));
    if (id === correcta) onChangeCorrecta(opcionesValues.find((x) => x.id !== id)?.id ?? null);
  };

  const addOpt = () => {
    const optsIds = opcionesValues.map(({ id }) => id);
    const newId = idForOpt(optsIds);
    if (opcionesValues.length === 0) onChangeCorrecta(newId);
    onChangeText({ ...opciones, [newId]: { id: newId, value: '' } });
  };

  return (
    <div className="editorQuestionGroup">
      {opcionesValues.map((opt) => (
        <div key={opt.id} className="optionQuestionEditor">
          <Button className="optionButtonQuestionEditor" onClick={() => onChangeCorrecta(opt.id)}>
            {correcta === opt.id ? <FontAwesomeIcon icon={faCheckCircle} />
              : <FontAwesomeIcon icon={faCircle} />}
          </Button>
          <InlineEditor
            initValue={opt.value}
            onChange={(text) => onChangeOpt(text, opt.id)}
          />
          <Button className="removeQuestionEditor" onClick={() => removeOpt(opt.id)}>
            <FontAwesomeIcon icon={faCircleXmark} />
          </Button>
        </div>
      ))}
      <Button onClick={addOpt} className="addOptionQuestionEditor">
        <FontAwesomeIcon icon={faAdd} />
        <span>Añadir opción</span>
      </Button>
    </div>
  );
}

const generateNewOpts = () => {
  const ids:string[] = [];
  return Array(4).fill(null).map(() => {
    const newId = idForOpt(ids);
    ids.push(newId);
    return [newId, { value: '', id: newId }];
  });
};

const numToId = (num:number) => {
  if (num < 10) return `id000${num}`;
  if (num < 100) return `id00${num}`;
  if (num < 1000) return `id0${num}`;
  return `id${num}`;
};

const idToNum = (id:string|undefined) => {
  if (id === undefined) return 1;
  return parseInt(id.replace('id', ''), 10);
};

const generateNewQuestion = (id:string) => {
  const opts = generateNewOpts();
  const newPreg:PreguntaTestDeQuimica = {
    done: false,
    id,
    level: '1',
    tema: 'Tema 1',
    nivelYTema: 'tema1_1',
    opciones: Object.fromEntries(opts),
    pregunta: '',
    year: '',
  };
  return { preg: newPreg, optCorr: opts[0][0] as string };
};

function EditPregunta({ preguntaTest, correcta, saveQuestion }:
  {preguntaTest:PreguntaTestDeQuimica, correcta:string, saveQuestion:Function}) {
  const [saved, setSaved] = useState(true);

  useEffect(() => {
    const cb = () => setSaved(true);
    document.addEventListener(`savedQuestion:${preguntaTest.id}`, cb);
    setSaved(true);
    return () => document.removeEventListener(`savedQuestion:${preguntaTest.id}`, cb);
  }, [preguntaTest.id]);

  const {
    pregunta, id: uid, tema, year, level, opciones,
  } = preguntaTest;

  function changePregunta<
  Type extends keyof PreguntaTestDeQuimica>(key:Type, value: PreguntaTestDeQuimica[Type]) {
    const newPreg = { ...preguntaTest, [key]: value };
    newPreg.nivelYTema = `${newPreg.tema.replace('Tema ', 'tema')}_${newPreg.level}`;
    if (deepEqual(newPreg, preguntaTest)) return;
    setSaved(false);
    saveQuestion(newPreg, correcta);
  }

  const changeCorrecta = (text:string) => {
    setSaved(false);
    saveQuestion(preguntaTest, text);
  };

  const changeTitle = (text:string) => { changePregunta('pregunta', text); };

  const changeTema = (event:ChangeEvent<HTMLSelectElement>) => changePregunta('tema', event.currentTarget.value);

  const changeCategorias = (cat:string) => changePregunta('year', cat);
  const changeOpciones = (opts:OpcionGroupTest) => changePregunta('opciones', opts);

  const changeLevel = (event:ChangeEvent<HTMLSelectElement>) => {
    const newLevel = event.currentTarget.value;
    if (newLevel !== '1' && newLevel !== '2' && newLevel !== '3') return;
    changePregunta('level', newLevel);
  };
  return (
    <div className="questionEditorContainer">
      <div className="savedIconQuestionEditor">
        <FontAwesomeIcon
          icon={saved ? faFloppyDisk : faSpinner}
          title={saved ? 'Guardado' : 'Guardando'}
        />
      </div>
      <div className="editorQuestionGroup">
        <h4 className="editorTitle">Pregunta:</h4>
        <InlineEditor initValue={pregunta} onChange={changeTitle} />
      </div>
      <div className="editorQuestionGroup">
        <h4 className="inlineTitle">ID:</h4>
        <span>{uid}</span>
      </div>
      <div className="editorQuestionGroup">
        <h4 className="inlineTitle">Tema:</h4>
        <select className="selectEditorQuestion" value={tema} onChange={changeTema}>
          {Array(9).fill(null).map((_, idx) => {
            const esteTema = idx === 8 ? 'Temas 9 y 10' : `Tema ${idx + 1}`;
            const value = idx === 8 ? 'Tema 9' : esteTema;
            return <option value={value} key={value}>{esteTema}</option>;
          })}
        </select>
      </div>
      <div className="editorQuestionGroup">
        <h4 className="inlineTitle">Nivel:</h4>
        <select className="selectEditorQuestion" value={level} onChange={changeLevel}>
          <option value="1">Nivel 1</option>
          <option value="2">Nivel 2</option>
          <option value="3">Nivel 3</option>
        </select>
      </div>
      <Categorias categorias={year ?? ''} onChange={changeCategorias} />
      <Options
        correcta={correcta ?? ''}
        onChangeCorrecta={changeCorrecta}
        opciones={opciones}
        onChangeText={changeOpciones}
      />
    </div>
  );
}

function FooterEdicion({
  anteriorPregunta, guardarPregunta, nuevaPregunta, siguientePregunta,
}:
  {anteriorPregunta:() => any,
    siguientePregunta:() => any, nuevaPregunta:Function, guardarPregunta:Function}) {
  useEffect(() => {
    const cbKeyLeft = (e:Event) => {
      if (e.target && (e.target as Element).closest('.mce-content-body') !== null) return;
      anteriorPregunta();
    };
    const cbKeyRight = (e:Event) => {
      if (e.target && (e.target as Element).closest('.mce-content-body') !== null) return;
      siguientePregunta();
    };
    document.addEventListener('swiperight', anteriorPregunta);
    document.addEventListener('swipeleft', siguientePregunta);
    document.addEventListener('keydownleft', cbKeyLeft);
    document.addEventListener('keydownright', cbKeyRight);
    return () => {
      document.removeEventListener('swiperight', anteriorPregunta);
      document.removeEventListener('swipeleft', siguientePregunta);
      document.removeEventListener('keydownleft', cbKeyLeft);
      document.removeEventListener('keydownright', cbKeyRight);
    };
  });
  return (
    <div className="footerEditorQuestion">
      <Button onClick={() => anteriorPregunta()}>Anterior</Button>
      <Button onClick={() => siguientePregunta()}>Siguiente</Button>
      <Button onClick={() => nuevaPregunta()}>Nueva</Button>
      <Button onClick={() => guardarPregunta()}>Guardar</Button>
    </div>
  );
}

export default function QuestionEditor() {
  const [activeId, setActiveId] = useState<string|undefined>('id0001');
  const [preguntas, setPreguntas] = useState<{[key:string]:PreguntaTestDeQuimica}|null>(null);
  const [corr, setCorr] = useState<{[key:string]:string}>({});
  const [activeIds, setActiveIds] = useState<string[]|null>(null);
  const [ids, setIds] = useState<string[]>([]);
  const newPregunta = () => {
    if (ids.length === 0) return;
    const newId = numToId(idToNum(ids[ids.length - 1]) + 1);
    setPreguntas((prevPregs) => {
      if (prevPregs === null) return null;
      const { preg, optCorr } = generateNewQuestion(newId);
      const newPregs = { ...prevPregs, [newId]: preg };
      setCorr((prevCor) => ({ ...prevCor, [newId]: optCorr }));
      SearchCmd.setPreguntasTest(newPregs);
      return newPregs;
    });
    setActiveId(newId);
  };

  const nextPregunta = () => {
    if (activeIds === null || activeId === undefined) return undefined;
    const nextIdx = activeIds.indexOf(activeId) + 1;
    if (nextIdx >= activeIds.length) return newPregunta();
    return setActiveId(activeIds[nextIdx]);
  };

  const prevPregunta = () => {
    if (activeIds === null || activeId === undefined) return undefined;
    let nextIdx = activeIds.indexOf(activeId) - 1;
    if (nextIdx === -1) return newPregunta();
    if (nextIdx === -2) nextIdx = activeIds.length - 1;
    return setActiveId(activeIds[nextIdx]);
  };

  const saveLocally = (preg:PreguntaTestDeQuimica, correcta:string) => {
    setPreguntas((prevPregs) => {
      if (prevPregs === null) return null;
      const newPregs = deepEqual(preg, prevPregs[preg.id]) ? prevPregs
        : { ...prevPregs, [preg.id]: preg };
      SearchCmd.setPreguntasTest(newPregs);
      setCorr((prevCor) => (prevCor[preg.id] === correcta ? prevCor
        : { ...prevCor, [preg.id]: correcta }));
      return newPregs;
    });
  };

  const saveQuestion = async () => {
    if (activeId === undefined || !preguntas?.[activeId] || corr[activeId] === undefined) return;
    await getFromSocket('main:pregunta', [activeId, preguntas[activeId]]);
    await getFromSocket('main:respuesta', [activeId, corr[activeId]]);
    setIds((prevIds) => (prevIds.includes(activeId) ? prevIds : [...prevIds, activeId]));
    const ev = new Event(`savedQuestion:${activeId}`);
    document.dispatchEvent(ev);
    Toast.addMsg('Pregunta Guardada', 3000);
  };

  setFooter(<FooterEdicion
    anteriorPregunta={prevPregunta}
    guardarPregunta={saveQuestion}
    nuevaPregunta={newPregunta}
    siguientePregunta={nextPregunta}
  />, [activeId, preguntas, corr, activeIds]);
  useEffect(() => {
    getFromSocketUID('main:allQuestions')
      .then((x:[pregs:{[key:string]:PreguntaTestDeQuimica}, solutions:{[key:string]:string}]) => {
        const [pregs, solutions] = x;
        const pregsArray = Object.values(pregs);
        const idsArray = pregsArray.map(({ id }) => id);
        idsArray.sort();
        SearchCmd.setPreguntasTest(pregsArray);
        SearchCmd.onSearch('EditorPreguntas', 'QuestEditor', '', (pregsSearch:string[]) => {
          setActiveIds(pregsSearch);
          setActiveId((prevAct) => (((prevAct && pregsSearch.includes(prevAct))
          || pregsSearch.length === 0) ? prevAct : pregsSearch[0]));
        });
        setPreguntas(pregs);
        setIds(idsArray);
        setCorr(solutions);
        setActiveIds(idsArray);
        setActiveId(idsArray[0]);
      });
  }, []);
  if (preguntas === null || activeIds === null || ids === null) return <GeneralContentLoader />;
  if (activeIds.length === 0 && ids.length !== 0) {
    Toast.addMsg('No se han encontrado resultados.', 3000);
    setActiveIds(ids);
    setActiveId((id) => id ?? ids[0]);
  }
  if (activeId === undefined) return <GeneralContentLoader />;
  return (
    <div>
      <EditPregunta
        correcta={corr[activeId]}
        preguntaTest={preguntas[activeId]}
        saveQuestion={saveLocally}
      />
    </div>
  );
}
