import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/lib/i18n";
import {
  Search,
  Upload,
  Truck,
  History,
  UserRound,
  ChevronRight,
} from "lucide-react";

export default function Landing() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="gradient-bg text-white py-16 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                {t('app.tagline')}
              </h1>
              <p className="text-xl mb-8 opacity-90">
                {t('app.description')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/medicines">
                  <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                    {t('medicine.title')}
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-primary">
                    {t('auth.login')}
                  </Button>
                </Link>
              </div>
            </div>
            <div className="text-center">
              <div className="w-64 h-64 mx-auto bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <UserRound className="h-24 w-24 text-white opacity-80" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">{t('dashboard.quickActions')}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <Link href="/medicines">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Search className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold mb-2">{t('common.search')} {t('medicine.title')}</h3>
                  <p className="text-sm text-muted-foreground">{t('medicine.searchPlaceholder')}</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/login">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Upload className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold mb-2">{t('prescription.uploadPrescription')}</h3>
                  <p className="text-sm text-muted-foreground">{t('medicine.scheduleH')}</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/login">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Truck className="h-6 w-6 text-orange-600" />
                  </div>
                  <h3 className="font-semibold mb-2">{t('order.trackOrder')}</h3>
                  <p className="text-sm text-muted-foreground">{t('order.trackingInfo')}</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/login">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <History className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold mb-2">{t('order.orderHistory')}</h3>
                  <p className="text-sm text-muted-foreground">{t('order.recentOrders')}</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="container mx-auto">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8">Find Your Medicines</h2>
            <div className="flex gap-4">
              <Input
                placeholder="Search medicines, brands, or conditions..."
                className="flex-1"
              />
              <Button>
                <Search className="h-4 w-4 mr-2" />
                {t('common.search')}
              </Button>
            </div>
            <div className="text-center mt-6">
              <Link href="/medicines">
                <Button variant="link">
                  Browse all medicines
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose {t('app.title')}?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserRound className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Licensed Pharmacy</h3>
              <p className="text-muted-foreground">
                We are a licensed pharmacy ensuring all medicines are genuine and safe.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Fast Delivery</h3>
              <p className="text-muted-foreground">
                Same-day delivery available in major cities. Quick and reliable service.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Prescription Support</h3>
              <p className="text-muted-foreground">
                Easy prescription upload and verification for Schedule H medicines.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
