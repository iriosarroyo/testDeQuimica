import { faVial, faVialCircleCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import UserContext from 'contexts/User';
import React, { useContext, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { logros } from 'services/logros';
import { Logros, logrosTypes, userDDBB } from 'types/interfaces';
import './Logros.css';

export default function LogrosComp({ starsAndLogros }: {starsAndLogros?:{stars:number, logros:userDDBB['logros'], username:string}}) {
  const defaultUser = useContext(UserContext)!;
  const { logros: logrosUser, stars, username } = starsAndLogros ?? defaultUser.userDDBB;
  const groupedLogros = useMemo(() => {
    const initialValue:Logros[][] = Array(logrosTypes.length).fill(null).map(() => ([]));
    return logros.reduce((acum, curr) => {
      acum[logrosTypes.indexOf(curr.type)].push(curr);
      return acum;
    }, initialValue);
  }, [logros]);
  const totalStars = useMemo(() => logros.reduce((acum, curr) => acum + curr.stars, 0), [logros]);
  const location = useLocation();
  useEffect(() => {
    if (location.hash !== '') document.querySelector(location.hash)?.scrollIntoView();
  }, []);
  return (
    <div className="logrosSection">
      <h2>{username}</h2>
      <div>
        {stars}
        {' '}
        /
        {' '}
        <strong>{totalStars}</strong>
        {' '}
        <FontAwesomeIcon icon={faVialCircleCheck} />
      </div>
      <div>
        Los
        {' '}
        <FontAwesomeIcon icon={faVialCircleCheck} />
        {' '}
        indican que el logro está completado. En cambio,
        {' '}
        <FontAwesomeIcon icon={faVial} />
        {' '}
        indica que el logro aún no está completo.
        El número es lo que vale ese logro cuando está completo.
      </div>
      {
            groupedLogros.map((group, idx) => (
              <div className="logrosGroup" key={logrosTypes[idx]}>
                <h3 className="logrosGroupTitle">{logrosTypes[idx]}</h3>
                <div className="logrosGroupContent">
                  {
                  group.map((logro) => {
                    const userdata = logrosUser?.[logro.key];
                    const icon = (userdata && (logro.value <= userdata.value))
                      ? faVialCircleCheck : faVial;
                    return (
                      <div id={logro.id} key={logro.id} className="logroSlide">
                        <div className="logroStars">
                          {Array(logro.stars).fill(null).map((v, i) => (
                            // eslint-disable-next-line react/no-array-index-key
                            <FontAwesomeIcon key={i} icon={icon} />))}
                        </div>
                        <div>
                          <h4 className="logroTitle">{logro.name}</h4>
                          <div className="logroDesc">{logro.description}</div>
                          <div className="logroValueGroup">
                            <div className="logroBar">
                              <div className="logroProgress" style={{ width: `${Math.min(((userdata?.value ?? 0) / logro.value) * 100, 100)}%` }} />
                            </div>
                            <div className="logroValue">
                              {userdata?.value ?? 0}
                              {' '}
                              /
                              {' '}
                              <strong>{logro.value}</strong>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                              }
                </div>
              </div>
            ))
}
    </div>
  );
}

LogrosComp.defaultProps = {
  starsAndLogros: undefined,
};
