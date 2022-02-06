import React from 'react';
import ContentLoader from 'react-content-loader';

const HEIGHT = 10;
const PADDING_BOTTOM = 5;
const iterations = Math.trunc(100 / (HEIGHT + PADDING_BOTTOM));

function GeneralPiece() {
  return (
    <ContentLoader
      height="200px"
      preserveAspectRatio="none"
      width="100%"
      backgroundColor={
  getComputedStyle(document.documentElement)
    .getPropertyValue('--font2-color')
}
      foregroundColor={
  getComputedStyle(document.documentElement)
    .getPropertyValue('--font2-fore-color')
}
      viewBox="0 0 100 100"
    >
      { Array(iterations).fill(null).map((x, i, arra) => {
        const key = i;
        return (
          <rect
            key={key}
            x="0"
            y={(HEIGHT + PADDING_BOTTOM) * i}
            height={HEIGHT}
            rx="2"
            ry="40"
            width={i === arra.length - 1 ? '33' : '100'}
          />
        );
      })}
    </ContentLoader>
  );
}

export default function GeneralContentLoader() {
  return (
    <div className="generalContentLoader">
      <GeneralPiece />
      <GeneralPiece />
      <GeneralPiece />
    </div>
  );
}
