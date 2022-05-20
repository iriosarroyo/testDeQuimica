import { RoomData } from 'types/interfaces';

const shouldCorregirOnClick = (roomData:RoomData) => {
  const { showPunt } = roomData;
  return showPunt === 'Sí';
};

const cannotCorregirOnClick = (roomData:RoomData) => roomData === undefined;

export const getCorregirOnClick = (roomData:RoomData) => {
  if (shouldCorregirOnClick(roomData)) return true;
  if (cannotCorregirOnClick(roomData)) return false;
  return roomData.corregirOnClick === 'Sí';
};

const shouldNotInBlanco = (roomData:RoomData) => {
  const { mode } = roomData;
  return mode === 'Fallos';
};
const cannotNotInBlanco = (roomData:RoomData) => roomData === undefined;

export const getNotInBlanco = (roomData:RoomData) => {
  if (shouldNotInBlanco(roomData)) return true;
  if (cannotNotInBlanco(roomData)) return false;
  return roomData.inBlanco === 'No';
};

const shouldPreventPrevious = (roomData:RoomData) => {
  const { timingMode } = roomData;
  return timingMode === 'Temporizador por Pregunta';
};

const cannotPreventPrevious = (roomData:RoomData) => roomData === undefined;

export const getPreventPrevious = (roomData:RoomData) => {
  if (shouldPreventPrevious(roomData)) return true;
  if (cannotPreventPrevious(roomData)) return false;
  return roomData.goBack === 'No';
};

export const getPuntType = (roomData:RoomData) => {
  const { mode } = roomData;
  return mode;
};

export const getShowPunt = (roomData:RoomData) => roomData.showPunt === 'Sí';

export const getTime = (roomData:RoomData) => {
  const { timingMode, endTime, timePerQuestion } = roomData;
  if (timingMode === 'Sin Temporizador') return undefined;
  if (timingMode === 'Temporizador Global') return endTime;
  return timePerQuestion * 60000; // min to secs
};

export const getTimeToSiguiente = (roomData:RoomData) => {
  const { timingMode, timePerQuestion } = roomData;
  if (timingMode !== 'Temporizador por Pregunta') return undefined;
  return timePerQuestion * 60000; // min to secs
};

export const getUnaPorUna = (roomData:RoomData, unaPorUna:boolean) => {
  const { timingMode } = roomData;
  if (timingMode === 'Temporizador por Pregunta' || getPreventPrevious(roomData)) return true;
  return unaPorUna;
};

export const getOnNext = (roomData:RoomData) => {
  const { timingMode } = roomData;
  return timingMode === 'Temporizador por Pregunta';
};

export const getNumOfPregs = (roomData:RoomData) => {
  const { timingMode, numPregs } = roomData;
  if (timingMode === 'Temporizador por Pregunta') return 1;
  return numPregs;
};
