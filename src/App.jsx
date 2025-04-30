import React from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import AdminDashboard from './Component/AdminDashboard'
import MainMenuPage from './Component/MainMenu'


const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainMenuPage/>} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </Router>
  )
}

export default App