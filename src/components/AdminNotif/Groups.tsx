import { faChevronRight, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from 'components/Button';
import ContextMenu from 'components/ContextMenu';

import React, {
  Dispatch, FormEvent, MouseEvent, SetStateAction, useMemo, useState, useRef, useEffect,
} from 'react';
import { getPossibilities } from 'services/notif';
import { getFromSocketUID } from 'services/socket';
import Toast from 'services/toast';
import { GroupNotif } from 'types/interfaces';
import './Groups.css';

type SetGroups = Dispatch<SetStateAction<GroupNotif[]|null>>

function AddForm({ group, setGroups, allUsers }:
  {group: GroupNotif, setGroups:SetGroups, allUsers: GroupNotif}) {
  const [value, setValue] = useState('');
  const [block, setBlock] = useState(false);
  const [possVis, setPossVis] = useState(true);
  const ref = useRef<HTMLInputElement>(null);
  const { disabled, id, people } = group;
  const peopleInGroup = useMemo(() => {
    const dict:{[k:string]:true} = {};
    people.forEach((x) => { dict[x.completeName ? x.uid : x.email] = true; });
    return dict;
  }, [people]);
  const trimmed = value.trim();

  const possibilities = useMemo(
    () => getPossibilities(allUsers, peopleInGroup, trimmed),
    [allUsers, peopleInGroup, trimmed],
  );

  useEffect(() => {
    const cb1 = () => setPossVis(true);
    const cb2 = (e:FocusEvent) => {
      if (!(e.relatedTarget as HTMLElement)?.closest('.possListNotif button')) {
        setPossVis(false);
      }
    };
    ref.current?.addEventListener('focus', cb1);
    ref.current?.addEventListener('blur', cb2);
    return () => {
      ref.current?.removeEventListener('focus', cb1);
      ref.current?.removeEventListener('blur', cb2);
    };
  }, [ref.current]);

  const addMember = async (email:string, uid?:string, completeName?:string) => {
    if (disabled) return undefined;
    setBlock(true);
    const res = await getFromSocketUID(
      'notification:addPersonToGroup',
      id,
      completeName === undefined ? email : uid,
      completeName === undefined,
    );
    if (!res) return Toast.addMsg('No se ha podido añadir el miembro al grupo');
    setGroups((currGrps) => {
      const deepCopy:GroupNotif[]| null = JSON.parse(JSON.stringify(currGrps));
      const thisGroup = deepCopy?.find((x) => x.id === id);
      if (!thisGroup) return deepCopy;
      thisGroup.people.push({
        email,
        completeName,
        uid: completeName === undefined ? res : uid,
      });
      return deepCopy;
    });
    return setBlock(false);
  };

  const handleAddForm = (e:FormEvent) => {
    e.preventDefault();
    if (trimmed === '' || block) return undefined;
    const pos = getPossibilities(allUsers, peopleInGroup, trimmed);
    if (!pos) return Toast.addMsg('No se ha encontrado ningún usuario con el nombre o el email indicado. El email tampoco es válido');
    setValue('');
    if (typeof pos === 'boolean') return addMember(trimmed);
    const [firstPos] = pos;
    return addMember(firstPos.email, firstPos.uid, firstPos.completeName);
  };
  return (
    <form onSubmit={handleAddForm} className="formAddMemberNotif">
      {possibilities
        ? (typeof possibilities !== 'boolean' && trimmed !== '' && possVis && (
          <ul className="unlisted absoluteFormAddMember possListNotif">
            {possibilities.map(({ email, uid, completeName }) => (
              <li key={uid}>
                <Button onClick={async () => {
                  setValue('');
                  await addMember(email, uid, completeName);
                  ref.current?.focus();
                }}
                >
                  {completeName ? `${completeName} (${email})` : email}
                </Button>
              </li>
            ))}
          </ul>
        ))
        : trimmed === '' || !possVis || <div className="emailNotValidGroup absoluteFormAddMember">Email no válido</div>}
      <input
        ref={ref}
        value={value}
        placeholder="Nuevo miembro o email"
        onChange={(e) => setValue(e.target.value)}
      />
    </form>
  );
}

function RenameForm({
  initialValue, group, groups, setGroupToRename, setGroups,
}:
  {initialValue:string,
    group:GroupNotif,
    groups:GroupNotif[],
    setGroups: SetGroups
  setGroupToRename: Dispatch<SetStateAction<string|null>>}) {
  const [val, setVal] = useState(initialValue);
  const ref = useRef<HTMLInputElement>(null);
  const handleForm = async (e:FormEvent) => {
    e.preventDefault();
    const trimmed = val.trim();
    if (trimmed === '') return undefined;
    if (group.name === trimmed) return setGroupToRename(null);
    if (!groups?.every((x) => trimmed !== x.name)) {
      return Toast.addMsg('Ese nombre ya está en uso');
    }
    const done = await getFromSocketUID('notification:renameGroup', group.id, trimmed);
    if (!done) return Toast.addMsg('No se ha podido renombrar el grupo');
    setGroupToRename(null);
    return setGroups((currGrps) => {
      if (!currGrps) return currGrps;
      const thisGroup = currGrps.find((x) => x.id === group.id);
      if (!thisGroup) return currGrps;
      thisGroup.name = trimmed;
      return currGrps;
    });
  };
  useEffect(() => ref.current?.focus(), [ref.current]);
  return (
    <form className="formRenameGroup" onSubmit={handleForm}>
      <input
        ref={ref}
        value={val}
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => setVal(e.target.value)}
      />
    </form>
  );
}

