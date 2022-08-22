import { faVialCircleCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from 'components/Button';
import GeneralContentLoader from 'components/GeneralContentLoader';
import Logros from 'components/Logros';
import FrontContext from 'contexts/Front';
import React, {
  useContext, useEffect, useState,
} from 'react';
import { getLogrosFrom, getStarsWithSetters } from 'services/logros';
import './Clasificacion.css';

export default function Clasificacion() {
  const [starsByUser, setStarsByUser] = useState<{stars:number, username:string}[]|null>(null);
  const setFront = useContext(FrontContext);
  const sortByName = (stars:{stars:number, username:string}[]|null) => {
    if (stars !== null) {
      const newVal = [...stars].sort((a, b) => a.username.localeCompare(b.username));
      setStarsByUser(newVal);
    }
  };
  const sortByStars = (stars:{stars:number, username:string}[]|null) => {
    if (stars !== null) {
      const newVal = [...stars].sort((a, b) => b.stars - a.stars);
      setStarsByUser(newVal);
    }
  };
  useEffect(() => {
    getStarsWithSetters(sortByStars);
  }, []);
  if (starsByUser === null) return <GeneralContentLoader />;
  return (
    <div className="clasificacionContainer">
      <h4>Clasificación</h4>
      <div className="gridClasificacion clasificacionTableHeader">
        <Button onClick={() => sortByName(starsByUser)}>Nombre de usuario</Button>
        <Button onClick={() => sortByStars(starsByUser)}>
          Nº de
          {' '}
          <FontAwesomeIcon icon={faVialCircleCheck} />
        </Button>
      </div>
      {starsByUser.map(({ stars, username }) => (
        <Button
          className="gridClasificacion clasificacionItem"
          key={username}
          title={username}
          onClick={async () => {
            const logros = await getLogrosFrom(username);
            setFront({
              elem: <Logros
                starsAndLogros={{ logros, stars, username }}
              />,
              cb: () => {},
            });
          }}
        >
          <div className="clasificacionItemUser">{username}</div>
          <div className="clasificacionItemStars">{stars}</div>
        </Button>
      ))}
    </div>
  );
}
