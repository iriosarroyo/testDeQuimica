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
