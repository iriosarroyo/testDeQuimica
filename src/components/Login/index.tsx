import { logIn } from 'services/user';
import React, { useContext, useEffect, useState } from 'react';
import MyErrorContext from 'contexts/Error';
import { Logo } from 'services/determineApp';
import { ReactComponent as GoogleLogo } from 'logoGoogle.svg';
import Button from 'components/Button';
import './Login.css';
import { useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarDay, faCopy, faUsers } from '@fortawesome/free-solid-svg-icons';
import Toast from 'services/toast';

function GoToLogin() {
  return <a href="#login" className="pagesButtonLogIn">Iniciar Sesión</a>;
}

export default function Login() {
  const setError = useContext(MyErrorContext);
  const [cookies, setCookies] = useState(localStorage.getItem('cookies') === 'true');
  const acceptCookies = () => {
    localStorage.setItem('cookies', 'true');
    setCookies(true);
  };
  const location = useLocation();
  useEffect(() => {
    if (location.hash !== '') document.querySelector(location.hash)?.scrollIntoView();
  }, []);
  return (
    <div className="loginContainer">
      {!cookies && (
      <div className="cookies">
        <span>Esta página utiliza cookies. Antes de iniciar sesión debes aceptar las cookies.</span>
        <Button onClick={acceptCookies}>Aceptar las cookies</Button>
      </div>
      )}
      <div className="slideGroup">
        <div className="slide" id="login">
          <Logo />
          <Button
            className="logInButton"
            onClick={() => {
              if (localStorage.getItem('cookies') !== 'true') {
                Toast.addMsg('Debes aceptar antes las cookies.', 5000);
                return;
              }
              logIn(setError);
            }}
          >
            <GoogleLogo className="googleLogo" />
            <span>Iniciar sesión con Google</span>
          </Button>
          <div className="pagesButtonContainer">
            <a href="#Retamar" className="pagesButtonLogIn">Retamar</a>
            <a href="#laPagina" className="pagesButtonLogIn">La página web</a>
            <a href="#historia" className="pagesButtonLogIn hidden">Últimos Años</a>
          </div>
        </div>
        <div className="slide" id="Retamar">
          <div className="slideContent">
            <a
              className="backgroundRetamar"
              href="https://www.retamar.com"
              target="_blank"
              rel="noreferrer"
            >
              <img
                alt="Escudo Retamar"
                src="/logoRetamar.png"
              />
            </a>
            <h2>
              Esta es la página web de preparación para las Olimpiadas de
              {' '}
              {process.env.REACT_APP_ASIGNATURA}
              {' '}
              del
              {' '}
              <a
                href="https://www.retamar.com"
                target="_blank"
                rel="noreferrer"
              >
                Colegio Retamar
              </a>
              .
            </h2>
            <GoToLogin />
          </div>
        </div>
        <div className="slide" id="laPagina">
          <div className="slideContent">
            <h2>Aquí podrás encontrar:</h2>
            <div className="panelGroup">
              <div className="panel">
                <div className="panelImg">
                  <FontAwesomeIcon icon={faCalendarDay} />
                </div>
                <div className="panelText">
                  <h4>Test Del Día</h4>
                  <p> Un test nuevo cada día con 5 preguntas de olimpiadas anteriores.</p>
                </div>
              </div>
              <div className="panel">
                <div className="panelImg">
                  <FontAwesomeIcon icon={faUsers} />
                </div>
                <div className="panelText">
                  <h4>Online</h4>
                  <p>
                    Un modo para competir contra tus amigos
                    resolviendo preguntas de olimpiadas.

                  </p>
                </div>
              </div>
              <div className="panel">
                <div className="panelImg">
                  <FontAwesomeIcon icon={faCopy} />
                </div>
                <div className="panelText">
                  <h4>Documentos</h4>
                  <p>Podrás descagarte archivos con apuntes para las olimpiadas y mucho más.</p>
                </div>
              </div>
            </div>
            <GoToLogin />
          </div>
        </div>
        <div className="slide" id="historia" hidden>
          <div className="panelGroup">
            <div className="panel">
              <div className="panelImg">
                <img src="/madrid.png" alt="Madrid" />
              </div>
              <div className="panelText" hidden>
                <h4>Olimpiadas 2020</h4>
                <strong>Olimpiada Local</strong>
                <ul>
                  <li>
                    Javier Sánchez-Bonilla Martínez (2º puesto).
                    Lorem ipsum, dolor sit amet consectetur adipisicing elit.
                    Ratione similique aliquam minima, magni iste alias possimus vero,
                    quo numquam impedit iusto. Obcaecati, perferendis non! Veritatis
                    commodi beatae impedit accusamus alias officiis, fugit consequatur
                    perferendis tempore maxime, molestias consectetur soluta quam voluptatibus
                    reprehenderit optio ullam, labore eligendi quis ad magni nulla porro iusto
                    quos? Fugiat a quos sequi consequuntur id impedit voluptate aspernatur
                    provident
                    laudantium,
                    omnis autem in pariatur rem optio quo doloremque, dicta nemo dolorum
                    assumenda.
                    Ullam, totam fuga dolore vero quis in eum placeat reiciendis voluptatum
                    voluptatibus at non, ab magnam natus veniam atque voluptatem eveniet rem.
                    Nihil soluta quos quidem numquam quisquam atque nam. Libero rem,
                    aliquam quam, doloribus quod neque ad dicta qui inventore
                    optio perspiciatis natus?
                    Assumenda, magnam similique. Tempora assumenda laboriosam
                    similique eius, iusto consectetur, vitae neque vel magnam deleniti
                    ratione corporis pariatur deserunt veniam atque suscipit ullam earum
                    perferendis sequi eveniet. Provident maxime autem ea dicta laborum,
                    in tempora blanditiis sequi harum vel modi voluptas quasi itaque
                    placeat nihil nisi. Quaerat cupiditate tempore, non expedita qui
                    magnam, repellat libero esse ullam velit iure. Porro voluptatum
                    consectetur eum sunt blanditiis doloremque ex inventore ab aspernatur.
                    Quidem vero rerum iusto amet cum modi dolore excepturi hic cumque,
                    laboriosam numquam velit voluptatem saepe exercitationem, quis beatae,
                    incidunt doloremque omnis veniam. Amet aspernatur, quasi sapiente impedit
                    quisquam ducimus officia. Sapiente ad expedita itaque aliquid mollitia
                    sunt impedit. Neque voluptate non deserunt quisquam iste amet, laboriosam
                    dolorem possimus ipsam distinctio expedita rerum deleniti officiis asperiores
                    voluptas necessitatibus nobis, numquam magnam ipsum? Debitis dicta fuga
                    architecto
                    S
                    it dolores, inventore mollitia consequuntur temporibus odio amet asperiores
                    neque quibusdam voluptate alias nesciunt labore hic accusamus animi itaque
                    fugiat aperiam dolore quia illum dignissimos nulla fugit officiis placeat?
                    Accusamus, error. Explicabo ex et at, consectetur dolorum sed nisi quae
                    iure quibusdam voluptate deserunt dicta? Est exercitationem suscipit
                    provident culpa, voluptatem quisquam aliquam cumque quidem. Iusto
                    commodi earum aliquid mollitia consequatur. Suscipit officia,
                    cupiditate quis porro non nostrum quidem molestiae, beatae,
                    corporis et iure! Accusantium minima consequuntur modi possimus
                    architecto
                    eos harum expedita quod, deleniti dicta asperiores id placeat inventore,
                  </li>
                </ul>
              </div>
            </div>
            <div className="panel">
              <div className="panelImg"><img src="" alt="" /></div>
              <div className="panelText">
                <h4>Olimpiadas 2021</h4>
                <p />
              </div>
            </div>
            <div className="panel">
              <div className="panelImg"><img src="" alt="" /></div>
              <div className="panelText">
                <h4>Olimpiadas 2022</h4>
                <p />
              </div>
            </div>
          </div>
          <GoToLogin />
        </div>
      </div>
    </div>
  );
}
