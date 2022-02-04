/* eslint-disable max-len */
import MyErrorContext from 'contexts/Error';
import React, { useContext, useEffect, useState } from 'react';
import { getInicioWithSetters } from 'services/database';
import { List } from 'react-content-loader';

function Inicio() {
  const [text, setText] = useState<any>(undefined);
  const setError = useContext(MyErrorContext);
  useEffect(() => {
    getInicioWithSetters(setText, setError);
  }, []);
  return (
    <div className="inicio mainText">
      {
      text
        ? (
          <>
            <h2>{text.title}</h2>
            <div dangerouslySetInnerHTML={{ __html: text.content }} />
          </>
        )
        : (
          <>
            <List className="listaPlaceHolder" />
            <List className="listaPlaceHolder" />
          </>
        )
    }

    </div>
  );
}
export default Inicio;
