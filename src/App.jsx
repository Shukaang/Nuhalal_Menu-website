// App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AdminDashboard from './Component/AdminDashboard';
import MainMenuPage from './Component/MainMenu';
import Login from './Component/Login';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // manual login tracking

  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainMenuPage />} />
        <Route path="/login" element={<Login onLogin={() => setIsLoggedIn(true)} />} />
        <Route
          path="/admin"
          element={
            isLoggedIn ? (
              <AdminDashboard />
            ) : (
              <Login onLogin={() => setIsLoggedIn(true)} />
            )
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
