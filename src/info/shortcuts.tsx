import loadable from '@loadable/component';
import React from 'react';
import { Shortcut } from 'types/interfaces';
import paginas from './paginas';
import { getShortCut } from './shortcutTools';

const Shortcuts = loadable(() => import('../components/Shortcuts'));
const Constantes = loadable(() => import('../components/Constantes'));
const TablaPeriodica = loadable(() => import('../components/TablaPeriodica'));

const shortcuts:Shortcut[] = [
  {
    action: 'showFront',
    description: 'Muestra los atajos de teclado.',
    id: 'atajosTeclado',
    get shortcut() {
      return getShortCut(this);
    },
    default: 'Ctrl+Alt+S',
    element: () => <Shortcuts />,

  },
  ...paginas,
  {
    action: 'showFront',
    description: 'Muestra la Tabla Periódica.',
    id: 'tablaPeriodica',
    get shortcut() {
      return getShortCut(this);
    },
    default: 'Ctrl+Alt+A',
    element: () => <TablaPeriodica properties={{ color: 'phases', temp: 293 }} />,
  },
  {
    action: 'showFront',
    description: 'Muestra las constantes y cambios de unidades.',
    id: 'constantes',
    get shortcut() {
      return getShortCut(this);
    },
    default: 'Ctrl+Alt+K',
    element: () => <Constantes />,
  },
];

export const removeShortCut = (id:string) => {
  const idx = shortcuts.findIndex((x) => x.id === id);
  if (idx !== -1) shortcuts.splice(idx);
};
export const addShortCut = (sc:Shortcut) => {
  shortcuts.push(sc);
  return () => removeShortCut(sc.id);
};

export default shortcuts;
