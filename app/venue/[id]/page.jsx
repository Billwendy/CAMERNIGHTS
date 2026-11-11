'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { MapPin, Navigation, ChevronLeft, ShieldCheck, X, Star } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

function VenueDetailContent() {
  const params = useParams();
  const router = useRouter();
  const venueId = params?.id || '1';

  const [lang, setLang] = useState('EN');
  const [venue, setVenue] = useState(null);
  const [activeTab, setActiveTab] = useState('menu'); // 'menu', 'services', 'gallery', 'staff', 'events'

  const [drinks, setDrinks] = useState([]);
  const [services, setServices] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [staff, setStaff] = useState([]);
  const [events, setEvents] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [newReviewText, setNewReviewText] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [guestCount, setGuestCount] = useState('4-6 Guests');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('22:00');

  useEffect(() => {
    const savedLang = localStorage.getItem('camernights_lang');
    if (savedLang) setLang(savedLang);

    loadVenueData();

    const handleStorageChange = () => loadVenueData();
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [venueId]);

  const loadVenueData = () => {
    const savedVenues = localStorage.getItem('camernights_registered_venues');
    let foundVenue = null;
    if (savedVenues) {
      const parsed = JSON.parse(savedVenues);
      foundVenue = parsed.find(v => v.id === venueId);
    }

    const savedAdmin = localStorage.getItem('camernights_admin_profile');
    let adminProfilePic = '';
    if (savedAdmin) {
      const admin = JSON.parse(savedAdmin);
      adminProfilePic = admin.heroImage || admin.profilePic || admin.image || '';
      if (venueId === '1' || (foundVenue && foundVenue.name.toLowerCase() === admin.venueName.toLowerCase())) {
        if (!foundVenue) foundVenue = {};
        foundVenue.name = admin.venueName;
        foundVenue.location = `${admin.venueCity || 'Buea'} Centre, Cameroon`;
      }
    }

    if (!foundVenue) {
      foundVenue = {
        id: venueId,
        name: 'LE CHATEAU CLUB',
        location: 'Buea Centre, Cameroon',
        category: 'CLUBS & NIGHTLIFE',
        image: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&q=80&w=1000'
      };
    }

    foundVenue.image = adminProfilePic || foundVenue.image || 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&q=80&w=1000';
    setVenue(foundVenue);

    setDrinks(JSON.parse(localStorage.getItem('camernights_chateau_drinks') || '[]'));
    setServices(JSON.parse(localStorage.getItem('camernights_chateau_services') || '[]'));
    
    const savedGallery = localStorage.getItem(`camernights_gallery_${venueId}`) || localStorage.getItem('camernights_gallery_1') || '[]';
    setGallery(JSON.parse(savedGallery));

    const rawStaff = JSON.parse(localStorage.getItem(`camernights_staff_${venueId}`) || localStorage.getItem('camernights_staff_1') || '[]');
    const normalizedStaff = rawStaff.map(s => ({
      ...s,
      photo: s.photo || s.photoUrl || s.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'
    }));
    setStaff(normalizedStaff);

    const savedEvents = localStorage.getItem(`camernights_events_${venueId}`) || localStorage.getItem('camernights_events_1') || '[]';
    setEvents(JSON.parse(savedEvents));

    const savedReviews = JSON.parse(localStorage.getItem(`camernights_reviews_${venueId}`) || JSON.stringify([
      { id: 1, author: 'Valerie M.', rating: 5, comment: 'Unmatched VVIP service in Buea! The bottle sparklers and atmosphere are top tier.', date: '2026-02-18' }
    ]));
    setReviews(savedReviews);
  };

  const handleOpenBooking = (tableName, tablePrice) => {
    const userProfile = localStorage.getItem('camernights_user_profile');
    if (!userProfile) {
      alert(lang === 'EN' ? 'Please log in or sign up before reserving VIP tables!' : 'Veuillez vous connecter ou vous inscrire avant de réserver des tables VIP !');
      router.push('/auth?role=user');
      return;
    }
    setSelectedTable({ name: tableName, price: tablePrice });
    setIsModalOpen(true);
  };

  const handleConfirmReservation = (e) => {
    e.preventDefault();
    const newBooking = {
      id: `RES-${Math.floor(1000 + Math.random() * 9000)}`,
      venueName: venue.name,
      venueCity: venue.location,
      tableType: selectedTable.name,
      guests: guestCount,
      date: bookingDate || 'Today',
      time: bookingTime,
      price: selectedTable.price,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };

    const existingBookings = JSON.parse(localStorage.getItem('camernights_admin_bookings') || '[]');
    const updatedBookings = [newBooking, ...existingBookings];
    localStorage.setItem('camernights_admin_bookings', JSON.stringify(updatedBookings));
    window.dispatchEvent(new Event('camernights_new_booking'));

    setIsModalOpen(false);
    alert(lang === 'EN' ? 'VVIP Table Reservation Request Sent successfully!' : 'Demande de réservation de table VVIP envoyée avec succès !');
    router.push('/bookings');
  };

  const handleAddReview = (e) => {
    e.preventDefault();
    if (!newReviewText.trim()) return;
    const userProfile = JSON.parse(localStorage.getItem('camernights_user_profile') || '{}');
    const newReview = {
      id: Date.now(),
      author: userProfile.name || userProfile.email || 'Anonymous Partygoer',
      rating: Number(newReviewRating),
      comment: newReviewText,
      date: new Date().toISOString().split('T')[0]
    };
    const updatedReviews = [newReview, ...reviews];
    setReviews(updatedReviews);
    localStorage.setItem(`camernights_reviews_${venueId}`, JSON.stringify(updatedReviews));
    setNewReviewText('');
    alert(lang === 'EN' ? 'Review published successfully!' : 'Avis publié avec succès !');
  };

  if (!venue) return null;

  const averageRating = reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : '5.0';

  const t = {
    EN: {
      back: 'Back',
      tablesHeader: 'VVIP TABLES & BOOTHS',
      minSpend: 'Minimum Spend',
      reserveBtn: 'Book Table',
      gps: 'GPS Directions',
      menuTab: 'Bottle Menu',
      servicesTab: 'Special Services',
      galleryTab: 'Photo Gallery',
      staffTab: 'Meet Our Staff',
      eventsTab: 'Upcoming Events',
      close: 'Close',
      confirmBooking: 'Confirm VVIP Reservation',
      reviewsHeader: 'CUSTOMER REVIEWS & RATINGS',
      writeReview: 'Leave a Review',
      submitReview: 'Publish Review'
    },
    FR: {
      back: 'Retour',
      tablesHeader: 'TABLES & SALONS VVIP',
      minSpend: 'Consommation Minimum',
      reserveBtn: 'Réserver',
      gps: 'Itinéraire GPS',
      menuTab: 'Menu Bouteilles',
      servicesTab: 'Services Spéciaux',
      galleryTab: 'Galerie Photo',
      staffTab: 'Notre Équipe',
      eventsTab: 'Événements à venir',
      close: 'Fermer',
      confirmBooking: 'Confirmer la Réservation VVIP',
      reviewsHeader: 'AVIS & NOTATIONS CLIENTS',
      writeReview: 'Laisser un avis',
      submitReview: "Publier l'avis"
    }
  }[lang];

  const tables = [
    { name: 'Royal VVIP Booth', price: '75,000 XAF', desc: 'Private elevated booth facing main DJ booth with bottle sparklers' },
    { name: 'VIP Dancefloor Table', price: '45,000 XAF', desc: 'Prime seating right next to the dancefloor action' },
    { name: 'Standard VIP Lounge', price: '25,000 XAF', desc: 'Comfortable luxury seating for groups up to 4' }
  ];

  return (
    <div className="w-full min-h-screen bg-[#111319] text-[#F5F5F7] font-sans pb-32 select-none">
      <div className="relative h-72 sm:h-96 w-full">
        <img src={venue.image} alt={venue.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#111319] via-black/40 to-transparent" />

        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <Link href="/" className="bg-[#12141C]/80 backdrop-blur-md border border-[#222634] text-[#E5B800] p-2.5 rounded-2xl flex items-center gap-2 hover:bg-[#12141C] transition">
            <ChevronLeft size={16} />
            <span>{t.back}</span>
          </Link>
          
          <span className="bg-[#E5B800] text-[#12141C] text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-lg">
            <ShieldCheck size={13} /> VERIFIED
          </span>
        </div>

        <div className="absolute bottom-6 left-6 right-6 space-y-1">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-extrabold text-[#E5B800] tracking-widest uppercase">
              {venue.category || 'PREMIUM CLUB'}
            </span>
            <div className="flex items-center gap-1 bg-[#12141C]/80 px-2.5 py-0.5 rounded-full border border-[#222634]">
              <Star size={12} className="text-[#E5B800] fill-[#E5B800]" />
              <span className="text-[10px] font-black text-white">{averageRating} ({reviews.length} reviews)</span>
            </div>
          </div>
          <h1 className="text-2xl sm:text-4xl font-serif font-black text-white">{venue.name}</h1>
          <p className="text-xs text-[#828B9E] flex items-center gap-1">
            <MapPin size={13} className="text-[#E5B800]" /> {venue.location}
          </p>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 pt-6 space-y-6">
        <div className="flex gap-3">
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue.name + ' ' + venue.location)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-[#181B26] border border-[#282E3E] hover:border-[#E5B800] text-white font-bold text-xs py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 transition shadow-xl"
          >
            <Navigation size={15} className="text-[#E5B800]" />
            <span>{t.gps}</span>
          </a>
        </div>

        <div className="bg-[#181B26] p-1.5 rounded-2xl border border-[#282E3E] grid grid-cols-2 sm:grid-cols-5 gap-1 text-center">
          <button onClick={() => setActiveTab('menu')} className={`py-2.5 rounded-xl text-[11px] font-black tracking-wider transition ${activeTab === 'menu' ? 'bg-[#E5B800] text-[#12141C] shadow-md' : 'text-[#828B9E] hover:text-white'}`}>{t.menuTab}</button>
          <button onClick={() => setActiveTab('services')} className={`py-2.5 rounded-xl text-[11px] font-black tracking-wider transition ${activeTab === 'services' ? 'bg-[#E5B800] text-[#12141C] shadow-md' : 'text-[#828B9E] hover:text-white'}`}>{t.servicesTab}</button>
          <button onClick={() => setActiveTab('gallery')} className={`py-2.5 rounded-xl text-[11px] font-black tracking-wider transition ${activeTab === 'gallery' ? 'bg-[#E5B800] text-[#12141C] shadow-md' : 'text-[#828B9E] hover:text-white'}`}>{t.galleryTab} ({gallery.length})</button>
          <button onClick={() => setActiveTab('staff')} className={`py-2.5 rounded-xl text-[11px] font-black tracking-wider transition ${activeTab === 'staff' ? 'bg-[#E5B800] text-[#12141C] shadow-md' : 'text-[#828B9E] hover:text-white'}`}>{t.staffTab} ({staff.length})</button>
          <button onClick={() => setActiveTab('events')} className={`py-2.5 rounded-xl text-[11px] font-black tracking-wider transition ${activeTab === 'events' ? 'bg-[#E5B800] text-[#12141C] shadow-md' : 'text-[#828B9E] hover:text-white'}`}>{t.eventsTab} ({events.length})</button>
        </div>

        {activeTab === 'menu' && (
          <div className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-xs font-serif font-black text-[#E5B800] tracking-widest uppercase">{t.tablesHeader}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {tables.map((tbl, idx) => (
                  <div key={idx} className="bg-[#181B26] border border-[#282E3E] rounded-3xl p-5 space-y-4 shadow-xl flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-serif font-black text-white">{tbl.name}</h3>
                      <p className="text-[10px] text-[#828B9E] mt-1">{tbl.desc}</p>
                    </div>
                    <div className="pt-2 border-t border-[#282E3E] flex items-center justify-between">
                      <div>
                        <span className="text-[9px] uppercase text-[#828B9E] block">{t.minSpend}</span>
                        <span className="text-sm font-black text-[#E5B800]">{tbl.price}</span>
                      </div>
                      <button onClick={() => handleOpenBooking(tbl.name, tbl.price)} className="bg-[#E5B800] hover:bg-[#d4a800] text-[#12141C] font-black text-xs px-4 py-2.5 rounded-xl uppercase tracking-wider transition shadow-lg">{t.reserveBtn}</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <h2 className="text-xs font-serif font-black text-[#E5B800] tracking-widest uppercase">PUBLISHED BOTTLES & DRINKS ({drinks.length})</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {drinks.map((d, i) => (
                  <div key={d.id || i} className="bg-[#181B26] border border-[#282E3E] rounded-2xl p-3.5 flex items-center justify-between shadow-lg">
                    <div className="flex items-center gap-3">
                      {d.image || d.photoUrl ? (
                        <img src={d.image || d.photoUrl} alt="Bottle" className="w-12 h-12 rounded-xl object-cover" />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-[#12141C] flex items-center justify-center font-bold text-xs text-[#E5B800]">🍾</div>
                      )}
                      <div>
                        <h4 className="text-xs font-bold text-white">{d.name}</h4>
                        <span className="text-[10px] text-[#828B9E] uppercase">{d.category}</span>
                      </div>
                    </div>
                    <span className="text-xs font-black text-[#E5B800]">{d.price}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'services' && (
          <div className="space-y-4">
            <h2 className="text-xs font-serif font-black text-[#E5B800] tracking-widest uppercase">SPECIAL VIP SERVICES ({services.length})</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {services.map((s, i) => (
                <div key={s.id || i} className="bg-[#181B26] border border-[#282E3E] rounded-2xl p-4 flex justify-between items-start shadow-lg">
                  <div>
                    <h3 className="text-xs font-bold text-white">{s.name}</h3>
                    <p className="text-[10px] text-[#828B9E] mt-0.5">{s.description}</p>
                  </div>
                  <span className="text-xs font-black text-[#E5B800]">{s.price}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'gallery' && (
          <div className="space-y-4">
            <h2 className="text-xs font-serif font-black text-[#E5B800] tracking-widest uppercase">CLUB PHOTO GALLERY ({gallery.length})</h2>
            {gallery.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {gallery.map((g, idx) => (
                  <div key={g.id || idx} className="bg-[#181B26] border border-[#282E3E] rounded-2xl overflow-hidden shadow-lg">
                    <img src={g.url} alt="Gallery" className="w-full h-32 object-cover" />
                    {g.caption && <p className="text-[10px] p-2 text-white truncate font-bold">{g.caption}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#828B9E] text-center py-16">No gallery photos uploaded yet.</p>
            )}
          </div>
        )}

        {activeTab === 'staff' && (
          <div className="space-y-4">
            <h2 className="text-xs font-serif font-black text-[#E5B800] tracking-widest uppercase">MEET OUR STAFF & MANAGEMENT ({staff.length})</h2>
            {staff.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {staff.map((st, idx) => (
                  <div key={st.id || idx} className="bg-[#181B26] border border-[#282E3E] rounded-2xl p-4 flex items-center gap-3 shadow-lg">
                    <img src={st.photo} alt={st.name} className="w-14 h-14 rounded-2xl object-cover border border-[#E5B800]/40" />
                    <div>
                      <h3 className="text-xs font-bold text-white">{st.name}</h3>
                      <p className="text-[10px] text-[#E5B800] font-semibold mt-0.5">{st.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#828B9E] text-center py-16">No staff members added yet.</p>
            )}
          </div>
        )}

        {/* TAB: EVENTS SECTION */}
        {activeTab === 'events' && (
          <div className="space-y-4">
            <h2 className="text-xs font-serif font-black text-[#E5B800] tracking-widest uppercase">UPCOMING EVENTS ({events.length})</h2>
            {events.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {events.map((ev, idx) => (
                  <div key={ev.id || idx} className="bg-[#181B26] border border-[#282E3E] rounded-2xl p-4 space-y-1 shadow-lg">
                    <div className="flex justify-between items-start">
                      <h3 className="text-xs font-bold text-white">{ev.title}</h3>
                      <span className="text-xs font-black text-[#E5B800]">{ev.price}</span>
                    </div>
                    <p className="text-[10px] text-[#828B9E]">📅 Date: <span className="text-white font-semibold">{ev.date}</span></p>
                    {ev.dj && <p className="text-[10px] text-[#828B9E]">🎤 DJ / Artist: <span className="text-[#E5B800] font-bold">{ev.dj}</span></p>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#828B9E] text-center py-16">No events added yet.</p>
            )}
          </div>
        )}

        <div className="bg-[#181B26] border border-[#282E3E] rounded-3xl p-6 space-y-6 shadow-xl mt-8">
          <div className="flex justify-between items-center border-b border-[#282E3E] pb-4">
            <div>
              <h2 className="text-xs font-serif font-black text-[#E5B800] tracking-widest uppercase">{t.reviewsHeader}</h2>
              <p className="text-[10px] text-[#828B9E] mt-0.5">Real feedback from verified Cameroonian partygoers</p>
            </div>
            <div className="flex items-center gap-1.5 bg-[#12141C] px-3 py-1.5 rounded-xl border border-[#282E3E]">
              <Star size={14} className="text-[#E5B800] fill-[#E5B800]" />
              <span className="text-xs font-black text-white">{averageRating} / 5.0</span>
            </div>
          </div>

          <div className="space-y-3">
            {reviews.map((rev) => (
              <div key={rev.id} className="bg-[#12141C] border border-[#282E3E] rounded-2xl p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-white">{rev.author}</span>
                  <div className="flex items-center gap-1">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} size={10} className="text-[#E5B800] fill-[#E5B800]" />
                    ))}
                    <span className="text-[10px] text-[#828B9E] ml-2">{rev.date}</span>
                  </div>
                </div>
                <p className="text-xs text-[#9DA4B4]">{rev.comment}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddReview} className="space-y-3 pt-4 border-t border-[#282E3E] text-xs">
            <h3 className="font-serif font-black text-white text-xs">{t.writeReview}</h3>
            <div className="flex gap-3">
              <select value={newReviewRating} onChange={(e) => setNewReviewRating(e.target.value)} className="bg-[#12141C] border border-[#282E3E] rounded-xl p-3 text-white focus:outline-none focus:border-[#E5B800]">
                <option value="5">⭐⭐⭐⭐⭐ (5/5)</option>
                <option value="4">⭐⭐⭐⭐ (4/5)</option>
                <option value="3">⭐⭐⭐ (3/5)</option>
                <option value="2">⭐⭐ (2/5)</option>
                <option value="1">⭐ (1/5)</option>
              </select>
              <input type="text" required placeholder="Share your nightlife experience..." value={newReviewText} onChange={(e) => setNewReviewText(e.target.value)} className="flex-1 bg-[#12141C] border border-[#282E3E] rounded-xl p-3 text-white focus:outline-none focus:border-[#E5B800]" />
            </div>
            <button type="submit" className="w-full bg-[#E5B800] hover:bg-[#d4a800] text-[#12141C] font-black text-xs py-3 rounded-xl uppercase tracking-wider transition shadow-lg">{t.submitReview}</button>
          </form>
        </div>
      </main>

      {isModalOpen && selectedTable && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181B26] border border-[#282E3E] rounded-3xl p-6 w-full max-w-sm space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-[#282E3E] pb-3">
              <span className="text-[10px] text-[#E5B800] uppercase font-bold">VVIP Table Booking</span>
              <button onClick={() => setIsModalOpen(false)} className="text-[#828B9E] hover:text-white"><X size={18} /></button>
            </div>
            <div className="flex justify-between items-center">
              <h3 className="text-base font-serif font-black text-white">{selectedTable.name}</h3>
              <span className="text-base font-black text-[#E5B800]">{selectedTable.price}</span>
            </div>
            <form onSubmit={handleConfirmReservation} className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-bold text-[#828B9E] uppercase block mb-1">Guests</label>
                <select value={guestCount} onChange={(e) => setGuestCount(e.target.value)} className="w-full bg-[#12141C] border border-[#282E3E] rounded-xl p-3 text-white focus:outline-none focus:border-[#E5B800]">
                  <option value="2-4 Guests">2-4 Guests</option>
                  <option value="4-6 Guests">4-6 Guests</option>
                  <option value="8-10 Guests">8-10 Guests (VVIP Booth)</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-[#828B9E] uppercase block mb-1">Date</label>
                  <input type="date" required value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} className="w-full bg-[#12141C] border border-[#282E3E] rounded-xl p-3 text-white focus:outline-none focus:border-[#E5B800]" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#828B9E] uppercase block mb-1">Time</label>
                  <input type="time" required value={bookingTime} onChange={(e) => setBookingTime(e.target.value)} className="w-full bg-[#12141C] border border-[#282E3E] rounded-xl p-3 text-white focus:outline-none focus:border-[#E5B800]" />
                </div>
              </div>
              <div className="pt-2 border-t border-[#282E3E] flex justify-between items-center">
                <span className="text-[9px] uppercase text-[#828B9E] font-bold">Minimum Spend:</span>
                <span className="text-base font-black text-[#E5B800]">{selectedTable.price}</span>
              </div>
              <button type="submit" className="w-full bg-[#E5B800] hover:bg-[#d4a800] text-[#12141C] font-black text-xs py-3 rounded-xl uppercase tracking-wider transition shadow-lg">{t.confirmBooking}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VenueDetailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#111319] text-white flex items-center justify-center text-xs font-bold">Loading Venue...</div>}>
      <VenueDetailContent />
    </Suspense>
  );
}