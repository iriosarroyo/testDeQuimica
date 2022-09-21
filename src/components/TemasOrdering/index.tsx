import deepEqual from 'services/deepEqual';
import React, {
  DragEvent, useEffect, useMemo, useState,
} from 'react';
import './TemasOrdering.css';
import { onValueDDBB } from 'services/database';
import Toast from 'services/toast';
import { getFromSocket } from 'services/socket';
import Button from 'components/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownLong, faUpLong } from '@fortawesome/free-solid-svg-icons';

type SortElem = {value:string, text:string}
const LAST_ELEMENT = 'DRAG_LAST_ELEMENT_WE_DO_NOT_WANT_TO_HAVE_SAME_TEXT_XYZAJSHJKA';
function SortableList({ elements, onChange }:{
    elements:SortElem[],
    onChange?: Function
}) {
  const [sortedElements, setSortedElements] = useState(elements);
  const [dragPos, setDragPos] = useState<SortElem|null>(null);
  const [dragging, setDragging] = useState(false);
  const [orderWhileDragging, setOrderWhileDragging] = useState(elements);
  const [activeDragging, setActiveDragging] = useState<SortElem|null>(null);

  useEffect(() => setSortedElements(elements), [elements]);

  const getOrder = (elem:SortElem, sortedArray:SortElem[]) => {
    const newOrder = sortedArray.filter((x) => x.value !== elem.value);
    if (dragPos?.value !== LAST_ELEMENT) {
      const insertIdx = newOrder.findIndex((x) => x.value === dragPos?.value);
      // Insert element into array at pos insertIdx
      newOrder.splice(insertIdx, 0, elem);
    } else {
      newOrder.push(elem);
    }
    return newOrder;
  };

  const handleDragStart = (e:DragEvent<HTMLDivElement>, id:SortElem) => {
    setActiveDragging(id);
    setDragging(true);
  };
  const handleDragOver = (event:DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (activeDragging === dragPos) return;
    if (activeDragging === null) return;
    const newOrder = getOrder(activeDragging, orderWhileDragging);
    if (deepEqual(newOrder, orderWhileDragging)) return;
    setOrderWhileDragging(newOrder);
  };

  const handleDragEnter = (id:SortElem) => {
    setDragPos(id);
  };

  const handleDragEnd = () => {
    setDragPos(null);
    setDragging(false);
    setOrderWhileDragging(sortedElements);
  };

  const handleDrop = () => {
    const newOrder = orderWhileDragging;
    if (onChange) onChange(newOrder);
    setSortedElements(newOrder);
  };

  const handleClick = (elem:SortElem, dir: 'up'|'down') => {
    const newOrder = [...orderWhileDragging];
    const idx = newOrder.findIndex((e) => e.value === elem.value);
    const idx2 = (idx + (dir === 'up' ? -1 : 1) + newOrder.length) % newOrder.length;
    const temp = newOrder[idx];
    newOrder[idx] = newOrder[idx2];
    newOrder[idx2] = temp;
    if (onChange) onChange(newOrder);
    setSortedElements(newOrder);
    setOrderWhileDragging(newOrder);
  };

  const activeArray = dragging ? orderWhileDragging : sortedElements;
  return (
    <div
      className="onlyDropHere"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {activeArray.map((elem) => (
        <div className="elemOrderButtons" key={elem.value}>
          <Button onClick={() => handleClick(elem, 'down')}>
            <FontAwesomeIcon icon={faDownLong} />
          </Button>
          <div
            onDragStart={(e) => handleDragStart(e, elem)}
            onDragEnd={() => handleDragEnd()}
            onDragEnter={() => handleDragEnter(elem)}
            id={elem.value}
            className={`orderingElem ${(dragging && elem === activeDragging) ? 'draggingElem' : ''}`}
            draggable
          >
            {elem.text}
          </div>
          <Button onClick={() => handleClick(elem, 'up')}>
            <FontAwesomeIcon icon={faUpLong} />
          </Button>
        </div>
      ))}
      <div
        onDragEnter={() => handleDragEnter({ value: LAST_ELEMENT, text: LAST_ELEMENT })}
        className="extraElem"
      />
    </div>
  );
}

SortableList.defaultProps = {
  onChange: undefined,
};

function TemasOrderingForCurso({ curso }:{curso:'bach1' | 'bach2' | 'eso3' | 'eso4' }) {
  const [temasOrderObj, setTemasOrderObj] = useState<{[k:string]: number}|null>(null);
  const temasOrderArray = useMemo(() => {
    if (temasOrderObj === null) return [];
    const entries = Object.entries(temasOrderObj);
    entries.sort((a, b) => a[1] - b[1]);
    return entries.map((elem) => ({ text: elem[0] === 'tema9' ? 'Temas 9 y 10' : elem[0].replace('tema', 'Tema '), value: elem[0] }));
  }, [temasOrderObj]);

  const handleChange = (elems:SortElem[]) => {
    const result = Object.fromEntries(elems.map((elem, i) => [elem.value, i]));
    getFromSocket('write:main', `general/ordenDeTemas/${curso}`, result);
  };
  useEffect(() => onValueDDBB(`general/ordenDeTemas/${curso}`, setTemasOrderObj, Toast.addMsg), []);
  if (temasOrderObj === null) return null;
  return (
    <SortableList elements={temasOrderArray} onChange={handleChange} />
  );
}

export default function TemasOrdering() {
  return (
    <div>
      <h3>Ordenar Temas</h3>
      <div>
        <h4>2º BACH</h4>
        <TemasOrderingForCurso curso="bach2" />
      </div>
      <div>
        <h4>1º BACH</h4>
        <TemasOrderingForCurso curso="bach1" />
      </div>
      <div>
        <h4>4º ESO</h4>
        <TemasOrderingForCurso curso="eso4" />
      </div>
      <div>
        <h4>3º ESO</h4>
        <TemasOrderingForCurso curso="eso3" />
      </div>
    </div>
  );
}