function Group({
  group, setGroups, allUsers, groupToRename, setGroupToRename, groups,
}:
    {group: GroupNotif, setGroups:SetGroups, allUsers: GroupNotif,
      groups:GroupNotif[],
    setGroupToRename: Dispatch<SetStateAction<string|null>>, groupToRename:string|null}) {
  const [visible, setVisible] = useState(false);
  const {
    name, people, disabled, id,
  } = group;

  useMemo(() => people.sort((a, b) => {
    if (a.completeName === undefined && b.completeName === undefined) {
      return a.email?.localeCompare(b.email);
    }
    if (a.completeName === undefined) return 1;
    if (b.completeName === undefined) return -1;
    return a.completeName.localeCompare(b.completeName);
  }), [people]);

  const handleClick = () => setVisible(!visible);

  const deleteMember = async (uid:string) => {
    if (disabled) return undefined;
    const res = await getFromSocketUID('notification:removePersonFromGroup', id, uid);
    if (!res) return Toast.addMsg('No se ha podido eliminar al miembro grupo');
    return setGroups((currGrps) => {
      const deepCopy:GroupNotif[]| null = JSON.parse(JSON.stringify(currGrps));
      const thisGroup = deepCopy?.find((x) => x.id === id);
      if (!thisGroup) return deepCopy;
      thisGroup.people = thisGroup.people.filter((x) => x.uid !== uid);
      return deepCopy;
    });
  };

  return (
    <>
      <div className="headContentGroup">
        <Button
          onKeyUp={(e:KeyboardEvent) => groupToRename === id && e.preventDefault()}
          onClick={handleClick}
        >
          <h3>
            <FontAwesomeIcon className={`iconGroups ${visible ? 'visibleIcon' : ''}`} icon={faChevronRight} />
            { groupToRename === id
              ? (
                <RenameForm
                  initialValue={name}
                  group={group}
                  groups={groups}
                  setGroupToRename={setGroupToRename}
                  setGroups={setGroups}
                />
              )
              : <span>{name}</span>}
          </h3>
        </Button>
      </div>

      <ul className={`groupList ${visible ? 'visibleList' : ''}`}>
        {disabled || (
        <li
          className="listItemForm"
        >
          <AddForm allUsers={allUsers} group={group} setGroups={setGroups} />
        </li>
        )}
        {people.map(({ uid, completeName, email }) => (
          <li key={uid}>
            <div>
              {completeName ? `${completeName} (${email})` : email}
              {disabled || (
              <Button
                className="deleteMemberNotif"
                title="Eliminar del grupo"
                onClick={() => deleteMember(uid)}
              >
                <FontAwesomeIcon icon={faTrash} />
              </Button>
              )}
            </div>
          </li>
        ))}
        {people.length === 0 && (
          <li><em>No hay miembros en este grupo</em></li>
        )}
      </ul>

    </>
  );
}

