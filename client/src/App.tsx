import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";

// Pages
import Landing from "@/pages/Landing";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Medicines from "@/pages/Medicines";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import Orders from "@/pages/Orders";
import Profile from "@/pages/Profile";
import Prescriptions from "@/pages/Prescriptions";
import Dashboard from "@/pages/admin/Dashboard";
import MedicineManagement from "@/pages/admin/MedicineManagement";
import AdminOrders from "@/pages/admin/Orders";
import PrescriptionReview from "@/pages/admin/PrescriptionReview";
import Reports from "@/pages/admin/Reports";
import BulkUpload from "@/pages/admin/BulkUpload";
import BatchManagement from "@/pages/admin/BatchManagement";
import BatchManagementEnhanced from "@/pages/admin/BatchManagementEnhanced";
import ExpiredMedicines from "@/pages/admin/ExpiredMedicines";
import SystemConfig from "@/pages/admin/SystemConfig";
import SuperAdminDashboard from "@/pages/superadmin/Dashboard";
import StoreOnboarding from "@/pages/superadmin/StoreOnboarding";
import SuperAdminSystemConfig from "@/pages/superadmin/SystemConfig";
import StoreManagement from "@/pages/superadmin/StoreManagement";
import PlatformAnalytics from "@/pages/superadmin/PlatformAnalytics";
import UserManagement from "@/pages/superadmin/UserManagement";
import Notifications from "@/pages/Notifications";
import AdminNotifications from "@/pages/admin/Notifications";
import NotFound from "@/pages/not-found";

function Router() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-lg">Loading...</div>
      </div>
    );
  }

  // Determine home component based on user role
  const getHomeComponent = () => {
    if (!isAuthenticated) return Landing;
    if (user?.role === 0 || user?.role === "super_admin") return SuperAdminDashboard; // Super admin
    if (user?.role === 1 || user?.role === "admin") return Dashboard; // Admin
    return Home; // Customer (role 2)
  };

  return (
    <Layout>
      <Switch>
        {/* Public routes */}
        <Route path="/" component={getHomeComponent()} />
        {/* Medicines route - only for customers (role 2) */}
        {(user?.role === 2 || user?.role === "customer") && <Route path="/medicines" component={Medicines} />}
        <Route path="/login" component={Login} />
        
        {/* Protected customer routes - only for customers (role 2) */}
        {(user?.role === 2 || user?.role === "customer") && (
          <>
            <Route path="/cart">
              <ProtectedRoute>
                <Cart />
              </ProtectedRoute>
            </Route>
            <Route path="/checkout">
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            </Route>
            <Route path="/orders">
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            </Route>
            <Route path="/profile">
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            </Route>
            <Route path="/prescriptions">
              <ProtectedRoute>
                <Prescriptions />
              </ProtectedRoute>
            </Route>
            <Route path="/notifications">
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            </Route>
          </>
        )}
        
        {/* Protected admin routes */}
        <Route path="/admin/dashboard">
          <ProtectedRoute requiredRole="admin">
            <Dashboard />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/medicines">
          <ProtectedRoute requiredRole="admin">
            <MedicineManagement />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/orders">
          <ProtectedRoute requiredRole="admin">
            <AdminOrders />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/prescriptions">
          <ProtectedRoute requiredRole="admin">
            <PrescriptionReview />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/reports">
          <ProtectedRoute requiredRole="admin">
            <Reports />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/bulk-upload">
          <ProtectedRoute requiredRole="admin">
            <BulkUpload />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/batches">
          <ProtectedRoute requiredRole="admin">
            <BatchManagementEnhanced />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/expired-medicines">
          <ProtectedRoute requiredRole="admin">
            <ExpiredMedicines />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/system-config">
          <ProtectedRoute requiredRole="admin">
            <SystemConfig />
          </ProtectedRoute>
        </Route>
        
        {/* Super Admin routes */}
        <Route path="/superadmin/dashboard">
          <ProtectedRoute requiredRole="super_admin">
            <SuperAdminDashboard />
          </ProtectedRoute>
        </Route>
        <Route path="/superadmin/store-onboarding">
          <ProtectedRoute requiredRole="super_admin">
            <StoreOnboarding />
          </ProtectedRoute>
        </Route>
        <Route path="/superadmin/system-config">
          <ProtectedRoute requiredRole="super_admin">
            <SuperAdminSystemConfig />
          </ProtectedRoute>
        </Route>
        <Route path="/superadmin/stores">
          <ProtectedRoute requiredRole="super_admin">
            <StoreManagement />
          </ProtectedRoute>
        </Route>
        <Route path="/superadmin/analytics">
          <ProtectedRoute requiredRole="super_admin">
            <PlatformAnalytics />
          </ProtectedRoute>
        </Route>
        <Route path="/superadmin/users">
          <ProtectedRoute requiredRole="super_admin">
            <UserManagement />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/notifications">
          <ProtectedRoute requiredRole="admin">
            <AdminNotifications />
          </ProtectedRoute>
        </Route>
        
        {/* Fallback to 404 */}
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
