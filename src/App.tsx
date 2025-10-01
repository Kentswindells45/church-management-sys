/**
 * Main application component that handles routing and layout
 * Sets up protected routes and authentication flow
 * Manages the overall application structure
 */
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./contexts/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Members from "./pages/Members";
import Events from "./pages/Events";
import Donations from "./pages/Donations";
import Volunteers from "./pages/Volunteers";
import Admin from "./pages/Admin";
import MainLayout from "./components/Layout/MainLayout";
import RequireAuth from "./components/RequireAuth";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            element={
              <RequireAuth>
                <MainLayout />
              </RequireAuth>
            }
          >
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/members" element={<Members />} />
            <Route path="/events" element={<Events />} />
            <Route path="/donations" element={<Donations />} />
            <Route path="/volunteers" element={<Volunteers />} />
            <Route path="/admin" element={<Admin />} />
          </Route>
        </Routes>
        <Toaster position="top-right" />
      </BrowserRouter>
    </AuthProvider>
  );
}
