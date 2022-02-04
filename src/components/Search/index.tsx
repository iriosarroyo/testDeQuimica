import React, { ChangeEvent, FormEvent, useState } from 'react';

export default function Search() {
  const [search, setSearch] = useState('');
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setSearch(value);
  };
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log({ search });
  };
  return (
    <form className="searcherForm" onSubmit={handleSubmit}>
      <input className="searcher" placeholder="Escribe y pulsa enter para buscar" type="search" onChange={handleChange} value={search} />
    </form>
  );
}
