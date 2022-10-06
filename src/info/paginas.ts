import {
  faAddressCard,
  faArchive,
  faArrowDown19,
  faCalendarDay,
  faChartLine,
  faChartPie,
  faEdit,
  faFilePen,
  faGraduationCap,
  faHome,
  faHSquare,
  faRankingStar,
  faUpload,
  faUsers,
  faUsersGear,
  faVialCircleCheck,
} from '@fortawesome/free-solid-svg-icons';
import { Paginas } from 'types/interfaces';
import { getShortCut } from './shortcutTools';

const paginas:Paginas = [
  {
    url: '/inicio',
    text: 'Inicio',
    icon: faHome,
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
    icon: faCalendarDay,
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
    icon: faArchive,
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
    url: '/puntuaciones',
    text: 'Puntuaciones',
    icon: faGraduationCap,
    id: 'goToPuntuaciones',
    get shortcut() {
      return getShortCut(this);
    },
    default: 'Ctrl+Alt+Q',
    shift: true,
    action: 'goTo',
    description: 'Abre la página de <em>Puntuaciones</em> en la misma pestaña. Para abrir en una nueva pestaña pulsa <kbd>Shift</kbd>.',
  },
  {
    url: '/logros',
    text: 'Logros',
    icon: faVialCircleCheck,
    id: 'goToLogro',
    get shortcut() {
      return getShortCut(this);
    },
    default: 'Ctrl+Alt+L',
    shift: true,
    action: 'goTo',
    description: 'Abre la página de <em>Logros</em> en la misma pestaña. Para abrir en una nueva pestaña pulsa <kbd>Shift</kbd>.',
  },
  {
    url: '/clasificacion',
    text: 'Clasificación',
    icon: faRankingStar,
    id: 'goToClasificacion',
    get shortcut() {
      return getShortCut(this);
    },
    default: 'Ctrl+Alt+X',
    shift: true,
    action: 'goTo',
    description: 'Abre la página de <em>Clasificación</em> en la misma pestaña. Para abrir en una nueva pestaña pulsa <kbd>Shift</kbd>.',
  },
  {
    url: '/tablaPeriodica',
    text: 'Tabla Periódica',
    icon: faHSquare,
    id: 'goToTabla',
    get shortcut() {
      return getShortCut(this);
    },
    default: 'Ctrl+Alt+P',
    shift: true,
    action: 'goTo',
    description: 'Abre la página de <em>Tabla Periódica</em> en la misma pestaña. Para abrir en una nueva pestaña pulsa <kbd>Shift</kbd>.',
  },
  {
    url: '/perfil',
    text: 'Perfil',
    icon: faAddressCard,
    id: 'goToPerfil',
    get shortcut() {
      return getShortCut(this);
    },
    default: 'Ctrl+Alt+U',
    shift: true,
    action: 'goTo',
    description: 'Abre la página de <em>Perfil</em> en la misma pestaña. Para abrir en una nueva pestaña pulsa <kbd>Shift</kbd>.',
  },
  {
    url: '/estadisticas',
    text: 'Estadísticas',
    icon: faChartLine,
    id: 'goToStats',
    get shortcut() {
      return getShortCut(this);
    },
    default: 'Ctrl+Alt+V',
    shift: true,
    action: 'goTo',
    description: 'Abre la página de <em>Estadísticas</em> en la misma pestaña. Para abrir en una nueva pestaña pulsa <kbd>Shift</kbd>.',
  },
];

export const paginasAdmin:Paginas = [
  {
    url: '/admin/editarInicio',
    text: 'Admin Inicio',
    icon: faEdit,
    id: 'goToAdmin',
    get shortcut() {
      return getShortCut(this);
    },
    default: 'Ctrl+Alt+N',
    shift: true,
    action: 'goTo',
    description: 'Abre la página de <em>Inicio</em> en la misma pestaña. Para abrir en una nueva pestaña pulsa <kbd>Shift</kbd>.',
  },
  {
    url: '/admin/editarPreguntas',
    text: 'Editar Preguntas',
    icon: faFilePen,
    id: 'goToEditarPreguntas',
    get shortcut() {
      return getShortCut(this);
    },
    default: 'Ctrl+Alt+C',
    shift: true,
    action: 'goTo',
    description: 'Abre la página de <em>Editar Preguntas</em> en la misma pestaña. Para abrir en una nueva pestaña pulsa <kbd>Shift</kbd>.',
  },
  {
    url: '/admin/documentos',
    text: 'Documentos (admin)',
    icon: faUpload,
    id: 'goToAdminDocumentos',
    get shortcut() {
      return getShortCut(this);
    },
    default: 'Ctrl+Alt+W',
    shift: true,
    action: 'goTo',
    description: 'Abre la página de <em>Documentos(admin)</em> en la misma pestaña. Para abrir en una nueva pestaña pulsa <kbd>Shift</kbd>.',
  },
  {
    url: '/admin/ordenarTemas',
    text: 'Ordenar Temas',
    icon: faArrowDown19,
    id: 'goToOrdenarTemas',
    get shortcut() {
      return getShortCut(this);
    },
    default: 'Ctrl+Alt+R',
    shift: true,
    action: 'goTo',
    description: 'Abre la página de <em>Ordenar Temas</em> en la misma pestaña. Para abrir en una nueva pestaña pulsa <kbd>Shift</kbd>.',
  },
  {
    url: '/admin/perfiles',
    text: 'Perfiles',
    icon: faUsersGear,
    id: 'goToPerfiles',
    get shortcut() {
      return getShortCut(this);
    },
    default: 'Ctrl+Alt+Y',
    shift: true,
    action: 'goTo',
    description: 'Abre la página de <em>Perfiles</em> en la misma pestaña. Para abrir en una nueva pestaña pulsa <kbd>Shift</kbd>.',
  },
  {
    url: '/admin/estadisticas',
    text: 'Estadísticas',
    icon: faChartPie,
    id: 'goToStatsAdmin',
    get shortcut() {
      return getShortCut(this);
    },
    default: 'Ctrl+Alt+B',
    shift: true,
    action: 'goTo',
    description: 'Abre la página de <em>Estadísticas</em> en la misma pestaña. Para abrir en una nueva pestaña pulsa <kbd>Shift</kbd>.',
  },
];

export default paginas;
