import React from 'react';
import './Constantes.css';

export default function Constantes() {
  return (
    <div className="constantesContainer">
      <h3>Constantes</h3>
      <ul className="unlisted">
        <li>
          <a href="https://es.wikipedia.org/wiki/Constante_de_Avogadro" target="_blank" referrerPolicy="no-referrer" rel="noreferrer">
            Nº de Avogadro
          </a>
          {' '}
          = 6,022·10
          <sup>23</sup>
          {' '}
          mol
          <sup>-1</sup>
        </li>
        <li>
          <a href="https://es.wikipedia.org/wiki/Constante_de_los_gases_ideales" target="_blank" referrerPolicy="no-referrer" rel="noreferrer">
            R
          </a>
          {' '}
          = 0,082 atm·L·mol
          <sup>-1</sup>
          ·K
          <sup>-1</sup>
          {' '}
          = 8,314 J·mol
          <sup>-1</sup>
          ·K
          <sup>-1</sup>
        </li>
        <li>
          <a href="https://es.wikipedia.org/wiki/Constante_de_Planck" target="_blank" referrerPolicy="no-referrer" rel="noreferrer">
            h
          </a>
          {' '}
          = 6,626·10
          <sup>-34</sup>
          {' '}
          J·s
        </li>
        <li>
          <a href="https://es.wikipedia.org/wiki/Velocidad_de_la_luz" target="_blank" referrerPolicy="no-referrer" rel="noreferrer">
            c
          </a>
          {' '}
          = 2,998·10
          <sup>8</sup>
          {' '}
          m/s
        </li>
        <li>
          <a href="https://es.wikipedia.org/wiki/Constante_de_Faraday" target="_blank" referrerPolicy="no-referrer" rel="noreferrer">
            F
          </a>
          {' '}
          = 96500 C
        </li>
      </ul>
      <h3>Cambios de unidades</h3>
      <ul className="unlisted">
        <li>1 atm = 760 mmHg = 101325 Pa</li>
        <li>1 cal = 4,18 J</li>
        <li>
          1 eV = 1,6·10
          <sup>-19</sup>
          {' '}
          J
        </li>
      </ul>
    </div>
  );
}
