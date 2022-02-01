import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faFileAlt,
  faFilePdf,
  faFileWord,
  faFilePowerpoint,
  faFileImage,
  faFolder,
  faAngleRight,
  faInfoCircle,
} from '@fortawesome/free-solid-svg-icons';
// import reportWebVitals from './reportWebVitals';
import App from './components/App';

library.add(
  faFileAlt,
  faFilePdf,
  faFileWord,
  faFilePowerpoint,
  faFileImage,
  faFolder,
  faAngleRight,
  faInfoCircle,
);

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root'),
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
