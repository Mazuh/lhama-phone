import React from 'react';
import { HashRouter as Router, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.css';
import WelcomePage from './components/WelcomePage';
import HomePage from './components/HomePage';

const App: React.FunctionComponent = () => {
  return (
    <Router>
      <Route exact={true} path="/" component={WelcomePage}></Route>
      <Route exact={true} path="/home" component={HomePage}></Route>
    </Router>
  );
}

export default App;
