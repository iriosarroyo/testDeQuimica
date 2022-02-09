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
  faBars,
  faUser,
  faHome,
  faArchive,
  faCheckCircle,
  faCircle,
  faCalendarDay,
} from '@fortawesome/free-solid-svg-icons';
// import reportWebVitals from './reportWebVitals';
import { faCircle as farCircle } from '@fortawesome/free-regular-svg-icons';
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
  faBars,
  faUser,
  faHome,
  faArchive,
  faCircle,
  farCircle,
  faCheckCircle,
  faCalendarDay,
);

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root'),
);

window.addEventListener('resize', () => document
  .documentElement
  .style
  .setProperty('--vh', `${window.innerHeight / 100}px`));
// window.addEventListener('resize', () => alert(`${window.innerHeight / 100}px`));

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
