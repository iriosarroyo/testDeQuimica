/* eslint-disable camelcase */
import { faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from 'components/Button';
import FechasContext from 'contexts/Fechas';
import React, {
  useContext, useMemo, useRef, useState,
} from 'react';
import Plot from 'react-plotly.js';
import { round } from 'services/probability';
import { getDatePlotly, time2String } from 'services/time';
import { Stats, TestStats, TimeStats } from 'types/interfaces';
import './StatsDisplay.css';

function NoDisponible() {
  return <span title="Un dato suele no estar disponible porque no hayas realizado test en ese período. La causa suele ser una división por 0.">No disponible</span>;
}

const DEFAULT_STEP = 5;
const editCount = (
  setter:React.Dispatch<React.SetStateAction<number>>,
  max:number,
  add:boolean = true,
  step = DEFAULT_STEP,
) => () => setter((val) => Math.min(
  Math.ceil(max / step) * step,
  Math.max(step, add ? val + step : val - step),
));

function MoreOrLess({
  data, dataComp, name, text, verb,
}:
  {data:string[]|undefined, dataComp:string[]|undefined, text:string, name:string, verb:string}) {
  const [numOfElemsStats, setNumOfElemsStats] = useState(DEFAULT_STEP);
  const [numOfElemsComp, setNumOfElemsComp] = useState(DEFAULT_STEP);
  if ((data === undefined || data.length === 0)
  && (dataComp === undefined || dataComp.length === 0)) return null;
  const { statsDate, statsCompDate } = useContext(FechasContext);
  const titleText = `${text}${text && ' '}${(text ? name.toLowerCase() : name).replace('*', '')}${verb && ' '}${verb}`;
  return (
    <div className="gridStats">
      <strong title={titleText}>{name}</strong>
      {data === undefined || data.length === 0 ? <NoDisponible /> : (
        <span className="moreOrLessText">
          <span title={`${titleText} ${statsDate.toLocaleLowerCase()}`}>{data.slice(0, numOfElemsStats).join(', ')}</span>
          <span>
            {numOfElemsStats > DEFAULT_STEP && (
            <Button onClick={editCount(setNumOfElemsStats, data.length, false)}>
              <FontAwesomeIcon icon={faMinus} />
            </Button>
            )}
            { data.length > numOfElemsStats
            && (
            <Button onClick={editCount(setNumOfElemsStats, data.length)}>
              <FontAwesomeIcon icon={faPlus} />
            </Button>
            )}
          </span>
        </span>
      )}
      {dataComp === undefined || dataComp.length === 0 ? <NoDisponible />
        : (
          <span className="moreOrLessText">
            <span title={`${titleText} ${statsCompDate.toLocaleLowerCase()}`}>{dataComp.slice(0, numOfElemsComp).join(', ')}</span>
            <span>
              {numOfElemsComp > DEFAULT_STEP && (
              <Button onClick={editCount(setNumOfElemsComp, dataComp.length, false)}>
                <FontAwesomeIcon icon={faMinus} />
              </Button>
              )}
              {dataComp.length > numOfElemsComp
                        && (
                        <Button onClick={editCount(setNumOfElemsComp, dataComp.length)}>
                          <FontAwesomeIcon icon={faPlus} />
                        </Button>
                        )}
            </span>
          </span>
        )}
    </div>
  );
}

function Pie({ values, labels, myRef }
  :{values:number[], labels: string[], myRef:React.RefObject<HTMLDivElement>}) {
  return (
    <Plot
      data={
        [{
          values,
          labels,
          type: 'pie',
          marker: { colors: ['green', 'red', 'lightblue'] },
        }]
      }
      config={{ setBackground: 'transparent', autosizable: true }}
      layout={{
        showlegend: false,
        margin: {
          t: 0, b: 0, l: 0, r: 0,
        },
        paper_bgcolor: getComputedStyle(myRef.current ?? document.documentElement).backgroundColor,
        width: 200,
        height: 250,
      }}
    />
  );
}

function PieChart({
  name, comp, val, labels,
}: {name:string, comp:number[], val:number[], labels:string[]}) {
  const ref = useRef<HTMLDivElement>(null);
  if (comp.every((v) => v === 0) && val.every((v) => v === 0)) return null;
  return (
    <div className="gridStats" ref={ref}>
      <strong title={name} style={{ wordBreak: 'normal' }}>{name}</strong>
      <Pie labels={labels} values={val} myRef={ref} />
      <Pie labels={labels} values={comp} myRef={ref} />
    </div>
  );
}

function ItemStat({
  name, comp, val, text, verb, transform,
}:{val:number|null, comp:number|null, name:string, verb:string,
  text:string, transform?:(v:number) =>string}) {
  const percentage = useMemo(() => round(((val ?? 0) / (comp ?? 0)) * 100), [val, comp]);
  const { statsDate, statsCompDate } = useContext(FechasContext);
  const titleText = `${text}${text && ' '}${text ? name.toLowerCase() : name}${verb && ' '}${verb}`;
  const textVal = useMemo(() => (transform ? transform(val ?? 0) : round(val ?? 0)), [val]);
  const textComp = useMemo(() => (transform ? transform(comp ?? 0) : round(comp ?? 0)), [val]);
  return (
    <div className="gridStats">
      <strong title={titleText}>{name}</strong>
      {
            val === null ? <NoDisponible /> : (
              <span>
                <span title={`${titleText} ${statsDate.toLocaleLowerCase()}`}>{textVal}</span>
                {Number.isNaN(percentage) || comp === null || percentage < 0 || val < 0
                  ? null
                  : (
                    <span title={`Porcentaje de ${name.toLocaleLowerCase()} ${verb} ${statsDate.toLocaleLowerCase()}. ${titleText} ${statsCompDate.toLocaleLowerCase()} es el 100%.`}>
                      {' '}
                      (
                      {Number.isFinite(percentage) ? percentage : <>&infin;</>}
                      %)
                    </span>
                  )}
              </span>
            )
        }
      {
            comp === null ? <NoDisponible /> : <span title={`${titleText} ${statsCompDate.toLocaleLowerCase()}`}>{textComp}</span>
        }
    </div>
  );
}
ItemStat.defaultProps = {
  transform: undefined,
};

function HeaderDisplay({ title }:{title:string}) {
  const { statsDate, statsCompDate } = useContext(FechasContext);
  return (
    <>
      <h3>{title}</h3>
      <div className="gridStats">
        <h4>Estadística</h4>
        <h4>{statsDate.replace('El ', '')}</h4>
        <h4>{statsCompDate}</h4>
      </div>
    </>
  );
}

function TestStatsDisplay({ stats, compStats, title }:
    {stats:TestStats, compStats:TestStats, title:string}) {
  const {
    n_tests, n_questions, n_correct, n_incorrect, n_blank, sum_time, ave_time,
    ave_defScore, ave_defScore_exam, most_common_incorrect, sum_defScore, notDoneTest,
  } = stats;
  const {
    n_tests: comp_n_test, n_questions: comp_n_questions, sum_time: comp_sum_time,
    ave_time: comp_ave_time, ave_defScore: comp_ave_defScore,
    ave_defScore_exam: comp_ave_defScore_exam,
    most_common_incorrect: comp_most_common_incorrect, sum_defScore: comp_sum_defScore,
    notDoneTest: comp_notDoneTest,
    n_correct: comp_n_correct, n_incorrect: comp_n_incorrect, n_blank: comp_n_blank,
  } = compStats;
  const { max, argsmax } = most_common_incorrect;
  const { max: comp_max, argsmax: comp_argsmax } = comp_most_common_incorrect;
  return (
    <div className="statsDisplay">
      <HeaderDisplay title={title} />
      <ItemStat name="Tests" val={n_tests} comp={comp_n_test} text="Nº de" verb="realizados" />
      <ItemStat name="Preguntas" val={n_questions} comp={comp_n_questions} text="Nº de" verb="realizadas" />
      <ItemStat name="Correctas" val={n_correct} comp={comp_n_correct} text="Nº de preguntas" verb="contestadas" />
      <ItemStat name="Incorrectas" val={n_incorrect} comp={comp_n_incorrect} text="Nº de preguntas" verb="contestadas" />
      <ItemStat name="En blanco" val={n_blank} comp={comp_n_blank} text="Nº de preguntas" verb="contestadas" />
      <ItemStat name="Puntuación total" val={sum_defScore} comp={comp_sum_defScore} text="La" verb="obtenida" />
      <ItemStat name="Puntuación media por pregunta" val={ave_defScore} comp={comp_ave_defScore} text="La" verb="obtenida" />
      <ItemStat name="Puntuación media por examen" val={ave_defScore_exam} comp={comp_ave_defScore_exam} text="La" verb="obtenida" />
      <ItemStat name="Tiempo" val={sum_time} comp={comp_sum_time} text="El" verb="dedicado a los test (HH:MM:SS)" transform={(time:number) => time2String(time, 'hours')[0]} />
      <ItemStat name="Tiempo medio" val={ave_time} comp={comp_ave_time} text="El" verb="por pregunta (MM:SS)" transform={(time:number) => time2String(time, 'minutes')[0]} />
      <ItemStat
        name="Veces respondidas una misma pregunta de manera incorrecta"
        val={max}
        comp={comp_max}
        text="Máximo nº de"
        verb=""
      />
      <MoreOrLess name="Pregunta más veces respondida de manera incorrecta" data={argsmax} dataComp={comp_argsmax} text="" verb="" />
      <MoreOrLess name="Personas que no han hecho tests*" data={notDoneTest} dataComp={comp_notDoneTest} text="" verb="" />
      <PieChart
        name="Correctas vs incorrectas vs en blanco"
        val={[n_correct, n_incorrect, n_blank]}
        comp={[comp_n_correct, comp_n_incorrect, comp_n_blank]}
        labels={['Correctas', 'Incorrectas', 'En blanco']}
      />
    </div>
  );
}

const DUMMY_DATE = '2022-06-01';
function TimePlot({ val, comp }:{val:TimeStats['timesPerDay'], comp:TimeStats['timesPerDay']}) {
  const x_val = useMemo(() => Object.keys(val).map((n) => getDatePlotly(Number(n))), [val]);
  const y_val = useMemo(() => Object.values(val).map((stats) => `${DUMMY_DATE} ${time2String(stats.sum_timeConnected, 'hours')[0]}`), [val]);
  const x_comp = useMemo(() => Object.keys(comp).map((n) => getDatePlotly(Number(n))), [comp]);
  const y_comp = useMemo(() => Object.values(comp).map((stats) => `${DUMMY_DATE} ${time2String(stats.sum_timeConnected, 'hours')[0]}`), [comp]);
  const { statsDate, statsCompDate } = useContext(FechasContext);
  return (
    <Plot
      data={[
        {
          x: x_val,
          y: y_val,
          type: 'scatter',
          name: statsDate,
        },
        {
          x: x_comp,
          y: y_comp,
          type: 'scatter',
          name: statsCompDate,
        },
      ]}
      layout={{
        yaxis: { tickformat: '%H:%M:%S' },
        legend: {
          orientation: 'h',
        },
        paper_bgcolor: getComputedStyle(document.body).getPropertyValue('--font2-color'),
        width: 600,
      }}
    />
  );
}

function TimeStatsDisplay({ stats, compStats, title }:
  {stats:TimeStats, compStats:TimeStats, title:string}) {
  const {
    num_connections, sum_timeConnected, ave_timeConnected,
    ave_per_user_timeConnected, notActive, timesPerDay,
  } = stats;
  const {
    num_connections: comp_num_connections, sum_timeConnected: comp_sum_timeConnected,
    ave_timeConnected: comp_ave_timeConnected,
    ave_per_user_timeConnected: comp_ave_per_user_timeConnected,
    notActive: comp_notActive, timesPerDay: comp_timesPerDay,
  } = compStats;
  return (
    <div className="statsDisplay">
      <HeaderDisplay title={title} />
      <ItemStat
        text="Nº de"
        name="Conexiones"
        val={num_connections}
        comp={comp_num_connections}
        verb="realizadas (Una persona con dos pestañas abiertas a la vez cuenta como una conexión, pero a veces si pierdes el wifi y la recuperas eso cuenta como 1 conexión extra)."
      />
      <ItemStat
        text="El"
        name="Tiempo total"
        val={sum_timeConnected}
        comp={comp_sum_timeConnected}
        verb="conectado (HH:MM:SS)"
        transform={(time:number) => time2String(time, 'hours')[0]}
      />
      <ItemStat
        text="El"
        name="Tiempo medio"
        val={ave_timeConnected}
        comp={comp_ave_timeConnected}
        verb="conectado (MM:SS)"
        transform={(time:number) => time2String(time, 'minutes')[0]}
      />
      <ItemStat
        text="El"
        name="Tiempo medio por usuario"
        val={ave_per_user_timeConnected}
        comp={comp_ave_per_user_timeConnected}
        verb="conectado (MM:SS)"
        transform={(time:number) => time2String(time, 'minutes')[0]}
      />
      <MoreOrLess
        text=""
        name="Personas no activas"
        data={notActive}
        dataComp={comp_notActive}
        verb=""
      />
      <TimePlot val={timesPerDay} comp={comp_timesPerDay} />
    </div>
  );
}

export default function StatsDisplay({ stats, compStats, isAdmin }:
  {stats:Stats, compStats:Stats, isAdmin:boolean|undefined}) {
  const {
    statsOnline, statsTestDeHoy, statsTests, statsTime,
  } = stats;
  const {
    statsOnline: compOnline, statsTestDeHoy: compTestDeHoy,
    statsTests: compTests, statsTime: compTime,
  } = compStats;
  return (
    <>
      {isAdmin && (
      <p>
        *Estas estadísticas solo están disponibles para el administrador
        <br />
        En el resumen no se tiene en cuenta a los administradores
      </p>
      )}
      <TestStatsDisplay stats={statsTests} compStats={compTests} title="Estadísticas de todos los tests" />
      <TestStatsDisplay stats={statsTestDeHoy} compStats={compTestDeHoy} title="Estadísticas de los test del día" />
      <TestStatsDisplay stats={statsOnline} compStats={compOnline} title="Estadísticas de los test online" />
      { isAdmin && <TimeStatsDisplay stats={statsTime} compStats={compTime} title="Estadísticas tiempo de conexión*" />}
    </>
  );
}
