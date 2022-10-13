/* eslint-disable react/jsx-no-useless-fragment */
import React from 'react';
import { Route } from 'react-router-dom';
import { Paginas } from 'types/interfaces';

export default function MyRoutes({ pags, remove }:{pags:Paginas, remove?:string}) {
  return (
    <>
      {pags.map((pag) => {
        const isVisible = typeof pag.visible === 'function' ? pag.visible() : pag.visible;
        return (
          <React.Fragment key={pag.id}>
            {isVisible ? (
              pag.paths.map((path) => <Route key={path} element={pag.component} path={remove ? path.replace(remove, '') : path} />)
            ) : null}
          </React.Fragment>
        );
      })}
    </>
  );
}

MyRoutes.defaultProps = {
  remove: undefined,
};
