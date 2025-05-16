import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';


import './App.css';
import FlowCanvas from "./components/FlowCanvas";
import Parent from './practice/Parent';
import HocImp from './practice/HocImp';
import UsersForm from './practice/UsersForm';


function App() {
  return (
    <div>
           <Router>
      <div>
        <h1>My React App</h1>
        <nav>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/prac">Prac</Link></li>
            <li><Link to="/hoc">Hoc</Link></li>
             <li><Link to="/user">User</Link></li>

          </ul>
        </nav>

        <Routes>
          {/* <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} /> */}
          <Route path="/prac" element={<Parent />} />
          <Route path="/hoc" element={<HocImp />} />
          <Route path="/user" element={<UsersForm />} />


        </Routes>
      </div>
    </Router>
      <h2 style={{ textAlign: "center" }}>🧱 React Flow Builder</h2>
      <FlowCanvas />
    </div>
  );
}

export default App;
