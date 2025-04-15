import { faFolderPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from 'components/Button';
import ContextMenu from 'components/ContextMenu';
import Folder from 'components/Folder';
import FrontContext from 'contexts/Front';
import { useEvent } from 'hooks/general';
import React, {
  MouseEvent,
  useContext, useEffect, useRef, useState,
} from 'react';
import {
  deleteDocumentLinks, onValueDocumentsLink, saveDocumentLinks, updateDocumentLinks,
} from 'services/documents';
import { isLogrosKeys, logros } from 'services/logros';
import { LogrosKeys } from 'types/interfaces';

function LinkForm({ name, url, logro }:{name?:string, url?:string, logro?:LogrosKeys}) {
  const [nameState, setName] = useState(name ?? '');
  const [urlState, setUrl] = useState(url ?? '');
  const [logroState, setLogro] = useState(logro);
  const setFront = useContext(FrontContext);
  const ref = useRef<HTMLInputElement>(null);
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = name === undefined ? await saveDocumentLinks(nameState, urlState, logroState)
      : await updateDocumentLinks(name, nameState, urlState);
    if (result) setFront({ elem: null, cb: () => {} });
  };
  useEffect(() => {
    window.setTimeout(() => ref.current?.focus(), 100);
  }, [ref.current]);
  return (
    <div className="editFormDocs">
      <h4>
        {name === undefined ? 'Añadir' : 'Actualizar'}
        {' '}
        link
      </h4>
      <form onSubmit={(e) => onSubmit(e)}>
        <label htmlFor="name">
          Nombre
          <input ref={ref} type="text" id="name" value={nameState} onChange={(e) => setName(e.currentTarget.value)} placeholder="Nombre" />
        </label>
        <label htmlFor="url">
          Url
          <input type="url" id="url" value={urlState} onChange={(e) => setUrl(e.currentTarget.value)} placeholder="https://example.com" />
        </label>
        <label htmlFor="logro">
          Logro
          <select
            id="logro"
            value={logro}
            onChange={(e) => {
              const { value } = e.currentTarget;
              if (value === '') setLogro(undefined);
              else if (isLogrosKeys(value)) setLogro(value);
            }}
          >
            <option value="">Ninguno</option>
            {logros.map((x) => (
              <option key={x.id} value={x.key}>
                {x.name}
                {' '}
                (
                {x.key}
                )
              </option>
            ))}
          </select>
        </label>
        <Button type="submit">Crear</Button>
      </form>
    </div>
  );
}

LinkForm.defaultProps = {
  name: undefined,
  url: undefined,
  logro: undefined,
};

interface DocsFrontContextMenu extends React.CSSProperties{
    name:string,
    url:string,
    logro?:LogrosKeys,
}
export default function DocsFront({ isAdmin }:{isAdmin:boolean}) {
  const setFront = useContext(FrontContext);
  const [links] = useEvent(onValueDocumentsLink);
  const [constextMenu, setContextMenu] = useState<DocsFrontContextMenu|null>(null);
  const handleContextMenu = (
    e:MouseEvent<HTMLElement>,
    name:string,
    url:string,
    logro?:LogrosKeys,
  ) => {
    if (!isAdmin) return;
    e.preventDefault();
    setContextMenu({
      top: `${e.clientY}px`,
      left: `${e.clientX}px`,
      name,
      url,
      logro,
    });
  };
  return (
    <>
      {isAdmin && (
      <div className="documentsEdition">
        <Button
          className="createFolderButton"
          onClick={() => setFront({
            elem: <LinkForm />,
            cb: () => {},
            unableFocus: true,
          })}
        >
          <FontAwesomeIcon icon={faFolderPlus} />
          <span>Añadir link</span>
        </Button>
      </div>
      ) }
      <ul className="unlisted folderGroup">
        <Folder
          onContextMenu={() => {}}
          folder={{ name: 'Documentos', url: isAdmin ? '/admin/documentos/Documentos' : '/documentos/Documentos' }}
        />
        {
            links?.map((x) => <Folder key={x.name} onContextMenu={handleContextMenu} folder={x} />)
        }
      </ul>
      {constextMenu && (
      <ContextMenu
        classOfElem=".folder"
        items={[{
          text: `Actualizar ${constextMenu.name}`,
          action: () => setFront({
            elem: <LinkForm
              name={constextMenu.name}
              url={constextMenu.url}
              logro={constextMenu.logro}
            />,
            cb: () => {},
            unableFocus: true,
          }),
        },
        { text: `Eliminar ${constextMenu.name}`, action: () => deleteDocumentLinks(constextMenu.name) }]}
        setContextMenu={setContextMenu}
        style={constextMenu}
      />
      )}
    </>
  );
}
