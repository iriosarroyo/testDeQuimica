import { faClose } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from 'components/Button';
import { useEvent } from 'hooks/general';
import React, { Dispatch, SetStateAction } from 'react';
import { round } from 'services/probability';
import { eventListenerSocket } from 'services/socket';
import './ServerStats.css';

export default function ServerStats({ setVisible }:{setVisible:Dispatch<SetStateAction<boolean>>}) {
  const [serverData] = useEvent<{
        ram:number,
        freeRam:number,
        cpuCount:number,
        cpu:number
    }>((setData) => eventListenerSocket('serverStats', setData));
  if (!serverData) return null;
  const {
    ram, cpu, cpuCount, freeRam,
  } = serverData;
  const usedRam = ram - freeRam;
  const percRam = `${round((usedRam / ram) * 100, 2)}%`;
  const percCPU = `${cpu}%`;
  return (
    <div className="serverStats">
      <Button onClick={() => setVisible(false)}>
        <FontAwesomeIcon icon={faClose} />
      </Button>
      <div>
        <div className="gridServerStats">
          <strong>
            CPU (
            {cpuCount}
            )
          </strong>
          <span>{percCPU}</span>
        </div>
        <div className="percBarServeStats">
          <div style={{ width: percCPU }} />
        </div>
      </div>
      <div>
        <div className="gridServerStats">
          <strong>RAM</strong>
          <span>{percRam}</span>
        </div>
        <div className="percBarServeStats">
          <div style={{ width: percRam }} />
        </div>
      </div>
    </div>
  );
}
