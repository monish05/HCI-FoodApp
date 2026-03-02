import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { FridgeProvider } from './context/FridgeContext'
import { ShoppingProvider } from './context/ShoppingContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import MyFridge from './pages/MyFridge'
import MealPlanner from './pages/MealPlanner'
import RecipeLibrary from './pages/RecipeLibrary'
import RecipeDetail from './pages/RecipeDetail'
import CookingMode from './pages/CookingMode'
import ShoppingList from './pages/ShoppingList'
import Analytics from './pages/Analytics'
import Login from './pages/Login'
import Survey from './pages/Survey'
import Profile from './pages/Profile'

function RequireAuth({ children }) {
  const auth = useAuth()
  const location = useLocation()

  if (auth.loading) {
    return (
      <div className="page-content py-24 text-center text-sm text-ink-muted">
        Loading...
      </div>
    )
  }

  if (!auth.isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (!auth.hasPreferences && location.pathname !== '/survey') {
    return <Navigate to="/survey" replace />
  }

  return children
}

function AppLayout() {
  const auth = useAuth()
  const location = useLocation()
  const showNav = auth.isAuthenticated && location.pathname !== '/login'

  return (
    <>
      {showNav && <Navbar />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/survey"
          element={(
            <RequireAuth>
              <Survey />
            </RequireAuth>
          )}
        />
        <Route
          path="/profile"
          element={(
            <RequireAuth>
              <Profile />
            </RequireAuth>
          )}
        />
        <Route
          path="/"
          element={(
            <RequireAuth>
              <Home />
            </RequireAuth>
          )}
        />
        <Route
          path="/fridge"
          element={(
            <RequireAuth>
              <MyFridge />
            </RequireAuth>
          )}
        />
        <Route
          path="/planner"
          element={(
            <RequireAuth>
              <MealPlanner />
            </RequireAuth>
          )}
        />
        <Route
          path="/recipes"
          element={(
            <RequireAuth>
              <RecipeLibrary />
            </RequireAuth>
          )}
        />
        <Route
          path="/recipes/:id"
          element={(
            <RequireAuth>
              <RecipeDetail />
            </RequireAuth>
          )}
        />
        <Route
          path="/cooking"
          element={(
            <RequireAuth>
              <CookingMode />
            </RequireAuth>
          )}
        />
        <Route
          path="/shopping"
          element={(
            <RequireAuth>
              <ShoppingList />
            </RequireAuth>
          )}
        />
        <Route
          path="/analytics"
          element={(
            <RequireAuth>
              <Analytics />
            </RequireAuth>
          )}
        />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <FridgeProvider>
        <ShoppingProvider>
          <AppLayout />
        </ShoppingProvider>
      </FridgeProvider>
    </AuthProvider>
  )
}
