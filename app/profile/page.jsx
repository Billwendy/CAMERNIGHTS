'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  User, Shield, Calendar, Sparkles, LogOut, MapPin, Building2, Heart, CheckCircle2, Clock, XCircle, QrCode, Bell 
} from 'lucide-react';

export default function UserProfilePage() {
  const router = useRouter();
  const [lang, setLang] = useState('EN');
  const [user, setUser] = useState(null);
  const [userBookings, setUserBookings] = useState([]);
  const [favoriteVenues, setFavoriteVenues] = useState([]);
  
  // Advanced Features States (Digital VIP Pass Modal & Notifications)
  const [notifications, setNotifications] = useState([]);
  const [showNotifDrawer, setShowNotifDrawer] = useState(false);
  const [selectedPass, setSelectedPass] = useState(null);

  useEffect(() => {
    const savedLang = localStorage.getItem('camernights_lang') || 'EN';
    setLang(savedLang);

    // Robust Session Recovery (prevents unexpected logouts across navigation)
    let savedProfile = localStorage.getItem('camernights_user_profile');
    
    if (!savedProfile) {
      const registered = JSON.parse(localStorage.getItem('camernights_registered_users') || '[]');
      if (registered.length > 0) {
        savedProfile = JSON.stringify(registered[registered.length - 1]);
        localStorage.setItem('camernights_user_profile', savedProfile);
      } else {
        router.push('/auth');
        return;
      }
    }

    try {
      const parsedUser = JSON.parse(savedProfile);
      setUser(parsedUser);

      // Load account-specific bookings dynamically
      const userKey = (parsedUser.email || 'default').toLowerCase();
      const savedBookings = localStorage.getItem(`camernights_user_bookings_${userKey}`);
      if (savedBookings) {
        setUserBookings(JSON.parse(savedBookings));
      } else {
        setUserBookings([]);
      }

      // Load account-specific favorite clubs
      const savedFavs = localStorage.getItem(`camernights_user_favorites_${userKey}`);
      if (savedFavs) {
        setFavoriteVenues(JSON.parse(savedFavs));
      } else {
        setFavoriteVenues([]);
      }

      // Load In-App Notifications
      const savedNotifs = localStorage.getItem(`camernights_notifications_${userKey}`);
      if (savedNotifs) {
        setNotifications(JSON.parse(savedNotifs));
      } else {
        const initialNotif = [{
          id: Date.now(),
          title: lang === 'FR' ? 'Bienvenue sur CamerNights VIP!' : 'Welcome to CamerNights VIP!',
          message: lang === 'FR' ? 'Votre compte est actif. Réservez votre première table.' : 'Your account is active. Explore and book your first table.',
          time: 'Just now',
          read: false
        }];
        setNotifications(initialNotif);
        localStorage.setItem(`camernights_notifications_${userKey}`, JSON.stringify(initialNotif));
      }
    } catch (e) {
      router.push('/auth');
    }
  }, [router, lang]);

  const handleLogout = () => {
    localStorage.removeItem('camernights_user_profile');
    router.push('/auth');
  };

  const toggleLanguage = (newLang) => {
    setLang(newLang);
    localStorage.setItem('camernights_lang', newLang);
  };

  const markNotificationsAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    if (user) {
      localStorage.setItem(`camernights_notifications_${user.email.toLowerCase()}`, JSON.stringify(updated));
    }
  };

  if (!user) return null;

  const t = {
    EN: {
      title: 'VIP MEMBER PROFILE',
      subtitle: 'Manage your exclusive club passes, active table reservations, and saved lounges.',
      nameLabel: 'Full Name',
      emailLabel: 'Account Email',
      membershipType: 'VIP PASS STATUS',
      activePass: 'GOLD VIP MEMBER',
      reservationsTitle: 'MY TABLE RESERVATIONS & VIP PASSES',
      emptyReservations: 'No active or past table reservations found. Book a VVIP table from any club lounge!',
      favoritesTitle: 'FAVORITE CLUBS & LOUNGES',
      emptyFavorites: 'No favorite clubs saved yet. Explore venues and tap the heart icon to save them here.',
      logoutBtn: 'SIGN OUT',
      clubsNav: 'CLUBS',
      reservationsNav: 'RESERVATIONS',
      profileNav: 'PROFILE',
      managerNav: 'MANAGER DESK',
      statusApproved: 'APPROVED',
      statusPending: 'PENDING',
      statusDeclined: 'DECLINED',
      statusCheckedIn: 'CHECKED IN',
      viewPass: 'View VIP Pass'
    },
    FR: {
      title: 'PROFIL MEMBRE VIP',
      subtitle: 'Gérez vos pass de club exclusifs, vos réservations de table et vos salons favoris.',
      nameLabel: 'Nom Complet',
      emailLabel: 'E-mail du Compte',
      membershipType: 'STATUT DU PASS VIP',
      activePass: 'MEMBRE VIP OR',
      reservationsTitle: 'MES RÉSERVATIONS DE TABLES & PASS VIP',
      emptyReservations: 'Aucune réservation active ou passée trouvée. Réservez une table VVIP dans un club !',
      favoritesTitle: 'CLUBS & SALONS FAVORIS',
      emptyFavorites: 'Aucun club favori enregistré. Explorez les établissements et ajoutez-les ici.',
      logoutBtn: 'SE DÉCONNECTER',
      clubsNav: 'CLUBS',
      reservationsNav: 'RÉSERVATIONS',
      profileNav: 'PROFIL',
      managerNav: 'ESPACE GESTIONNAIRE',
      statusApproved: 'APPROUVÉ',
      statusPending: 'EN ATTENTE',
      statusDeclined: 'REFUSÉ',
      statusCheckedIn: 'ENREGISTRÉ',
      viewPass: 'Voir Pass VIP'
    }
  }[lang];

  return (
    <div className="w-full min-h-screen bg-[#111319] text-[#F5F5F7] font-sans pb-28 select-none">
      {/* STICKY TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-50 bg-[#111319]/90 backdrop-blur-md px-6 py-4 border-b border-[#282E3E] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#E5B800] text-[#111319] flex items-center justify-center font-serif font-black text-base shadow-lg">
            C
          </div>
          <span className="font-serif font-black tracking-widest text-white text-sm sm:text-base">CAMERNIGHTS</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Notification Bell Button */}
          <button 
            onClick={() => { setShowNotifDrawer(!showNotifDrawer); markNotificationsAsRead(); }}
            className="relative p-2.5 rounded-xl bg-[#181B26] border border-[#282E3E] text-white hover:border-[#E5B800] transition"
          >
            <Bell size={16} />
            {notifications.some(n => !n.read) && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#E5B800] rounded-full animate-pulse" />
            )}
          </button>

          {/* Language Switcher */}
          <div className="bg-[#181B26] p-1 rounded-xl border border-[#282E3E] flex items-center gap-1 text-xs font-black">
            <button 
              onClick={() => toggleLanguage('EN')} 
              className={`px-3 py-1.5 rounded-lg transition ${lang === 'EN' ? 'bg-[#E5B800] text-[#111319]' : 'text-[#828B9E] hover:text-white'}`}
            >
              EN
            </button>
            <button 
              onClick={() => toggleLanguage('FR')} 
              className={`px-3 py-1.5 rounded-lg transition ${lang === 'FR' ? 'bg-[#E5B800] text-[#111319]' : 'text-[#828B9E] hover:text-white'}`}
            >
              FR
            </button>
          </div>
        </div>
      </header>

      {/* NOTIFICATION DRAWER DROPDOWN */}
      {showNotifDrawer && (
        <div className="absolute right-6 top-16 w-80 bg-[#181B26] border border-[#282E3E] rounded-2xl shadow-2xl z-50 p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-[#282E3E] pb-2">
            <h3 className="text-xs font-serif font-black text-white uppercase">In-App Notifications</h3>
            <span className="text-[10px] text-[#828B9E]">{notifications.length} Total</span>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {notifications.length === 0 ? (
              <p className="text-[10px] text-[#828B9E] text-center py-4">No notifications yet.</p>
            ) : (
              notifications.map((notif, idx) => (
                <div key={idx} className="p-3 bg-[#111319] border border-[#282E3E] rounded-xl space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-white">{notif.title}</span>
                    <span className="text-[9px] text-[#828B9E]">{notif.time}</span>
                  </div>
                  <p className="text-[10px] text-[#828B9E]">{notif.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* MAIN CONTAINER */}
      <main className="max-w-4xl mx-auto px-4 pt-6 space-y-6">
        
        {/* PROFILE HEADER CARD */}
        <div className="bg-[#181B26] border border-[#282E3E] rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#282E3E] pb-6">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111319] border border-[#282E3E] text-[#E5B800] text-[10px] font-black tracking-widest uppercase">
                <Sparkles size={12} />
                <span>{t.membershipType}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-serif font-black text-white uppercase tracking-wide">
                {user.fullName}
              </h1>
              <p className="text-xs text-[#828B9E]">{user.email}</p>
            </div>

            <button 
              onClick={handleLogout}
              className="px-4 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 font-black text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-rose-500/20 transition"
            >
              <LogOut size={14} />
              <span>{t.logoutBtn}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-[#111319] border border-[#282E3E] p-4 rounded-2xl space-y-1">
              <span className="text-[10px] text-[#828B9E] uppercase font-bold tracking-wider">{t.nameLabel}</span>
              <p className="font-bold text-white text-sm">{user.fullName}</p>
            </div>
            <div className="bg-[#111319] border border-[#282E3E] p-4 rounded-2xl space-y-1">
              <span className="text-[10px] text-[#828B9E] uppercase font-bold tracking-wider">{t.emailLabel}</span>
              <p className="font-bold text-white text-sm">{user.email}</p>
            </div>
          </div>
        </div>

        {/* TABLE RESERVATIONS & DIGITAL PASSES SECTION */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-serif font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Calendar size={16} className="text-[#E5B800]" />
              <span>{t.reservationsTitle}</span>
            </h2>
            <span className="text-xs font-black text-[#828B9E] bg-[#181B26] border border-[#282E3E] px-3 py-1 rounded-xl">
              {userBookings.length} {userBookings.length === 1 ? 'Booking' : 'Bookings'}
            </span>
          </div>

          {userBookings.length === 0 ? (
            <div className="bg-[#181B26] border border-[#282E3E] rounded-3xl p-8 text-center space-y-3">
              <Calendar size={32} className="mx-auto text-[#828B9E] opacity-50" />
              <p className="text-xs text-[#828B9E] max-w-sm mx-auto leading-relaxed">{t.emptyReservations}</p>
              <Link 
                href="/" 
                className="inline-block px-5 py-2.5 bg-[#E5B800] text-[#111319] font-black text-xs uppercase tracking-wider rounded-xl shadow-lg hover:bg-[#d4a800] transition"
              >
                Explore Clubs
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {userBookings.map((booking, idx) => (
                <div key={idx} className="bg-[#181B26] border border-[#282E3E] rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-white uppercase">{booking.venueName || 'VIP Table'}</span>
                      <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                        booking.status === 'APPROVED' || booking.status === 'Confirmed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                        booking.status === 'CHECKED IN' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30' :
                        booking.status === 'DECLINED' || booking.status === 'Cancelled' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30' :
                        'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      }`}>
                        {(booking.status === 'APPROVED' || booking.status === 'Confirmed') && <CheckCircle2 size={10} />}
                        {booking.status === 'CHECKED IN' && <CheckCircle2 size={10} />}
                        {(booking.status === 'DECLINED' || booking.status === 'Cancelled') && <XCircle size={10} />}
                        {(!booking.status || booking.status === 'Pending') && <Clock size={10} />}
                        <span>{booking.status === 'Confirmed' ? 'APPROVED' : booking.status || t.statusPending}</span>
                      </span>
                    </div>
                    <p className="text-[10px] text-[#828B9E]">
                      Table: <span className="text-white font-bold">{booking.tableName || booking.tableType}</span> | Guests: <span className="text-white font-bold">{booking.guests}</span> | Date: <span className="text-white font-bold">{booking.date}</span>
                    </p>
                    {booking.preOrders && booking.preOrders.length > 0 && (
                      <p className="text-[10px] text-[#E5B800]">
                        Pre-Orders: {booking.preOrders.map(p => `${p.name} (x${p.qty})`).join(', ')}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                    <span className="text-xs font-black text-[#E5B800] bg-[#111319] border border-[#282E3E] px-3 py-1.5 rounded-xl">
                      {booking.totalPrice || booking.price || 'Verified VIP'}
                    </span>
                    {(booking.status === 'APPROVED' || booking.status === 'Confirmed' || booking.status === 'CHECKED IN') && (
                      <button
                        onClick={() => setSelectedPass({ ...booking, passCode: booking.id || `VIP-${Math.floor(1000 + Math.random() * 9000)}-CMR` })}
                        className="px-3 py-1.5 rounded-xl bg-[#E5B800] text-[#111319] font-black text-xs flex items-center gap-1 hover:bg-[#d4a800] transition uppercase"
                      >
                        <QrCode size={14} /> {t.viewPass}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* FAVORITE CLUBS SECTION */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-serif font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Heart size={16} className="text-[#E5B800]" />
              <span>{t.favoritesTitle}</span>
            </h2>
            <span className="text-xs font-black text-[#828B9E] bg-[#181B26] border border-[#282E3E] px-3 py-1 rounded-xl">
              {favoriteVenues.length} {favoriteVenues.length === 1 ? 'Club' : 'Clubs'}
            </span>
          </div>

          {favoriteVenues.length === 0 ? (
            <div className="bg-[#181B26] border border-[#282E3E] rounded-3xl p-8 text-center space-y-3">
              <Building2 size={32} className="mx-auto text-[#828B9E] opacity-50" />
              <p className="text-xs text-[#828B9E] max-w-sm mx-auto leading-relaxed">{t.emptyFavorites}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {favoriteVenues.map((venue) => (
                <Link 
                  key={venue.id} 
                  href={`/venue/${venue.id}`}
                  className="bg-[#181B26] border border-[#282E3E] rounded-2xl p-4 flex items-center gap-4 hover:border-[#E5B800] transition group"
                >
                  <img src={venue.image} alt={venue.name} className="w-16 h-16 rounded-xl object-cover" />
                  <div>
                    <h3 className="text-xs font-serif font-black text-white uppercase group-hover:text-[#E5B800] transition">{venue.name}</h3>
                    <p className="text-[10px] text-[#828B9E] uppercase mt-0.5">{venue.city} Centre</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

      </main>

      {/* DIGITAL VIP PASS MODAL */}
      {selectedPass && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181B26] border border-[#E5B800]/50 rounded-3xl p-6 w-full max-w-sm space-y-6 shadow-2xl relative">
            <div className="text-center space-y-1">
              <span className="text-[10px] font-black tracking-widest text-[#E5B800] uppercase">CAMERNIGHTS EXCLUSIVE ACCESS</span>
              <h3 className="text-lg font-serif font-black text-white">DIGITAL VIP PASS</h3>
              <p className="text-[10px] text-[#828B9E]">Present this pass at venue door for express entry</p>
            </div>

            {/* Pass QR Box */}
            <div className="bg-[#111319] border border-[#282E3E] rounded-2xl p-6 text-center space-y-3">
              <div className="w-36 h-36 mx-auto bg-white rounded-xl p-2 flex items-center justify-center">
                <QrCode size={120} className="text-[#111319]" />
              </div>
              <span className="font-mono font-black text-xs text-[#E5B800] tracking-widest block">{selectedPass.passCode}</span>
            </div>

            {/* Pass Metadata */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between border-b border-[#282E3E] pb-1">
                <span className="text-[#828B9E]">Venue:</span>
                <span className="text-white font-bold uppercase">{selectedPass.venueName || 'CHATEAU VIP'}</span>
              </div>
              <div className="flex justify-between border-b border-[#282E3E] pb-1">
                <span className="text-[#828B9E]">Table:</span>
                <span className="text-white font-bold uppercase">{selectedPass.tableName || selectedPass.tableType}</span>
              </div>
              <div className="flex justify-between border-b border-[#282E3E] pb-1">
                <span className="text-[#828B9E]">Guests:</span>
                <span className="text-white font-bold">{selectedPass.guests}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#828B9E]">Date:</span>
                <span className="text-white font-bold">{selectedPass.date}</span>
              </div>
            </div>

            <button 
              onClick={() => setSelectedPass(null)}
              className="w-full py-3 bg-[#E5B800] text-[#111319] font-black text-xs rounded-xl uppercase tracking-wider hover:bg-[#d4a800] transition"
            >
              Close Pass
            </button>
          </div>
        </div>
      )}

      {/* BOTTOM FLOATING TAB BAR */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#181B26]/95 backdrop-blur-md border-t border-[#282E3E] py-3 px-6">
        <div className="max-w-md mx-auto flex justify-around items-center text-[10px] font-black uppercase tracking-wider">
          <Link href="/" className="flex flex-col items-center gap-1 text-[#828B9E] hover:text-white transition">
            <Sparkles size={18} />
            <span>{t.clubsNav}</span>
          </Link>
          <Link href="/bookings" className="flex flex-col items-center gap-1 text-[#828B9E] hover:text-white transition">
            <Calendar size={18} />
            <span>{t.reservationsNav}</span>
          </Link>
          <Link href="/profile" className="flex flex-col items-center gap-1 text-[#E5B800]">
            <User size={18} />
            <span>{t.profileNav}</span>
          </Link>
          <Link href="/admin" className="flex flex-col items-center gap-1 text-[#828B9E] hover:text-white transition">
            <Shield size={18} />
            <span>{t.managerNav}</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}