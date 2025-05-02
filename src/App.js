
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar.jsx';
import HomePage from './components/Homepage/Homepage.jsx'; // <- case-sensitive!
import Signin from './components/Signin';
import Signup from './components/Signup';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
// import './Navbar.css';
// import './Homepage.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <main className="app-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/signin" element={<Signin />} />
            <Route path="/signup" element={<Signup />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;