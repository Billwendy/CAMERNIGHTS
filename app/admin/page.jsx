'use client';

import React, { useState, useEffect } from 'react';
import { 
  Shield, Building, CreditCard, Users, Calendar, DollarSign, CheckCircle2, XCircle, Bell, Plus, Trash2, Image as ImageIcon, Upload, LogOut, Sparkles, QrCode, Radio, MapPin 
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();
  const [lang, setLang] = useState('EN');
  const [adminProfile, setAdminProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Menu, Services, Gallery, Staff & Events State
  const [venueDrinks, setVenueDrinks] = useState([]);
  const [drinkName, setDrinkName] = useState('');
  const [drinkCategory, setDrinkCategory] = useState('SPIRITS');
  const [drinkPrice, setDrinkPrice] = useState('');
  const [drinkUnit, setDrinkUnit] = useState('Bottle');
  const [drinkDesc, setDrinkDesc] = useState('');
  const [drinkImage, setDrinkImage] = useState('');

  const [venueServices, setVenueServices] = useState([]);
  const [serviceName, setServiceName] = useState('');
  const [servicePrice, setServicePrice] = useState('');
  const [serviceDesc, setServiceDesc] = useState('');

  const [venueGallery, setVenueGallery] = useState([]);
  const [galleryFile, setGalleryFile] = useState(null);
  const [galleryCaption, setGalleryCaption] = useState('');

  const [venueStaff, setVenueStaff] = useState([]);
  const [staffName, setStaffName] = useState('');
  const [staffRole, setStaffRole] = useState('');
  const [staffPhoto, setStaffPhoto] = useState('');

  // Events State
  const [venueEvents, setVenueEvents] = useState([]);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventDj, setEventDj] = useState('');
  const [eventPrice, setEventPrice] = useState('');

  // New States for Advanced Features Integration (QR Scanner & Floor Plan Status)
  const [scanCodeInput, setScanCodeInput] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [floorTables, setFloorTables] = useState([
    { id: 1, name: 'Royal VIP Booth 1', capacity: '6-8 Guests', status: 'Available', minSpend: '75,000 XAF' },
    { id: 2, name: 'DJ Booth Lounge', capacity: '4-6 Guests', status: 'Reserved', minSpend: '50,000 XAF' },
    { id: 3, name: 'VVIP Terrace Table', capacity: '10-12 Guests', status: 'Available', minSpend: '150,000 XAF' }
  ]);

  // Added State for Club Profile Picture Sync Update
  const [clubProfileImage, setClubProfileImage] = useState('');

  // Image Compressor Helper to Prevent LocalStorage Quota Exceeded Errors
  const compressImage = (file, callback, maxWidth = 300, maxHeight = 300) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
        callback(compressedDataUrl);
      };
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    const savedLang = localStorage.getItem('camernights_lang');
    if (savedLang) setLang(savedLang);

    const savedAdmin = localStorage.getItem('camernights_admin_profile');
    if (!savedAdmin) {
      router.push('/auth?role=admin');
      return;
    }
    const parsedAdmin = JSON.parse(savedAdmin);
    if (!parsedAdmin.isLoggedIn) {
      router.push('/auth?role=admin');
      return;
    }
    setAdminProfile(parsedAdmin);
    setClubProfileImage(parsedAdmin.image || parsedAdmin.heroImage || parsedAdmin.profilePic || '');
    loadAdminData();
  }, [router]);

  const loadAdminData = () => {
    const savedBookings = localStorage.getItem('camernights_admin_bookings') || JSON.stringify([
      { id: 'RES-9981', userEmail: 'user@camernights.cm', userName: 'Marcello Fétard', venueName: 'CHATEAU VIP', venueCity: 'Buea', tableType: 'Royal VIP Booth', date: '2026-02-20', time: '22:00', guests: '4-6 Guests', price: '75,000 XAF', status: 'Pending' },
      { id: 'RES-5615', userEmail: 'vip@camernights.cm', userName: 'Sophie VIP', venueName: 'CHATEAU VIP', venueCity: 'Buea', tableType: 'Royal VIP Booth', date: '2026-02-22', time: '23:00', guests: '8-10 Guests', price: '75,000 XAF', status: 'Confirmed' }
    ]);
    setBookings(JSON.parse(savedBookings));

    const venueId = '1';
    const savedDrinks = localStorage.getItem('camernights_chateau_drinks') || JSON.stringify([
      { id: 1, name: 'BEER', category: 'SPIRITS', price: '1000 XAF' },
      { id: 2, name: 'BURBUR', category: 'SPIRITS', price: '2000 XAF' },
      { id: 3, name: 'SMALL GUINESS', category: 'SPIRITS', price: '1000 XAF' },
      { id: 4, name: 'HAARP', category: 'SPIRITS', price: '1000 XAF' },
      { id: 5, name: 'HENNESSY VSOP', category: 'SPIRITS', price: '85,000 XAF' }
    ]);
    setVenueDrinks(JSON.parse(savedDrinks));

    const savedServices = localStorage.getItem('camernights_chateau_services') || JSON.stringify([
      { id: 1, name: 'VIP HOOKAH SERVICE', price: '10,000 XAF', description: 'Premium shisha flavor of choice with ice tip' }
    ]);
    setVenueServices(JSON.parse(savedServices));

    const savedGallery = localStorage.getItem(`camernights_gallery_${venueId}`) || JSON.stringify([
      { id: 1, url: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&q=80&w=1000', caption: 'VIP Moment' }
    ]);
    setVenueGallery(JSON.parse(savedGallery));

    const savedStaff = localStorage.getItem(`camernights_staff_${venueId}`) || JSON.stringify([
      { id: 1, name: 'Marcello', role: 'Head VIP Host', photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400' }
    ]);
    setVenueStaff(JSON.parse(savedStaff));

    const savedEvents = localStorage.getItem(`camernights_events_${venueId}`) || JSON.stringify([
      { id: 1, title: 'Friday Night Fever', date: '2026-03-01', dj: 'DJ Maphorisa', price: '5,000 XAF' }
    ]);
    setVenueEvents(JSON.parse(savedEvents));

    const savedTables = localStorage.getItem(`camernights_floortables_${venueId}`);
    if (savedTables) setFloorTables(JSON.parse(savedTables));
  };

  const handleLogout = () => {
    localStorage.removeItem('camernights_admin_profile');
    router.push('/auth?role=admin');
  };

  // Two-Way Booking Status Synchronization with User Profile Storage
  const handleUpdateBookingStatus = (bookingId, newStatus) => {
    const updated = bookings.map(b => {
      if (b.id === bookingId) {
        const updatedBooking = { ...b, status: newStatus };
        
        // Sync directly to user's personal booking storage key if email is present
        if (b.userEmail) {
          const userKey = b.userEmail.toLowerCase();
          const userBookingsKey = `camernights_user_bookings_${userKey}`;
          const existingUserBookings = JSON.parse(localStorage.getItem(userBookingsKey) || '[]');
          
          const syncedUserBookings = existingUserBookings.map(ub => 
            ub.id === bookingId ? { ...ub, status: newStatus === 'Confirmed' || newStatus === 'Approved' ? 'APPROVED' : newStatus === 'Cancelled' ? 'DECLINED' : newStatus } : ub
          );
          localStorage.setItem(userBookingsKey, JSON.stringify(syncedUserBookings));

          // Push In-App Notification to User
          const userNotifKey = `camernights_notifications_${userKey}`;
          const existingNotifs = JSON.parse(localStorage.getItem(userNotifKey) || '[]');
          const newNotif = {
            id: Date.now(),
            title: lang === 'FR' ? 'Mise à jour de réservation' : 'Reservation Status Updated',
            message: lang === 'FR' ? `Votre réservation ${b.tableType} est maintenant : ${newStatus}` : `Your reservation for ${b.tableType} status is now: ${newStatus}`,
            time: 'Just now',
            read: false
          };
          localStorage.setItem(userNotifKey, JSON.stringify([newNotif, ...existingNotifs]));
        }

        return updatedBooking;
      }
      return b;
    });

    setBookings(updated);
    localStorage.setItem('camernights_admin_bookings', JSON.stringify(updated));
  };

  // Door Security QR Pass Verification Handler
  const handleVerifyPass = (e) => {
    e.preventDefault();
    if (!scanCodeInput) return;
    const found = bookings.find(b => b.id.toLowerCase() === scanCodeInput.toLowerCase() || b.status === 'Confirmed' || b.status === 'Approved');
    if (found) {
      handleUpdateBookingStatus(found.id, 'CHECKED IN');
      setScanResult({ success: true, message: `Pass Verified! Table: ${found.tableType} - Guest: ${found.userName || 'VIP Partygoer'}` });
    } else {
      setScanResult({ success: false, message: lang === 'FR' ? 'Code de pass invalide ou non approuvé.' : 'Invalid or Unapproved Pass Code.' });
    }
    setScanCodeInput('');
  };

  // Toggle Table Availability on Floor Plan Map
  const toggleTableStatus = (tableId) => {
    const venueId = '1';
    const updated = floorTables.map(t => t.id === tableId ? { ...t, status: t.status === 'Available' ? 'Reserved' : 'Available' } : t);
    setFloorTables(updated);
    localStorage.setItem(`camernights_floortables_${venueId}`, JSON.stringify(updated));
  };

  // Added Handler to Update Club Profile Picture & Sync Live to Homepage Card
  const handleUpdateClubImage = (e) => {
    e.preventDefault();
    if (!clubProfileImage || !adminProfile) return;

    const updatedAdmin = { 
      ...adminProfile, 
      image: clubProfileImage, 
      heroImage: clubProfileImage, 
      profilePic: clubProfileImage 
    };
    setAdminProfile(updatedAdmin);
    localStorage.setItem('camernights_admin_profile', JSON.stringify(updatedAdmin));

    // Sync directly into registered venues list so homepage card updates instantly
    const savedVenues = JSON.parse(localStorage.getItem('camernights_registered_venues') || '[]');
    const venueIndex = savedVenues.findIndex(v => v.id === adminProfile.id || v.name?.toLowerCase() === adminProfile.venueName?.toLowerCase());
    
    if (venueIndex >= 0) {
      savedVenues[venueIndex].image = clubProfileImage;
      localStorage.setItem('camernights_registered_venues', JSON.stringify(savedVenues));
    } else {
      savedVenues.push({
        id: adminProfile.id || '1',
        name: adminProfile.venueName || 'CHATEAU VIP',
        city: adminProfile.city || adminProfile.venueCity || 'Buea',
        location: `${adminProfile.city || adminProfile.venueCity || 'Buea'} Centre`,
        category: 'VERIFIED VIP',
        rating: 5.0,
        minSpend: '25,000 XAF',
        tags: ['VIP Table Service', 'Bottle Service'],
        image: clubProfileImage
      });
      localStorage.setItem('camernights_registered_venues', JSON.stringify(savedVenues));
    }

    window.dispatchEvent(new Event('storage'));
    alert(lang === 'FR' ? 'Photo de profil du club mise à jour et synchronisée !' : 'Club profile picture updated and synced to homepage!');
  };

  const handleAddDrink = (e) => {
    e.preventDefault();
    if (!drinkName || !drinkPrice) return;
    const newDrink = { id: Date.now(), name: drinkName.toUpperCase(), category: drinkCategory, price: drinkPrice, unit: drinkUnit, description: drinkDesc, image: drinkImage };
    const updated = [newDrink, ...venueDrinks];
    setVenueDrinks(updated);
    localStorage.setItem('camernights_chateau_drinks', JSON.stringify(updated));
    setDrinkName('');
    setDrinkPrice('');
    setDrinkDesc('');
    setDrinkImage('');
    alert(lang === 'EN' ? 'Bottle added successfully!' : 'Bouteille ajoutée avec succès !');
  };

  const handleDeleteDrink = (id) => {
    const updated = venueDrinks.filter(d => d.id !== id);
    setVenueDrinks(updated);
    localStorage.setItem('camernights_chateau_drinks', JSON.stringify(updated));
  };

  const handleAddService = (e) => {
    e.preventDefault();
    if (!serviceName || !servicePrice) return;
    const newService = { id: Date.now(), name: serviceName.toUpperCase(), price: servicePrice, description: serviceDesc };
    const updated = [newService, ...venueServices];
    setVenueServices(updated);
    localStorage.setItem('camernights_chateau_services', JSON.stringify(updated));
    setServiceName('');
    setServicePrice('');
    setServiceDesc('');
    alert(lang === 'EN' ? 'Special service published successfully!' : 'Service spécial publié avec succès !');
  };

  const handleGalleryUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    compressImage(file, (compressedUrl) => {
      setGalleryFile(compressedUrl);
    }, 800, 800);
  };

  const handleSaveGalleryPhoto = (e) => {
    e.preventDefault();
    if (!galleryFile) return;
    const venueId = '1';
    const newPhoto = { id: Date.now(), url: galleryFile, caption: galleryCaption || 'VIP Moment' };
    const updated = [newPhoto, ...venueGallery];
    setVenueGallery(updated);
    localStorage.setItem(`camernights_gallery_${venueId}`, JSON.stringify(updated));
    setGalleryFile(null);
    setGalleryCaption('');
    alert(lang === 'EN' ? 'Photo published to homepage and venue page!' : 'Photo publiée sur la page d\'accueil et la page du lieu !');
  };

  const handleDeleteGallery = (id) => {
    const venueId = '1';
    const updated = venueGallery.filter(p => p.id !== id);
    setVenueGallery(updated);
    localStorage.setItem(`camernights_gallery_${venueId}`, JSON.stringify(updated));
  };

  const handleAddStaff = (e) => {
    e.preventDefault();
    if (!staffName || !staffPhoto) return;
    const venueId = '1';
    const newStaff = { id: Date.now(), name: staffName, role: staffRole || 'VIP Host', photo: staffPhoto };
    const updated = [newStaff, ...venueStaff];
    setVenueStaff(updated);
    localStorage.setItem(`camernights_staff_${venueId}`, JSON.stringify(updated));
    setStaffName('');
    setStaffRole('');
    setStaffPhoto('');
    alert(lang === 'EN' ? 'Staff member added successfully!' : 'Membre du personnel ajouté avec succès !');
  };

  const handleDeleteStaff = (id) => {
    const venueId = '1';
    const updated = venueStaff.filter(s => s.id !== id);
    setVenueStaff(updated);
    localStorage.setItem(`camernights_staff_${venueId}`, JSON.stringify(updated));
  };

  const handleAddEvent = (e) => {
    e.preventDefault();
    if (!eventTitle || !eventDate) return;
    const venueId = '1';
    const newEvent = { id: Date.now(), title: eventTitle, date: eventDate, dj: eventDj, price: eventPrice };
    const updated = [newEvent, ...venueEvents];
    setVenueEvents(updated);
    localStorage.setItem(`camernights_events_${venueId}`, JSON.stringify(updated));
    setEventTitle('');
    setEventDate('');
    setEventDj('');
    setEventPrice('');
    alert(lang === 'EN' ? 'Event added successfully and synced to venue page!' : 'Événement ajouté avec succès !');
  };

  const handleDeleteEvent = (id) => {
    const venueId = '1';
    const updated = venueEvents.filter(ev => ev.id !== id);
    setVenueEvents(updated);
    localStorage.setItem(`camernights_events_${venueId}`, JSON.stringify(updated));
  };

  if (!adminProfile) return null;

  const totalBookingsCount = bookings.length;
  const pendingBookingsCount = bookings.filter(b => b.status === 'Pending').length;
  const estimatedRevenue = bookings
    .filter(b => b.status === 'Confirmed' || b.status === 'Approved')
    .reduce((acc, curr) => acc + (parseInt(curr.price.replace(/[^0-9]/g, '')) || 0), 0);

  const t = {
    EN: {
      title: 'MANAGER OPERATIONS DESK',
      analyticsTab: 'Analytics',
      reservationsTab: 'Reservations',
      menuTab: 'Menu & Services',
      galleryTab: 'Gallery & Profile',
      staffTab: 'Meet Our Staff',
      eventsTab: 'Events',
      totalReservations: 'TOTAL RESERVATIONS',
      pendingRequests: 'PENDING REQUESTS',
      confirmedRevenue: 'CONFIRMED REVENUE',
      recentBookings: 'RECENT BOOKINGS',
      publishedLive: 'PUBLISHED LIVE'
    },
    FR: {
      title: 'ESPACE GESTIONNAIRE',
      analyticsTab: 'Analytique',
      reservationsTab: 'Réservations',
      menuTab: 'Menu & Services',
      galleryTab: 'Galerie & Profil',
      staffTab: 'Notre Équipe',
      eventsTab: 'Événements',
      totalReservations: 'TOTAL RÉSERVATIONS',
      pendingRequests: 'DEMANDES EN ATTENTE',
      confirmedRevenue: 'REVENUS CONFIRMÉS',
      recentBookings: 'RÉSERVATIONS RÉCENTES',
      publishedLive: 'PUBLIÉ EN LIGNE'
    }
  }[lang];

  return (
    <div className="w-full min-h-screen bg-[#111319] text-[#F5F5F7] font-sans pb-24 select-none">
      {/* HEADER BAR */}
      <header className="sticky top-0 z-40 bg-[#111319]/95 backdrop-blur-md px-5 py-4 border-b border-[#282E3E] flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-[#E5B800] overflow-hidden flex items-center justify-center text-[#111319] font-black">
            <Building size={16} />
          </div>
          <div>
            <h1 className="text-sm font-serif font-black tracking-widest text-[#E5B800]">{adminProfile.venueName}</h1>
            <p className="text-[9px] tracking-widest text-[#828B9E] uppercase font-bold">{adminProfile.venueCity || adminProfile.city} CENTRE</p>
          </div>
        </div>
        <button onClick={handleLogout} className="p-2 bg-[#181B26] border border-[#282E3E] text-rose-400 rounded-xl hover:bg-rose-500/10 transition">
          <LogOut size={16} />
        </button>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-6 space-y-6">
        {/* SUBSCRIPTION BANNER */}
        <div className="bg-[#181B26] border-2 border-[#E5B800]/50 rounded-2xl p-4 flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#E5B800] text-[#12141C] rounded-xl flex items-center justify-center font-bold">
              <Shield size={20} />
            </div>
            <div>
              <p className="text-[10px] text-[#E5B800] font-bold">Annual Subscription Active (10 Months Remaining)</p>
              <p className="text-xs font-serif font-black text-white">{adminProfile.venueName} VIP Partner</p>
            </div>
          </div>
          <span className="bg-[#E5B800] text-[#12141C] text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">Verified</span>
        </div>

        {/* NAVIGATION TABS (Expanded to 6 columns for Events) */}
        <div className="bg-[#181B26] p-1.5 rounded-2xl border border-[#282E3E] grid grid-cols-6 gap-1 text-center font-black">
          <button onClick={() => setActiveTab('dashboard')} className={`py-2.5 rounded-xl text-[10px] transition ${activeTab === 'dashboard' ? 'bg-[#E5B800] text-[#111319]' : 'text-[#828B9E]'}`}>{t.analyticsTab}</button>
          <button onClick={() => setActiveTab('bookings')} className={`py-2.5 rounded-xl text-[10px] transition ${activeTab === 'bookings' ? 'bg-[#E5B800] text-[#111319]' : 'text-[#828B9E]'}`}>{t.reservationsTab}</button>
          <button onClick={() => setActiveTab('menu')} className={`py-2.5 rounded-xl text-[10px] transition ${activeTab === 'menu' ? 'bg-[#E5B800] text-[#111319]' : 'text-[#828B9E]'}`}>{t.menuTab}</button>
          <button onClick={() => setActiveTab('gallery')} className={`py-2.5 rounded-xl text-[10px] transition ${activeTab === 'gallery' ? 'bg-[#E5B800] text-[#111319]' : 'text-[#828B9E]'}`}>{t.galleryTab}</button>
          <button onClick={() => setActiveTab('staff')} className={`py-2.5 rounded-xl text-[10px] transition ${activeTab === 'staff' ? 'bg-[#E5B800] text-[#111319]' : 'text-[#828B9E]'}`}>{t.staffTab}</button>
          <button onClick={() => setActiveTab('events')} className={`py-2.5 rounded-xl text-[10px] transition ${activeTab === 'events' ? 'bg-[#E5B800] text-[#111319]' : 'text-[#828B9E]'}`}>{t.eventsTab}</button>
        </div>

        {/* TAB 1: ANALYTICS & DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[#181B26] border border-[#282E3E] rounded-2xl p-5 space-y-2 shadow-xl">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-black text-[#828B9E] uppercase">{t.totalReservations}</span>
                  <Calendar size={16} className="text-[#E5B800]" />
                </div>
                <p className="text-3xl font-serif font-black text-white">{totalBookingsCount}</p>
                <span className="text-[10px] text-emerald-400 font-bold block">Live reservation feed</span>
              </div>

              <div className="bg-[#181B26] border border-[#282E3E] rounded-2xl p-5 space-y-2 shadow-xl">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-black text-[#828B9E] uppercase">{t.pendingRequests}</span>
                  <Bell size={16} className="text-amber-400" />
                </div>
                <p className="text-3xl font-serif font-black text-amber-400">{pendingBookingsCount}</p>
                <span className="text-[10px] text-[#828B9E] block">Requires manager action</span>
              </div>

              <div className="bg-[#181B26] border border-[#282E3E] rounded-2xl p-5 space-y-2 shadow-xl">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-black text-[#828B9E] uppercase">{t.confirmedRevenue}</span>
                  <DollarSign size={16} className="text-emerald-400" />
                </div>
                <p className="text-2xl font-serif font-black text-emerald-400">{estimatedRevenue.toLocaleString()} XAF</p>
                <span className="text-[10px] text-[#828B9E] block">From confirmed bookings</span>
              </div>
            </div>

            {/* DOOR SECURITY QR SCANNER INTEGRATION */}
            <div className="bg-[#181B26] border border-[#E5B800]/30 rounded-3xl p-6 space-y-4 shadow-xl">
              <h3 className="text-xs font-serif font-black text-[#E5B800] uppercase tracking-wider flex items-center gap-2">
                <QrCode size={16} /> DOOR SECURITY & VIP PASS VERIFIER
              </h3>
              <form onSubmit={handleVerifyPass} className="flex gap-3">
                <input 
                  type="text" 
                  placeholder="Enter Booking ID / Pass Code (e.g. RES-9981)" 
                  value={scanCodeInput}
                  onChange={(e) => setScanCodeInput(e.target.value)}
                  className="flex-1 bg-[#111319] border border-[#282E3E] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#E5B800]"
                />
                <button type="submit" className="px-5 py-3 bg-[#E5B800] text-[#111319] font-black text-xs rounded-xl uppercase tracking-wider hover:bg-[#d4a800] transition">
                  Verify Pass
                </button>
              </form>
              {scanResult && (
                <div className={`p-3 rounded-2xl text-xs font-bold ${scanResult.success ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'}`}>
                  {scanResult.message}
                </div>
              )}
            </div>

            {/* INTERACTIVE FLOOR PLAN / TABLE STATUS MAP */}
            <div className="bg-[#181B26] border border-[#282E3E] rounded-3xl p-6 space-y-4 shadow-xl">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-serif font-black text-[#E5B800] uppercase tracking-wider flex items-center gap-2">
                  <MapPin size={16} /> INTERACTIVE VIP FLOOR PLAN MAP
                </h3>
                <span className="text-[10px] text-[#828B9E]">Tap table to toggle status</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {floorTables.map((tbl) => (
                  <div 
                    key={tbl.id} 
                    onClick={() => toggleTableStatus(tbl.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition ${tbl.status === 'Available' ? 'bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-500' : 'bg-rose-500/10 border-rose-500/30 hover:border-rose-500'}`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-white uppercase">{tbl.name}</span>
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${tbl.status === 'Available' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                        {tbl.status}
                      </span>
                    </div>
                    <p className="text-[10px] text-[#828B9E]">{tbl.capacity} • Min: <span className="text-[#E5B800] font-bold">{tbl.minSpend}</span></p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#181B26] border border-[#282E3E] rounded-3xl p-6 space-y-4 shadow-xl">
              <h3 className="text-xs font-serif font-black text-[#E5B800] uppercase tracking-wider">{t.recentBookings}</h3>
              <div className="space-y-3">
                {bookings.slice(0, 3).map((b) => (
                  <div key={b.id} className="bg-[#111319] border border-[#282E3E] rounded-2xl p-4 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-white">{b.id} - {b.tableType}</span>
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${b.status === 'Confirmed' || b.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-400' : b.status === 'CHECKED IN' ? 'bg-purple-500/20 text-purple-400' : 'bg-amber-500/20 text-amber-400'}`}>{b.status}</span>
                      </div>
                      <p className="text-[10px] text-[#828B9E] mt-1">{b.date} at {b.time} • {b.guests} • {b.price} {b.userName ? `• Guest: ${b.userName}` : ''}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: RESERVATIONS */}
        {activeTab === 'bookings' && (
          <div className="bg-[#181B26] border border-[#282E3E] rounded-3xl p-6 space-y-4 shadow-xl">
            <h3 className="text-xs font-serif font-black text-[#E5B800] uppercase tracking-wider">ALL RESERVATION REQUESTS ({bookings.length})</h3>
            <div className="space-y-3">
              {bookings.map((b) => (
                <div key={b.id} className="bg-[#111319] border border-[#282E3E] rounded-2xl p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-[10px] font-mono text-[#828B9E]">{b.id} {b.userName ? `• ${b.userName}` : ''}</span>
                      <h4 className="text-sm font-bold text-white font-serif">{b.tableType}</h4>
                    </div>
                    <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase ${b.status === 'Confirmed' || b.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-400' : b.status === 'CHECKED IN' ? 'bg-purple-500/20 text-purple-400' : 'bg-amber-500/20 text-amber-400'}`}>{b.status}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[10px] text-[#828B9E] border-t border-b border-[#282E3E] py-2">
                    <div>Date: <span className="text-white font-bold">{b.date} {b.time}</span></div>
                    <div>Guests: <span className="text-white font-bold">{b.guests}</span></div>
                    <div>Min Spend: <span className="text-[#E5B800] font-bold">{b.price}</span></div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => handleUpdateBookingStatus(b.id, 'Confirmed')} className="bg-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1">
                      <CheckCircle2 size={14} /> Confirm
                    </button>
                    <button onClick={() => handleUpdateBookingStatus(b.id, 'CHECKED IN')} className="bg-purple-500/20 text-purple-400 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1">
                      <QrCode size={14} /> Check In
                    </button>
                    <button onClick={() => handleUpdateBookingStatus(b.id, 'Cancelled')} className="bg-rose-500/20 text-rose-400 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1">
                      <XCircle size={14} /> Cancel
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: MENU & SERVICES */}
        {activeTab === 'menu' && (
          <div className="space-y-6">
            <div className="bg-[#181B26] border border-[#282E3E] rounded-3xl p-6 space-y-4 shadow-xl">
              <h3 className="text-xs font-serif font-black text-[#E5B800] uppercase tracking-wider flex items-center gap-2">
                <Sparkles size={14} /> PUBLISH NEW BOTTLE
              </h3>
              <form onSubmit={handleAddDrink} className="space-y-3 text-xs">
                <div>
                  <label className="text-[10px] uppercase font-bold text-[#828B9E] block mb-1">Drink Name</label>
                  <input type="text" required placeholder="e.g. MOET & CHANDON ICE" value={drinkName} onChange={(e) => setDrinkName(e.target.value)} className="w-full bg-[#12141C] border border-[#282E3E] rounded-xl p-3 text-white focus:outline-none focus:border-[#E5B800]" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-[#828B9E] block mb-1">Category</label>
                    <select value={drinkCategory} onChange={(e) => setDrinkCategory(e.target.value)} className="w-full bg-[#12141C] border border-[#282E3E] rounded-xl p-3 text-white focus:outline-none focus:border-[#E5B800]">
                      <option value="SPIRITS">Spirits & Vodka</option>
                      <option value="CHAMPAGNE">Champagne</option>
                      <option value="WINE">Wine</option>
                      <option value="BEER">Beer</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-[#828B9E] block mb-1">Price</label>
                    <input type="text" required placeholder="e.g. 75,000 XAF" value={drinkPrice} onChange={(e) => setDrinkPrice(e.target.value)} className="w-full bg-[#12141C] border border-[#282E3E] rounded-xl p-3 text-white focus:outline-none focus:border-[#E5B800]" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-[#828B9E] block mb-1">Bottle Photo (Optional)</label>
                  <label className="w-full bg-[#12141C] border border-[#282E3E] hover:border-[#E5B800] rounded-xl p-3 cursor-pointer flex items-center justify-center gap-2 text-[#E5B800] transition">
                    <ImageIcon size={16} />
                    <span className="text-xs font-bold text-white">{drinkImage ? 'Photo Selected ✓' : 'Choose Image'}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        compressImage(file, (compressedUrl) => setDrinkImage(compressedUrl), 300, 300);
                      }
                    }} />
                  </label>
                </div>
                <button type="submit" className="w-full bg-[#E5B800] text-[#111319] font-black text-xs py-3.5 rounded-xl uppercase tracking-wider shadow-lg hover:bg-[#d4a800] transition">Add Drink</button>
              </form>
            </div>

            <div className="bg-[#181B26] border border-[#282E3E] rounded-3xl p-6 space-y-4 shadow-xl">
              <h3 className="text-xs font-serif font-black text-[#E5B800] uppercase tracking-wider">{t.publishedLive} ({venueDrinks.length})</h3>
              <div className="space-y-3">
                {venueDrinks.map((d) => (
                  <div key={d.id} className="bg-[#12141C] border border-[#282E3E] rounded-2xl p-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {d.image ? (
                        <div className="w-10 h-10 rounded-xl overflow-hidden"><img src={d.image} alt="" className="w-full h-full object-cover" /></div>
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-[#181B26] flex items-center justify-center text-[#E5B800]">🍾</div>
                      )}
                      <div>
                        <h4 className="text-xs font-bold text-white">{d.name}</h4>
                        <p className="text-[10px] text-[#828B9E] uppercase">{d.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-black text-[#E5B800]">{d.price}</span>
                      <button onClick={() => handleDeleteDrink(d.id)} className="p-1.5 bg-rose-500/20 text-rose-400 rounded-lg"><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: GALLERY & PROFILE */}
        {activeTab === 'gallery' && (
          <div className="space-y-6">
            {/* Added Club Profile Picture Sync Update Section */}
            <div className="bg-[#181B26] border border-[#E5B800]/40 rounded-3xl p-6 space-y-4 shadow-xl">
              <h3 className="text-xs font-serif font-black text-[#E5B800] uppercase tracking-wider flex items-center gap-2">
                <ImageIcon size={14} /> UPDATE CLUB PROFILE PICTURE (HOMEPAGE SYNC)
              </h3>
              <form onSubmit={handleUpdateClubImage} className="space-y-3 text-xs">
                <div className="flex items-center gap-4">
                  {clubProfileImage && (
                    <img src={clubProfileImage} alt="Club Profile" className="w-16 h-16 rounded-2xl object-cover border border-[#E5B800]" />
                  )}
                  <label className="flex-1 bg-[#12141C] border border-[#282E3E] hover:border-[#E5B800] rounded-xl p-3.5 cursor-pointer flex items-center justify-center gap-2 text-[#E5B800] transition">
                    <Upload size={16} />
                    <span className="font-bold text-white">{clubProfileImage ? 'Change Image' : 'Upload Profile Picture'}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        compressImage(file, (compressedUrl) => setClubProfileImage(compressedUrl), 600, 600);
                      }
                    }} />
                  </label>
                </div>
                <button type="submit" className="w-full bg-[#E5B800] text-[#111319] font-black text-xs py-3 rounded-xl uppercase tracking-wider shadow-lg hover:bg-[#d4a800] transition">
                  Sync Profile Picture to Homepage Card
                </button>
              </form>
            </div>

            <div className="bg-[#181B26] border border-[#282E3E] rounded-3xl p-6 space-y-4 shadow-xl">
              <h3 className="text-xs font-serif font-black text-[#E5B800] uppercase tracking-wider flex items-center gap-2">
                <ImageIcon size={14} /> UPLOAD CLUB GALLERY PHOTOS FROM PHONE
              </h3>
              <form onSubmit={handleSaveGalleryPhoto} className="space-y-3 text-xs">
                <label className="w-full bg-[#12141C] border border-[#282E3E] hover:border-[#E5B800] rounded-xl p-4 cursor-pointer flex items-center justify-center gap-2 text-[#E5B800] transition">
                  <Upload size={18} />
                  <span className="font-bold text-white">{galleryFile ? 'Photo Selected ✓' : 'Upload Photo'}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleGalleryUpload} />
                </label>
                <input type="text" placeholder="Caption (e.g. VIP Saturday Night)" value={galleryCaption} onChange={(e) => setGalleryCaption(e.target.value)} className="w-full bg-[#12141C] border border-[#282E3E] rounded-xl p-3 text-white focus:outline-none focus:border-[#E5B800]" />
                <button type="submit" className="w-full bg-[#E5B800] text-[#111319] font-black text-xs py-3.5 rounded-xl uppercase tracking-wider shadow-lg hover:bg-[#d4a800] transition">Publish Photo</button>
              </form>
            </div>

            <div className="bg-[#181B26] border border-[#282E3E] rounded-3xl p-6 space-y-4 shadow-xl">
              <h3 className="text-xs font-serif font-black text-[#E5B800] uppercase tracking-wider">GALLERY FEED ({venueGallery.length})</h3>
              <div className="grid grid-cols-2 gap-3">
                {venueGallery.map((p) => (
                  <div key={p.id} className="bg-[#12141C] border border-[#282E3E] rounded-2xl overflow-hidden relative group">
                    <img src={p.url} alt="" className="w-full h-32 object-cover" />
                    <p className="text-[10px] p-2 text-white truncate font-bold">{p.caption}</p>
                    <button onClick={() => handleDeleteGallery(p.id)} className="absolute top-2 right-2 p-1.5 bg-rose-500 text-white rounded-lg shadow-lg"><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: STAFF */}
        {activeTab === 'staff' && (
          <div className="space-y-6">
            <div className="bg-[#181B26] border border-[#282E3E] rounded-3xl p-6 space-y-4 shadow-xl">
              <h3 className="text-xs font-serif font-black text-[#E5B800] uppercase tracking-wider flex items-center gap-2">
                <Users size={14} /> ADD STAFF MEMBER (MEET OUR STAFF)
              </h3>
              <form onSubmit={handleAddStaff} className="space-y-3 text-xs">
                <div>
                  <label className="text-[10px] uppercase font-bold text-[#828B9E] block mb-1">Staff Name</label>
                  <input type="text" required placeholder="e.g. Brenda Nchinda" value={staffName} onChange={(e) => setStaffName(e.target.value)} className="w-full bg-[#12141C] border border-[#282E3E] rounded-xl p-3 text-white focus:outline-none focus:border-[#E5B800]" />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-[#828B9E] block mb-1">Role</label>
                  <input type="text" placeholder="e.g. VIP Hostess / Manager" value={staffRole} onChange={(e) => setStaffRole(e.target.value)} className="w-full bg-[#12141C] border border-[#282E3E] rounded-xl p-3 text-white focus:outline-none focus:border-[#E5B800]" />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-[#828B9E] block mb-1">Staff Photo</label>
                  <label className="w-full bg-[#12141C] border border-[#282E3E] hover:border-[#E5B800] rounded-xl p-3 cursor-pointer flex items-center justify-center gap-2 text-[#E5B800] transition">
                    <ImageIcon size={16} />
                    <span className="text-xs font-bold text-white">{staffPhoto ? 'Photo Selected ✓' : 'Choose Photo'}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        compressImage(file, (compressedUrl) => setStaffPhoto(compressedUrl), 300, 300);
                      }
                    }} />
                  </label>
                </div>
                <button type="submit" className="w-full bg-[#E5B800] text-[#111319] font-black text-xs py-3.5 rounded-xl uppercase tracking-wider shadow-lg hover:bg-[#d4a800] transition">Add Staff</button>
              </form>
            </div>

            <div className="bg-[#181B26] border border-[#282E3E] rounded-3xl p-6 space-y-4 shadow-xl">
              <h3 className="text-xs font-serif font-black text-[#E5B800] uppercase tracking-wider">TEAM LIST ({venueStaff.length})</h3>
              <div className="space-y-3">
                {venueStaff.map((s) => (
                  <div key={s.id} className="bg-[#12141C] border border-[#282E3E] rounded-2xl p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={s.photo} alt="" className="w-12 h-12 rounded-xl object-cover" />
                      <div>
                        <h4 className="text-xs font-bold text-white">{s.name}</h4>
                        <p className="text-[10px] text-[#E5B800] font-bold">{s.role}</p>
                      </div>
                    </div>
                    <button onClick={() => handleDeleteStaff(s.id)} className="p-2 bg-rose-500/20 text-rose-400 rounded-lg"><Trash2 size={16} /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: EVENTS & LIVE VIBE TRACKER */}
        {activeTab === 'events' && (
          <div className="space-y-6">
            <div className="bg-[#181B26] border border-[#282E3E] rounded-3xl p-6 space-y-4 shadow-xl">
              <h3 className="text-xs font-serif font-black text-[#E5B800] uppercase tracking-wider flex items-center gap-2">
                <Radio size={14} /> PUBLISH "TONIGHT'S VIBE" EVENT / DJ LINEUP
              </h3>
              <form onSubmit={handleAddEvent} className="space-y-3 text-xs">
                <div>
                  <label className="text-[10px] uppercase font-bold text-[#828B9E] block mb-1">Event Title</label>
                  <input type="text" required placeholder="e.g. Friday Night Fever" value={eventTitle} onChange={(e) => setEventTitle(e.target.value)} className="w-full bg-[#12141C] border border-[#282E3E] rounded-xl p-3 text-white focus:outline-none focus:border-[#E5B800]" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-[#828B9E] block mb-1">Date</label>
                    <input type="date" required value={eventDate} onChange={(e) => setEventDate(e.target.value)} className="w-full bg-[#12141C] border border-[#282E3E] rounded-xl p-3 text-white focus:outline-none focus:border-[#E5B800]" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-[#828B9E] block mb-1">Ticket / Entry Fee</label>
                    <input type="text" placeholder="e.g. 5,000 XAF" value={eventPrice} onChange={(e) => setEventPrice(e.target.value)} className="w-full bg-[#12141C] border border-[#282E3E] rounded-xl p-3 text-white focus:outline-none focus:border-[#E5B800]" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-[#828B9E] block mb-1">DJ / Artist Lineup</label>
                  <input type="text" placeholder="e.g. DJ Maphorisa" value={eventDj} onChange={(e) => setEventDj(e.target.value)} className="w-full bg-[#12141C] border border-[#282E3E] rounded-xl p-3 text-white focus:outline-none focus:border-[#E5B800]" />
                </div>
                <button type="submit" className="w-full bg-[#E5B800] text-[#111319] font-black text-xs py-3.5 rounded-xl uppercase tracking-wider shadow-lg hover:bg-[#d4a800] transition">Publish Event</button>
              </form>
            </div>

            <div className="bg-[#181B26] border border-[#282E3E] rounded-3xl p-6 space-y-4 shadow-xl">
              <h3 className="text-xs font-serif font-black text-[#E5B800] uppercase tracking-wider">UPCOMING EVENTS FEED ({venueEvents.length})</h3>
              <div className="space-y-3">
                {venueEvents.map((ev) => (
                  <div key={ev.id} className="bg-[#12141C] border border-[#282E3E] rounded-2xl p-4 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white">{ev.title}</h4>
                      <p className="text-[10px] text-[#828B9E] mt-0.5">📅 {ev.date} {ev.dj ? `• 🎤 ${ev.dj}` : ''}</p>
                      {ev.price && <span className="text-[10px] text-[#E5B800] font-bold">{ev.price}</span>}
                    </div>
                    <button onClick={() => handleDeleteEvent(ev.id)} className="p-2 bg-rose-500/20 text-rose-400 rounded-lg"><Trash2 size={16} /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}