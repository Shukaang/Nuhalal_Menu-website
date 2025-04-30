// App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AdminDashboard from './Component/AdminDashboard';
import MainMenu from './Component/MainMenu';
import Login from './Component/Login';
import PrivateRoute from './Component/PrivateRoute';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false); 

  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainMenu />} />
        <Route path="/login" element={<Login onLogin={() => setIsLoggedIn(true)} />} />
        <Route path="/admin" element={
          <PrivateRoute>
            <AdminDashboard />
          </PrivateRoute>
            } />
        </Routes>
    </Router>
  );
};

export default App;
