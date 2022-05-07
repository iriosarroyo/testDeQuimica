import MyErrorContext from 'contexts/Error';
import React, {
  RefObject,
  useContext, useEffect, useRef, useState,
} from 'react';
import { getFrasesCuriosasWithSetters, getInicioWithSetters } from 'services/database';
import setFooter from 'hooks/setFooter';
import UserContext from 'contexts/User';
import GeneralContentLoader from 'components/GeneralContentLoader';

const changeAnimation = (
  estaRef:RefObject<HTMLDivElement>,
  frases:string[],
  velocidad:number,
) => {
  const ref = estaRef;
  if (ref.current) {
    ref.current.style.animation = 'none';
    ref.current.textContent = frases[Math.trunc(Math.random() * frases.length)];
    const duration = (2 * ref.current.clientWidth) / (100 * velocidad);
    ref.current.style.animation = `slider-text ${duration}s linear 2s`;
  }
};

function InicioFooter({ velocidad }:{velocidad:number}) {
  const ref = useRef<HTMLDivElement>(null);
  const setError = useContext(MyErrorContext);
  useEffect(() => {
    const callback = (frases:string[]) => {
      if (ref.current) {
        changeAnimation(ref, frases, velocidad);
        ref.current.addEventListener('animationend', () => changeAnimation(ref, frases, velocidad));
      }
    };
    getFrasesCuriosasWithSetters(callback, setError);
  }, [velocidad]);

  return (
    <div className="sliderTextContainer">
      <div ref={ref} className="sliderText" />
    </div>
  );
}

function Inicio() {
  const [text, setText] = useState<any>(undefined);
  const setError = useContext(MyErrorContext);
  const { userDDBB } = useContext(UserContext) ?? { userDDBB: { velocidad: 1 } };
  const { velocidad } = userDDBB;
  setFooter(<InicioFooter velocidad={velocidad} />, [velocidad]);

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
        : <GeneralContentLoader />

    }

    </div>
  );
}
export default Inicio;
