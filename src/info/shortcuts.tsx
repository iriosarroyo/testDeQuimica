import loadable from '@loadable/component';
import React from 'react';
import { Shortcut } from 'types/interfaces';
import paginas from './paginas';

const Shortcuts = loadable(() => import('../components/Shortcuts'));

const shortcuts:Shortcut[] = [
  {
    action: 'showFront',
    description: 'Muestra los atajos de teclado.',
    shortcut: 'Ctrl+Alt+S',
    element: () => <Shortcuts />,

  },
  ...paginas,
];

export default shortcuts;
