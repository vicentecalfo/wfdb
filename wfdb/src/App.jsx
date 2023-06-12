import "./App.css";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MapPage from "./pages/MapPage";
import AboutPage from "./pages/AboutPage";


function App() {

  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<MapPage/>} />
        <Route path="/about" element={<AboutPage/>} />
      </Routes>
    </Router>
  );
}

export default App;
