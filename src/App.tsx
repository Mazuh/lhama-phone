import React from 'react';
import { HashRouter as Router, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.css';
import 'react-smart-tabs/dist/bundle.css';
import '@material/react-material-icon/dist/material-icon.css';
import WelcomePage from './components/WelcomePage';
import MainPage from './components/MainPage';

const App: React.FunctionComponent = () => {
  return (
    <Router>
      <Route exact={true} path="/" component={WelcomePage}></Route>
      <Route exact={true} path="/main" component={MainPage}></Route>
    </Router>
  );
}

export default App;
