/* eslint-disable @typescript-eslint/no-unused-vars */
// filepath: f:\Node-Project\church-management\src\components\ProtectedRoute.tsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import type { User } from "../types/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "admin" | "staff" | "member";
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
}) => {
  type AuthContextType = {
    isAuthenticated: boolean;
    user: User | null;
    isLoading: boolean;
  };
  const location = useLocation();
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};
