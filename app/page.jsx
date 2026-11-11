'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Star, ShieldCheck, ChevronRight, Sparkles, Building2, Calendar, User, Shield } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  const [lang, setLang] = useState('EN');
  const [selectedCity, setSelectedCity] = useState('ALL');
  const [venues, setVenues] = useState([]);

  useEffect(() => {
    const savedLang = localStorage.getItem('camernights_lang');
    if (savedLang) setLang(savedLang);

    loadVenues();

    const handleStorageChange = () => loadVenues();
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const changeLang = (l) => {
    setLang(l);
    localStorage.setItem('camernights_lang', l);
  };

  const loadVenues = () => {
    const savedAdmin = localStorage.getItem('camernights_admin_profile');
    let adminProfilePic = '';
    let adminVenueName = 'CHATEAU VIP';
    let adminVenueCity = 'Buea';

    if (savedAdmin) {
      const parsedAdmin = JSON.parse(savedAdmin);
      adminProfilePic = parsedAdmin.image || parsedAdmin.profilePic || '';
      if (parsedAdmin.venueName) adminVenueName = parsedAdmin.venueName;
      if (parsedAdmin.city || parsedAdmin.venueCity) adminVenueCity = parsedAdmin.city || parsedAdmin.venueCity;
    }

    const registered = JSON.parse(localStorage.getItem('camernights_registered_venues') || '[]');

    const defaultVenues = [
      {
        id: '1',
        name: adminVenueName,
        city: adminVenueCity,
        location: `${adminVenueCity} Centre, ${adminVenueCity}`,
        category: 'VERIFIED VIP',
        rating: 4.9,
        reviewsCount: 1,
        minSpend: '25,000 XAF',
        tags: ['VIP Table Service', 'Bottle Service', 'Live DJ'],
        image: adminProfilePic || 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&q=80&w=1000'
      },
      {
        id: '2',
        name: 'SKYLUXE VIP LOUNGE',
        city: 'Douala',
        location: 'Bonapriso, Douala',
        category: 'VERIFIED VIP',
        rating: 4.8,
        reviewsCount: 95,
        minSpend: '25,000 XAF',
        tags: ['Rooftop View', 'Cocktail Bar', 'Shisha'],
        image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=1000'
      }
    ];

    const combined = [...registered, ...defaultVenues].map(v => {
      if (v.id === '1' || v.name === adminVenueName) {
        return { ...v, image: adminProfilePic || v.image, city: adminVenueCity };
      }
      return v;
    });

    const uniqueVenues = Array.from(new Map(combined.map(item => [item.id || item.name, item])).values());
    setVenues(uniqueVenues);
  };

  const filteredVenues = venues.filter(v => {
    if (selectedCity === 'ALL') return true;
    return v.city?.toLowerCase() === selectedCity.toLowerCase();
  });

  const cities = ['ALL CITIES', 'BUEA', 'DOUALA', 'YAOUNDÉ', 'LIMBE', 'BAMENDA'];

  return (
    <div className="w-full min-h-screen bg-[#111319] text-[#F5F5F7] font-sans pb-28 select-none">
      {/* HEADER SECTION */}
      <header className="max-w-5xl mx-auto px-5 pt-6 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#E5B800] flex items-center justify-center font-bold text-black text-sm">
            C
          </div>
          <h1 className="text-sm font-serif font-black tracking-widest text-[#E5B800]">CAMERNIGHTS</h1>
        </div>

        {/* LANGUAGE SWITCHER */}
        <div className="flex items-center bg-[#181B26] border border-[#282E3E] rounded-full p-0.5 text-[10px] font-bold">
          <button
            onClick={() => changeLang('EN')}
            className={`px-2.5 py-1 rounded-full transition ${lang === 'EN' ? 'bg-[#E5B800] text-[#111319]' : 'text-[#828B9E]'}`}
          >
            EN
          </button>
          <button
            onClick={() => changeLang('FR')}
            className={`px-2.5 py-1 rounded-full transition ${lang === 'FR' ? 'bg-[#E5B800] text-[#111319]' : 'text-[#828B9E]'}`}
          >
            FR
          </button>
        </div>
      </header>

      {/* HERO HEADER SECTION */}
      <div className="max-w-5xl mx-auto bg-[#181B26] border border-[#282E3E] rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111319] border border-[#282E3E] text-[#E5B800] text-[10px] font-black tracking-widest uppercase">
          <Sparkles size={12} />
          <span>{lang === 'FR' ? 'VIE NOCTURNE & GASTRONOMIE VIP AU CAMEROUN' : 'CAMEROON VIP NIGHTLIFE & DINING'}</span>
        </div>
        <h1 className="text-lg sm:text-3xl font-serif font-black text-white tracking-wide uppercase leading-tight">
          {lang === 'FR' ? 'DÉCOUVREZ & RÉSERVEZ DES NUITS VVIP' : 'DISCOVER & RESERVE VVIP NIGHTS'}
        </h1>
        <p className="text-xs sm:text-sm text-[#828B9E] leading-relaxed">
          {lang === 'FR' 
            ? 'Réservations de clubs exclusives, services de bouteilles et salons VIP à Buea, Douala, Yaoundé, Limbe et Bamenda.' 
            : 'Exclusive club reservations, bottle services, and VIP lounges across Buea, Douala, Yaoundé, Limbe, and Bamenda.'}
        </p>
      </div>

      {/* CITY NAVIGATION ROW */}
      <nav className="max-w-5xl mx-auto px-5 py-3 overflow-x-auto no-scrollbar flex items-center gap-2 text-[10px] font-extrabold">
        {cities.map((city) => {
          const rawCity = city.replace('ALL CITIES', 'ALL');
          const isSelected = selectedCity.toUpperCase() === rawCity.toUpperCase();
          return (
            <button
              key={city}
              onClick={() => setSelectedCity(rawCity)}
              className={`px-4 py-2 rounded-full uppercase tracking-wider flex items-center gap-1 whitespace-nowrap transition ${
                isSelected
                  ? 'bg-[#E5B800] text-[#111319] font-black shadow-lg'
                  : 'bg-[#181B26] text-[#828B9E] border border-[#282E3E] hover:text-white'
              }`}
            >
              <span>📍</span>
              <span>{city}</span>
            </button>
          );
        })}
      </nav>

      {/* VENUE GRID */}
      <main className="max-w-5xl mx-auto px-5 pt-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {filteredVenues.map((v) => (
            <div
              key={v.id || v.name}
              className="bg-[#181B26] border border-[#282E3E] rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between"
            >
              <div className="relative h-56 w-full overflow-hidden">
                <img src={v.image} alt={v.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#181B26] via-transparent to-black/30" />
                <div className="absolute top-3 left-3 bg-[#111319]/80 backdrop-blur-md border border-[#E5B800]/40 text-[#E5B800] text-[9px] font-black px-2.5 py-1 rounded-full uppercase flex items-center gap-1 shadow-lg">
                  <ShieldCheck size={12} /> VERIFIED VIP
                </div>
                <div className="absolute bottom-3 left-3 flex items-center gap-1 text-[10px] font-bold text-[#E5B800]">
                  <Star size={12} className="fill-[#E5B800]" />
                  <span>{v.rating || 5.0} ({v.reviewsCount || 1} reviews)</span>
                </div>
              </div>

              <div className="p-5 space-y-3">
                <div>
                  <h3 className="font-serif font-black text-base text-white">{v.name}</h3>
                  <p className="text-[11px] text-[#828B9E] flex items-center gap-1 mt-0.5">
                    <MapPin size={12} className="text-[#E5B800]" /> {v.city || 'Buea'} Centre
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5 text-[9px] font-bold text-[#828B9E]">
                  {(v.tags || ['VIP Table Service', 'Bottle Service']).map((tag, i) => (
                    <span key={i} className="bg-[#111319] border border-[#282E3E] px-2.5 py-1 rounded-lg">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-[#282E3E]">
                  <div>
                    <span className="text-[9px] font-extrabold uppercase text-[#828B9E] block">MINIMUM SPEND</span>
                    <span className="text-xs font-black text-[#E5B800]">{v.minSpend || '25,000 XAF'}</span>
                  </div>

                  <Link
                    href={`/venue/${v.id || '1'}`}
                    className="bg-[#E5B800] hover:bg-[#d4a800] text-[#111319] font-black text-[11px] px-5 py-2.5 rounded-xl uppercase tracking-wider flex items-center gap-1 transition shadow-lg"
                  >
                    <span>VIEW VENUE</span>
                    <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* BOTTOM NAVIGATION BAR */}
      <div className="fixed bottom-0 inset-x-0 bg-[#111319]/95 backdrop-blur-md border-t border-[#282E3E] z-50">
        <div className="max-w-md mx-auto grid grid-cols-4 py-3 text-[9px] font-black uppercase text-center">
          <Link href="/" className="flex flex-col items-center gap-1 text-[#E5B800]">
            <Building2 size={18} />
            <span>CLUBS</span>
          </Link>
          <Link href="/bookings" className="flex flex-col items-center gap-1 text-[#828B9E] hover:text-white transition">
            <Calendar size={18} />
            <span>RESERVATIONS</span>
          </Link>
          <Link href="/auth?role=user" className="flex flex-col items-center gap-1 text-[#828B9E] hover:text-white transition">
            <User size={18} />
            <span>PROFILE</span>
          </Link>
          <Link href="/admin" className="flex flex-col items-center gap-1 text-[#828B9E] hover:text-white transition">
            <Shield size={18} />
            <span>MANAGER DESK</span>
          </Link>
        </div>
      </div>
    </div>
  );
}