export default class Toast {
  static buffer:{text:string, duration:number}[] = [];

  static setterFn = (text:string|undefined) => { (() => text)(); };

  static addMsg(text:string, duration:number) {
    const prevToast = Toast.buffer.find((x) => x.text === text && x.duration === duration);
    if (prevToast !== undefined) return;
    Toast.buffer.push({ text, duration });
    if (Toast.buffer.length === 1) Toast.show();
  }

  static show() {
    const msg = Toast.buffer[0];
    Toast.setterFn(msg.text);
    setTimeout(() => {
      Toast.buffer.shift();
      Toast.setterFn(undefined);
      if (Toast.buffer.length !== 0) setTimeout(Toast.show, 300);
    }, msg.duration);
  }
}
