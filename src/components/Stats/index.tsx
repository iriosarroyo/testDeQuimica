import Button from 'components/Button';
import GeneralContentLoader from 'components/GeneralContentLoader';
import StatsDisplay from 'components/StatsDisplay';
import FechasContext, { defaultFechasContext } from 'contexts/Fechas';
import React, { ChangeEvent, useEffect, useState } from 'react';
import { getFromSocketUID } from 'services/socket';
import { isSummerTime } from 'services/time';
import { Stats as StatsType } from 'types/interfaces';
import './Stats.css';

const isoDateToMs = (val:string, end:boolean = false) => new Date(`${val} GMT+0${isSummerTime(new Date(val)) ? 2 : 1}00`).getTime()
 + Number(end) * 24 * 3600 * 1000; // ADD 1 day to end

const LAST_DAY_OF_THE_MONTH = new Map([
  [0, 31],
  [1, 28],
  [2, 31],
  [3, 30],
  [4, 31],
  [5, 30],
  [6, 31],
  [7, 31],
  [8, 30],
  [9, 31],
  [10, 30],
  [11, 31],
]);

const getLastDayOfTheMonth = (month:number, year:number) => {
  if (month !== 1) return LAST_DAY_OF_THE_MONTH.get(month) ?? 30;
  return LAST_DAY_OF_THE_MONTH.get(month) ?? 28 + (year % 4 === 0 && year % 100 !== 0 ? 1 : 0);
};

const getLastMonthDates = (beginOrEnd:'begin'|'end') => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const prevYear = month === 0 ? year - 1 : year;
  const prevMonth = (month - 1 + 12) % 12;
  return new Date(prevYear, prevMonth, beginOrEnd === 'begin' ? 1 : getLastDayOfTheMonth(prevMonth, prevYear), 5)
    .toISOString().replace(/T.+/, '');
};

const setInitialDate = (
  e:ChangeEvent<HTMLInputElement>,
  setInit:React.Dispatch<React.SetStateAction<string>>,
  setEnd:React.Dispatch<React.SetStateAction<string>>,
) => {
  const { value } = e.target;
  setInit(value);
  setEnd((end) => (end < value ? value : end));
};

const reverseDate = (date:string) => date.split('-').reverse().join('-');
const getFromToDateString = (start:string, end:string) => {
  if (start === end) return `El ${reverseDate(start)}`;
  return `Desde ${reverseDate(start)} hasta ${reverseDate(end)}`;
};

export default function Stats({ isAdmin, uid }:{isAdmin?:boolean, uid?:string}) {
  // TODO: until 2.00 am in summer and 1.00 am in winter, the date is the one of the previous day.
  const [init, setInit] = useState(() => new Date().toISOString().replace(/T.+/, ''));
  const [end, setEnd] = useState(() => new Date().toISOString().replace(/T.+/, ''));
  const [stats, setStats] = useState<StatsType|null>(null);
  const [initComp, setInitComp] = useState(() => getLastMonthDates('begin'));
  const [endComp, setEndComp] = useState(() => getLastMonthDates('end'));
  const [compStats, setCompStats] = useState<StatsType|null>(null);
  const [fechasString, setFechas] = useState(defaultFechasContext);
  const statsPath = isAdmin ? 'stats:allStats' : 'stats:userStats';
  const getStats = () => {
    setFechas((fechas) => ({ ...fechas, statsDate: getFromToDateString(init, end) }));
    setStats(null);
    getFromSocketUID(statsPath, isoDateToMs(init), isoDateToMs(end, true), uid || undefined)
      .then(setStats);
  };
  const getCompStats = () => {
    setFechas((fechas) => ({ ...fechas, statsCompDate: getFromToDateString(initComp, endComp) }));
    setCompStats(null);
    getFromSocketUID(statsPath, isoDateToMs(initComp), isoDateToMs(endComp, true), uid || undefined)
      .then(setCompStats);
  };
  useEffect(() => {
    getStats();
    getCompStats();
  }, [isAdmin, uid]);
  return (
    <div className="statsContainer">
      <form
        className="statsForm"
        onSubmit={(e) => {
          e.preventDefault();
          getStats();
        }}
      >
        <h3>Fechas Estadísticas</h3>
        <label htmlFor="initDateStats" title="Fecha inicio de las estadísticas (inclusive)">
          <span className="sameWidth">Desde</span>
          <input type="date" id="initDateStats" value={init} onChange={(e) => setInitialDate(e, setInit, setEnd)} />
        </label>
        <label htmlFor="endDateStats" title="Fecha fin de las estadísticas (inclusive)">
          <span className="sameWidth">Hasta</span>
          <input type="date" id="endDateStats" value={end} min={init} onChange={(e) => setEnd(e.target.value)} />
        </label>
        <Button type="submit">Actualizar</Button>
      </form>
      <form
        className="statsForm"
        onSubmit={(e) => {
          e.preventDefault();
          getCompStats();
        }}
      >
        <h3>Fechas Comparación</h3>
        <label htmlFor="initDateComp" title="Fecha inicio de las estadísticas (inclusive)">
          <span className="sameWidth">Desde</span>
          <input type="date" value={initComp} id="initDateComp" onChange={(e) => setInitialDate(e, setInitComp, setEndComp)} />
        </label>
        <label htmlFor="endDateComps" title="Fecha fin de la comparación (inclusive)">
          <span className="sameWidth">Hasta</span>
          <input type="date" id="endDateComps" value={endComp} min={initComp} onChange={(e) => setEndComp(e.target.value)} />
        </label>
        <Button type="submit">Actualizar</Button>
      </form>
      <FechasContext.Provider value={fechasString}>
        { stats !== null && compStats !== null
          ? <StatsDisplay stats={stats} compStats={compStats} isAdmin={isAdmin} />
          : <GeneralContentLoader />}
      </FechasContext.Provider>

    </div>
  );
}

Stats.defaultProps = {
  isAdmin: false,
  uid: undefined,
};
