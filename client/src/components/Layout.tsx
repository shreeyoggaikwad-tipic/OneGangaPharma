import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
// import { useTranslation } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import {
  ShoppingCart,
  User,
  Menu,
  X,
  Bell,
  Pill,
  ChevronDown,
  Globe,
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
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, isAuthenticated } = useAuth();
  // const { t, language, changeLanguage } = useTranslation();
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
    { name: "Medicines", href: "/medicines", show: !isAdmin },
    {
      name: "Orders",
      href: "/orders",
      show: isAuthenticated && !isAdmin,
    },
    {
      name: "Prescriptions",
      href: "/prescriptions",
      show: isAuthenticated && !isAdmin,
    },
    // Admin navigation
    { name: "Dashboard", href: "/admin/dashboard", show: isAdmin },
  ];

  const MobileNavigation = () => (
    <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80">
        <SheetHeader className="sr-only">
          <SheetTitle>Navigation Menu</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col space-y-4 mt-8">
          {navigation
            .filter((item) => item.show)
            .map((item) => (
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

          {/* Language Selector for Mobile - Commented out */}
          {/*
          <div className="py-2 border-t border-gray-200">
            <div className="text-sm font-medium text-gray-700 mb-2 px-3">
              Language
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={language === "en" ? "default" : "outline"}
                size="sm"
                className="text-xs"
                onClick={() => changeLanguage("en")}
              >
                EN
              </Button>
              <Button
                variant={language === "hi" ? "default" : "outline"}
                size="sm"
                className="text-xs"
                onClick={() => changeLanguage("hi")}
              >
                हिं
              </Button>
              <Button
                variant={language === "mr" ? "default" : "outline"}
                size="sm"
                className="text-xs"
                onClick={() => changeLanguage("mr")}
              >
                मरा
              </Button>
            </div>
          </div>
          */}

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
                      Profile
                    </Button>
                  </Link>

                  <Link href="/notifications">
                    <Button
                      variant={location === "/notifications" ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Bell className="h-4 w-4 mr-2" />
                      Notifications
                      {unreadNotifications.length > 0 && (
                        <Badge
                          variant="destructive"
                          className="ml-auto w-5 h-5 flex items-center justify-center p-0 text-xs"
                        >
                          {unreadNotifications.length}
                        </Badge>
                      )}
                    </Button>
                  </Link>

                  <Link href="/cart">
                    <Button
                      variant={location === "/cart" ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Cart {cartCount > 0 && `(${cartCount})`}
                    </Button>
                  </Link>
                </>
              )}

              <Button
                onClick={handleLogout}
                variant="ghost"
                className="w-full justify-start"
              >
                Logout
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
                Login
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
      <nav className="bg-white/95 backdrop-blur-md shadow-lg fixed top-0 left-0 right-0 z-50 border-b border-gray-200/50 transition-all duration-300">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <div className="w-10 h-10 medical-bg-primary rounded-lg flex items-center justify-center mr-3">
                <Pill className="text-white h-6 w-6" />
              </div>
              <span className="text-xl font-bold medical-primary">
                Sharda Med
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-2 lg:space-x-4 xl:space-x-6">
              {navigation
                .filter((item) => item.show)
                .map((item) => (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={location === item.href ? "default" : "ghost"}
                      className="font-medium text-sm xl:text-base px-3 xl:px-4"
                    >
                      {item.name}
                    </Button>
                  </Link>
                ))}

              {/* Language Selector - Commented out for now */}
              {/* 
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="inline-flex items-center justify-center px-3 py-2 text-sm font-medium border border-gray-300 rounded-lg bg-white text-gray-700 transition-all duration-200 hover:bg-blue-600 hover:text-white hover:border-blue-600 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                    <Globe className="h-4 w-4 mr-1 flex-shrink-0" />
                    <span className="hidden md:inline text-xs lg:text-sm">
                      {language.toUpperCase()}
                    </span>
                    <ChevronDown className="h-3 w-3 ml-1 flex-shrink-0" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => changeLanguage("en")}>
                    English
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => changeLanguage("hi")}>
                    हिंदी
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => changeLanguage("mr")}>
                    मराठी
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              */}

              {isAuthenticated ? (
                <>
                  {/* Customer-specific navigation - hidden for admin users */}
                  {!isAdmin && (
                    <>
                      {/* Notifications */}
                      <Link href="/notifications">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="relative hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 rounded-lg shadow-sm hover:shadow-md"
                        >
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
                        <Button
                          variant="ghost"
                          size="icon"
                          className="relative hover:bg-green-50 hover:text-green-600 transition-all duration-200 rounded-lg shadow-sm hover:shadow-md"
                        >
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
                      <button className="flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md bg-transparent hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-md">
                          <User className="h-4 w-4 text-white" />
                        </div>
                        <span className="hidden lg:block font-medium">
                          {user?.firstName} {user?.lastName}
                        </span>
                        <ChevronDown className="h-3 w-3" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {/* Profile link - hidden for admin users */}
                      {!isAdmin && (
                        <DropdownMenuItem asChild>
                          <Link href="/profile">Profile</Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={handleLogout}>
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <Link href="/login">
                  <Button className="text-white bg-primary hover:bg-primary/90">
                    Login
                  </Button>
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <MobileNavigation />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 pt-16">{children}</main>

      {/* Mobile Cart Button - Only for customers */}
      {isAuthenticated && !isAdmin && (
        <Link href="/cart">
          <Button className="fixed bottom-4 right-4 lg:hidden z-30 w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 transform hover:scale-110 transition-all duration-200">
            <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6" />
            {cartCount > 0 && (
              <Badge
                variant="secondary"
                className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center p-0 text-xs bg-red-500 text-white border-2 border-white"
              >
                {cartCount}
              </Badge>
            )}
          </Button>
        </Link>
      )}

      {/* Footer */}
      <footer className="bg-medical-text text-white py-6 sm:py-8 mt-8 sm:mt-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 medical-bg-primary rounded-lg flex items-center justify-center mr-3">
                  <Pill className="text-white h-6 w-6" />
                </div>
                <span className="text-xl font-bold">Sharda Med</span>
              </div>
              <p className="text-gray-100 text-sm">Your trusted online pharmacy for quality medicines and healthcare products.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-white">Quick Links</h3>
              <ul className="space-y-2 text-gray-100">
                <li>
                  <Link
                    href="/medicines"
                    className="hover:text-white transition-colors"
                  >
                    Medicines
                  </Link>
                </li>
                <li>
                  <Link
                    href="/prescriptions"
                    className="hover:text-white transition-colors"
                  >
                    Upload Prescription
                  </Link>
                </li>
                <li>
                  <Link
                    href="/orders"
                    className="hover:text-white transition-colors"
                  >
                    Track Order
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-white">Support</h3>
              <ul className="space-y-2 text-gray-100">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Terms of Service
                  </a>
                </li>
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
            <p>
              &copy; 2024 Sharda Med. All rights reserved. Licensed
              pharmacy.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
