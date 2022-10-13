import MyErrorContext from 'contexts/Error';
import React, {
  RefObject,
  useContext, useEffect, useRef, useState,
} from 'react';
import { getFrasesCuriosasWithSetters, getInicioWithSetters } from 'services/database';
import setFooter from 'hooks/setFooter';
import UserContext from 'contexts/User';
import GeneralContentLoader from 'components/GeneralContentLoader';
import SearchCmd from 'services/commands';
import { CompleteUser } from 'types/interfaces';
import { sendLogroUpdate } from 'services/logros';

const changeAnimation = (
  estaRef:RefObject<HTMLDivElement>,
  frases:string[]|null,
  velocidad:number,
  user?:CompleteUser,
) => {
  const ref = estaRef;
  if (ref.current && frases) {
    ref.current.style.animation = 'none';
    ref.current.textContent = frases[Math.trunc(Math.random() * frases.length)];
    const duration = (2 * ref.current.clientWidth) / (100 * velocidad);
    ref.current.style.animation = `slider-text ${duration}s linear 2s`;
    if (user) sendLogroUpdate('mensajes', user.userDDBB.logros?.mensajes);
  }
};

function InicioFooter({ velocidad }:{velocidad:number}) {
  const user = useContext(UserContext)!;
  const [frases, setFrases] = useState<string[]|null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const setError = useContext(MyErrorContext);
  useEffect(() => {
    const callback = (fr:string[]) => {
      setFrases(fr);
    };
    getFrasesCuriosasWithSetters(callback, (err:Error) => {
      if (err.message !== 'Permission denied') return setError(err);
      return setFrases(null);
    });
  }, []);

  useEffect(() => {
    if (ref.current) {
      changeAnimation(ref, frases, velocidad);
    }
  }, [frases, velocidad]);
  if (frases === null) return null;
  return (
    <div className="sliderTextContainer">
      <div ref={ref} onAnimationEnd={() => changeAnimation(ref, frases, velocidad, user)} className="sliderText" />
    </div>
  );
}

function Inicio() {
  const [text, setText] = useState<any>(undefined);
  const setError = useContext(MyErrorContext);
  const { userDDBB } = useContext(UserContext)! ?? { userDDBB: { velocidad: 1 } };
  const { velocidad } = userDDBB;
  setFooter(<InicioFooter velocidad={velocidad} />, [velocidad]);

  useEffect(() => {
    getInicioWithSetters(setText, setError);
  }, []);
  useEffect(() => document.querySelector('#searchCursor')?.scrollIntoView(), [text]);
  useEffect(() => {
    if (text !== undefined) return SearchCmd.onSearch('Inicio', 'Inicio', text.content, (val:string) => setText({ content: val }));
    return () => {};
  }, [text === undefined]);
  return (
    <div className="inicio mainText">
      {
      text
        ? (
          <div dangerouslySetInnerHTML={{ __html: text.content }} />
        )
        : <GeneralContentLoader />

    }

    </div>
  );
}
export default Inicio;
