'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  MapPin,
  Star,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  Building2,
  Calendar,
  User,
  Shield,
  Heart,
  Search,
  LogIn,
  Share2,
  Check,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import {
  safeParseJSON,
  formatXAFPrice,
  setActiveUserSession,
  fetchMergedVenues,
} from '@/lib/camernightsSync';

export default function HomePage() {
  const router = useRouter();
  const [lang, setLang] = useState('EN');
  const [selectedCity, setSelectedCity] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortByRating, setSortByRating] = useState(false);
  const [venues, setVenues] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [copiedVenueKey, setCopiedVenueKey] = useState('');

  const loadVenues = useCallback(async () => {
    const parsedAdmin = safeParseJSON(localStorage.getItem('camernights_admin_profile'), null);
    const isAdminActive = Boolean(parsedAdmin && parsedAdmin.isLoggedIn);
    const adminProfilePic = isAdminActive
      ? parsedAdmin?.image || parsedAdmin?.profilePic || parsedAdmin?.heroImage || ''
      : '';
    const adminVenueName = isAdminActive ? parsedAdmin?.venueName || 'CHATEAU VIP' : 'CHATEAU VIP';
    const adminVenueCity = isAdminActive
      ? parsedAdmin?.city || parsedAdmin?.venueCity || 'Buea'
      : 'Buea';
    const adminVenueId = isAdminActive && parsedAdmin?.venueId ? String(parsedAdmin.venueId) : '';

    const registeredRaw = safeParseJSON(localStorage.getItem('camernights_registered_venues'), []);
    const registered = Array.isArray(registeredRaw) ? registeredRaw : [];

    const matchesAdminVenue = (v) => {
      if (!isAdminActive || !parsedAdmin) return false;
      const vId = v.id ? String(v.id) : '';
      const vName = v.name ? String(v.name).trim().toLowerCase() : '';
      const aName = adminVenueName ? String(adminVenueName).trim().toLowerCase() : '';
      const ownerMatch =
        (parsedAdmin.id && v.ownerId && String(v.ownerId) === String(parsedAdmin.id)) ||
        (parsedAdmin.email &&
          v.ownerEmail &&
          String(v.ownerEmail).toLowerCase() === String(parsedAdmin.email).toLowerCase());

      return (
        (adminVenueId && vId === adminVenueId) ||
        ownerMatch ||
        (aName && vName === aName)
      );
    };

    const normalizedRegistered = registered.map((v) => {
      if (matchesAdminVenue(v)) {
        return {
          ...v,
          name: parsedAdmin?.venueName || v.name,
          city: adminVenueCity || v.city || 'Buea',
          location:
            v.location ||
            `${adminVenueCity || v.city || 'Buea'} Centre, ${adminVenueCity || v.city || 'Buea'}`,
          image: adminProfilePic || v.image,
          minSpend: formatXAFPrice(v.minSpend) || '25,000 XAF',
        };
      }
      return {
        ...v,
        city: v.city || 'Buea',
        location: v.location || `${v.city || 'Buea'} Centre, ${v.city || 'Buea'}`,
        minSpend: formatXAFPrice(v.minSpend) || '25,000 XAF',
      };
    });

    const hasAdminInRegistered = normalizedRegistered.some(matchesAdminVenue);
    const hasDefaultPrimaryInRegistered = normalizedRegistered.some((v) => String(v.id) === '1');

    const defaultVenues = [];
    if (!hasAdminInRegistered && !hasDefaultPrimaryInRegistered) {
      defaultVenues.push({
        id: adminVenueId || '1',
        name: adminVenueName,
        city: adminVenueCity,
        location: `${adminVenueCity} Centre, ${adminVenueCity}`,
        category: 'VERIFIED VIP',
        rating: 4.9,
        reviewsCount: 1,
        minSpend: '25,000 XAF',
        tags: ['VIP Table Service', 'Bottle Service', 'Live DJ'],
        image:
          adminProfilePic ||
          'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&q=80&w=1000',
      });
    }

    const hasDoualaLounge = normalizedRegistered.some(
      (v) => String(v.id) === '2' || v.name?.toUpperCase() === 'SKYLUXE VIP LOUNGE'
    );
    if (!hasDoualaLounge) {
      defaultVenues.push({
        id: '2',
        name: 'SKYLUXE VIP LOUNGE',
        city: 'Douala',
        location: 'Bonapriso, Douala',
        category: 'VERIFIED VIP',
        rating: 4.8,
        reviewsCount: 95,
        minSpend: '25,000 XAF',
        tags: ['Rooftop View', 'Cocktail Bar', 'Shisha'],
        image:
          'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=1000',
      });
    }

    const combined = [...normalizedRegistered, ...defaultVenues];
    const uniqueLocal = Array.from(
      new Map(combined.map((item) => [String(item.id || item.name), item])).values()
    );
    setVenues(uniqueLocal);

    const syncedVenues = await fetchMergedVenues(uniqueLocal);
    setVenues(syncedVenues);
  }, []);

  const loadFavoritesForUser = useCallback(async (userObj) => {
    if (!userObj) {
      setFavoriteIds([]);
      return;
    }

    const userKey = (userObj.email || 'default').toLowerCase();
    const localFavs = safeParseJSON(
      localStorage.getItem(`camernights_user_favorites_${userKey}`),
      []
    );
    const localIds = Array.isArray(localFavs) ? localFavs.map((f) => String(f.id)) : [];
    setFavoriteIds(localIds);

    if (userObj.id) {
      try {
        const { data, error } = await supabase
          .from('favorite_venues')
          .select('venue_id, venue_name, venue_city')
          .eq('user_id', userObj.id);

        if (!error && Array.isArray(data)) {
          const dbIds = data.map((row) => String(row.venue_id));
          setFavoriteIds(dbIds);
        }
      } catch {
        // Keep local favorites on offline/network issue
      }
    }
  }, []);

  useEffect(() => {
    const savedLang = localStorage.getItem('camernights_lang');
    if (savedLang) setLang(savedLang);

    loadVenues();

    const syncSessionState = async () => {
      const cachedAdmin = safeParseJSON(localStorage.getItem('camernights_admin_profile'), null);
      const cachedUser = safeParseJSON(localStorage.getItem('camernights_user_profile'), null);

      let supaUser = null;
      try {
        const { data } = await supabase.auth.getSession();
        supaUser = data?.session?.user || null;
      } catch {
        supaUser = null;
      }

      const isAdminSession = Boolean(cachedAdmin && cachedAdmin.isLoggedIn);
      setCurrentAdmin(isAdminSession ? cachedAdmin : null);

      if (supaUser && !isAdminSession) {
        const activeUser = {
          id: supaUser.id,
          email: supaUser.email || cachedUser?.email || '',
          fullName:
            supaUser.user_metadata?.full_name ||
            cachedUser?.fullName ||
            (supaUser.email ? supaUser.email.split('@')[0] : 'VIP Member'),
        };
        setCurrentUser(activeUser);
        if (!cachedUser || cachedUser.email !== activeUser.email) {
          setActiveUserSession(activeUser);
        }
        await loadFavoritesForUser(activeUser);
      } else if (!isAdminSession && cachedUser && (cachedUser.email || cachedUser.isLoggedIn)) {
        setCurrentUser(cachedUser);
        await loadFavoritesForUser(cachedUser);
      } else {
        setCurrentUser(null);
        setFavoriteIds([]);
      }
    };

    syncSessionState();

    const handleStorageChange = () => {
      const latestLang = localStorage.getItem('camernights_lang');
      if (latestLang) setLang(latestLang);
      loadVenues();
      syncSessionState();
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      syncSessionState();
    });

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      subscription.unsubscribe();
    };
  }, [loadVenues, loadFavoritesForUser]);

  const changeLang = (l) => {
    setLang(l);
    localStorage.setItem('camernights_lang', l);
    window.dispatchEvent(new Event('storage'));
  };

  const handleProfileNavClick = (e) => {
    e.preventDefault();
    if (currentUser) {
      router.push('/profile');
    } else {
      router.push('/auth?role=user');
    }
  };

  const handleAdminNavClick = (e) => {
    e.preventDefault();
    if (currentAdmin && currentAdmin.isLoggedIn) {
      router.push('/admin');
    } else {
      router.push('/auth?role=admin');
    }
  };

  const handleShareVenue = async (venue, venueKey) => {
    const targetPath = `/venue/${venue.id || '1'}`;
    const shareUrl =
      typeof window !== 'undefined' ? `${window.location.origin}${targetPath}` : targetPath;
    const shareTitle = `${venue.name} — CAMERNIGHTS`;

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: shareTitle, url: shareUrl });
        return;
      } catch {
        // Fall back to clipboard copy
      }
    }

    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      }
      setCopiedVenueKey(venueKey);
      setTimeout(() => {
        setCopiedVenueKey((prev) => (prev === venueKey ? '' : prev));
      }, 2000);
    } catch {
      setCopiedVenueKey('');
    }
  };

  const handleToggleFavorite = async (venue) => {
    if (!currentUser) {
      router.push('/auth?role=user');
      return;
    }

    const venueKey = String(venue.id || venue.name);
    const userKey = (currentUser.email || 'default').toLowerCase();
    const favStorageKey = `camernights_user_favorites_${userKey}`;
    const existingFavs = safeParseJSON(localStorage.getItem(favStorageKey), []);
    const isAlreadyFav = favoriteIds.includes(venueKey);

    let updatedFavs;
    if (isAlreadyFav) {
      updatedFavs = existingFavs.filter((item) => String(item.id) !== venueKey);
      setFavoriteIds((prev) => prev.filter((id) => id !== venueKey));

      if (currentUser.id) {
        try {
          await supabase
            .from('favorite_venues')
            .delete()
            .eq('user_id', currentUser.id)
            .eq('venue_id', venueKey);
        } catch {
          // Keep local favorite state
        }
      }
    } else {
      const favEntry = {
        id: venueKey,
        name: venue.name,
        city: venue.city || 'Buea',
        image:
          venue.image ||
          'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&q=80&w=1000',
      };
      updatedFavs = [favEntry, ...existingFavs.filter((item) => String(item.id) !== venueKey)];
      setFavoriteIds((prev) => (prev.includes(venueKey) ? prev : [...prev, venueKey]));

      if (currentUser.id) {
        try {
          await supabase.from('favorite_venues').upsert(
            {
              user_id: currentUser.id,
              venue_id: venueKey,
              venue_name: venue.name,
              venue_city: venue.city || 'Buea',
            },
            { onConflict: 'user_id,venue_id' }
          );
        } catch {
          // Keep local favorite state
        }
      }
    }

    localStorage.setItem(favStorageKey, JSON.stringify(updatedFavs));
  };

  const filteredVenues = venues
    .filter((v) => {
      const matchesCity =
        selectedCity === 'ALL' || v.city?.toLowerCase() === selectedCity.toLowerCase();
      const q = searchQuery.trim().toLowerCase();
      if (!q) return matchesCity;
      const inName = v.name?.toLowerCase().includes(q);
      const inCity = v.city?.toLowerCase().includes(q);
      const inTags = Array.isArray(v.tags) && v.tags.some((t) => t.toLowerCase().includes(q));
      return matchesCity && (inName || inCity || inTags);
    })
    .sort((a, b) => {
      if (!sortByRating) return 0;
      return Number(b.rating || 0) - Number(a.rating || 0);
    });

  const cities = ['ALL CITIES', 'BUEA', 'DOUALA', 'YAOUNDÉ', 'LIMBE', 'BAMENDA'];

  const bottomTabs = currentAdmin
    ? [
        { key: 'clubs', label: 'CLUBS', href: '/', icon: Building2, active: true },
        {
          key: 'admin',
          label: 'MANAGER DESK',
          href: '/admin',
          icon: Shield,
          active: false,
          onClick: handleAdminNavClick,
        },
      ]
    : currentUser
      ? [
          { key: 'clubs', label: 'CLUBS', href: '/', icon: Building2, active: true },
          {
            key: 'bookings',
            label: 'RESERVATIONS',
            href: '/bookings',
            icon: Calendar,
            active: false,
          },
          {
            key: 'profile',
            label: 'PROFILE',
            href: '/profile',
            icon: User,
            active: false,
            onClick: handleProfileNavClick,
          },
        ]
      : [
          { key: 'clubs', label: 'CLUBS', href: '/', icon: Building2, active: true },
          {
            key: 'bookings',
            label: 'RESERVATIONS',
            href: '/bookings',
            icon: Calendar,
            active: false,
          },
          {
            key: 'profile',
            label: 'PROFILE',
            href: '/profile',
            icon: User,
            active: false,
            onClick: handleProfileNavClick,
          },
          {
            key: 'admin',
            label: 'MANAGER DESK',
            href: '/admin',
            icon: Shield,
            active: false,
            onClick: handleAdminNavClick,
          },
        ];

  return (
    <div className="w-full min-h-screen bg-[#111319] text-[#F5F5F7] font-sans pb-28 select-none">
      {/* HEADER SECTION */}
      <header className="max-w-5xl mx-auto px-5 pt-6 pb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#E5B800] flex items-center justify-center font-bold text-black text-sm">
            C
          </div>
          <h1 className="text-sm font-serif font-black tracking-widest text-[#E5B800]">
            CAMERNIGHTS
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {!currentUser && !currentAdmin ? (
            <Link
              href="/auth?role=user"
              className="px-3 py-1 rounded-full bg-[#181B26] border border-[#282E3E] hover:border-[#E5B800] text-[10px] font-bold text-[#E5B800] flex items-center gap-1 transition"
            >
              <LogIn size={11} />
              <span>{lang === 'FR' ? 'Connexion' : 'Sign In'}</span>
            </Link>
          ) : (
            <span className="px-3 py-1 rounded-full bg-[#181B26] border border-[#E5B800]/30 text-[10px] font-bold text-[#E5B800] truncate max-w-[130px]">
              {currentAdmin
                ? currentAdmin.venueName || 'MANAGER'
                : currentUser.fullName || currentUser.email}
            </span>
          )}

          {/* LANGUAGE SWITCHER */}
          <div className="flex items-center bg-[#181B26] border border-[#282E3E] rounded-full p-0.5 text-[10px] font-bold">
            <button
              onClick={() => changeLang('EN')}
              className={`px-2.5 py-1 rounded-full transition ${
                lang === 'EN' ? 'bg-[#E5B800] text-[#111319]' : 'text-[#828B9E]'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => changeLang('FR')}
              className={`px-2.5 py-1 rounded-full transition ${
                lang === 'FR' ? 'bg-[#E5B800] text-[#111319]' : 'text-[#828B9E]'
              }`}
            >
              FR
            </button>
          </div>
        </div>
      </header>

      {/* HERO HEADER SECTION */}
      <div className="max-w-5xl mx-auto bg-[#181B26] border border-[#282E3E] rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111319] border border-[#282E3E] text-[#E5B800] text-[10px] font-black tracking-widest uppercase">
          <Sparkles size={12} />
          <span>
            {lang === 'FR'
              ? 'VIE NOCTURNE & GASTRONOMIE VIP AU CAMEROUN'
              : 'CAMEROON VIP NIGHTLIFE & DINING'}
          </span>
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

      {/* SEARCH & TOP RATED BAR */}
      <div className="max-w-5xl mx-auto px-5 pb-2 flex items-center gap-2.5">
        <div className="relative flex-1">
          <Search
            size={14}
            className="text-[#828B9E] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              lang === 'FR'
                ? 'Rechercher un club, salon ou ambiance...'
                : 'Search club, lounge, or vibe...'
            }
            className="w-full bg-[#181B26] border border-[#282E3E] focus:border-[#E5B800] rounded-full py-2 pl-9 pr-4 text-xs text-white placeholder-[#828B9E] focus:outline-none transition"
          />
        </div>
        <button
          type="button"
          onClick={() => setSortByRating((prev) => !prev)}
          className={`px-3.5 py-2 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 whitespace-nowrap border transition ${
            sortByRating
              ? 'bg-[#E5B800] text-[#111319] border-[#E5B800]'
              : 'bg-[#181B26] text-[#828B9E] border-[#282E3E] hover:text-white'
          }`}
        >
          <Star size={11} className={sortByRating ? 'fill-[#111319]' : ''} />
          <span>{lang === 'FR' ? 'Mieux notés' : 'Top Rated'}</span>
        </button>
      </div>

      {/* VENUE GRID */}
      <main className="max-w-5xl mx-auto px-5 pt-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {filteredVenues.map((v) => {
            const venueKey = String(v.id || v.name);
            const isFav = favoriteIds.includes(venueKey);
            const isCopied = copiedVenueKey === venueKey;

            return (
              <div
                key={venueKey}
                className="bg-[#181B26] border border-[#282E3E] rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between"
              >
                <div className="relative h-56 w-full overflow-hidden">
                  <img src={v.image} alt={v.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#181B26] via-transparent to-black/30" />
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <div className="bg-[#111319]/80 backdrop-blur-md border border-[#E5B800]/40 text-[#E5B800] text-[9px] font-black px-2.5 py-1 rounded-full uppercase flex items-center gap-1 shadow-lg">
                      <ShieldCheck size={12} /> VERIFIED VIP
                    </div>
                    <span className="bg-[#111319]/80 backdrop-blur-md border border-[#282E3E] text-white text-[9px] font-extrabold px-2.5 py-1 rounded-full uppercase shadow-lg">
                      {lang === 'FR' ? 'OUVERT CE SOIR' : 'OPEN TONIGHT'}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleShareVenue(v, venueKey)}
                      aria-label={isCopied ? 'Link copied' : 'Share venue'}
                      className="p-2 rounded-full bg-[#111319]/85 backdrop-blur-md border border-[#282E3E] hover:border-[#E5B800] transition shadow-lg flex items-center gap-1 text-[9px] font-bold text-white"
                    >
                      {isCopied ? (
                        <>
                          <Check size={13} className="text-[#E5B800]" />
                          <span className="text-[#E5B800] pr-0.5">
                            {lang === 'FR' ? 'Copié' : 'Copied'}
                          </span>
                        </>
                      ) : (
                        <Share2 size={13} className="text-white" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleFavorite(v)}
                      aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
                      className="p-2 rounded-full bg-[#111319]/85 backdrop-blur-md border border-[#282E3E] hover:border-[#E5B800] transition shadow-lg"
                    >
                      <Heart
                        size={14}
                        className={isFav ? 'text-[#E5B800] fill-[#E5B800]' : 'text-white'}
                      />
                    </button>
                  </div>
                  <div className="absolute bottom-3 left-3 flex items-center gap-1 text-[10px] font-bold text-[#E5B800]">
                    <Star size={12} className="fill-[#E5B800]" />
                    <span>
                      {v.rating || 5.0} ({v.reviewsCount || 1} reviews)
                    </span>
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
                      <span
                        key={i}
                        className="bg-[#111319] border border-[#282E3E] px-2.5 py-1 rounded-lg"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-[#282E3E]">
                    <div>
                      <span className="text-[9px] font-extrabold uppercase text-[#828B9E] block">
                        MINIMUM SPEND
                      </span>
                      <span className="text-xs font-black text-[#E5B800]">
                        {v.minSpend || '25,000 XAF'}
                      </span>
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
            );
          })}
        </div>
      </main>

      {/* BOTTOM NAVIGATION BAR */}
      <div className="fixed bottom-0 inset-x-0 bg-[#111319]/95 backdrop-blur-md border-t border-[#282E3E] z-50">
        <div
          className={`max-w-md mx-auto grid py-3 text-[9px] font-black uppercase text-center ${
            bottomTabs.length === 2
              ? 'grid-cols-2'
              : bottomTabs.length === 3
                ? 'grid-cols-3'
                : 'grid-cols-4'
          }`}
        >
          {bottomTabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <Link
                key={tab.key}
                href={tab.href}
                onClick={tab.onClick}
                className={`flex flex-col items-center gap-1 transition ${
                  tab.active ? 'text-[#E5B800]' : 'text-[#828B9E] hover:text-white'
                }`}
              >
                <IconComponent size={18} />
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}