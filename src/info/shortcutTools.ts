import { MyUser, Shortcut } from 'types/interfaces';

let user:MyUser;

export const setUser = (usuario:MyUser) => {
  user = usuario;
};

export const getShortCut = (shortcutObj:Shortcut) => {
  let result = localStorage.getItem(`shortcut-${shortcutObj.id}`);
  if (user) result = user.userDDBB.shortcuts?.[shortcutObj.id];
  if (result) return result;
  return shortcutObj.default;
};

export const updateLocalShortCuts = (shortcuts:Shortcut[]) => {
  shortcuts.forEach((x) => {
    localStorage.setItem(`shortcut-${x.id}`, x.shortcut);
  });
};