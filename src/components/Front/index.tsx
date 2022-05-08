import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from 'components/Button';
import React, { PropsWithChildren } from 'react';

type FrontProps = {
  setChildren:Function,
  cb: Function
}

export default function Front({ children, setChildren, cb }:PropsWithChildren<FrontProps>) {
  return (
    <div className="frontElement">
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
