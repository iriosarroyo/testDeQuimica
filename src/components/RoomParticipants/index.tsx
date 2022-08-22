import {
  faCaretRight, faUserCheck, faUsersBetweenLines, faUserXmark,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from 'components/Button';
import ContextMenu from 'components/ContextMenu';
import React, { MouseEvent, useState } from 'react';
import { deleteDDBB, writeDDBB } from 'services/database';
import { RoomMember } from 'types/interfaces';
import './RoomParticipants.css';

export default function RoomParticipants({
  members, username, room, isRoomAdmin,
}:
    {username:string, members:{[key:string]:RoomMember}, room:string, isRoomAdmin:boolean}) {
  const [displayed, setDisplayed] = useState(false);
  const [contextMenu, setContextMenu] = useState<{top:string, left:string, mate:string}|null>(null);
  const tipo = Object.values(members)[0]?.value?.split(' ')[1];
  const entriesMembers = Object.entries(members);
  entriesMembers.sort((a, b) => {
    const order = parseFloat(a[1].value ?? '0') - parseFloat(b[1].value ?? '0');
    return tipo === 'Fallos' ? order : -order;
  });
  const changeAdmin = async (member:string) => {
    if (window.confirm(`Está seguro de que quiere cambiar el administrador a ${member}`)) {
      await writeDDBB(`rooms/${room}/admin`, member);
    }
    setContextMenu(null);
  };

  const deleteMember = async (member:string) => {
    if (window.confirm(`Está seguro de que quiere eliminar a ${member}`)) {
      await deleteDDBB(`rooms/${room}/members/${member}`);
    }
    setContextMenu(null);
  };

  const handleContextMenu = (e:MouseEvent<HTMLLIElement>, member:string) => {
    if (!isRoomAdmin) return;
    if (member === username) return;
    e.preventDefault();
    setContextMenu({
      top: `${e.clientY}px`,
      left: `${e.clientX}px`,
      mate: member,
    });
  };
  const { mate, ...styleContex } = contextMenu ?? {};
  const handleClick = () => {
    setDisplayed(!displayed);
  };
  return (
    <div className={`participantsContainer ${displayed ? '' : 'participantsOculto'}`}>
      <Button className="participantsClose" onClick={handleClick}>
        {displayed
          ? <FontAwesomeIcon icon={faCaretRight} />
          : <FontAwesomeIcon icon={faUsersBetweenLines} />}
      </Button>
      <ul className="unlisted participantsStates">
        {isRoomAdmin && <div className="participantesInfo">Haz click derecho sobre cada participante para ver más opciones.</div>}
        <li className="memberRoom">
          <span className="iconRoom">Listo</span>
          <span>Usuario</span>
          <span>{tipo}</span>
        </li>
        {entriesMembers.map(([key, member]) => (
          <li key={key} onContextMenu={(e) => handleContextMenu(e, key)} className="memberRoom">
            <span className="iconRoom">
              {member.ready
                ? <FontAwesomeIcon icon={faUserCheck} />
                : <FontAwesomeIcon icon={faUserXmark} />}
            </span>
            <span>
              {key === username ? 'Tú' : key}
            </span>
            <span>
              {member.value && parseFloat(member.value)}
            </span>
          </li>
        ))}
      </ul>
      {(contextMenu && mate) && (
      <ContextMenu
        style={styleContex}
        items={[{ text: `Hacer a ${mate} administrador`, action: () => changeAdmin(mate) },
          { text: `Expulsar a ${mate} del grupo`, action: () => deleteMember(mate) }]}
        setContextMenu={setContextMenu}
        classOfElem=".memberRoom"
      />
      ) }
    </div>
  );
}
