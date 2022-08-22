export const createSwipeEvent = (name:string, dist:number) => {
  const cb = (ev:TouchEvent) => {
    const { target, changedTouches: touches } = ev;
    const cbEnd = (evEnd:TouchEvent) => {
      const { changedTouches: touchesEnd } = evEnd;
      const distanceX = (touches[0]?.pageX ?? 0) - (touchesEnd[0]?.pageX ?? 0);
      const distanceY = (touches[0]?.pageY ?? 0) - (touchesEnd[0]?.pageY ?? 0);
      if (Math.abs(distanceX) >= Math.abs(dist)
      && distanceX * dist > 0
      && Math.abs(distanceY) < 50) {
        const custom = new CustomEvent(name, {
          detail: {
            distanceX,
            distanceY,
          },
          bubbles: true,
        });
        target?.dispatchEvent(custom);
      }
      document.removeEventListener('touchend', cbEnd);
    };
    document.addEventListener('touchend', cbEnd);
  };
  document.addEventListener('touchstart', cb);
  return () => document.removeEventListener('touchstart', cb);
};

export const arrowsEvent = () => {
  const cb = (e:KeyboardEvent) => {
    const config = {
      bubbles: true,
    };
    let ev:Event|undefined;
    if (e.code === 'ArrowLeft') ev = new Event('keydownleft', config);
    else if (e.code === 'ArrowRight') ev = new Event('keydownright', config);
    else if (e.code === 'ArrowUp') ev = new Event('keydownup', config);
    else if (e.code === 'ArrowDown') ev = new Event('keydowndown', config);

    if (ev) e.target?.dispatchEvent(ev);
  };
  document.addEventListener('keydown', cb);
  return () => document.removeEventListener('keydown', cb);
};
