import React from 'react';
import './MyError.css';

export default function Error({ error, setError }:{error:Error, setError:Function}) {
  const { message, name, stack = 'No hay más información' } = error;
  return (
    <article className="errorContainer">
      <div className="errorGroup">
        <details>
          <summary>{name}</summary>
          <p>{stack}</p>
        </details>
        <div>{message}</div>
        <div>
          {// eslint-disable-next-line jsx-a11y/no-autofocus
            <button type="button" onClick={() => setError(undefined)} autoFocus>Aceptar</button>
}
        </div>
      </div>
    </article>
  );
}
