import { useState, useEffect } from 'react';

// Translation keys and values
const translations = {
  en: {
    // Navigation
    'nav.medicines': 'Medicines',
    'nav.orders': 'Orders',
    'nav.prescriptions': 'Prescriptions',
    'nav.cart': 'Cart',
    'nav.profile': 'Profile',
    'nav.dashboard': 'Dashboard',
    
    // Auth
    'auth.login': 'Login',
    'auth.logout': 'Logout',
    'auth.register': 'Register',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.firstName': 'First Name',
    'auth.lastName': 'Last Name',
    
    // Common
    'common.search': 'Search',
    'common.add': 'Add',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    
    // Medicine
    'medicine.addToCart': 'Add to Cart',
    'medicine.inStock': 'In Stock',
    'medicine.outOfStock': 'Out of Stock',
    'medicine.lowStock': 'Low Stock',
    'medicine.prescriptionRequired': 'Prescription Required',
    
    // Cart
    'cart.empty': 'Your cart is empty',
    'cart.checkout': 'Checkout',
    'cart.total': 'Total',
    
    // Orders
    'order.placed': 'Placed',
    'order.confirmed': 'Confirmed',
    'order.outForDelivery': 'Out for Delivery',
    'order.delivered': 'Delivered',
    
    // App
    'app.title': 'Sharda Med',
    'app.subtitle': 'Your Trusted Online Pharmacy',
    'app.description': 'Order medicines online with prescription support. Fast delivery, genuine products, and trusted service.',
  },
  hi: {
    // Navigation
    'nav.medicines': 'दवाइयां',
    'nav.orders': 'ऑर्डर',
    'nav.prescriptions': 'प्रिस्क्रिप्शन',
    'nav.cart': 'कार्ट',
    'nav.profile': 'प्रोफाइल',
    'nav.dashboard': 'डैशबोर्ड',
    
    // Auth
    'auth.login': 'लॉग इन',
    'auth.logout': 'लॉग आउट',
    'auth.register': 'रजिस्टर',
    'auth.email': 'ईमेल',
    'auth.password': 'पासवर्ड',
    'auth.firstName': 'पहला नाम',
    'auth.lastName': 'अंतिम नाम',
    
    // Common
    'common.search': 'खोजें',
    'common.add': 'जोड़ें',
    'common.edit': 'संपादित करें',
    'common.delete': 'मिटाएं',
    'common.save': 'सेव करें',
    'common.cancel': 'रद्द करें',
    'common.loading': 'लोड हो रहा है...',
    'common.error': 'त्रुटि',
    'common.success': 'सफलता',
    
    // Medicine
    'medicine.addToCart': 'कार्ट में जोड़ें',
    'medicine.inStock': 'स्टॉक में है',
    'medicine.outOfStock': 'स्टॉक में नहीं',
    'medicine.lowStock': 'कम स्टॉक',
    'medicine.prescriptionRequired': 'प्रिस्क्रिप्शन आवश्यक',
    
    // Cart
    'cart.empty': 'आपका कार्ट खाली है',
    'cart.checkout': 'चेकआउट',
    'cart.total': 'कुल',
    
    // Orders
    'order.placed': 'रखा गया',
    'order.confirmed': 'पुष्ट',
    'order.outForDelivery': 'डिलीवरी के लिए',
    'order.delivered': 'डिलीवर',
    
    // App
    'app.title': 'शारदा मेड',
    'app.subtitle': 'आपकी विश्वसनीय ऑनलाइन फार्मेसी',
    'app.description': 'प्रिस्क्रिप्शन सपोर्ट के साथ ऑनलाइन दवाइयां ऑर्डर करें। तेज़ डिलीवरी, असली उत्पाद, और भरोसेमंद सेवा।',
  },
  mr: {
    // Navigation
    'nav.medicines': 'औषधे',
    'nav.orders': 'ऑर्डर',
    'nav.prescriptions': 'प्रिस्क्रिप्शन',
    'nav.cart': 'कार्ट',
    'nav.profile': 'प्रोफाइल',
    'nav.dashboard': 'डॅशबोर्ड',
    
    // Auth
    'auth.login': 'लॉगिन',
    'auth.logout': 'लॉगआउट',
    'auth.register': 'नोंदणी',
    'auth.email': 'ईमेल',
    'auth.password': 'पासवर्ड',
    'auth.firstName': 'पहिले नाव',
    'auth.lastName': 'आडनाव',
    
    // Common
    'common.search': 'शोधा',
    'common.add': 'जोडा',
    'common.edit': 'संपादित करा',
    'common.delete': 'हटवा',
    'common.save': 'जतन करा',
    'common.cancel': 'रद्द करा',
    'common.loading': 'लोड होत आहे...',
    'common.error': 'त्रुटी',
    'common.success': 'यश',
    
    // Medicine
    'medicine.addToCart': 'कार्टमध्ये जोडा',
    'medicine.inStock': 'स्टॉकमध्ये आहे',
    'medicine.outOfStock': 'स्टॉक नाही',
    'medicine.lowStock': 'कमी स्टॉक',
    'medicine.prescriptionRequired': 'प्रिस्क्रिप्शन आवश्यक',
    
    // Cart
    'cart.empty': 'तुमचे कार्ट रिकामे आहे',
    'cart.checkout': 'चेकआउट',
    'cart.total': 'एकूण',
    
    // Orders
    'order.placed': 'दिले',
    'order.confirmed': 'पुष्ट',
    'order.outForDelivery': 'डिलिव्हरीसाठी',
    'order.delivered': 'वितरित',
    
    // App
    'app.title': 'शारदा मेड',
    'app.subtitle': 'तुमची विश्वसनीय ऑनलाइन फार्मसी',
    'app.description': 'प्रिस्क्रिप्शन सपोर्टसह ऑनलाइन औषधे ऑर्डर करा। जलद वितरण, खरी उत्पादने आणि विश्वसनीय सेवा।',
  },
};

type Language = 'en' | 'hi' | 'mr';
type TranslationKey = keyof typeof translations.en;

export function useTranslation() {
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('language') as Language) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key: TranslationKey): string => {
    return translations[language][key] || translations.en[key] || key;
  };

  const changeLanguage = (newLanguage: Language) => {
    setLanguage(newLanguage);
  };

  return {
    t,
    language,
    changeLanguage,
  };
}
