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
  let timeStr;
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

export const getNumOfDays = (time:Date|number) => {
  const date = new Date(time);
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  return year * 12 * 30 + month * 30 + day;
};
