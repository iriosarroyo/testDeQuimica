import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faArrowRight, faArrowRightArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { Editor as TinyEditor } from 'tinymce';

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
const editorSetUp = (editor:TinyEditor) => {
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
};
export default editorSetUp;
