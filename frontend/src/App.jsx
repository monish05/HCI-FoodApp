import { Routes, Route } from 'react-router-dom'
import { FridgeProvider } from './context/FridgeContext'
import { ShoppingProvider } from './context/ShoppingContext'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'

import Home from './pages/Home'
import MyFridge from './pages/MyFridge'
import MealPlanner from './pages/MealPlanner'
import RecipeLibrary from './pages/RecipeLibrary'
import RecipeDetail from './pages/RecipeDetail'
import CookingMode from './pages/CookingMode'
import ShoppingList from './pages/ShoppingList'
import Analytics from './pages/Analytics'
import Profile from './pages/Profile'

import Login from './pages/Login'
import Register from './pages/Register'

export default function App() {
  return (
    <FridgeProvider>
      <ShoppingProvider>
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/fridge" element={<ProtectedRoute><MyFridge /></ProtectedRoute>} />
          <Route path="/planner" element={<ProtectedRoute><MealPlanner /></ProtectedRoute>} />
          <Route path="/recipes" element={<ProtectedRoute><RecipeLibrary /></ProtectedRoute>} />
          <Route path="/recipes/:id" element={<ProtectedRoute><RecipeDetail /></ProtectedRoute>} />
          <Route path="/cooking" element={<ProtectedRoute><CookingMode /></ProtectedRoute>} />
          <Route path="/shopping" element={<ProtectedRoute><ShoppingList /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />

          {/* ✅ Profile */}
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        </Routes>
      </ShoppingProvider>
    </FridgeProvider>
  )
}