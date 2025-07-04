import { BrowserRouter as Router, Routes, Route, Link, Outlet } from 'react-router-dom';


import './App.css';
import FlowCanvas from "./components/FlowCanvas";
import Parent from './practice/Parent';
import HocImp from './practice/HocImp';
import UsersForm from './practice/UsersForm';
import StudentsForm from './practice/StudentsForm';
import Chat from './practice/Chat';
import Layout from './Layout';
import FormDemo from './practice/FormDemo';
import Search from './practice/Search';
import { DevidSearch } from './practice/DevidSearch';
import ProxyComponent from './proxy/ProxyComponent';


function App() {
  return (
    <div>
           <Router>
      {/* <div> */}
        <h1>My React App</h1>
        <nav>
          <ul>
            <li><Link to="/">Home</Link></li>
            {/* <li><Link to="/about">About</Link></li> */}
             <li><Link to="/form">Form Demo</Link></li>

            <li><Link to="/prac">Prac</Link></li>
            <li><Link to="/hoc">Hoc</Link></li>
             <li><Link to="/user">User</Link></li>
             <li><Link to="/students">Students</Link></li>
             <li><Link to="/chat">Chat</Link></li>
             <li><Link to="/flowcanvas">Flow Canvas</Link></li>
             <li><Link to="/search">search</Link></li>
             <li><Link to="/devidsearch">devid search</Link></li>
             <li><Link to="/proxy">Proxy components</Link></li>





          </ul>
        </nav>
        <Routes>
          <Route path="/flowcanvas" element={<FlowCanvas />} />
          <Route path="/prac" element={<Parent />} />
          <Route path="/hoc" element={<HocImp />} />
          <Route path="/user" element={<UsersForm />} />
          <Route path="/students" element={<StudentsForm />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/search" element={<Search/>} />
          <Route path="/form" element={<FormDemo/>} />
          <Route path="/devidsearch" element={<DevidSearch/>} />
          <Route path="/proxy" element={<ProxyComponent/>} />


          
        </Routes>


      {/* </div> */}
      {/* <Layout/> */}

    </Router>
      {/* <h2 style={{ textAlign: "center" }}>🧱 React Flow Builder</h2> */}
      {/* <FlowCanvas /> */}
    </div>
  );
}

export default App;
