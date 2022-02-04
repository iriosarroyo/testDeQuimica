import Pregunta from 'components/Pregunta';
import React, { useEffect, useState } from 'react';
import { setPreguntaById } from 'services/database';
import './Test.css';

export default function Test() {
  const [pregunta, setPregunta] = useState(null);
  const [pregunta2, setPregunta2] = useState(null);
  const [pregunta3, setPregunta3] = useState(null);
  const [pregunta4, setPregunta4] = useState(null);
  const [pregunta5, setPregunta5] = useState(null);
  useEffect(() => {
    setPreguntaById(setPregunta, 'id0001');
    setPreguntaById(setPregunta2, 'id0111');
    setPreguntaById(setPregunta3, 'id0222');
    setPreguntaById(setPregunta4, 'id0333');
    setPreguntaById(setPregunta5, 'id0444');
  }, []);

  return (
    <div className="test mainText">
      {pregunta && <Pregunta objPreg={pregunta} />}
      {pregunta2 && <Pregunta objPreg={pregunta2} />}
      {pregunta3 && <Pregunta objPreg={pregunta3} />}
      {pregunta4 && <Pregunta objPreg={pregunta4} />}
      {pregunta5 && <Pregunta objPreg={pregunta5} />}
    </div>
  );
}
