import React from 'react';

const isElementInViewport = (el:HTMLElement) => {
  const {
    top, left, bottom, right,
  } = el.getBoundingClientRect();

  return (
    top >= 0
      && left >= 0
      && bottom <= (window.innerHeight || document.documentElement.clientHeight)
      && right <= (window.innerWidth || document.documentElement.clientWidth)
  );
};

export const createIntersectionObserver = (
  elem:HTMLElement,
  // eslint-disable-next-line no-undef
  callback:IntersectionObserverCallback,
) => {
  const options = {
    root: elem,
    rootMargin: '0px',
    threshold: 0.01,
  };
  return new IntersectionObserver(callback, options);
};

export default isElementInViewport;

const isMobile = () => (window.innerHeight
    !== Math.round(document.body.getBoundingClientRect().height));

export const onChangeFullscreen = (
  setFullscreenButton: React.Dispatch<React.SetStateAction<boolean>>,
) => {
  if (!isMobile()) return () => {};
  const cbTouch = () => {
    document.body.requestFullscreen().then(console.log)
      .catch(() => setFullscreenButton(true));
    document.removeEventListener('touchend', cbTouch);
  };
  document.addEventListener('touchend', cbTouch);

  const cb = () => {
    console.log('hello');
    if (document.fullscreenElement) setFullscreenButton(false);
    else setFullscreenButton(true);
  };
  document.body.addEventListener('fullscreenchange', cb);
  return () => document.body.removeEventListener('fullscreenchange', cb);
};
