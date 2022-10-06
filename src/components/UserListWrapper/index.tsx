import {
  faAngleDoubleLeft, faAngleDoubleRight, faArrowDownAZ, faArrowUpAZ, faUser,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import GeneralContentLoader from 'components/GeneralContentLoader';
import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { eventListUsers, getFromSocketUID } from 'services/socket';
import { date2String } from 'services/time';
import { UserDDBBAdmin, UserForAdmin } from 'types/interfaces';
import general from 'info/general.json';
import Button from 'components/Button';
import { isKeyOfObj } from 'services/toolsForData';
import SearchCmd from 'services/commands';
import { initialUserListValue, LOCAL_USER } from 'services/menus';
import './UserListWrapper.css';

  type UsersObj = {[k:string]:UserForAdmin|undefined}

const sorterGen = (param:keyof UserDDBBAdmin, type:'string'|'number') => (a:string, b:string, u:UsersObj, reverse = false) => {
  const defaultVal = type === 'string' ? '' : 0;
  const firstElem = reverse ? b : a;
  const secondElem = reverse ? a : b;
  const val1 = u[firstElem]?.userDDBB[param] ?? defaultVal;
  const val2 = u[secondElem]?.userDDBB[param] ?? defaultVal;
  if (typeof val1 === 'string' && typeof val2 === 'string') return val1.localeCompare(val2);
  if (typeof val1 === 'number' && typeof val2 === 'number') return val2 - val1;
  if (val1 === undefined) return -1;
  return 1;
};
const DEFAULT_CURSO = { year: 'unknown', group: 'Z' };
const SORTERS = {
  name: sorterGen('name', 'string'),
  surname: sorterGen('surname', 'string'),
  lastConnection: sorterGen('lastConnection', 'number'),
  lastTest: sorterGen('lastTest', 'number'),
  year: (a:string, b:string, u:UsersObj, reverse = false) => {
    const firstElem = reverse ? b : a;
    const secondElem = reverse ? a : b;
    const { group: g1, year: y1 } = u[firstElem]?.userDDBB ?? DEFAULT_CURSO;
    const { group: g2, year: y2 } = u[secondElem]?.userDDBB ?? DEFAULT_CURSO;
    if (y1 === y2) return g1.localeCompare(g2);
    if (isKeyOfObj(y1, general.cursosOrder) && isKeyOfObj(y2, general.cursosOrder)) {
      return general.cursosOrder[y1] - general.cursosOrder[y2];
    }
    return 1;
  },
};
const SORTERS_TRANSLATION = {
  name: 'Nombre',
  surname: 'Apellidos',
  lastConnection: 'Última conexión',
  lastTest: 'Último test',
  year: 'Curso',
};
  type SorterKey = keyof typeof SORTERS;
  type SortArray = [SorterKey, boolean];

function ProfilePerfilesAdmin({ user, isActive }:{user:UserForAdmin, isActive:boolean}) {
  const curso = useMemo(
    () => general.cursos
      .find((c) => c.value === user.userDDBB.year)?.short ?? 'Sin curso',
    [user.userDDBB.year],
  );
  const completeName = `${user.userDDBB.name} ${user.userDDBB.surname}`;
  return (
    <div className={`profilePerfilAdmin ${isActive ? 'active' : ''}`}>
      <div className={`imgProfileAdmin ${user.userDDBB.connected ? 'enlinea' : ''}`}>
        <div className="overflowHiddenPerfilAdmin" title={completeName}>
          {
                      user.photoURL === null
                        ? <FontAwesomeIcon icon={faUser} />
                        : <img src={user.photoURL} alt={`Foto ${user.displayName}`} />
                      }
        </div>
      </div>
      <div className="textContainerPerfilAdmin">
        <strong>{completeName}</strong>
        <div className="userStateProfile">
          {user.userDDBB.connected
            ? 'En línea'
            : date2String(user.userDDBB.lastConnection, { month: '2-digit', year: '2-digit' })}
        </div>
        <div className="cursoProfileAdmin">
          {`${curso} ${user.userDDBB.group}`}
        </div>
      </div>
    </div>
  );
}

function UserList({
  users, activeUsers, activeUid, setVisible, visible, sorter, setSorter, path, defaultText,
}:{
      activeUsers: string[],
      users: UsersObj,
      activeUid:string|undefined,
      setVisible:() => any,
      visible: boolean,
      sorter: SortArray,
      setSorter: React.Dispatch<React.SetStateAction<SortArray>>,
      path:string,
      defaultText:string|undefined
  }) {
  const [sortBy, reverse] = sorter;
  return (
    <ul className="unlisted userListAdmin">
      <li className="buttonHideContainer">
        <Button className="buttonHideShow" onClick={setVisible}>
          <FontAwesomeIcon icon={visible ? faAngleDoubleRight : faAngleDoubleLeft} />
        </Button>
        <Button
          className="buttonSort"
          onClick={() => setSorter(([sort, rev]) => {
            const keys = Object.keys(SORTERS) as SorterKey[];
            const newIdx = (keys.indexOf(sort) + 1) % keys.length;
            return [keys[newIdx], rev];
          })}
        >
          {SORTERS_TRANSLATION[sortBy]}
        </Button>
        <Button className="buttonReverse" onClick={() => setSorter(([sort, rev]) => ([sort, !rev]))}>
          <FontAwesomeIcon icon={reverse ? faArrowUpAZ : faArrowDownAZ} />
        </Button>
      </li>
      {!!defaultText && (
      <li title={defaultText}>
        <Link className="linkToProfile" to={path}>
          <h4 className={!activeUid ? 'active' : ''}>{defaultText}</h4>
        </Link>
      </li>
      )}
      {activeUsers.map((uid) => {
        const thisUser = users[uid];
        if (thisUser === undefined) return null;
        return (
          <li key={uid}>
            <Link className="linkToProfile" to={`${path}/${uid}`}>
              <ProfilePerfilesAdmin user={thisUser} isActive={activeUid === uid} />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

const setDataOfUser = (uid:string|undefined, val:string|boolean, path:string)
  :Promise<Error|undefined> => {
  if (uid === undefined) return Promise.resolve(new Error('Uid no definido'));
  return getFromSocketUID('users:editData', uid, val, path);
};

const getUsersUids = (u:UsersObj, sortBy:SorterKey, filter:string[], reverse = false) => {
  const uidList = Object.keys(u);
  const sortFn = (a:string, b:string) => SORTERS[sortBy](a, b, u, reverse);
  uidList.sort(sortFn);
  return uidList.filter((elem) => filter.includes(elem));
};

export default function UserListWrapper({ Child, path, defaultText }
  :{Child:React.ElementType, path:string, defaultText?:string}) {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UsersObj>({});
  const [activeUids, setActiveUids] = useState<string[]>([]);
  let currentUid = useParams()['*'];
  const [visible, setVisible] = useState(initialUserListValue);
  const [sorter, setSorter] = useState<[keyof typeof SORTERS, boolean]>(['name', false]);
  useEffect(() => {
    const [sortBy, reverse] = sorter;
    const usersUids = getUsersUids(users, sortBy, activeUids, reverse);
    setActiveUids(usersUids);
  }, [sorter, users]);

  useEffect(
    () => setActiveUids(getUsersUids(users, sorter[0], Object.keys(users), sorter[1])),
    [loading],
  );

  useEffect(() => SearchCmd.onCustomSearch(
    users,
    ['name', 'surname', 'year', 'group', 'username'],
    (val) => setActiveUids(getUsersUids(users, sorter[0], val, sorter[1])),
    'userDDBB',
  ), [users, sorter]);
  // we want to get also the empty strings
  if (!currentUid && !defaultText) [currentUid] = activeUids;
  const currentUser = users[currentUid ?? ''];

  useEffect(() => eventListUsers((u:UsersObj) => {
    setUsers(u);
    setLoading(false);
  }), []);

  if (loading) return <GeneralContentLoader />;
  return (
    <div className={`perfilesAdmin ${visible ? '' : 'listaNoDesplegada'}`}>
      { currentUser === undefined && !defaultText
        ? <div>No se ha encontrado ningún usuario con ese id.</div>
        : (
          <div>
            <Child
              user={currentUser}
              uid={currentUid}
              isAdmin
              setFn={(
                val:string|boolean,
                dataPath:string,
              ) => setDataOfUser(currentUid, val, dataPath)}
            />
          </div>
        )}
      <UserList
        defaultText={defaultText}
        path={path}
        activeUsers={activeUids}
        users={users}
        activeUid={currentUid}
        setVisible={() => setVisible((val) => {
          localStorage.setItem(LOCAL_USER, `${val}`); // Goes the other way around
          return !val;
        })}
        visible={visible}
        setSorter={setSorter}
        sorter={sorter}
      />
    </div>
  );
}
UserListWrapper.defaultProps = {
  defaultText: undefined,
};
