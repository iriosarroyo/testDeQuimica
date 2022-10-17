import { DEFAULT_LEVELS } from 'info/temas';
import React, { useEffect, useState } from 'react';
import {
  count,
  EXTRA_PER_10,
  EXTRA_PER_100,
  getProbLevel1,
  getProbLevel2,
  getProbLevel3,
  getProbTemaWithoutTemasInOrder, getPuntuacionDelTema,
  getPuntuacionLevel1, getPuntuacionLevel2, getPuntuacionLevel3,
  MAX_PUNT_NIV_1, MAX_PUNT_NIV_2, MAX_PUNT_NIV_3, VAL_PUNT_ACIERTO, VAL_PUNT_FALLO,
} from 'services/probability';
import { userDDBB } from 'types/interfaces';

const getTextNivel = (punt = MAX_PUNT_NIV_1) => `Máxima puntuación: ${punt}. 
    Es el número de aciertos por ${VAL_PUNT_ACIERTO} menos el número de fallos por
    ${VAL_PUNT_FALLO}. A este valor se le suma un extra de ${EXTRA_PER_10}
    por cada 10 preguntas acertadas y ${EXTRA_PER_100} por cada 100 preguntas acertadas.
    La probabilidad del nivel depende de la puntuación del tema.`;

export default function PuntPerTemaStats({ temas, tema, curso }: {tema:string, temas:userDDBB['temas'], curso:string}) {
  const thisTema = temas?.[tema] ?? DEFAULT_LEVELS;
  const puntuacion = getPuntuacionDelTema(thisTema);
  const [probTema, setProbTema] = useState<null|number>(null);
  useEffect(() => {
    getProbTemaWithoutTemasInOrder(tema, temas, curso).then(setProbTema);
  }, [tema, temas]);
  return (
    <div style={{ textAlign: 'justify' }}>
      <div>
        <h3>Puntuación del tema</h3>
        <em>
          Puntuación sobre 10. Es la suma de la puntuación del nivel 1,
          más la del nivel 2, más la del nivel 3. Como máximo se puede
          sacar un 10.
        </em>
        <div>
          <strong>Punt.:</strong>
          {' '}
          <span>{puntuacion}</span>
        </div>
      </div>
      <div>
        <h3>Probabilidad del tema</h3>
        <em>
          Es la probabilidad de que aparezca una pregunta de este tema.
          Recuerda que para desbloquear el tema (probabilidad
          {' '}
          {'>'}
          {' '}
          0)
          necesitas tener un 4 o más en los anteriores temas.
        </em>
        <div>
          <strong>Prob.:</strong>
          {' '}
          <span>{probTema}</span>
        </div>
      </div>
      <div>
        <h3>Nivel 1</h3>
        <em>{getTextNivel()}</em>
        <div>
          <strong>Puntuación:</strong>
          {' '}
          <span>{getPuntuacionLevel1(thisTema.level1)}</span>
        </div>
        <div>
          <strong>Probabilidad:</strong>
          {' '}
          <span>{getProbLevel1(puntuacion)}</span>
        </div>
        <div>
          <strong>Aciertos:</strong>
          {' '}
          <span>{count(thisTema.level1.aciertos)}</span>
        </div>
        <div>
          <strong>Fallos:</strong>
          {' '}
          <span>{count(thisTema.level1.fallos)}</span>
        </div>
        <div>
          <strong>En blanco:</strong>
          {' '}
          <span>{count(thisTema.level1.enBlanco)}</span>
        </div>
      </div>
      <div>
        <h3>Nivel 2</h3>
        <em>{getTextNivel(MAX_PUNT_NIV_2)}</em>
        <div>
          <strong>Puntuación:</strong>
          {' '}
          <span>{getPuntuacionLevel2(thisTema.level2)}</span>
        </div>
        <div>
          <strong>Probabilidad:</strong>
          {' '}
          <span>{getProbLevel2(puntuacion)}</span>
        </div>
        <div>
          <strong>Aciertos:</strong>
          {' '}
          <span>{count(thisTema.level2.aciertos)}</span>
        </div>
        <div>
          <strong>Fallos:</strong>
          {' '}
          <span>{count(thisTema.level2.fallos)}</span>
        </div>
        <div>
          <strong>En blanco:</strong>
          {' '}
          <span>{count(thisTema.level2.enBlanco)}</span>
        </div>
      </div>
      <div>
        <h3>Nivel 3</h3>
        <em>{getTextNivel(MAX_PUNT_NIV_3)}</em>
        <div>
          <strong>Puntuación:</strong>
          {' '}
          <span>{getPuntuacionLevel3(thisTema.level3)}</span>
        </div>
        <div>
          <strong>Probabilidad:</strong>
          {' '}
          <span>{getProbLevel3(puntuacion)}</span>
        </div>
        <div>
          <strong>Aciertos:</strong>
          {' '}
          <span>{count(thisTema.level3.aciertos)}</span>
        </div>
        <div>
          <strong>Fallos:</strong>
          {' '}
          <span>{count(thisTema.level3.fallos)}</span>
        </div>
        <div>
          <strong>En blanco:</strong>
          {' '}
          <span>{count(thisTema.level3.enBlanco)}</span>
        </div>
      </div>
    </div>
  );
}
