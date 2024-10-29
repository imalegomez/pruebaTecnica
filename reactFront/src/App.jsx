import React from "react";
import { useLocation ,BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import MainMenu from "./components/MainMenu";
import SudokuGame from "./components/SudokuGame";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Login, Register } from "./components/auth";

const PrivateRoute = ({ children }) => {
    const { userId, isAuthChecked } = useAuth();
    const location = useLocation();
  
    // No hacemos nada hasta que hayamos verificado la autenticación
    if (!isAuthChecked) {
      return null; // O un componente de loading si prefieres
    }
  
    return userId ? 
      children : 
      <Navigate to="/" state={{ from: location }} replace />;
  };

const App = () => {
    return (
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } />
            <Route path="/register" element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } />
            <Route path="/menu" element={
              <PrivateRoute>
                <MainMenu />
              </PrivateRoute>
            } />
            <Route path="/game/:gameId" element={
              <PrivateRoute>
                <SudokuGame />
              </PrivateRoute>
            } />
          </Routes>
        </Router>
      </AuthProvider>
    );
  };
  
  // Agregamos un PublicRoute para manejar las rutas públicas
  const PublicRoute = ({ children }) => {
    const { userId, isAuthChecked } = useAuth();
    const location = useLocation();
  
    if (!isAuthChecked) {
      return null; // O un componente de loading si prefieres
    }
  
    return !userId ? 
      children : 
      <Navigate to="/menu" state={{ from: location }} replace />;
  };

export default App;
