import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { 
  ShoppingCart, 
  User, 
  Menu, 
  X, 
  Bell,
  Pill,
  ChevronDown,
  Globe
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, isAuthenticated } = useAuth();
  const { t, language, changeLanguage } = useTranslation();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Admin users only see dashboard, customer users see regular navigation
  const isAdmin = user?.role === "admin";

  // Get cart count - only for customer users
  const { data: cartItems = [] } = useQuery({
    queryKey: ["/api/cart"],
    enabled: isAuthenticated && user?.role !== "admin",
  });

  // Get notifications count - only for customer users
  const { data: notifications = [] } = useQuery({
    queryKey: ["/api/notifications"],
    enabled: isAuthenticated && user?.role !== "admin",
  });

  const unreadNotifications = notifications.filter((n: any) => !n.isRead);
  const cartCount = cartItems.length;

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/auth/logout");
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
    }
  };
  
  const navigation = [
    // Customer navigation (commented out for admin users)
    { name: t('nav.medicines'), href: "/medicines", show: !isAdmin },
    { name: t('nav.orders'), href: "/orders", show: isAuthenticated && !isAdmin },
    { name: t('nav.prescriptions'), href: "/prescriptions", show: isAuthenticated && !isAdmin },
    // Admin navigation
    { name: t('nav.dashboard'), href: "/admin/dashboard", show: isAdmin },
  ];

  const MobileNavigation = () => (
    <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80">
        <div className="flex flex-col space-y-4 mt-8">
          {navigation.filter(item => item.show).map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant={location === item.href ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Button>
            </Link>
          ))}
          
          {isAuthenticated && (
            <>
              {/* Customer-specific navigation - hidden for admin users */}
              {!isAdmin && (
                <>
                  <Link href="/profile">
                    <Button
                      variant={location === "/profile" ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <User className="h-4 w-4 mr-2" />
                      {t('nav.profile')}
                    </Button>
                  </Link>
                  
                  <Link href="/cart">
                    <Button
                      variant={location === "/cart" ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      {t('nav.cart')} {cartCount > 0 && `(${cartCount})`}
                    </Button>
                  </Link>
                </>
              )}
              
              <Button onClick={handleLogout} variant="ghost" className="w-full justify-start">
                {t('auth.logout')}
              </Button>
            </>
          )}
          
          {!isAuthenticated && (
            <Link href="/login">
              <Button
                variant="default"
                className="w-full justify-start text-white bg-primary hover:bg-primary/90"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('auth.login')}
              </Button>
            </Link>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <nav className="bg-white shadow-lg sticky top-0 z-40 border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <div className="w-10 h-10 medical-bg-primary rounded-lg flex items-center justify-center mr-3">
                <Pill className="text-white h-6 w-6" />
              </div>
              <span className="text-xl font-bold medical-primary">{t('app.title')}</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              {navigation.filter(item => item.show).map((item) => (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={location === item.href ? "default" : "ghost"}
                    className="font-medium"
                  >
                    {item.name}
                  </Button>
                </Link>
              ))}

              {/* Language Selector */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-all duration-200 rounded-lg shadow-sm hover:shadow-md">
                    <Globe className="h-4 w-4 mr-1" />
                    {language.toUpperCase()}
                    <ChevronDown className="h-3 w-3 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => changeLanguage('en')}>
                    English
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => changeLanguage('hi')}>
                    हिंदी
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => changeLanguage('mr')}>
                    मराठी
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {isAuthenticated ? (
                <>
                  {/* Customer-specific navigation - hidden for admin users */}
                  {!isAdmin && (
                    <>
                      {/* Notifications */}
                      <Link href="/notifications">
                        <Button variant="ghost" size="icon" className="relative hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 rounded-lg shadow-sm hover:shadow-md">
                          <Bell className="h-5 w-5" />
                          {unreadNotifications.length > 0 && (
                            <Badge
                              variant="destructive"
                              className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 text-xs bg-gradient-to-r from-red-500 to-red-600 animate-pulse"
                            >
                              {unreadNotifications.length}
                            </Badge>
                          )}
                        </Button>
                      </Link>

                      {/* Cart */}
                      <Link href="/cart">
                        <Button variant="ghost" size="icon" className="relative hover:bg-green-50 hover:text-green-600 transition-all duration-200 rounded-lg shadow-sm hover:shadow-md">
                          <ShoppingCart className="h-5 w-5" />
                          {cartCount > 0 && (
                            <Badge
                              variant="destructive"
                              className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 text-xs bg-gradient-to-r from-green-500 to-green-600 animate-pulse"
                            >
                              {cartCount}
                            </Badge>
                          )}
                        </Button>
                      </Link>
                    </>
                  )}

                  {/* Profile Menu - available for all users */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="flex items-center space-x-2 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 transition-all duration-200 rounded-lg shadow-sm hover:shadow-md px-3 py-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-md">
                          <User className="h-4 w-4 text-white" />
                        </div>
                        <span className="hidden lg:block font-medium">
                          {user?.firstName} {user?.lastName}
                        </span>
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {/* Profile link - hidden for admin users */}
                      {!isAdmin && (
                        <DropdownMenuItem asChild>
                          <Link href="/profile">{t('nav.profile')}</Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={handleLogout}>
                        {t('auth.logout')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <Link href="/login">
                  <Button className="text-white bg-primary hover:bg-primary/90">{t('auth.login')}</Button>
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <MobileNavigation />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Mobile Cart Button */}
      {isAuthenticated && (
        <Link href="/cart">
          <Button className="fixed bottom-4 right-4 md:hidden z-30 w-14 h-14 rounded-full shadow-lg">
            <ShoppingCart className="h-6 w-6" />
            {cartCount > 0 && (
              <Badge
                variant="secondary"
                className="absolute -top-2 -right-2 w-6 h-6 flex items-center justify-center p-0 text-xs"
              >
                {cartCount}
              </Badge>
            )}
          </Button>
        </Link>
      )}

      {/* Footer */}
      <footer className="bg-medical-text text-white py-8 mt-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 medical-bg-primary rounded-lg flex items-center justify-center mr-3">
                  <Pill className="text-white h-6 w-6" />
                </div>
                <span className="text-xl font-bold">{t('app.title')}</span>
              </div>
              <p className="text-gray-100 text-sm">{t('app.description')}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-white">Quick Links</h3>
              <ul className="space-y-2 text-gray-100">
                <li><Link href="/medicines" className="hover:text-white transition-colors">Medicines</Link></li>
                <li><Link href="/prescriptions" className="hover:text-white transition-colors">Upload Prescription</Link></li>
                <li><Link href="/orders" className="hover:text-white transition-colors">Track Order</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-white">Support</h3>
              <ul className="space-y-2 text-gray-100">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-white">Contact Info</h3>
              <div className="space-y-2 text-gray-100 text-sm">
                <p>📞 +91 9876543210</p>
                <p>✉️ support@shardamed.com</p>
                <p>📍 Mumbai, Maharashtra</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-600 mt-8 pt-8 text-center text-gray-100 text-sm">
            <p>&copy; 2024 {t('app.title')}. All rights reserved. Licensed pharmacy.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
