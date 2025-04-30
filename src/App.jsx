import React from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import AdminDashboard from './Component/AdminDashboard'
import MainMenuPage from './Component/MainMenu'
import Login from './Component/Login'
import ProtectedRoute from './Component/ProtactedRoute'


const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainMenuPage/>} />
        <Route path="/login"/>
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminDashboard/>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  )
}

export default App