import React, {
  ChangeEvent, Dispatch, FormEvent, SetStateAction, useContext,
  useEffect, useMemo, useRef, useState,
} from 'react';
import { Editor as TinyEditor } from 'tinymce';
import { Editor } from '@tinymce/tinymce-react';
import editorSetUp from 'services/editorSetUp';
import UserContext from 'contexts/User';
import { useAsync } from 'hooks/general';
import { eventListenerSocket, getFromSocketUID, getSocket } from 'services/socket';
import GeneralContentLoader from 'components/GeneralContentLoader';
import { GroupNotif } from 'types/interfaces';
import { getGroupPos, getPossibilities } from 'services/notif';
import './Email.css';
import Button from 'components/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import Toast from 'services/toast';

interface EmailData{
  groups?:string[],
  emails?:string[],
  users?:string[],
  subject?:string,
  html?:string
}
function EmailBody({ emailData, setVal }:{
  emailData: EmailData, setVal: Dispatch<SetStateAction<EmailData|null>>}) {
  const { html: value = '' } = emailData;
  const user = useContext(UserContext)!;
  const handleChange = (e:string) => {
    getFromSocketUID('notification:saveEmail', { ...emailData, html: e });
    setVal((curr) => ({ ...curr, html: e }));
  };
  return (
    <Editor
      apiKey="m6t3xlqm61ck0rs6rwpjljwyy23zyz0neghtxujisl42v67b"
      value={value}
      onEditorChange={handleChange}
      init={{
        min_height: 200,
        resize: false,
        menubar: false,
        plugins: [
          'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
          'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
          'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount',
        ],
        toolbar: 'undo redo | superscript subscript | insertArrow insertDoubleArrow |'
        + 'bold italic underline | alignleft aligncenter '
        + 'alignright alignjustify | bullist numlist outdent indent | '
        + 'removeformat | blocks | help',
        content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
        content_langs: [
          { title: 'Spanish', code: 'es' },
        ],
        skin: user.userDDBB.mode === 'dark' ? 'oxide-dark' : 'oxide',
        setup: (editor:TinyEditor) => {
          editorSetUp(editor);
        },
        help_tabs: ['shortcuts',
          'keyboardnav'],
      }}
    />
  );
}

function Subject({ emailData, setVal }:
  {emailData:EmailData, setVal: Dispatch<SetStateAction<EmailData|null>>}) {
  const { subject: value = '' } = emailData;
  const handleChange = (e:ChangeEvent<HTMLInputElement>) => {
    getFromSocketUID('notification:saveEmail', { ...emailData, subject: e.target.value });
    setVal((curr) => ({ ...curr, subject: e.target.value }));
  };
  return <input className="inputEmail" value={value} onChange={handleChange} />;
}

function GroupsToEmail({
  emailData, setEmailVals, groupDict,
}:
   {emailData:EmailData,
    groupDict:{[k:string]:GroupNotif},
     setEmailVals: Dispatch<SetStateAction<EmailData|null>>}) {
  const { groups } = emailData;
  if (!groups) return null;

  const removeGroup = (id:string) => {
    const newGroups = groups.filter((x) => x !== id);
    getFromSocketUID('notification:saveEmail', { ...emailData, groups: newGroups });
    setEmailVals({ ...emailData, groups: newGroups });
  };

  return (
    <ul className="unlisted emailToList">
      {groups.map((id) => {
        const group = groupDict[id];
        if (!group) return null;
        return (
          <li key={group.id}>
            {group.name}
            <ul className="tooltipEmailGroup">
              {group.people.map(({ email, uid, completeName }) => (
                <li key={uid}>
                  {completeName ? `${completeName} (${email})` : email}
                </li>
              ))}
              {group.people.length === 0 && (
              <li>
                <em>No hay miembros en este grupo.</em>
              </li>
              )}

            </ul>
            <Button className="deleteItemToList" onClick={() => removeGroup(id)}>
              <FontAwesomeIcon icon={faTrash} />
            </Button>
          </li>
        );
      })}
    </ul>
  );
}

