import React, { useEffect, useState } from 'react';

import {
  getPuntuacionDelTema, getPuntuacionLevel1, getPuntuacionLevel2, getTemasInOrder,
} from 'services/probability';
import { CompleteUser } from 'types/interfaces';
import './Puntuaciones.css';

export default function Puntuaciones({ user }:{user:CompleteUser}) {
  const [temasInOrder, setTemasInOrder] = useState<string[]>([]);
  const { temas, year } = user.userDDBB;
  useEffect(() => {
    getTemasInOrder(year).then(setTemasInOrder);
  }, []);
  return (
    <div className="puntuacionesPerTema">
      <p>
        Las puntuaciones en cada tema se calculan multiplicando el número de aciertos por 0,25 y
        restando el número de fallos por 0,05. Hay un bonus de 0,5 por cada 10 preguntas acertadas y
        de 1 punto por cada 100 preguntas acertadas. Las preguntas de
        {' '}
        <span className="level1Text">nivel 1</span>
        {' '}
        como máximo
        pueden aportar una puntuación de 2 puntos y las de
        {' '}
        <span className="level2Text">nivel 2</span>
        {' '}
        tienen el máximo en 6
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
            temasInOrder.map((tema) => {
              const levels = temas[tema];
              const percLevel1 = getPuntuacionLevel1(levels.level1) * 10;
              const percLevel2 = getPuntuacionLevel2(levels.level2) * 10;
              const percTotal = getPuntuacionDelTema(levels); // multiplicamos más abajo
              return (
                <div className="puntuacionTemaProgress" key={tema}>
                  <strong>{tema.replace('tema9', 'Temas 9 y 10').replace('tema', 'Tema ')}</strong>
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
                </div>
              );
            })
        }
      </div>
    </div>
  );
}
