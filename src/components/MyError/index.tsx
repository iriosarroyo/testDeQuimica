import React from 'react';
import './MyError.css';

export default function Error({ error, setError }:{error:string, setError:Function}) {
  return (
    <article className="errorContainer">
      <div className="errorGroup">
        <div>{error}</div>
        <div>
          <button type="button" onClick={() => setError(undefined)}>Aceptar</button>
        </div>
      </div>
    </article>
  );
}
