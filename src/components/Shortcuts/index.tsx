import ShortcutKey from 'components/ShortcutKey';
import shortcuts from 'info/shortcuts';
import React from 'react';
import './Shortcuts.css';

export default function Shortcuts() {
  return (
    <ul className="unlisted shortcutGroup">
      {shortcuts.map((x) => (
        x.shortcut ? (
          <li className="shortcut" key={x.id}>
            <div className="shortcutCombination">
              <ShortcutKey shortcut={x.shortcut} />
            </div>
            <div className="shortcutDescription">{x.description}</div>
          </li>
        ) : null
      ))}
    </ul>
  );
}
