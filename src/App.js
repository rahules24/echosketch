import React from "react";
import './App.css';
import './index.css';
import Paper from './components/Paper';
import About from './components/About';
import 'bootstrap/dist/css/bootstrap.min.css';

import {
  HashRouter as Router,
  Routes,
  Route
} from "react-router-dom";

function App() {
  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<Paper />} />
        <Route exact path="/about" element={<About />} />
      </Routes>
    </Router>

  );
}

export default App;