export const time2String = (ms:number, show:'hours'|'seconds'|'minutes') => {
  let time = ms < 0 ? 0 : ms;
  time /= 1000;
  const seg = Math.trunc(time % 60);
  time -= time % 60;
  const min = Math.trunc((time / 60) % 60);
  time -= (time / 60) % 60;
  time /= 60;
  const hora = Math.trunc(time / 60);
  const horaStr = hora < 10 ? `0${hora}` : hora;
  const minStr = min < 10 ? `0${min}` : min;
  const segStr = seg < 10 ? `0${seg}` : seg;
  let timeStr:string = '';
  if (show === 'hours') timeStr = `${horaStr}:${minStr}:${segStr}`;
  if (show === 'minutes') timeStr = `${minStr}:${segStr}`;
  if (show === 'seconds') timeStr = `${segStr}`;
  return [timeStr, `PT${horaStr}H${minStr}M${segStr}S`];
};
export const date2String = (time:Date|number|undefined, opts?:Intl.DateTimeFormatOptions) => {
  if (time === undefined) return 'Nunca';
  const options:Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    ...(opts ?? {}),
  };
  return new Date(time).toLocaleDateString('es-ES', options);
};

const HRS_TO_MS = 3600 * 1000;
const DAY_TO_MS = 24 * HRS_TO_MS;

const CACHE_TIMES_CHANGES:{[k:string]:number[]|undefined} = {};
export const getDateOfTimeChanges = (year:number) => {
  // 1 am of last day of the month.
  const inCache = CACHE_TIMES_CHANGES[year];
  if (inCache) return inCache;
  const lastDayOfMarch = Date.UTC(year, 2, 31, 1);
  const dayOfLastDayOfMarch = new Date(lastDayOfMarch).getUTCDay();
  const lastDayOfOctober = Date.UTC(year, 9, 31, 1);
  const dayOfLastDayOfOctober = new Date(lastDayOfOctober).getUTCDay();
  const result = [lastDayOfMarch - dayOfLastDayOfMarch * DAY_TO_MS,
    lastDayOfOctober - dayOfLastDayOfOctober * DAY_TO_MS];
  CACHE_TIMES_CHANGES[year] = result;
  return result;
};
export const isSummerTime = (date:Date) => {
  const time = date.getTime();
  const year = date.getUTCFullYear();
  const [marchChange, octoberChange] = getDateOfTimeChanges(year);
  return time >= marchChange && time <= octoberChange;
};

export const getCETTime = (date:Date|number) => {
  let ms = (typeof date === 'number' ? date : date.getTime()) + 1 * HRS_TO_MS; // Sum 1 hour as CET is UTC +1 or +2 (UTC+1)
  const dateObj = new Date(date);
  if (isSummerTime(dateObj)) ms += 1 * HRS_TO_MS; // Sum 1 hour if is summer time (UTC+2)
  return ms;
};

export const getNumOfDays = (time:Date|number) => Math.floor(getCETTime(time) / DAY_TO_MS);

export const getDatePlotly = (numOfDays:number) => {
  const ms = numOfDays * DAY_TO_MS;
  const date = new Date(ms);
  return date.toISOString().replace(/T.+/, '');
};
