import React from 'react';

export default function ShortcutKey({ shortcut }:{shortcut:string}) {
  return (
    <>
      {shortcut.split('+').map((key, i, shcuts) => (
        <span key={key}>
          <kbd>{key}</kbd>
          {i === shcuts.length - 1 ? '' : '+'}
        </span>
      ))}
    </>
  );
}
