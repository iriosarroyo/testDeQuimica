import { MutableRefObject, useEffect } from 'react';

export default function useOutsideAlerter(
  ref:MutableRefObject<any>,
  ref2:MutableRefObject<any>,
  callback:Function,
) {
  useEffect(() => {
    function handleClickOutside(event:MouseEvent) {
      if (ref.current && !ref.current.contains(event.target)
      && ref2.current && !ref2.current.contains(event.target)) {
        callback();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref]);
}
