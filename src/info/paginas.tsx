import React from 'react';
import {
  faAddressCard,
  faArchive,
  faArrowDown19,
  faBook,
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
  IconDefinition,
} from '@fortawesome/free-solid-svg-icons';
import { PaginaObject, Paginas } from 'types/interfaces';
import loadable from '@loadable/component';
import GeneralContentLoader from 'components/GeneralContentLoader';
import isApp from 'services/determineApp';
import { Navigate } from 'react-router-dom';
import { getShortCut } from './shortcutTools';

const Perfil = loadable(() => import('components/Perfil'), {
  fallback: <GeneralContentLoader />,
});
const Inicio = loadable(() => import('components/Inicio'), {
  fallback: <GeneralContentLoader />,
});
const Documentos = loadable(() => import('components/Documentos'), {
  fallback: <GeneralContentLoader />,
});
const TablaEditor = loadable(() => import('components/TablaEditor'), {
  fallback: <GeneralContentLoader />,
});
const CustomTest = loadable(() => import('components/CustomTest'), {
  fallback: <GeneralContentLoader />,
});

const Online = loadable(() => import('components/Online'), {
  fallback: <GeneralContentLoader />,
});

const Puntuaciones = loadable(() => import('components/Puntuaciones'), {
  fallback: <GeneralContentLoader />,
});

const Logros = loadable(() => import('components/Logros'), {
  fallback: <GeneralContentLoader />,
});
const Clasificacion = loadable(() => import('components/Clasificacion'), {
  fallback: <GeneralContentLoader />,
});
const Stats = loadable(() => import('components/Stats'), {
  fallback: <GeneralContentLoader />,
});

const Ajustes = loadable(() => import('components/Ajustes'), {
  fallback: <GeneralContentLoader />,
});

const InicioEditor = loadable(() => import('components/InicioEditor'), {
  fallback: <GeneralContentLoader />,
});

const QuestionEditor = loadable(() => import('components/QuestionEditor'), {
  fallback: <GeneralContentLoader />,
});
const TemasOrdering = loadable(() => import('components/TemasOrdering'), {
  fallback: <GeneralContentLoader />,
});

const PerfilesAdmin = loadable(() => import('components/PerfilesAdmin'), {
  fallback: <GeneralContentLoader />,
});
const StatsAdmin = loadable(() => import('components/StatsAdmin'), {
  fallback: <GeneralContentLoader />,
});

const FrasesCuriosasEditor = loadable(() => import('components/FrasesCuriosasEditor'), {
  fallback: <GeneralContentLoader />,
});
const Error404 = loadable(() => import('components/Error404'), {
  fallback: <GeneralContentLoader />,
});

const getPaginaDescription = (text:string) => (
  <>
    Abre la página de
    {' '}
    <em>{text}</em>
    {' '}
    en la misma pestaña. Para abrir en una nueva pestaña pulsa
    {' '}
    <kbd>Shift</kbd>
    .
  </>
);

const newPagina = (
  text: string,
  url: string,
  icon: IconDefinition|undefined,
  defaultShortcut: string|undefined,
  // eslint-disable-next-line no-undef
  component:JSX.Element,
  visible = true,
  paths:string[] = [url],
):PaginaObject => {
  const action = 'goTo';
  return {
    text,
    url,
    icon,
    default: defaultShortcut,
    id: action + text,
    action,
    paths,
    visible,
    description: getPaginaDescription(text),
    component,
    shift: true,
    get shortcut() {
      return getShortCut(this);
    },
  };
};

const paginas:Paginas = [
  newPagina('Inicio', '/inicio', faHome, 'Ctrl+Alt+I', <Inicio />),
  newPagina('InicioRedirect', '/', undefined, undefined, <Navigate to="/inicio" replace />),
  newPagina('Test de Hoy', '/testDeHoy', faCalendarDay, 'Ctrl+Alt+T', <CustomTest room="testDelDia" />),
  newPagina('Documentos', '/documentos', faArchive, 'Ctrl+Alt+D', <Documentos />, true, ['documentos/*']),
  newPagina('Online', '/online', faUsers, 'Ctrl+Alt+O', <Online />),
  newPagina('Puntuaciones', '/puntuaciones', faGraduationCap, 'Ctrl+Alt+Q', <Puntuaciones />),
  newPagina('Logros', '/logros', faVialCircleCheck, 'Ctrl+Alt+L', <Logros />),
  newPagina('Clasificación', '/clasificacion', faRankingStar, 'Ctrl+Alt+X', <Clasificacion />),
  newPagina('Tabla Periódica', '/tablaPeriodica', faHSquare, 'Ctrl+Alt+P', <TablaEditor />, isApp('quimica')),
  newPagina('Perfil', '/perfil', faAddressCard, 'Ctrl+Alt+U', <Perfil />),
  newPagina('Estadísticas', '/estadisticas', faChartLine, 'Ctrl+Alt+V', <Stats />),
  newPagina('Ajustes', '/ajustes', undefined, 'Ctrl+Alt+Ñ', <Ajustes />),
  newPagina('Error404', '*', undefined, undefined, <Error404 />),
];

export const paginasAdmin:Paginas = [
  newPagina('Admin Inicio', '/admin/editarInicio', faEdit, 'Ctrl+Alt+N', <InicioEditor />),
  newPagina('Editar Preguntas', '/admin/editarPreguntas', faFilePen, 'Ctrl+Alt+C', <QuestionEditor />),
  newPagina('Documentos (admin)', '/admin/documentos', faUpload, 'Ctrl+Alt+W', <Documentos admin />, true, ['documentos/*']),
  newPagina('Ordenar Temas', '/admin/ordenarTemas', faArrowDown19, 'Ctrl+Alt+R', <TemasOrdering />),
  newPagina('Perfiles', '/admin/perfiles', faUsersGear, 'Ctrl+Alt+Y', <PerfilesAdmin />, true, ['/perfiles/*']),
  newPagina('Estadísticas (admin)', '/admin/estadisticas', faChartPie, 'Ctrl+Alt+B', <StatsAdmin />, true, ['estadisticas/*']),
  newPagina('Datos Curiosos', '/admin/datosCuriosos', faBook, 'Ctrl+Alt+M', <FrasesCuriosasEditor />),
];

export const paginasEditor:Paginas = [
  newPagina('Editar Preguntas', '/editor/editarPreguntas', faFilePen, 'Ctrl+Alt+C', <QuestionEditor />),
];

export default paginas;
