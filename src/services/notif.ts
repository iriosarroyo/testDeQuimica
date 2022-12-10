import { GroupNotif } from 'types/interfaces';

const TILDE_CONVERSION = {
  a: 'á',
  e: 'é',
  i: 'í',
  o: 'ó',
  u: 'ú|ü',
  n: 'ñ',
};

const isValidEmail = (email:string) => {
  const EMAIL_REGEX = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return EMAIL_REGEX.test(email);
};

const getRegex = (str:string) => {
  try {
    return new RegExp(
      str
        .replace(/[aeioun]/gi, (x) => `(?:${x}|${TILDE_CONVERSION[x.toLowerCase() as keyof typeof TILDE_CONVERSION]})`),
      'i',
    );
  } catch {
    return /.+/i;
  }
};

// If there're no possibilities returns true if email is valid and false if not
export const getPossibilities = (
  allUsers:GroupNotif,
  alreadyInGroup: {[k:string]:true},
  str:string,
) => {
  const regex = getRegex(str);
  const { people } = allUsers;
  const validPeople = people.filter(({ uid, completeName, email }) => (
    !(uid in alreadyInGroup) && !(email in alreadyInGroup)
      && (regex.test(email) || (completeName && regex.test(completeName)))));
  if (validPeople.length > 0) return validPeople;
  return isValidEmail(str) && !(str in alreadyInGroup);
};

export const getGroupPos = (groups:GroupNotif[], alreadySelected:string[], str:string) => {
  const regex = getRegex(str);
  const alreadySelectedSet = new Set(alreadySelected);
  return groups.filter((x) => !alreadySelectedSet.has(x.id) && x.name.match(regex));
};
