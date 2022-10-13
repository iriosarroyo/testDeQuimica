import {
  faAdd, faCheck, faTimes, faTimesCircle,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from 'components/Button';
import GeneralContentLoader from 'components/GeneralContentLoader';
import UserContext from 'contexts/User';
import { useEvent } from 'hooks/general';
import { PATHS_SCKT } from 'info/paths';
import React, { useContext, useEffect, useState } from 'react';
import { listenActiveFrasesCuriosas, listenFrasesCuriosas } from 'services/database';
import { getFromSocketUID, listenEditorFrasesCuriosas } from 'services/socket';
import './FrasesCuriosaEditor.css';

const execDatoCurioso = (action:'edit'|'new'|'delete', ...params:any[]) => getFromSocketUID(`datoCurioso:${action}`, ...params);

function FraseCuriosa({ value, id, editing }:
    {value:string, id:string, editing:{[k:string]:string}}) {
  const [currValue, setCurrValue] = useState(value);
  const { userDDBB } = useContext(UserContext)!;
  const { username } = userDDBB;
  useEffect(() => {
    if (editing[id] !== username) setCurrValue(value);
  }, [value]);
  return (
    <div className="fraseCuriosaEditor">
      <textarea
        value={currValue}
        onChange={(e) => {
          if (editing[id] !== username && editing[id] !== undefined) return;
          const { value: val } = e.target;
          setCurrValue(val);
          execDatoCurioso('edit', id, val, username);
        }}
      />
      {editing[id] !== username && editing[id] !== undefined ? (
        <span>
          {username}
          {' '}
          está editando
        </span>
      ) : null}
      <Button title="Eliminar Dato Curioso" onClick={() => execDatoCurioso('delete', id)}>
        <FontAwesomeIcon icon={faTimesCircle} />
      </Button>
    </div>
  );
}

const setActiveDatos = (val:boolean) => {
  getFromSocketUID(PATHS_SCKT.activeDatosCuriosos, val);
};

export default function FrasesCuriosasEditor() {
  const [frasesCuriosas] = useEvent(listenFrasesCuriosas);
  const [editing] = useEvent(listenEditorFrasesCuriosas);
  const [active] = useEvent(listenActiveFrasesCuriosas);
  if (active === undefined) return <GeneralContentLoader />;
  return (
    <div className="frasesCuriosasEditorContainer">
      <h3>¿Mostrar Datos Curiosos?</h3>
      <Button onClick={() => setActiveDatos(!active)}>
        <FontAwesomeIcon icon={active ? faCheck : faTimes} />
        {' '}
        {active ? 'Sí' : 'No'}
      </Button>

      <h3>Datos Curiosos</h3>
      {frasesCuriosas === undefined ? <GeneralContentLoader />
        : frasesCuriosas.map(([k, v]) => (
          <FraseCuriosa
            value={v}
            key={k}
            id={k}
            editing={editing ?? {}}
          />
        ))}
      <Button title="Añadir Dato Curioso" onClick={() => execDatoCurioso('new')}>
        <FontAwesomeIcon icon={faAdd} />
      </Button>
    </div>
  );
}
