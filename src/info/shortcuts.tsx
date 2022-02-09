import loadable from '@loadable/component';
import React from 'react';
import { Shortcut } from 'types/interfaces';
import paginas from './paginas';

const Shortcuts = loadable(() => import('../components/Shortcuts'));
const Constantes = loadable(() => import('../components/Constantes'));
const TablaPeriodica = loadable(() => import('../components/TablaPeriodica'));

const shortcuts:Shortcut[] = [
  {
    action: 'showFront',
    description: 'Muestra los atajos de teclado.',
    shortcut: 'Ctrl+Alt+S',
    element: () => <Shortcuts />,

  },
  ...paginas,
  {
    action: 'showFront',
    description: 'Muestra la Tabla Periódica.',
    shortcut: 'Ctrl+Alt+A',
    element: () => <TablaPeriodica properties={{ color: 'phases', temp: 293 }} />,
  },
  {
    action: 'showFront',
    description: 'Muestra las constantes y cambios de unidades.',
    shortcut: 'Ctrl+Alt+K',
    element: () => <Constantes />,
  },
];

export default shortcuts;
