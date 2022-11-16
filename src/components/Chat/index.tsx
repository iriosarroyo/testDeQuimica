import {
  faCaretRight, faMessage, faPaperPlane, faTurnDown,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from 'components/Button';
import MyErrorContext from 'contexts/Error';
import UserContext from 'contexts/User';
import { useEvent } from 'hooks/general';
import React, {
  ChangeEvent, FormEvent, RefObject, useContext, useEffect, useMemo, useRef, useState,
} from 'react';
import { onValueDDBB, pushDDBB } from 'services/database';
import { timeInChat } from 'services/time';
import './Chat.css';

let intersectionObs:IntersectionObserver;
type MSG = {username:string, time:number, msg:string, auto?:boolean}
function ChatMessages({
  myRef, scrollToBottom, msgs, displayed,
}:
    {myRef:RefObject<HTMLDivElement>,
       scrollToBottom: Function, displayed:boolean, msgs:[string, MSG][]}) {
  const [end, setEnd] = useState(true);
  const { username } = useContext(UserContext)!.userDDBB;
  const ref = useRef<HTMLDivElement>(null);
  const ref2 = useRef<HTMLDivElement>(null);

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
  console.log(msgs.length);
  useEffect(() => {
    ref2.current?.scrollIntoView({ behavior: 'smooth' });
    // setTimeout(() => ref2.current?.scrollIntoView({ behavior: 'smooth' }), 750);
  }, [displayed]);
  const scrollTo = localStorage.getItem('chat:scrollTo');
  const numOfUnread = localStorage.getItem('chat:numberOfUnread');
  return (
    <div className="chatTexts" ref={myRef}>
      {msgs.slice(-1000).map(([key, x]) => (
        <React.Fragment key={key}>

          {x.auto ? <div id={key} className="autoMsgChat">{x.msg}</div>
            : (
              <div
                id={key}
                className={`chatMsg ${x.username === username ? 'own' : 'others'}`}
              >
                <strong className="chatUsername">{x.username === username ? 'Tú' : x.username}</strong>
                <div>{x.msg}</div>
                <div className="chatFecha">{timeInChat(x.time)}</div>
              </div>
            )}
          {key === scrollTo && numOfUnread && numOfUnread !== '0' && (
          <div ref={ref2} className="autoMsgChat chatNumOfUnread">
            {numOfUnread}
            {' '}
            mensajes sin leer
          </div>
          )}
        </React.Fragment>
      ))}

      <Button
        className={`bottomButton ${end ? 'chatAtEnd' : ''}`}
        onClick={() => scrollToBottom()}
      >
        <FontAwesomeIcon icon={faTurnDown} />
      </Button>

      <div className="bottomChat" ref={ref} />
    </div>
  );
}

function ChatInput({ room, scrollToBottom }:{room:string, scrollToBottom:() => void}) {
  const { username } = useContext(UserContext)!.userDDBB;
  const [inputVal, setInputVal] = useState<string>('');
  const handleChange = (e:ChangeEvent<HTMLInputElement>) => setInputVal(e.target.value);
  const handleSubmit = async (e:FormEvent) => {
    e.preventDefault();
    if (inputVal === '') return;
    const [ref] = await pushDDBB(
      `rooms/${room}/chat`,
      { msg: inputVal, username, time: new Date().getTime() },
    );
    if (ref) setInputVal('');
    scrollToBottom();
  };
  return (
    <form className="chatForm" onSubmit={handleSubmit}>
      <input className="chatInput" type="text" value={inputVal} onChange={handleChange} />
      <Button type="submit">
        <FontAwesomeIcon icon={faPaperPlane} />
      </Button>
    </form>
  );
}

export default function Chat({ room }: {room:string}) {
  const myRef = useRef<HTMLDivElement>(null);
  const [displayed, setDisplayed] = useState(false);
  const setError = useContext(MyErrorContext);
  const [msgs = {}] = useEvent<{[key:string]:MSG}>((setMsgs) => onValueDDBB(`rooms/${room}/chat`, setMsgs, setError));
  const msgsEntries = useMemo(() => Object.entries(msgs), [msgs]);
  const [numOfUnread, intOfUnread] = useMemo(() => {
    const lastReadMsg = localStorage.getItem('chat:lastReadMsg');
    const idxLastRead = msgsEntries.findIndex((val) => val[0] === lastReadMsg);
    const notRead = msgsEntries.length - 1 - idxLastRead;
    return [notRead > 99 ? '99+' : notRead, notRead];
  }, [msgs, displayed]);

  if (displayed) localStorage.setItem('chat:lastReadMsg', msgsEntries[msgsEntries.length - 1][0]);
  const scrollToBottom = () => {
    if (myRef.current) myRef.current.scrollTop = myRef.current.scrollHeight;
  };

  const handleClick = () => {
    const lastReadMsg = localStorage.getItem('chat:lastReadMsg');
    if (!displayed && lastReadMsg) {
      localStorage.setItem('chat:scrollTo', lastReadMsg);
      localStorage.setItem('chat:numberOfUnread', intOfUnread.toString());
    } else localStorage.removeItem('chat:scrollTo');
    setDisplayed(!displayed);
  };
  const data = numOfUnread === 0 ? {} : { 'data-numofmsgs': numOfUnread };
  return (
    <div className={`chatContainer ${displayed ? '' : 'chatOculto'}`}>
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
      <Button className="chatClose" {...data} onClick={handleClick}>
        {displayed
          ? <FontAwesomeIcon icon={faCaretRight} />
          : <FontAwesomeIcon icon={faMessage} />}
      </Button>
      <div className="chat">
        <ChatMessages
          myRef={myRef}
          msgs={msgsEntries}
          scrollToBottom={scrollToBottom}
          displayed={displayed}
        />
        <ChatInput room={room} scrollToBottom={scrollToBottom} />
      </div>
    </div>
  );
}