function CrearGrupo({ groups, setGroups }: {groups:GroupNotif[], setGroups: SetGroups}) {
  const [val, setVal] = useState('');
  const handleSubmit = async (e:FormEvent) => {
    e.preventDefault();
    const trimmed = val.trim();
    if (trimmed === '') return undefined;
    if (!groups?.every((x) => trimmed !== x.name)) {
      return Toast.addMsg('Ese nombre ya está en uso');
    }
    const key = await getFromSocketUID('notification:createGroup', trimmed);
    if (!key) return Toast.addMsg('No se ha podido crear el grupo');
    setVal('');
    return setGroups((currGrps) => (currGrps && [...currGrps, { id: key, name: val, people: [] }]));
  };
  return (
    <form onSubmit={handleSubmit} className="createGroupNotif">
      <input
        placeholder="Nuevo grupo"
        value={val}
        onChange={(e) => setVal(e.target.value)}
      />
      <Button type="submit">
        <FontAwesomeIcon icon={faPlus} />
      </Button>
    </form>
  );
}

export default function GroupsNotification({
  groups, setGroups,
}:{groups:GroupNotif[],
   setGroups:SetGroups}) {
  const [contextMenu, setContextMenu] = useState<{top:string, left:string}|null>(null);
  const [contextItems, setContextItems] = useState<{
    text: string; action:()=> any;
      }[]|null>(null);
  const [groupToRename, setGroupToRename] = useState<string|null>(null);

  const deleteGroup = async (group:GroupNotif) => {
    const { disabled, id } = group;
    if (disabled) return undefined;
    const res = await getFromSocketUID('notification:deleteGroup', id);
    if (!res) return Toast.addMsg('No se ha podido eliminar el grupo');
    return setGroups((currGrps) => currGrps?.filter((x) => x.id !== id) ?? null);
  };

  const createCopy = async (group:GroupNotif) => {
    const { name, people } = group;
    const newName = `${name} (copia - ${Date.now()})`;
    const id = await getFromSocketUID(
      'notification:copyGroup',
      newName,
      Object.fromEntries(people.map((x) => [x.uid, x.completeName ? true : x.email])),
    );
    if (!id) return Toast.addMsg('No se ha podido crear una copia del grupo');
    return setGroups((currGrps) => (currGrps && [...currGrps, {
      id,
      name: newName,
      people: JSON.parse(JSON.stringify(people)),
    }]));
  };

  const handleContextMenu = (e:MouseEvent<HTMLLIElement>, group:GroupNotif) => {
    e.preventDefault();
    setContextMenu({
      top: `${e.clientY}px`,
      left: `${e.clientX}px`,
    });
    setContextItems([{ action: () => createCopy(group), text: `Crear copia de ${group.name}` },
      ...(group.disabled ? []
        : [
          { action: () => deleteGroup(group), text: `Eliminar ${group.name}` },
          { action: () => setGroupToRename(group.id), text: `Cambiar nombre de ${group.name}` },
        ]
      ),

    ]);
  };
  const [allUsers] = groups;
  return (
    <div className="groupsMainContent">
      <CrearGrupo groups={groups} setGroups={setGroups} />
      <ul className="unlisted">
        {groups.map((group) => (
          <li key={group.id} className="groupNotif" onContextMenu={(e) => handleContextMenu(e, group)}>
            <Group
              groupToRename={groupToRename}
              groups={groups}
              setGroupToRename={setGroupToRename}
              group={group}
              setGroups={setGroups}
              allUsers={allUsers}
            />
          </li>
        ))}
      </ul>
      {contextMenu && contextItems && (
      <ContextMenu
        style={contextMenu}
        items={contextItems}
        setContextMenu={setContextMenu}
        classOfElem=".groupNotif"
      />
      ) }
    </div>
  );
}
