import React from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import AdminDashbord from './Component/AdminDashbord'
import MainMenuPage from './Component/MainMenu'


const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainMenuPage/>} />
        <Route path="/admin" element={<AdminDashbord />} />
      </Routes>
    </Router>
  )
}

export default App