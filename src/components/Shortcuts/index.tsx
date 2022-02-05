import shortcuts from 'info/shortcuts';
import React from 'react';
import './Shortcuts.css';

console.log('importado');

export default function Shortcuts() {
  return (
    <ul className="unlisted shortcutGroup">
      {shortcuts.map((x) => (
        <li className="shortcut" key={x.shortcut}>
          <div className="shortcutCombination">
            {x.shortcut.split('+').map((key, i, shcuts) => (
              <span key={key}>
                <kbd>{key}</kbd>
                {i === shcuts.length - 1 ? '' : '+'}
              </span>
            ))}
          </div>
          <div className="shortcutDescription" dangerouslySetInnerHTML={{ __html: x.description }} />
        </li>
      ))}
    </ul>
  );
}
