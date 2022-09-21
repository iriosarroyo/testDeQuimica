import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from 'components/Button';
import useOutsideAlerter from 'hooks/outsideAlerter';
import UserIconDropdown from 'components/UserIconDropdown';
import React, { useRef, useState } from 'react';
import { auth } from 'services/firebaseApp';
import './UserIcon.css';
import { faUser } from '@fortawesome/free-solid-svg-icons';

export default function UserIcon({ def }:{def?:boolean}) {
  const [show, toggleShow] = useState(false);
  const [undefIcon, setUndefIcon] = useState(false);
  const handleClick = () => toggleShow(!show);
  const user = auth.currentUser;
  const className = user && user.photoURL && !undefIcon ? 'userIcon' : 'undefinedIcon userIcon';
  const ref = useRef();
  const ref2 = useRef();
  useOutsideAlerter(ref, ref2, () => toggleShow(false));

  return (
    <>
      <Button nextref={ref2} onClick={handleClick} className={className}>
        {user && user.photoURL && !undefIcon
          ? <img loading="lazy" onError={() => setUndefIcon(true)} src={user.photoURL} alt="Profile" referrerPolicy="no-referrer" />
          : <FontAwesomeIcon icon={faUser} />}
      </Button>
      {!def && show && <UserIconDropdown nextref={ref} closeDropDown={() => toggleShow(false)} />}
    </>
  );
}

UserIcon.defaultProps = { def: false };
