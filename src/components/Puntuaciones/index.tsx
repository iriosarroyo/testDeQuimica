import Button from 'components/Button';
import PuntPerTemaStats from 'components/PuntPerTemaStats';
import UserContext from 'contexts/User';
import { DEFAULT_LEVELS, getTemas } from 'info/temas';
import React, { useContext, useEffect, useState } from 'react';

import {
  EXTRA_PER_10,
  EXTRA_PER_100,
  getPuntuacionDelTema, getPuntuacionLevel1, getPuntuacionLevel2, getTemasInOrder,
  MAX_PUNT_NIV_1, MAX_PUNT_NIV_2, VAL_PUNT_ACIERTO, VAL_PUNT_FALLO,
} from 'services/probability';
import { CompleteUser, userDDBB } from 'types/interfaces';
import './Puntuaciones.css';

function PuntuacionDelTema({ temas, tema, curso }:{temas:userDDBB['temas'], tema:string, curso:string}) {
  const [display, setDisplay] = useState(false);
  const levels = temas?.[tema] ?? DEFAULT_LEVELS;
  const percLevel1 = getPuntuacionLevel1(levels.level1) * 10;
  const percLevel2 = getPuntuacionLevel2(levels.level2) * 10;
  const percTotal = getPuntuacionDelTema(levels); // multiplicamos más abajo
  const TEMAS = getTemas();
  return (
    <div className="puntuacionTemaProgress" key={tema}>
      <Button onClick={() => setDisplay((v) => !v)}>
        <strong>{TEMAS[tema as keyof typeof TEMAS]}</strong>
        <div className="progressPuntuacionesContainer">
          <div className="puntuacionProgress">
            Puntuación:
            {' '}
            {Math.round(percTotal * 100) / 100}
          </div>
          <div className="progressLevel1" style={{ width: `${percLevel1}%` }} />
          <div className="progressLevel2" style={{ width: `${percLevel1 + percLevel2}%` }} />
          <div className="progressLevel3" style={{ width: `${percTotal * 10}%` }} />
        </div>
      </Button>
      {
      display && <PuntPerTemaStats curso={curso} tema={tema} temas={temas} />
      }
    </div>
  );
}

export default function Puntuaciones({ user }:{user?:CompleteUser}) {
  const [temasInOrder, setTemasInOrder] = useState<string[]>([]);
  const defaultUser = useContext(UserContext)!;
  const { temas, year } = (user ?? defaultUser).userDDBB;
  useEffect(() => {
    getTemasInOrder(year).then(setTemasInOrder);
  }, []);
  return (
    <div className="puntuacionesPerTema">
      <p>
        Las puntuaciones en cada tema se calculan multiplicando el número de aciertos por
        {' '}
        {VAL_PUNT_ACIERTO}
        {' '}
        y
        restando el número de fallos por
        {' '}
        {VAL_PUNT_FALLO}
        . Hay un bonus de
        {' '}
        {EXTRA_PER_10}
        {' '}
        por cada 10 preguntas acertadas y
        de
        {' '}
        {EXTRA_PER_100}
        {' '}
        punto por cada 100 preguntas acertadas. Las preguntas de
        {' '}
        <span className="level1Text">nivel 1</span>
        {' '}
        como máximo
        pueden aportar una puntuación de
        {' '}
        {MAX_PUNT_NIV_1}
        {' '}
        puntos y las de
        {' '}
        <span className="level2Text">nivel 2</span>
        {' '}
        tienen el máximo en
        {' '}
        {MAX_PUNT_NIV_2}
        puntos. Las preguntas de
        {' '}
        <span className="level3Text">nivel 3</span>
        , pueden aportar todos los puntos.
      </p>
      <p>
        El orden en el que aparecen los temas, es el orden establecido por el administrador y
        que determina el orden en el que te aparecen los temas. Un tema aparece cuando hayas
        alcanzado un 4 en todos los anteriores.
      </p>
      <div className="gridPuntuacionesPerTema">
        {
            temasInOrder.map((tema) => (
              <PuntuacionDelTema key={tema} tema={tema} temas={temas} curso={year} />))
        }
      </div>
    </div>
  );
}

Puntuaciones.defaultProps = {
  user: undefined,
};
