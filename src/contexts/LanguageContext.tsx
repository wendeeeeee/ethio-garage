"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'am';

interface Translations {
  [key: string]: {
    en: string;
    am: string;
  };
}

const translations: Translations = {
  // Common
  home: { en: 'Home', am: 'ዋና ገፅ' },
  spare_parts: { en: 'Spare Parts', am: 'መለዋወጫዎች' },
  services: { en: 'Services', am: 'አገልግሎቶች' },
  book_maintenance: { en: 'Book Maintenance', am: 'ጥገና ይመዝገቡ' },
  cars_for_sale: { en: 'Cars for Sale', am: 'የሚሸጡ መኪኖች' },
  admin: { en: 'Admin', am: 'አስተዳዳሪ' },

  // Home Page
  hero_title: { en: 'Ethio Garage', am: 'ኢትዮ ጋራዥ' },
  hero_subtitle: { en: 'Premium Automotive Care & Genuine Spare Parts', am: 'ፕሪሚየም የመኪና ጥገና እና ኦሪጂናል መለዋወጫዎች' },
  emergency_btn: { en: 'Emergency? Get Help Now!', am: 'ድንገተኛ ብልሽት? አሁኑኑ እርዳታ ያግኙ!' },
  rescue_form_title: { en: 'Emergency Rescue Service', am: 'የድንገተኛ የመኪና ብልሽት አገልግሎት' },
  rescue_form_desc: { en: 'We will dispatch a mechanic to your exact location immediately.', am: 'ወዲያውኑ ወደሚገኙበት ቦታ መካኒክ እንልካለን።' },
  name_placeholder: { en: 'Your Name', am: 'ስምዎ' },
  phone_placeholder: { en: 'Your Phone Number', am: 'ስልክ ቁጥርዎ' },
  vehicle_placeholder: { en: 'Vehicle (e.g. Toyota Vitz)', am: 'መኪና (ለምሳሌ Toyota Vitz)' },
  location_placeholder: { en: 'Exact Location or Landmark', am: 'ትክክለኛ አድራሻ ወይም ታዋቂ ቦታ' },
  issue_placeholder: { en: 'What is the issue?', am: 'ችግሩ ምንድን ነው?' },
  describe_issue: { en: 'Describe your issue...', am: 'ችግርዎን ያብራሩ...' },
  locating: { en: 'Locating you...', am: 'ቦታዎን እየፈለግን ነው...' },
  request_rescue_btn: { en: 'Share Location & Request Rescue', am: 'ቦታዎን ያጋሩ እና እርዳታ ይጠይቁ' },
  phone_label: { en: 'Your Phone Number', am: 'ስልክ ቁጥርዎ' },
  problem_label: { en: 'What is the problem?', am: 'ችግሩ ምንድን ነው?' },
  send_rescue_btn: { en: 'Send Rescue Request (GPS Tracked)', am: 'የማዳን ጥያቄ ላክ (በጂፒኤስ ክትትል የሚደረግ)' },
  request_sent: { en: 'Request Sent!', am: 'ጥያቄዎ ተልኳል!' },
  request_sent_desc: { en: 'An operator is reviewing your request and will assign a mechanic shortly.', am: 'ኦፕሬተር ጥያቄዎን እየገመገመ ነው፣ በቅርቡ መካኒክ ይመደብሎታል።' },
  tracking_token: { en: 'Your Tracking Token:', am: 'የመከታተያ ኮድዎ፡' },
  help_on_way: { en: 'Help is on the way!', am: 'እርዳታ በመንገድ ላይ ነው!' },
  assigned_mechanic: { en: 'Assigned Mechanic:', am: 'የተመደበው መካኒክ፡' },
  skill: { en: 'Skill', am: 'ክህሎት' },
  call_mechanic: { en: 'Call Mechanic:', am: 'መካኒኩን ይደውሉ፡' },
  back_home: { en: 'Back to Home', am: 'ወደ ዋና ገፅ ተመለስ' },
  or_call_us: { en: 'OR CALL US', am: 'ወይም ይደውሉልን' },

  // Emergency Issues
  "Engine won't start": { en: "Engine won't start", am: 'ሞተር አይነሳም' },
  "Flat tire": { en: "Flat tire", am: 'ጎማ ተንፍሷል' },
  "Battery dead": { en: "Battery dead", am: 'ባትሪ ሞቷል' },
  "Brake problem": { en: "Brake problem", am: 'የፍሬን ችግር' },
  "Oil leak": { en: "Oil leak", am: 'ዘይት ይፈሳል' },
  "Overheating": { en: "Overheating", am: 'ሞተር ይግላል' },
  "Transmission issue": { en: "Transmission issue", am: 'የማርሽ ችግር' },
  "Accident / Body damage": { en: "Accident / Body damage", am: 'አደጋ / የገላ ጉዳት' },
  "Towing request": { en: "Towing request", am: 'የመጎተት ጥያቄ' },
  "Car locked / Key issue": { en: "Car locked / Key issue", am: 'መኪና ተቆልፏል / የቁልፍ ችግር' },

  // Home Cards
  genuine_parts: { en: 'Genuine Spare Parts', am: 'ኦሪጂናል መለዋወጫዎች' },
  genuine_parts_desc: { en: 'Search our live inventory for high-quality components for your vehicle.', am: 'ለመኪናዎ ጥራት ያላቸውን ዕቃዎች ለማግኘት የዕቃ ማከማቻችንን ይፈልጉ።' },
  search_inventory_btn: { en: 'Search Inventory', am: 'የዕቃ ማከማቻ ፈልግ' },
  premium_services: { en: 'Premium Services', am: 'ፕሪሚየም አገልግሎቶች' },
  premium_services_desc: { en: 'Explore our comprehensive automotive care services offered by experts.', am: 'በባለሙያዎች የሚሰጡትን አጠቃላይ የመኪና ጥገና አገልግሎቶቻችንን ይመልከቱ።' },
  view_services_btn: { en: 'View Services', am: 'አገልግሎቶችን ይመልከቱ' },
  book_maintenance_desc: { en: 'Schedule a routine maintenance appointment to keep your car running perfectly.', am: 'መኪናዎ በጥሩ ሁኔታ እንዲሰራ መደበኛ የጥገና ቀጠሮ ይያዙ።' },
  schedule_now_btn: { en: 'Schedule Now', am: 'አሁን ቀጠሮ ይያዙ' },

  // Spare Parts Page
  search_placeholder: { en: 'Search for parts (e.g. Toyota Brake Pads)...', am: 'መለዋወጫ ይፈልጉ (ለምሳሌ Toyota Brake Pads)...' },
  search_btn: { en: 'Search', am: 'ፈልግ' },
  in_stock: { en: 'in stock', am: 'በክምችት አለ' },
  out_of_stock: { en: 'Out of Stock', am: 'አልቋል' },
  no_parts_found: { en: 'No parts found for', am: 'ለዚህ የተገኘ መለዋወጫ የለም፡' },
  call_to_order: { en: 'Call us to order it!', am: 'ለማዘዝ ይደውሉልን!' },

  // Maintenance Page
  schedule_title: { en: 'Schedule Maintenance', am: 'የጥገና ቀጠሮ' },
  schedule_subtitle: { en: 'Keep your vehicle in top condition. Book your service below.', am: 'መኪናዎን በጥሩ ሁኔታ ያቆዩት። አገልግሎትዎን ከዚህ በታች ይመዝገቡ።' },
  customer_name: { en: 'Customer Name', am: 'የደንበኛ ስም' },
  license_plate: { en: 'License Plate (e.g. AA 12345)', am: 'የታርጋ ቁጥር (ለምሳሌ AA 12345)' },
  preferred_date: { en: 'Preferred Date', am: 'የሚመርጡት ቀን' },
  preferred_time: { en: 'Preferred Time', am: 'የሚመርጡት ሰዓት' },
  morning: { en: 'Morning (8AM - 12PM)', am: 'ጠዋት (ከ2 ሰዓት - 6 ሰዓት)' },
  afternoon: { en: 'Afternoon (1PM - 5PM)', am: 'ከሰዓት (ከ7 ሰዓት - 11 ሰዓት)' },
  service_type: { en: 'Service Type', am: 'የአገልግሎት ዓይነት' },
  full_service: { en: 'Full Service', am: 'ሙሉ አገልግሎት' },
  oil_change: { en: 'Oil Change', am: 'የዘይት ቅያሬ' },
  brake_inspection: { en: 'Brake Inspection', am: 'የፍሬን ምርመራ' },
  engine_diag: { en: 'Engine Diagnostics', am: 'የሞተር ምርመራ' },
  other: { en: 'Other', am: 'ሌላ' },
  book_appointment_btn: { en: 'Book Appointment', am: 'ቀጠሮ ያስይዙ' },

  // Maintenance Form
  what_service: { en: 'What service do you need?', am: 'ምን ዓይነት አገልግሎት ይፈልጋሉ?' },
  select_service: { en: 'Select a service...', am: 'አገልግሎት ይምረጡ...' },
  general_inspection: { en: 'General Inspection', am: 'አጠቃላይ ምርመራ' },
  tire_replacement: { en: 'Tire Service / Replacement', am: 'የጎማ አገልግሎት / ቅያሪ' },
  brake_replacement: { en: 'Brake Pad Replacement', am: 'የፍሬን ፓድ ቅያሪ' },
  battery_replacement: { en: 'Battery Replacement', am: 'የባትሪ ቅያሪ' },
  body_work: { en: 'Body Work / Paint', am: 'የገላ ጥገና / ቀለም' },
  vehicle_make_model: { en: 'Vehicle (Make & Model)', am: 'መኪና (ስም እና ሞዴል)' },
  confirm_booking: { en: 'Confirm Booking', am: 'ቀጠሮ ያረጋግጡ' },
  booking: { en: 'Booking...', am: 'ቀጠሮ በመያዝ ላይ...' },
  booking_success: { en: '✅ Maintenance booked successfully! We will contact you soon to confirm.', am: '✅ የጥገና ቀጠሮ በተሳካ ሁኔታ ተይዟል! ለማረጋገጥ በቅርቡ እናገኝዎታለን።' },
  booking_fail: { en: 'Failed to book maintenance. Please call us directly.', am: 'ቀጠሮ መያዝ አልተቻለም። እባክዎ በቀጥታ ይደውሉልን።' },
  plan_ahead: { en: 'Plan ahead. Schedule a service at our garage and avoid the wait.', am: 'አስቀድመው ያቅዱ። በጋራዣችን ቀጠሮ በመያዝ ወረፋን ያስወግዱ።' },

  // Cars Page
  cars_for_sale_subtitle: { en: 'Browse verified car listings from sellers in Addis Ababa.', am: 'በአዲስ አበባ ውስጥ ያሉ የተረጋገጡ የመኪና ሽያጭ ዝርዝሮችን ያስሱ።' },
  search_cars: { en: 'Search by make, model, or year...', am: 'በስም፣ በሞዴል፣ ወይም በተመረተበት ዓመት ይፈልጉ...' },
  no_cars_yet: { en: 'No cars listed yet', am: 'እስካሁን ምንም መኪና አልተመዘገበም' },
  bringing_new_cars: { en: 'We are working on bringing you new cars soon.', am: 'በቅርቡ አዳዲስ መኪኖችን እናቀርብሎታለን።' },
  cars_desc: { en: 'Browse our curated selection of high-quality, pre-owned vehicles.', am: 'የተመረጡ እና ከፍተኛ ጥራት ያላቸውን መኪኖች ያስሱ።' },
  view_cars_btn: { en: 'View Cars', am: 'መኪኖችን ይመልከቱ' },

  // Services
  services_subtitle: { en: 'Comprehensive automotive care by certified experts.', am: 'በተመሰከረላቸው ባለሙያዎች የሚሰጥ አጠቃላይ የመኪና ጥገና።' },
  srv_repair: { en: 'Repair & Maintenance', am: 'ጥገና እና ዕድሳት' },
  srv_repair_desc: { en: 'Comprehensive vehicle care and standard maintenance routines.', am: 'አጠቃላይ የመኪና እንክብካቤ እና መደበኛ የጥገና ስራዎች።' },
  srv_battery: { en: 'Battery Service', am: 'የባትሪ አገልግሎት' },
  srv_battery_desc: { en: 'Testing, jump-starts, and genuine battery replacements.', am: 'ምርመራ፣ ማስነሳት፣ እና ኦሪጂናል የባትሪ ቅያሪ።' },
  srv_tire: { en: 'Tire Service', am: 'የጎማ አገልግሎት' },
  srv_tire_desc: { en: 'Puncture repairs, balancing, rotation, and new tires.', am: 'የጎማ ጥገና፣ ሚዛን ማስተካከል፣ እና አዳዲስ ጎማዎች።' },
  srv_oil: { en: 'Oil Change', am: 'የዘይት ቅያሬ' },
  srv_oil_desc: { en: 'Premium synthetic oil and filter replacements.', am: 'ፕሪሚየም ዘይት እና የፊልተር ቅያሪ።' },
  srv_electrical: { en: 'Electrical Service', am: 'የኤሌክትሪክ አገልግሎት' },
  srv_electrical_desc: { en: 'Advanced diagnostics for wiring, alternators, and sensors.', am: 'የኤሌክትሪክ መስመሮች፣ አልተርኔተር፣ እና ሴንሰሮች ምርመራ።' },
  srv_roadside: { en: 'Emergency Roadside', am: 'የመንገድ ላይ እርዳታ' },
  srv_roadside_desc: { en: 'Fast response for breakdowns and lockouts anywhere in the city.', am: 'በከተማው ውስጥ የትም ቦታ ለሚከሰቱ ብልሽቶች ፈጣን ምላሽ።' },
  srv_towing: { en: 'Towing Service', am: 'የመጎተት አገልግሎት' },
  srv_towing_desc: { en: 'Safe and secure vehicle transportation to our main garage.', am: 'መኪናዎን ደህንነቱ በተጠበቀ ሁኔታ ወደ ዋናው ጋራዥ ማጓጓዝ።' },
  srv_diagnosis: { en: 'Vehicle Diagnosis', am: 'የመኪና ምርመራ' },
  srv_diagnosis_desc: { en: 'Computerized scanning to identify hidden engine problems.', am: 'ድብቅ የሞተር ችግሮችን ለመለየት በኮምፒውተር የታገዘ ምርመራ።' },
  learn_more: { en: 'Learn More', am: 'ተጨማሪ ያንብቡ' },
  showing: { en: 'Showing', am: 'እየታየ ያለው' },
  listings: { en: 'listings', am: 'ዝርዝሮች' },
  price: { en: 'Price:', am: 'ዋጋ፡' },
  transmission: { en: 'Transmission:', am: 'ማርሽ፡' },
  fuel: { en: 'Fuel:', am: 'ነዳጅ፡' },
  mileage: { en: 'Mileage:', am: 'የተጓዘው ርቀት፡' },
  color: { en: 'Color:', am: 'ቀለም፡' },
  contact_seller: { en: 'Contact Seller:', am: 'ሻጩን ያግኙ፡' },

  // Footer
  footer_title: { en: 'Ethio Garage', am: 'ኢትዮ ጋራዥ' },
  footer_desc: { en: 'Your trusted partner for all automotive needs in Addis Ababa.', am: 'በአዲስ አበባ ውስጥ ላሉት የመኪና ፍላጎቶችዎ ሁሉ ታማኝ አጋርዎ።' },
  footer_rights: { en: 'All rights reserved.', am: 'መብቱ በህግ የተጠበቀ ነው።' },
};

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedLang = localStorage.getItem('language') as Language;
    if (savedLang) {
      setLanguage(savedLang);
    }
  }, []);

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'am' : 'en';
    setLanguage(newLang);
    localStorage.setItem('language', newLang);
  };

  const t = (key: string): string => {
    const translation = translations[key];
    if (!translation) return key;
    return translation[language];
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
