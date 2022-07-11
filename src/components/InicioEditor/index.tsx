import { Editor as TinyEditor } from 'tinymce';
import { Editor } from '@tinymce/tinymce-react';
import React, {
  useContext,
  useEffect, useRef, useState,
} from 'react';
import { getInicioWithSetters } from 'services/database';
import { setValueSocket } from 'services/socket';
import UserContext from 'contexts/User';
import './InicioEditor.css';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  faArrowRight, faArrowRightArrowLeft, faFloppyDisk, faSpinner,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const insertArrow = (editor:TinyEditor) => {
  editor.execCommand('InsertHTML', false, '&#8594;');
};

const insertDobleArrow = (editor:TinyEditor) => {
  editor.execCommand('InsertHTML', false, '&rlarr;');
};

const addIcon = (editor:TinyEditor, name:string, iconDef:IconDefinition) => {
  const { icon } = iconDef;
  const [,, ,, path] = icon;
  editor.ui.registry.addIcon(name, `<svg style="font-size:24px" viewBox="0 0 512 512" width="24" height="24">
    <path d="${path}"/>
  </svg>`);
};

export default function InicioEditor() {
  const user = useContext(UserContext)!;
  const [text, setText] = useState({ content: 'Escriba aquí para introducir un nuevo texto de inicio' });
  const editorRef = useRef<Editor>(null);
  const [saved, setSaved] = useState(true);
  useEffect(() => {
    getInicioWithSetters(setText, () => {});
    document.addEventListener('saved:main:inicio:content', () => {
      console.log('saved');
      setSaved(true);
    }, false);
  }, []);
  const manageKeyUp = (_:any, editor:TinyEditor) => {
    if (saved) setSaved(false);
    setValueSocket('main:inicio:content', editor.getContent(), 3000);
  };
  return (
    <div className="inicioEditor">
      <div className="savedIconContainer">
        <FontAwesomeIcon
          className="savedIcon"
          icon={saved ? faFloppyDisk : faSpinner}
          title={saved ? 'Guardado' : 'Guardando'}
        />
      </div>
      <Editor
        apiKey="m6t3xlqm61ck0rs6rwpjljwyy23zyz0neghtxujisl42v67b"
        ref={editorRef}
        initialValue={text.content}
        onEditorChange={manageKeyUp}
        init={{
          height: '100%',
          resize: false,
          menubar: false,
          plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount',
          ],
          toolbar: 'undo redo | superscript subscript | insertArrow insertDoubleArrow |'
            + 'bold italic underline | alignleft aligncenter '
            + 'alignright alignjustify | bullist numlist outdent indent | '
            + 'removeformat | blocks | help',
          content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
          content_langs: [
            { title: 'Spanish', code: 'es' },
          ],
          skin: user.userDDBB.mode === 'dark' ? 'oxide-dark' : 'oxide',
          content_css: user.userDDBB.mode,
          setup: (editor:TinyEditor) => {
            editor.shortcuts.add('meta+l', 'Añadir subíndice', 'subscript');
            editor.shortcuts.add('meta+m', 'Añadir superíndice', 'superscript');
            editor.shortcuts.add('meta+0', 'Añadir flecha', () => insertArrow(editor));
            editor.shortcuts.add('meta+q', 'Añadir doble flecha', () => insertDobleArrow(editor));
            addIcon(editor, 'arrow', faArrowRight);
            addIcon(editor, 'doubleArrow', faArrowRightArrowLeft);
            editor.ui.registry.addButton('insertArrow', {
              icon: 'arrow',
              tooltip: 'Añadir flecha',
              onAction: () => { insertArrow(editor); },
            });
            editor.ui.registry.addButton('insertDoubleArrow', {
              icon: 'doubleArrow',
              tooltip: 'Añadir doble flecha',
              onAction: () => { insertDobleArrow(editor); },
            });
          },
          help_tabs: ['shortcuts',
            'keyboardnav'],
        }}
      />
    </div>
  );
}
