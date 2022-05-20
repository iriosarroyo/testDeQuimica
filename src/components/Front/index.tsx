import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from 'components/Button';
import React, {
  KeyboardEvent, PropsWithChildren, useEffect, useRef,
} from 'react';

type FrontProps = {
  setChildren:Function,
  cb: Function
}

export default function Front({ children, setChildren, cb }:PropsWithChildren<FrontProps>) {
  const handleKeyDown = (event:KeyboardEvent) => (event.key === 'Escape' ? setChildren({ elem: null, cb: () => {} }) : undefined);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.focus();
  }, [ref.current]);
  return (
    <div
      ref={ref}
      className="frontElement"
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onDoubleClick={() => setChildren({ elem: null, cb: () => {} })}
    >
      <div>{children}</div>
      <Button onClick={() => {
        setChildren({ elem: null, cb: () => {} });
        cb();
      }}
      >
        <FontAwesomeIcon icon={faTimes} />
      </Button>
    </div>
  );
}
