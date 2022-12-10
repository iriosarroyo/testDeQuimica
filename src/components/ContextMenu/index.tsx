import Button from 'components/Button';
import React, {
  useEffect, useRef, useState, MouseEvent as ME,
} from 'react';
import './ContextMenu.css';

export default function ContextMenu({
  style, setContextMenu, items, classOfElem,
}:
    {style:React.CSSProperties,
    setContextMenu:Function,
    items:{text:string, action:(e:ME) => any}[]
     classOfElem:string}) {
  const ref = useRef<HTMLUListElement>(null);
  const [myStyle, setStyle] = useState(style);

  useEffect(() => {
    const listener = (e:MouseEvent) => {
      if (!(e.target instanceof HTMLElement) && !(e.target instanceof SVGElement)) return;
      if (e.type === 'contextmenu' && e.target.closest(classOfElem) !== null) return;
      if (e.target.closest('.contextMenu') !== null) return;
      setContextMenu(null);
    };
    document.addEventListener('click', listener);
    document.addEventListener('contextmenu', listener);
    return () => {
      document.removeEventListener('click', listener);
      document.removeEventListener('contextmenu', listener);
    };
  }, []);

  useEffect(() => {
    if (ref.current) {
      const {
        right, bottom, top, left,
      } = ref.current.getBoundingClientRect();
      const h = bottom - top;
      const w = right - left;
      let finalStyle = style;
      const styleLeft = parseInt(finalStyle.left?.toString() ?? '0', 10);
      const styleTop = parseInt(finalStyle.top?.toString() ?? '0', 10);
      if (window.innerWidth < styleLeft + w) {
        finalStyle = { left: `${styleLeft - w}px`, top: finalStyle.top };
      }
      if (window.innerHeight < styleTop + h) {
        finalStyle = { left: finalStyle.left, top: `${styleTop - h}px` };
      }
      setStyle(finalStyle);
    }
  }, [ref, ref.current, style]);

  return (
    <ul ref={ref} onContextMenu={(e) => e.preventDefault()} className="unlisted contextMenu" style={myStyle}>
      {
        items.map((elem) => (
          <li key={elem.text}>
            <Button
              className="contextButton"
              onClick={(e) => {
                elem.action(e);
                setContextMenu(null);
              }}
            >
              {elem.text}
            </Button>
          </li>
        ))
}
    </ul>
  );
}
