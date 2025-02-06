import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Login from './screens/Login';
import Signup from './screens/Signup';
import Profile from './screens/Profile';
import Drinks from './screens/Drinks';

function App() {
  return (
    <Router>
      <div>
        <nav style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>
          <Link to="/login" style={{ marginRight: '10px' }}>Login</Link>
          <Link to="/signup" style={{ marginRight: '10px' }}>Signup</Link>
          <Link to="/profile" style={{ marginRight: '10px' }}>Profile</Link>
          <Link to="/drinks" style={{ marginRight: '10px' }}>Drinks</Link>
        </nav>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/drinks" element={<Drinks />} />
          <Route path="*" element={<Drinks />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
