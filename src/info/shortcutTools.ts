import { MyUser, Shortcut } from 'types/interfaces';

let user:MyUser;

export const setUser = (usuario:MyUser) => {
  user = usuario;
};

export const getUser = () => user;

export const getShortCut = (shortcutObj:Shortcut) => {
  let result:string|null|undefined = localStorage.getItem(`shortcut-${shortcutObj.id}`);
  if (user) result = user.userDDBB.shortcuts?.[shortcutObj.id];
  if (result) return result;
  return shortcutObj.default;
};

export const updateLocalShortCuts = (shortcuts:Shortcut[]) => {
  shortcuts.forEach((x) => {
    if (x.shortcut) localStorage.setItem(`shortcut-${x.id}`, x.shortcut);
  });
};
