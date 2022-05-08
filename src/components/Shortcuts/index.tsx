import ShortcutKey from 'components/ShortcutKey';
import shortcuts from 'info/shortcuts';
import React from 'react';
import './Shortcuts.css';

console.log('importado');

export default function Shortcuts() {
  return (
    <ul className="unlisted shortcutGroup">
      {shortcuts.map((x) => (
        <li className="shortcut" key={x.id}>
          <div className="shortcutCombination">
            <ShortcutKey shortcut={x.shortcut} />
          </div>
          <div className="shortcutDescription" dangerouslySetInnerHTML={{ __html: x.description }} />
        </li>
      ))}
    </ul>
  );
}