function UsersToEmail({ emailData, setEmailVals, usersDict }:
  {emailData:EmailData,
    setEmailVals: Dispatch<SetStateAction<EmailData|null>>,
  usersDict:{[k:string]:GroupNotif['people'][number]}}) {
  const { users } = emailData;
  if (!users) return null;

  const removeUser = (id:string) => {
    const newUsers = users.filter((x) => x !== id);
    getFromSocketUID('notification:saveEmail', { ...emailData, users: newUsers });
    setEmailVals({ ...emailData, users: newUsers });
  };

  return (
    <ul className="unlisted emailToList emailToUser">
      {users.map((id) => {
        const person = usersDict[id];
        if (!person) return null;
        return (
          <li key={person.uid}>
            {person.completeName}
            <div className="tooltipEmailUser">{person.email}</div>
            <Button className="deleteItemToList" onClick={() => removeUser(id)}>
              <FontAwesomeIcon icon={faTrash} />
            </Button>
          </li>
        );
      })}
    </ul>
  );
}

function EmailsToEmail({ emailData, setEmailVals }:
  {emailData:EmailData,
    setEmailVals: Dispatch<SetStateAction<EmailData|null>>}) {
  const { emails } = emailData;
  if (!emails) return null;

  const removeEmail = (email:string) => {
    const newEmails = emails.filter((x) => x !== email);
    getFromSocketUID('notification:saveEmail', { ...emailData, emails: newEmails });
    setEmailVals({ ...emailData, emails: newEmails });
  };

  return (
    <ul className="unlisted emailToList emailToEmail">
      {emails.map((email) => (
        <li key={email}>
          {email}
          <Button className="deleteItemToList" onClick={() => removeEmail(email)}>
            <FontAwesomeIcon icon={faTrash} />
          </Button>
        </li>
      ))}
    </ul>
  );
}

function ToForm({ allGroups, emailData, setEmailVals }:
  {emailData:EmailData, allGroups:GroupNotif[],
     setEmailVals: Dispatch<SetStateAction<EmailData|null>>}) {
  const [val, setVal] = useState('');
  const [active, setActive] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  const alreadyInGroup = useMemo(() => {
    const dict:{[k:string]:true} = {};
    emailData.emails?.forEach((x) => { dict[x] = true; });
    emailData.users?.forEach((x) => { dict[x] = true; });
    return dict;
  }, [emailData.emails, emailData.users]);
  const trimmed = val.trim();

  const possibGroups = useMemo(
    () => getGroupPos(allGroups, emailData.groups ?? [], trimmed),
    [emailData.groups, trimmed],
  );

  const possibEmailUser = useMemo(
    () => getPossibilities(allGroups[0], alreadyInGroup, trimmed),
    [emailData.emails, emailData.users, trimmed],
  );
  useEffect(() => {
    const cb1 = () => setActive(true);
    const cb2 = (e:FocusEvent) => {
      if (!(e.relatedTarget as HTMLElement)?.closest('.possForToEmail button')) {
        setActive(false);
      }
    };
    ref.current?.addEventListener('focus', cb1);
    ref.current?.addEventListener('blur', cb2);
    return () => {
      ref.current?.removeEventListener('focus', cb1);
      ref.current?.removeEventListener('blur', cb2);
    };
  }, [ref.current]);

  const saveData = (prop: keyof EmailData, value:string) => {
    const newData:EmailData = {
      ...emailData,
      [prop]: emailData[prop] ? [...(emailData[prop] as string[]), value] : [value],
    };
    getFromSocketUID('notification:saveEmail', newData);
    setEmailVals(newData);
    setVal('');
    ref.current?.focus();
  };

  const handleSubmit = (e:FormEvent) => {
    e.preventDefault();
    if (trimmed === '') return;
    const groupPos = getGroupPos(allGroups, emailData.groups ?? [], trimmed);
    if (groupPos.length > 0) {
      saveData('groups', groupPos[0]?.id);
      return;
    }
    const possibilities = getPossibilities(allGroups[0], alreadyInGroup, trimmed);
    if (!possibilities) return;
    if (typeof possibilities === 'boolean') {
      saveData('emails', trimmed);
      return;
    }
    const [user] = possibilities;
    saveData('users', user.uid);
  };
  return (
    <form onSubmit={handleSubmit}>
      <input ref={ref} className="inputEmail" value={val} onChange={(e) => setVal(e.target.value)} />
      <div className="formForPossibilities">
        {active && trimmed && (
          !possibEmailUser && possibGroups.length === 0
            ? <div className="emailNotValidEmail possForToEmail">Email no válido</div>
            : (
              <ul className="unlisted possForToEmail">
                {possibGroups.map((x) => (
                  <li key={x.id} className="possGroupForToEmail">
                    <Button onClick={() => saveData('groups', x.id)}>
                      {x.name}
                    </Button>
                  </li>
                ))}
                {typeof possibEmailUser === 'boolean' || possibEmailUser.map((x) => (
                  <li key={x.uid} className="possUserForToEmail">
                    <Button onClick={() => saveData('users', x.uid)}>
                      {x.completeName}
                      {' '}
                      (
                      {x.email}
                      )
                    </Button>
                  </li>
                ))}
              </ul>
            )
        )}
      </div>
    </form>
  );
}

