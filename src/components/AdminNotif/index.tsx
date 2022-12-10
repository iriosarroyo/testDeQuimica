import GeneralContentLoader from 'components/GeneralContentLoader';
import { useAsync } from 'hooks/general';
import React from 'react';
import { NavLink, Route, Routes } from 'react-router-dom';
import { getFromSocketUID } from 'services/socket';
import { GroupNotif } from 'types/interfaces';
import { faPaperPlane, faPeopleGroup } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Email from './Email';
import GroupsNotification from './Groups';
import './AdminNotif.css';

export default function AdminNotif() {
  const [groups, setGroups] = useAsync<GroupNotif[]|null>(() => getFromSocketUID('notification:getAllGroups'));

  if (!groups) return <GeneralContentLoader />;

  return (
    <div className="adminNotifContainer">

      <ul className="unlisted menuNotificaciones">
        <li>
          <NavLink to="grupos">
            <FontAwesomeIcon icon={faPeopleGroup} />
            <span>Grupos</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="email">
            <FontAwesomeIcon icon={faPaperPlane} />
            <span>Email</span>
          </NavLink>
        </li>
      </ul>
      <div className="adminNotifContent">
        <Routes>

          <Route element={<Email groups={groups} />} path="/email" />
          <Route element={<GroupsNotification groups={groups} setGroups={setGroups} />} path="/grupos" />
        </Routes>
      </div>
    </div>
  );
}
