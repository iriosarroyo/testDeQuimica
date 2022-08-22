import React from 'react';
import { Comando } from 'services/commands';
import './CommandDescription.css';

export default function CommandDescription({ cmd }:{cmd:Comando}) {
  return (
    <div className="cmdDescription">
      <h4>
        {cmd.name}
      </h4>
      <strong>
        Descripción:
      </strong>
      <div>
        {cmd.desc}
      </div>
      { cmd.params.length > 0 && (
      <>
        {' '}
        <strong>
          Parámetros
        </strong>
        <ul>
          {cmd.params.map((param) => (
            <li key={param.name}>
              <span>
                <em>
                  {param.name}
                  :
                  {' '}
                </em>
                {param.desc}
              </span>
              <span>
                <em><strong>Tipo:</strong></em>
                {' '}
                {param.type.join(', ')}
              </span>
              <strong>{param.optional ? 'Opcional' : 'Obligatorio'}</strong>
            </li>
          ))}
        </ul>
      </>
      )}
    </div>
  );
}
