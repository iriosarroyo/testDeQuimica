import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from 'components/Button';
import React, { PropsWithChildren } from 'react';

type FrontProps = {
  setChildren:Function
}

export default function Front({ children, setChildren }:PropsWithChildren<FrontProps>) {
  return (
    <div className="frontElement">
      <div>{children}</div>
      <Button onClick={() => setChildren(null)}><FontAwesomeIcon icon={faTimes} /></Button>
    </div>
  );
}
