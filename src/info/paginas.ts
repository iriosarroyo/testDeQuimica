import { faUsers } from '@fortawesome/free-solid-svg-icons';
import { Paginas } from 'types/interfaces';
import { getShortCut } from './shortcutTools';

const paginas:Paginas = [
  {
    url: '/',
    text: 'Inicio',
    icon: 'home',
    id: 'goToInicio',
    get shortcut() {
      return getShortCut(this);
    },
    default: 'Ctrl+Alt+I',
    shift: true,
    action: 'goTo',
    description: 'Abre la página de <em>Inicio</em> en la misma pestaña. Para abrir en una nueva pestaña pulsa <kbd>Shift</kbd>.',
  },
  {
    url: '/testDeHoy',
    text: 'Test de Hoy',
    icon: 'calendar-day',
    id: 'goToTest',
    get shortcut() {
      return getShortCut(this);
    },
    default: 'Ctrl+Alt+T',
    shift: true,
    action: 'goTo',
    description: 'Abre la página de <em>Test de Hoy</em> en la misma pestaña. Para abrir en una nueva pestaña pulsa <kbd>Shift</kbd>.',
  },
  {
    url: '/documentos',
    text: 'Documentos',
    icon: 'archive',
    id: 'goToDocuments',
    get shortcut() {
      return getShortCut(this);
    },
    default: 'Ctrl+Alt+D',
    shift: true,
    action: 'goTo',
    description: 'Abre la página de <em>Documentos</em> en la misma pestaña. Para abrir en una nueva pestaña pulsa <kbd>Shift</kbd>.',
  },
  {
    url: '/online',
    text: 'Online',
    icon: faUsers,
    id: 'goToOnline',
    get shortcut() {
      return getShortCut(this);
    },
    default: 'Ctrl+Alt+O',
    shift: true,
    action: 'goTo',
    description: 'Abre la página de <em>Online</em> en la misma pestaña. Para abrir en una nueva pestaña pulsa <kbd>Shift</kbd>.',
  },
  {
    url: '/tablaPeriodica',
    text: 'Tabla Periódica',
    icon: 'h-square',
    id: 'goToTabla',
    get shortcut() {
      return getShortCut(this);
    },
    default: 'Ctrl+Alt+P',
    shift: true,
    action: 'goTo',
    description: 'Abre la página de <em>Tabla Periódica</em> en la misma pestaña. Para abrir en una nueva pestaña pulsa <kbd>Shift</kbd>.',
  },
];

export default paginas;
