import {
  faCaretRight, faEye, faUserCheck, faUsersBetweenLines, faUserXmark,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from 'components/Button';
import ContextMenu from 'components/ContextMenu';
import MyErrorContext from 'contexts/Error';
import { useEvent } from 'hooks/general';
import React, {
  MouseEvent, useContext, useEffect, useState,
} from 'react';
import SearchCmd from 'services/commands';
import {
  addOne, deleteDDBB, onValueDDBB, writeDDBB,
} from 'services/database';
import { sendAutoMsg } from 'services/rooms';
import Toast from 'services/toast';
import { RoomMember } from 'types/interfaces';
import './RoomParticipants.css';

const addCommands = (
  members:{[key:string]:RoomMember},
  username:string,
  isRoomAdmin:boolean,
  banned: string[]|null|undefined,
  makeCurrObserved: (member:string) => any,
  changeAdmin: (member:string) => any,
  deleteMember: (member:string) => any,
  changeViewerState: (member:string) => any,
  banMember: (member:string) => any,
  unbanMember: (member:string) => any,
) => {
  const otherMembers = Object.keys(members).filter((x) => x !== username);
  const viewCommand = () => SearchCmd.addCommand(
    'view',
    'Observa al participante indicado',
    makeCurrObserved,
    {
      name: 'Participante',
      desc: 'Observa al participante indicado',
      optional: false,
      type: Object.entries(members).filter(([user, data]) => user !== username && !data.isViewer)
        .map(([user]) => user),
    },
  );
  const changeAdminCmd = () => SearchCmd.addCommand(
    'makeAdminGroup',
    'Asigna el administrador del grupo',
    changeAdmin,
    {
      name: 'Participante',
      desc: 'Convierte en administrador al participante indicado',
      optional: false,
      type: otherMembers,
    },
  );
  const deleteMemberCmd = () => SearchCmd.addCommand(
    'deleteMember',
    'Expulsa al participante del grupo',
    deleteMember,
    {
      name: 'Participante',
      desc: 'Expulsa al participante indicado',
      optional: false,
      type: otherMembers,
    },
  );
  const banMemberCmd = () => SearchCmd.addCommand(
    'banMember',
    'Bannea al participante del grupo',
    banMember,
    {
      name: 'Participante',
      desc: 'Bannea al participante indicado (también puedes bannear a un usuario que no esté en el grupo)',
      optional: false,
      type: [...otherMembers, 'string'],
    },
  );
  const unbanMemberCmd = () => SearchCmd.addCommand(
    'unbanMember',
    'Levanta el banneo de una persona',
    unbanMember,
    {
      name: 'Persona',
      desc: 'Levanta el banneo de la persona indicada',
      optional: false,
      type: banned ?? [],
    },
  );

  const changeViewerStateCmd = () => SearchCmd.addCommand(
    'changeViewerState',
    'Convierte en observador o revoca el estado de observador de un participante',
    (viewer:boolean, member:string) => {
      if (viewer === Boolean(members[member].isViewer)) return;
      if (viewer && Object.values(members).filter((m) => !m.isViewer).length <= 1) {
        Toast.addMsg('No se puede convertir a todo el mundo el observador', 3000);
        return;
      }
      changeViewerState(member);
    },
    {
      name: 'Estado',
      desc: 'Indica si convertirlo en observador (true) o si le revocas el estado ed observador (false)',
      optional: false,
      type: ['boolean'],
    },
    {
      name: 'Participante',
      desc: 'Participante al que se le aplica (tú por defecto)',
      optional: true,
      type: Object.keys(members),
      default: username,
    },
  );
  const offList = [
    ...(isRoomAdmin ? [changeAdminCmd(),
      deleteMemberCmd(), changeViewerStateCmd(), banMemberCmd(),
      ...(banned ? [unbanMemberCmd()] : []),
    ] : []),
    ...(members[username]?.isViewer ? [viewCommand()] : []),
  ];
  return () => offList.forEach((x) => x());
};

function BannedList({
  volverHaciaAtras, banned, isRoomAdmin, unban,
}:
  {volverHaciaAtras:() => any, banned:string[]|null|undefined,
     isRoomAdmin:boolean, unban:(m:string) => any}) {
  return (
    <ul className="unlisted participantsStates">
      <li><Button onClick={volverHaciaAtras}>Volver</Button></li>
      {banned ? banned.map((x) => (
        <li
          key={x}
          className="memberRoom"
        >
          <span className="nameUnban">{x}</span>
          {isRoomAdmin && <span className="buttonUnban"><Button onClick={() => unban(x)}>Unban</Button></span>}
        </li>
      ))
        : <li className="participantesInfo">No hay usuarios banneados</li>}
    </ul>
  );
}

function ParticipantesList({
  entriesMembers, handleContextMenu, isRoomAdmin, makeCurrObserved,
  tipo, username, viewerUser, showBanned,
}:
  {isRoomAdmin: boolean,
  tipo: string | undefined,
  entriesMembers: [string, RoomMember][],
  makeCurrObserved: (member: string, user?: string, overwrite?: boolean) => Promise<void>,
  handleContextMenu: (e: MouseEvent<HTMLLIElement>, member: string) => void,
  viewerUser: string | undefined,
  username: string, showBanned: () => any}) {
  return (
    <ul className="unlisted participantsStates">
      {isRoomAdmin && <div className="participantesInfo">Haz click derecho sobre cada participante para ver más opciones.</div>}
      <li className="memberRoom">
        <span className="iconRoom">Listo</span>
        <span>Usuario</span>
        <span>{tipo}</span>
      </li>
      {entriesMembers.map(([key, member]) => (
      // eslint-disable-next-line max-len
      // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
        <li
          key={key}
          onClick={() => makeCurrObserved(key)}
          onContextMenu={(e) => handleContextMenu(e, key)}
          className="memberRoom"
        >
          <span className="iconRoom">
            {member.isViewer
              ? <FontAwesomeIcon icon={faEye} />
              : <FontAwesomeIcon icon={member.ready ? faUserCheck : faUserXmark} />}
          </span>
          <span title={key === viewerUser && key !== username ? 'Observando...' : ''}>
            {key === username ? 'Tú' : key}
          </span>
          <span>
            {member.value && parseFloat(member.value)}
          </span>
        </li>
      ))}
      <li className="endOfParticipants"><Button onClick={showBanned}>Ver personas banneadas</Button></li>
    </ul>
  );
}
export default function RoomParticipants({
  members, username, room, isRoomAdmin, viewerUser,
}:
    {username:string, members:{[key:string]:RoomMember},
    viewerUser?:string,
    room:string, isRoomAdmin:boolean}) {
  const [displayed, setDisplayed] = useState(false);
  const [showBanned, setShowBanned] = useState(false);
  const [contextMenu, setContextMenu] = useState<{top:string, left:string, mate:string}|null>(null);
  const setError = useContext(MyErrorContext);
  const [banned] = useEvent<string[]|null>((set) => onValueDDBB(
    `rooms/${room}/banned`,
    (ban:null|{}) => set(ban && Object.keys(ban)),
    setError,
  ), [room]);
  const tipo = Object.values(members)[0]?.value?.split(' ')[1];
  const entriesMembers = Object.entries(members);
  entriesMembers.sort((a, b) => {
    const order = parseFloat(a[1].value ?? '0') - parseFloat(b[1].value ?? '0');
    return tipo === 'Fallos' ? order : -order;
  });
  const changeAdmin = async (member:string) => {
    if (window.confirm(`Está seguro de que quiere cambiar el administrador a ${member}`)) {
      await writeDDBB(`rooms/${room}/admin`, member);
      await sendAutoMsg(room, username, `${username} ha hecho administrador a ${member}`);
    }
    setContextMenu(null);
  };

  const deleteMember = async (member:string, force = false) => {
    if (force || window.confirm(`Está seguro de que quiere eliminar a ${member}`)) {
      await deleteDDBB(`rooms/${room}/members/${member}`);
      await sendAutoMsg(room, username, `${username} ha expulsado a ${member}`);
      addOne(`activeRooms/${room}/participants`, true);
    }
    setContextMenu(null);
  };

  const banMember = async (member:string) => {
    await writeDDBB(`rooms/${room}/banned/${member}`, true);
    if (member in members) await deleteMember(member, true);
  };

  const unbanMember = (member:string) => deleteDDBB(`rooms/${room}/banned/${member}`);

  const makeCurrObserved = async (
    member:string,
    user:string = username,
    overwrite:boolean = false,
  ) => {
    if (!members[user].isViewer && !overwrite) return;
    if (user === member) return;
    await writeDDBB(`rooms/${room}/members/${user}/viewing`, member);
    if (!overwrite) Toast.addMsg(`Observando a ${member}`, 3000);
  };

  const changeViewerState = async (member:string) => {
    const wasViewer = members[member]?.isViewer;
    await writeDDBB(`rooms/${room}/members/${member}/isViewer`, !wasViewer);
    if (!wasViewer) {
      makeCurrObserved(
        Object.entries(members)
          .filter(([x, v]) => x !== member && !v.isViewer)[0][0],
        member,
        true,
      );
    } else {
      deleteDDBB(`rooms/${room}/members/${member}/viewing`);
    }
  };

  useEffect(() => addCommands(
    members,
    username,
    isRoomAdmin,
    banned,
    makeCurrObserved,
    changeAdmin,
    deleteMember,
    changeViewerState,
    banMember,
    unbanMember,
  ));

  const handleContextMenu = (e:MouseEvent<HTMLLIElement>, member:string) => {
    if (!isRoomAdmin) return;
    // if (member === username) return;
    e.preventDefault();
    setContextMenu({
      top: `${e.clientY}px`,
      left: `${e.clientX}px`,
      mate: member,
    });
  };
  const { mate, ...styleContex } = contextMenu ?? {};
  const mateIsViewer = members[mate ?? '']?.isViewer;
  const contextMenuSetViewer = {
    text: `${mateIsViewer ? 'Revocar' : 'Hacer'} observador a ${mate}`,
    action: () => changeViewerState(mate ?? ''),
  };
  const contextMenuItems = mate === username ? []
    : [{ text: `Hacer a ${mate} administrador`, action: () => changeAdmin(mate ?? '') },
      { text: `Expulsar a ${mate} del grupo`, action: () => deleteMember(mate ?? '') },
      { text: `Bannear a ${mate} del grupo`, action: () => banMember(mate ?? '') },
    ];
  if (mateIsViewer || Object.values(members).filter((m) => !m.isViewer).length > 1) {
    contextMenuItems.push(contextMenuSetViewer);
  }
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
      {showBanned ? (
        <BannedList
          banned={banned}
          volverHaciaAtras={() => setShowBanned(false)}
          isRoomAdmin={isRoomAdmin}
          unban={unbanMember}
        />
      )
        : (
          <ParticipantesList
            entriesMembers={entriesMembers}
            handleContextMenu={handleContextMenu}
            isRoomAdmin={isRoomAdmin}
            makeCurrObserved={makeCurrObserved}
            tipo={tipo}
            username={username}
            viewerUser={viewerUser}
            showBanned={() => setShowBanned(true)}
          />
        )}
      {(contextMenu && mate && contextMenuItems.length > 0) && (
      <ContextMenu
        style={styleContex}
        items={contextMenuItems}
        setContextMenu={setContextMenu}
        classOfElem=".memberRoom"
      />
      ) }
    </div>
  );
}

RoomParticipants.defaultProps = {
  viewerUser: undefined,
};
