import {
  faCaretRight, faMessage, faPaperPlane, faTurnDown,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from 'components/Button';
import MyErrorContext from 'contexts/Error';
import UserContext from 'contexts/User';
import React, {
  ChangeEvent, FormEvent, RefObject, useContext, useEffect, useRef, useState,
} from 'react';
import { onValueDDBB, pushDDBB } from 'services/database';
import './Chat.css';

let intersectionObs:IntersectionObserver;

function ChatMessages({ room, myRef, scrollToBottom }:
    {room:string, myRef:RefObject<HTMLDivElement>, scrollToBottom: Function}) {
  const [msgs, setMsgs] = useState<{[key:string]:{username:string, time:number, msg:string}}>({});
  const [end, setEnd] = useState(true);
  const { username } = useContext(UserContext)!.userDDBB;
  const ref = useRef<HTMLDivElement>(null);
  const setError = useContext(MyErrorContext);
  useEffect(() => {
    const hello = (a:any) => { setMsgs(a); console.log(a); };
    return onValueDDBB(`rooms/${room}/chat`, hello, setError);
  }, []);

  useEffect(() => {
    if (end) scrollToBottom();
  }, [msgs]);
  useEffect(
    () => {
      if (intersectionObs) intersectionObs.disconnect();
      if (!myRef.current || !ref.current) return;
      intersectionObs = new IntersectionObserver((elem) => {
        const [bottom] = elem;
        if (bottom.isIntersecting) setEnd(true);
        else setEnd(false);
      }, {
        root: myRef.current,
        threshold: 0,
      });
      intersectionObs.observe(ref.current);
    },
    [],
  );

  return (
    <div className="chatTexts" ref={myRef}>
      {Object.values(msgs ?? {}).map((x) => (
        <div
          key={`${x.time}_${x.username}`}
          className={`chatMsg ${x.username === username ? 'own' : 'others'}`}
        >
          <strong className="chatUsername">{x.username === username ? 'Tú' : x.username}</strong>
          <div>{x.msg}</div>
        </div>
      ))}

      <Button className={`bottomButton ${end ? 'chatAtEnd' : ''}`} onClick={() => scrollToBottom()}>
        <FontAwesomeIcon icon={faTurnDown} />
      </Button>

      <div className="bottomChat" ref={ref} />
    </div>
  );
}

export default function Chat({ room }: {room:string}) {
  const { username } = useContext(UserContext)!.userDDBB;
  const myRef = useRef<HTMLDivElement>(null);
  const [inputVal, setInputVal] = useState<string>('');
  const [displayed, setDisplayed] = useState(false);

  const scrollToBottom = () => {
    if (myRef.current) myRef.current.scrollTop = myRef.current.scrollHeight;
  };

  useEffect(() => {
    scrollToBottom();
  }, [displayed]);

  const handleChange = (e:ChangeEvent<HTMLInputElement>) => setInputVal(e.target.value);
  const handleSubmit = async (e:FormEvent) => {
    e.preventDefault();
    const [ref] = await pushDDBB(
      `rooms/${room}/chat`,
      { msg: inputVal, username, time: new Date().getTime() },
    );
    if (ref) setInputVal('');
    scrollToBottom();
  };
  const handleClick = () => {
    setDisplayed(!displayed);
  };
  return (
    <div className={`chatContainer ${displayed ? '' : 'chatOculto'}`}>
      <Button className="chatClose" onClick={handleClick}>
        {displayed
          ? <FontAwesomeIcon icon={faCaretRight} />
          : <FontAwesomeIcon icon={faMessage} />}
      </Button>
      <div className="chat">
        <ChatMessages room={room} myRef={myRef} scrollToBottom={scrollToBottom} />
        <form className="chatForm" onSubmit={handleSubmit}>
          <input className="chatInput" type="text" value={inputVal} onChange={handleChange} />
          <Button type="submit">
            <FontAwesomeIcon icon={faPaperPlane} />
          </Button>
        </form>
      </div>
    </div>
  );
}
