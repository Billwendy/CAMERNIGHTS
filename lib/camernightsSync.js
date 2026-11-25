'use client';

import { supabase } from '@/lib/supabaseClient';

export const safeParseJSON = (raw, fallback) => {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
};

export const formatXAFPrice = (rawValue) => {
  if (rawValue === null || rawValue === undefined) return '';
  const digitsOnly = String(rawValue).replace(/[^0-9]/g, '');
  if (!digitsOnly) return '';
  const numericAmount = Number(digitsOnly);
  if (Number.isNaN(numericAmount)) return '';
  return `${numericAmount.toLocaleString('en-US')} XAF`;
};

export const setActiveUserSession = (userObj) => {
  if (typeof window === 'undefined' || !userObj) return;
  localStorage.removeItem('camernights_admin_profile');
  const normalized = {
    id: userObj.id || '',
    email: userObj.email || '',
    fullName:
      userObj.fullName ||
      userObj.name ||
      (userObj.email ? userObj.email.split('@')[0] : 'VIP Member'),
    name:
      userObj.name ||
      userObj.fullName ||
      (userObj.email ? userObj.email.split('@')[0] : 'VIP Member'),
    role: 'user',
    isLoggedIn: true,
  };
  localStorage.setItem('camernights_user_profile', JSON.stringify(normalized));
  window.dispatchEvent(new Event('storage'));
};

export const setActiveAdminSession = (adminObj) => {
  if (typeof window === 'undefined' || !adminObj) return;
  localStorage.removeItem('camernights_user_profile');
  const normalized = {
    ...adminObj,
    role: 'admin',
    isLoggedIn: true,
  };
  localStorage.setItem('camernights_admin_profile', JSON.stringify(normalized));
  window.dispatchEvent(new Event('storage'));
};

export const clearRoleSessions = async (role = 'all') => {
  if (typeof window === 'undefined') return;
  if (role === 'user' || role === 'all') {
    localStorage.removeItem('camernights_user_profile');
  }
  if (role === 'admin' || role === 'all') {
    localStorage.removeItem('camernights_admin_profile');
  }
  if (role === 'all') {
    try {
      await supabase.auth.signOut();
    } catch {
      // Ignore signOut error when using local session
    }
  }
  window.dispatchEvent(new Event('storage'));
};

export const fetchMergedVenues = async (localVenues = []) => {
  const localArray = Array.isArray(localVenues) ? localVenues : [];
  try {
    const { data, error } = await supabase.from('venues').select('*');
    if (error || !Array.isArray(data)) {
      return localArray;
    }

    const dbNormalized = data.map((row) => ({
      id: String(row.id),
      ownerId: row.owner_id || row.ownerId || '',
      ownerEmail: row.owner_email || row.ownerEmail || '',
      name: row.name || 'VIP VENUE',
      city: row.city || 'Buea',
      location: row.location || `${row.city || 'Buea'} Centre, ${row.city || 'Buea'}`,
      category: row.category || 'VERIFIED VIP',
      rating: row.rating ?? 4.9,
      reviewsCount: row.reviews_count ?? row.reviewsCount ?? 1,
      minSpend: formatXAFPrice(row.min_spend || row.minSpend) || '25,000 XAF',
      tags: Array.isArray(row.tags) ? row.tags : ['VIP Table Service', 'Bottle Service'],
      image:
        row.image ||
        row.image_url ||
        'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&q=80&w=1000',
    }));

    const merged = [...dbNormalized, ...localArray];
    return Array.from(
      new Map(merged.map((item) => [String(item.id || item.name), item])).values()
    );
  } catch {
    return localArray;
  }
};

export const syncReservationToSupabase = async (booking) => {
  if (!booking) return false;
  try {
    const payload = {
      id: booking.id,
      user_id: booking.userId || null,
      user_email: booking.userEmail || '',
      user_name: booking.userName || 'VIP Partygoer',
      venue_id: String(booking.venueId || ''),
      venue_name: booking.venueName || '',
      venue_city: booking.venueCity || '',
      table_type: booking.tableType || '',
      guests: booking.guests || '',
      booking_date: booking.date || '',
      booking_time: booking.time || '',
      price: booking.price || '0 XAF',
      status: booking.status || 'Pending',
    };
    const { error } = await supabase.from('reservations').upsert(payload, { onConflict: 'id' });
    return !error;
  } catch {
    return false;
  }
};