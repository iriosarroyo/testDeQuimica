export const determineContentType = (type:string) => {
  if (type.startsWith('image')) return 'image';
  if (type === 'application/pdf') return 'pdf';
  if (type.includes('word')) return 'word';
  if (type.includes('powerpoint') || type.includes('presentation')) return 'powerpoint';
  return 'alt';
};
export const sizeToString = (size:number) => {
  let thisSize = size;
  const typeOfSize = ['bytes', 'kb', 'Mb', 'Gb', 'Tb'];
  let x = 0;
  while (thisSize > 1000) {
    thisSize /= 1000;
    if (x === typeOfSize.length - 1) break;
    /* eslint no-plusplus: "warn" */
    x++;
  }
  return `${Math.round(thisSize * 100) / 100} ${typeOfSize[x]}`;
};
export const isKeyOfObj = <T>(key:PropertyKey, obj:T): key is keyof T => key in obj;
