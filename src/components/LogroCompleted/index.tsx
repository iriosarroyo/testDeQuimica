import { faVialCircleCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import FrontContext from 'contexts/Front';
import React, { useContext, useMemo } from 'react';
import Confetti from 'react-confetti';
import { Link } from 'react-router-dom';
import { useWindowSize } from 'react-use';
import { logros } from 'services/logros';

export default function LogroComplete({ logroId, fn }:{logroId:string, fn?:() => void}) {
  const logro = useMemo(() => logros.find(({ id }) => id === logroId), [logroId]);
  const setFront = useContext(FrontContext);
  const { height, width } = useWindowSize();
  if (logro === undefined) {
    setFront({ elem: null, cb: () => {} });
    return null;
  }
  const { name, description, stars } = logro;
  return (
    <div>
      <Confetti height={height} width={width} />
      <h3 className="headerNotificacion">Logro Completado</h3>
      <h4 className="titleNotificacion">{name}</h4>
      <div className="imgNotificacion">
        {Array(stars).fill(null)
          // eslint-disable-next-line react/no-array-index-key
          .map((_, idx) => <FontAwesomeIcon key={idx} icon={faVialCircleCheck} />)}
      </div>
      <div className="bodyNotificacion">{description}</div>
      <Link
        to={`/logros#${logroId}`}
        onClick={
        () => { setFront({ elem: null, cb: () => {} }); if (fn) fn(); }
      }
        className="buttonNotificacion"
      >
        Ir al logro

      </Link>
    </div>
  );
}

LogroComplete.defaultProps = {
  fn: undefined,
};
