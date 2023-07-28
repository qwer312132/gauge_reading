import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import {Title} from "./Title";
import { Home } from "./Home";
import { About } from "./About";

class App2 extends React.Component {
  render() {
    return (
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/title" element={<Title />} />
        </Routes>
      </Router>
    );
  }
}
export default App2;
