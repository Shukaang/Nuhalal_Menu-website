import React from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import MainMenuPage from './Component/MainMenu'
import AdminDashboard from './Component/AdminDashboard'

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainMenuPage/>} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </Router>
  )
}

export default App