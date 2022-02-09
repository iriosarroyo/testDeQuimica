export const time2String = (ms:number) => {
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
  return [`${horaStr}:${minStr}:${segStr}`, `PT${horaStr}H${minStr}M${segStr}S`];
};
export const date2String = () => {};
