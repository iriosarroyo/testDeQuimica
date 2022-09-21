export const LOCAL_NAV = 'TestDeQuimica_NavContract';
export const LOCAL_USER = 'TestDeQuimica_UserList';
const localNavValue = localStorage.getItem(LOCAL_NAV);
const localUserListValue = localStorage.getItem(LOCAL_USER);
const getInitialValue = (localValue: null| string) => {
  const NAV_CONTRACT_DEFAULT = window.innerWidth <= 500;
  return localValue === null ? NAV_CONTRACT_DEFAULT : localValue === 'true';
};
export const initialNavValue = getInitialValue(localNavValue);
export const initialUserListValue = !getInitialValue(localUserListValue);
