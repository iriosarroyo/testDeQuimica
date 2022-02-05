import { Paginas } from 'types/interfaces';

const paginas:Paginas = [
  {
    url: '/',
    text: 'Inicio',
    icon: 'home',
    shortcut: 'Ctrl+Alt+I',
    shift: 'Ctrl+Shift+Alt+I',
    action: 'goTo',
    description: 'Abre la página de <em>Inicio</em> en la misma pestaña. Para abrir en una nueva pestaña pulsa <kbd>Shift</kbd>.',
  },
  {
    url: '/testDeHoy',
    text: 'Test de Hoy',
    icon: 'calendar-day',
    shortcut: 'Ctrl+Alt+T',
    shift: 'Ctrl+Shift+Alt+T',
    action: 'goTo',
    description: 'Abre la página de <em>Test de Hoy</em> en la misma pestaña. Para abrir en una nueva pestaña pulsa <kbd>Shift</kbd>.',
  },
  {
    url: '/documentos',
    text: 'Documentos',
    icon: 'archive',
    shortcut: 'Ctrl+Alt+D',
    shift: 'Ctrl+Shift+Alt+D',
    action: 'goTo',
    description: 'Abre la página de <em>Test de Hoy</em> en la misma pestaña. Para abrir en una nueva pestaña pulsa <kbd>Shift</kbd>.',
  },
];

export default paginas;
