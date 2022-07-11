import { faInfo } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from 'components/Button';
import CommandDescription from 'components/CommandDescription';
import { addShortCut } from 'info/shortcuts';
import { getShortCut } from 'info/shortcutTools';
import React, {
  ChangeEvent, FormEvent, KeyboardEvent, useState,
  useRef,
  useEffect,
} from 'react';

import SearchCmd, { Comando } from 'services/commands';
import './Search.css';

export default function Search() {
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLInputElement>(null);
  const [autocomplete, setAutocomplete] = useState<
    {text:string, desc:string, cmd?:Comando}[]>([]);
  const [activeAutoComplete, setActiveAutocomplete] = useState(0);
  const [activeToolTip, setActiveTooltip] = useState(false);
  const [description, setDescription] = useState('');
  const setEmpty = () => {
    setAutocomplete([]);
    setActiveAutocomplete(0);
  };

  useEffect(() => addShortCut({
    default: 'F2',
    get shortcut() {
      return getShortCut(this);
    },
    description: 'Activa la barra de comandos y búsqueda.',
    id: 'focusSearch',
    action: () => ref.current?.focus(),
  }), [ref.current]);
  useEffect(() => {
    const cb = (e:FocusEvent) => {
      const target = e.relatedTarget as HTMLElement;
      if ((target !== null && target.closest('.triggerAutocomplete') !== null)) return;
      setEmpty();
    };
    ref.current?.addEventListener('blur', cb);
    return () => ref.current?.removeEventListener('blur', cb);
  }, [ref.current]);
  useEffect(() => {
    document.querySelector('.activeAuto')?.scrollIntoView();
  }, [activeAutoComplete]);
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setSearch(value);
  };
  const handleKeyDown = (e:KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (['ArrowUp', 'ArrowDown', 'Tab'].includes(e.code)) e.preventDefault();
    if (e.code === 'Escape') ref.current?.blur();
  };
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (autocomplete.length !== 0) return;
    SearchCmd.runSearchOrCommand(search);
  };
  const handleKeyUp = (event:KeyboardEvent<HTMLInputElement>) => {
    const { value, selectionStart } = event.currentTarget;
    if (['ArrowUp', 'ArrowDown', 'Tab'].includes(event.code) && value.startsWith('/')) {
      setActiveAutocomplete((activeAutoComplete + (event.code === 'ArrowUp' ? -1 : 1) + autocomplete.length) % autocomplete.length);
    } else if (event.code === 'Enter' && value.startsWith('/') && autocomplete.length !== 0) {
      setSearch(SearchCmd.runAutoComplete(
        value.slice(0, selectionStart ?? undefined),
        activeAutoComplete,
      ) + value.slice(selectionStart ?? Infinity));
      setEmpty();
    } else if (value.startsWith('/') && event.code !== 'Enter') {
      const [auto, desc] = SearchCmd.getAutoComplete(value.slice(0, selectionStart ?? undefined));
      setAutocomplete(auto);
      setDescription(desc);
      setActiveAutocomplete(0);
    } else if (autocomplete.length !== 0) {
      setEmpty();
    }
  };
  return (
    <form className="searcherForm" onSubmit={handleSubmit}>
      { autocomplete.length > 0
      && (
      <div
        className="autocompleteSearcher"
        style={{
          left: ref.current?.offsetLeft,
        }}
      >
        <strong>{description}</strong>
        <div>
          <ul className="unlisted">
            {autocomplete.map((x, i) => (
              <li className={i === activeAutoComplete ? 'activeAuto' : ''} key={`${search}_${x.text}`}>
                <Button
                  className="triggerAutocomplete"
                  onClick={() => {
                    const curr = ref.current;
                    if (curr === null) return;
                    const { selectionStart } = curr;
                    setSearch(SearchCmd.runAutoComplete(
                      search.slice(0, selectionStart ?? undefined),
                      i,
                    ) + search.slice(selectionStart ?? Infinity));
                    setEmpty();
                    ref.current?.focus();
                  }}
                >
                  <div>{x.text}</div>
                  <em>{x.desc}</em>
                  {x.cmd
                    && (
                    <>
                      {
                      // eslint-disable-next-line jsx-a11y/click-events-have-key-events
                        <div
                          className="tooltipSearchInfo"
                          role="button"
                          tabIndex={-1}
                          onClick={(e) => {
                            e.stopPropagation();
                            ref.current?.focus();
                            if (!activeToolTip || activeAutoComplete === i) {
                              setActiveTooltip(!activeToolTip);
                            }
                            setActiveAutocomplete(i);
                          }}
                        >
                          <FontAwesomeIcon icon={faInfo} />
                        </div>
}
                      {(activeToolTip && i === activeAutoComplete) && (
                      <div className="tooltipSearch">
                        <CommandDescription cmd={x.cmd} />
                      </div>
                      )}
                    </>
                    )}
                </Button>
              </li>
            ))}
          </ul>
        </div>
      </div>
      )}
      <input
        ref={ref}
        className="searcher"
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        placeholder="Usa / para ejecutar comandos o busca en la página"
        type="search"
        onChange={handleChange}
        value={search}
      />
    </form>
  );
}
