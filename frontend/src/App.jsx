import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import MyFridge from './pages/MyFridge'
import MealPlanner from './pages/MealPlanner'
import RecipeLibrary from './pages/RecipeLibrary'
import RecipeDetail from './pages/RecipeDetail'
import CookingMode from './pages/CookingMode'
import ShoppingList from './pages/ShoppingList'
import Analytics from './pages/Analytics'

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/fridge" element={<MyFridge />} />
        <Route path="/planner" element={<MealPlanner />} />
        <Route path="/recipes" element={<RecipeLibrary />} />
        <Route path="/recipes/:id" element={<RecipeDetail />} />
        <Route path="/cooking" element={<CookingMode />} />
        <Route path="/shopping" element={<ShoppingList />} />
        <Route path="/analytics" element={<Analytics />} />
      </Routes>
    </>
  )
}
