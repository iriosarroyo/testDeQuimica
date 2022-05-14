import React from 'react';
import { RoomMember } from 'types/interfaces';

export default function RoomParticipants({ members, username }:
    {username:string, members:{[key:string]:RoomMember}}) {
  return (
    <div>
      <details>
        <summary>Participantes</summary>
        <ul>
          {Object.entries(members).map(([key, member]) => (
            <li key={key}>
              <span>
                {key === username ? 'Tú' : key}
                :
                {' '}
              </span>
              <span>{member.ready ? 'Listo' : 'No listo'}</span>
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}
