import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from 'components/Button';
import React, {
  KeyboardEvent, PropsWithChildren, useEffect, useRef,
} from 'react';

type FrontProps = {
  setChildren:Function,
  cb: Function,
  unableFocus?: boolean
}

export default function Front({
  children, setChildren, cb, unableFocus,
}:
  PropsWithChildren<FrontProps>) {
  const clearFront = () => {
    setChildren({ elem: null, cb: () => {} });
    cb();
  };
  const handleKeyDown = (event:KeyboardEvent) => (event.key === 'Escape' ? clearFront() : undefined);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current && !unableFocus) ref.current.focus();
  }, [ref.current]);
  return (
    <div
      ref={ref}
      className="frontElement"
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div>{children}</div>
      <Button onClick={() => {
        clearFront();
      }}
      >
        <FontAwesomeIcon icon={faTimes} />
      </Button>
    </div>
  );
}

Front.defaultProps = {
  unableFocus: false,
};
