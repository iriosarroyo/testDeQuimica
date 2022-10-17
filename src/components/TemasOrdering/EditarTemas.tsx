import Button from 'components/Button';
import { PATHS_DDBB } from 'info/paths';
import { getTemas, updateTemas } from 'info/temas';
import React, { useState, FormEvent } from 'react';
import { updateDDBB, writeDDBB } from 'services/database';

const sendTema = async (
  val:string,
  tema:string,
  sendUpdate:React.Dispatch<React.SetStateAction<boolean>>,
  newTema?:boolean,
) => {
  const done = await writeDDBB(`${PATHS_DDBB.temas}/${tema}`, val.trim());
  const orden = parseInt(tema.replace('tema', ''), 10) - 1;
  if (newTema) {
    await updateDDBB(PATHS_DDBB.temasOrden, {
      [`bach2/${tema}`]: orden,
      [`bach1/${tema}`]: orden,
      [`eso4/${tema}`]: orden,
      [`eso3/${tema}`]: orden,
    });
  }
  if (!done) {
    await updateTemas();
    sendUpdate((up) => !up);
  }
};
function InputTemas({ value, tema, sendUpdate }:{value:string, tema:string,
    sendUpdate:React.Dispatch<React.SetStateAction<boolean>>}) {
  const [val, setVal] = useState(value);
  const onSend = (e:FormEvent) => {
    e.preventDefault();
    sendTema(val, tema, sendUpdate);
  };
  return (
    <form onSubmit={onSend}>
      <strong>{tema}</strong>
      <input type="text" value={val} onChange={(e) => setVal(e.target.value)} />
    </form>
  );
}
export default function EditarTemas({ sendUpdate }:
     {sendUpdate:React.Dispatch<React.SetStateAction<boolean>>}) {
  const temasEntries = Object.entries(getTemas());
  temasEntries.sort((a, b) => parseInt(a[0].replace('tema', ''), 10) - parseInt(b[0].replace('tema', ''), 10));
  return (
    <div className="editarTemasNames">
      <h3>Nombre de los Temas</h3>
      <p>
        Pulsa enter para guardar. Puedes comprobar que
        se han guardado si se cambian los nombres de
        {' '}
        <em>Ordenar temas</em>

      </p>
      {temasEntries.map(([k, v]) => (
        <InputTemas sendUpdate={sendUpdate} tema={k} key={k} value={v} />
      ))}
      <Button onClick={() => {
        const maxTema = Math.max(...Object.keys(getTemas()).map((x) => parseInt(x.replace('tema', ''), 10)));
        const nextTema = `tema${maxTema + 1}`;
        sendTema('', nextTema, sendUpdate, true);
      }}
      >
        Añadir Tema

      </Button>
    </div>
  );
}
