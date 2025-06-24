import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "super_admin" | "admin" | "customer";
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  // Helper function to check if user has required role
  const hasRequiredRole = (userRole: any, required: string) => {
    if (!required) return true;
    
    // Handle numeric roles (new system)
    if (typeof userRole === 'number') {
      const roleMap: Record<number, string> = {
        0: 'super_admin',
        1: 'admin', 
        2: 'customer'
      };
      return roleMap[userRole] === required;
    }
    
    // Handle string roles (legacy system)
    return userRole === required;
  };

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You need to be logged in to access this page.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/login";
      }, 1000);
      return;
    }

    if (!isLoading && isAuthenticated && requiredRole && !hasRequiredRole(user?.role, requiredRole)) {
      toast({
        title: "Access Denied",
        description: `You need ${requiredRole} privileges to access this page.`,
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
      return;
    }
  }, [isAuthenticated, isLoading, user, requiredRole, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated || (requiredRole && !hasRequiredRole(user?.role, requiredRole))) {
    return null;
  }

  return <>{children}</>;
}