export default function Email({ groups }:{groups:GroupNotif[]}) {
  const [emailData, setEmailData] = useAsync<EmailData|null>(() => getFromSocketUID('notification:getStoredEmail'));
  const [allUsers] = groups;
  const usersDict = useMemo(() => {
    const dict:{[k:string]:GroupNotif['people'][number]} = {};
    allUsers.people.forEach((user) => { dict[user.uid] = user; });
    return dict;
  }, [allUsers]);

  const groupDict = useMemo(() => {
    const dict:{[k:string]:GroupNotif} = {};
    groups.forEach((group) => { dict[group.id] = group; });
    return dict;
  }, [groups]);
  const user = useContext(UserContext)!;
  const { id } = getSocket();
  useEffect(() => {
    if (!emailData) return undefined;
    const off = eventListenerSocket(`notifications:${user.uid}:email`, (sockId:string, data) => {
      if (id !== sockId) setEmailData(data);
    });
    return () => { off(); };
  }, [emailData === null]);

  if (!emailData) return <GeneralContentLoader />;
  const sendEmail = () => {
    const {
      emails, groups: grps, html, subject, users,
    } = emailData;
    const allEmails = Array.from(new Set([
      emails ?? [],
      grps?.flatMap((grp) => groupDict[grp]?.people?.map((x) => x.email) ?? []) ?? [],
      users?.map((usr) => usersDict[usr]?.email ?? undefined) ?? [],
    ].flat(1)));
    if (allEmails.length === 0) {
      Toast.addMsg('Añade al menos un destinatario');
      return;
    }
    if (!subject) {
      Toast.addMsg('Añade un asunto');
      return;
    }
    if (!html || html === '<p></p>') {
      Toast.addMsg('Añade un cuerpo al mensaje');
      return;
    }
    getFromSocketUID('notification:sendEmail', allEmails, subject, html);
    getFromSocketUID('notification:saveEmail', {});
    setEmailData({});
  };
  return (
    <div className="emailContent">
      <h4 className="titleEmail">Para (cco)</h4>
      <GroupsToEmail groupDict={groupDict} emailData={emailData} setEmailVals={setEmailData} />
      <UsersToEmail usersDict={usersDict} emailData={emailData} setEmailVals={setEmailData} />
      <EmailsToEmail emailData={emailData} setEmailVals={setEmailData} />
      <div>
        <em className="infoEmail">Escribe el nombre del grupo, del usuario o el email al que quieras enviar el correo</em>
        <ToForm allGroups={groups} emailData={emailData} setEmailVals={setEmailData} />
      </div>
      <h4 className="titleEmail">Asunto</h4>
      <Subject emailData={emailData} setVal={setEmailData} />
      <h4 className="titleEmail">Cuerpo</h4>
      <EmailBody emailData={emailData} setVal={setEmailData} />
      <Button className="sendButton" onClick={sendEmail}>Enviar</Button>
    </div>
  );
}
