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
import { faFloppyDisk, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import editorSetUp from 'services/editorSetUp';

export default function InicioEditor() {
  const user = useContext(UserContext)!;
  const [text, setText] = useState({ content: 'Escriba aquí para introducir un nuevo texto de inicio' });
  const editorRef = useRef<Editor>(null);
  const [saved, setSaved] = useState(true);
  useEffect(() => {
    getInicioWithSetters(setText, () => {});
    document.addEventListener(
      'saved:main:inicio:content',
      () => setSaved(true),
      false,
    );
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
            editorSetUp(editor);
          },
          help_tabs: ['shortcuts',
            'keyboardnav'],
        }}
      />
    </div>
  );
}
