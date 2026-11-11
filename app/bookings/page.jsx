'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Users, Phone, ArrowLeft, CheckCircle2, XCircle, Hourglass, AlertCircle, MessageCircle } from 'lucide-react';
import Link from 'next/link';

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [lang, setLang] = useState('EN');

  useEffect(() => {
    const savedLang = localStorage.getItem('camernights_lang');
    if (savedLang) setLang(savedLang);

    const saved = localStorage.getItem('camernights_user_bookings');
    if (saved) setBookings(JSON.parse(saved));

    const handleStorageChange = () => {
      const updatedLang = localStorage.getItem('camernights_lang');
      if (updatedLang) setLang(updatedLang);
      const updatedBookings = localStorage.getItem('camernights_user_bookings');
      if (updatedBookings) setBookings(JSON.parse(updatedBookings));
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('camernights_booking_updated', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('camernights_booking_updated', handleStorageChange);
    };
  }, []);

  const t = {
    EN: {
      title: 'MY RESERVATIONS',
      subtitle: 'Live VIP Table Status',
      confirmed: 'CONFIRMED BY CLUB',
      declined: 'DECLINED BY CLUB',
      pending: 'AWAITING APPROVAL',
      contactHost: 'Contact Host',
      receiptBtn: 'WhatsApp Pass Receipt',
      noBookings: 'No Active Bookings',
      noBookingsDesc: 'You haven’t reserved any VIP tables yet.',
      explore: 'Explore Venues'
    },
    FR: {
      title: 'MES RÉSERVATIONS',
      subtitle: 'Statut des Tables VIP en Direct',
      confirmed: 'CONFIRMÉ PAR LE CLUB',
      declined: 'REFUSÉ PAR LE CLUB',
      pending: 'EN ATTENTE D’APPROBATION',
      contactHost: 'Contacter l’Hôte',
      receiptBtn: 'Reçu Pass WhatsApp',
      noBookings: 'Aucune Réservation',
      noBookingsDesc: 'Vous n’avez pas encore réservé de table VIP.',
      explore: 'Explorer les Clubs'
    }
  }[lang];

  const handleShareWhatsAppReceipt = (item) => {
    const message = encodeURIComponent(
      `🎉 *CAMERNIGHTS VIP ENTRY PASS*\n` +
      `-----------------------------------\n` +
      `📌 *Booking ID:* ${item.id}\n` +
      `🏢 *Venue:* ${item.venueName} (${item.venueCity})\n` +
      `🛋️ *Table:* ${item.tableType}\n` +
      `👥 *Guests:* ${item.guests}\n` +
      `📅 *Date:* ${item.date}\n` +
      `⏰ *Time:* ${item.time}\n` +
      `💰 *Minimum Spend:* ${item.price}\n` +
      `STATUS: *CONFIRMED*\n` +
      `-----------------------------------\n` +
      `Show this digital pass to the VIP entrance host.`
    );
    const phone = (item.managerContact || '+237670000001').replace('+', '');
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  return (
    <div className="w-full min-h-screen bg-[#0F0F12] text-[#F5F5F7] pb-24 font-sans select-none">
      
      {/* HEADER BAR */}
      <header className="sticky top-0 z-40 bg-[#0F0F12]/95 px-6 py-4 border-b border-[#1B1B22] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 bg-[#1B1B22] border border-[#2C2C35] rounded-xl text-[#D4AF37] hover:scale-105 transition">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-lg font-serif font-bold text-[#F5F5F7]">{t.title}</h1>
            <p className="text-[10px] text-[#8E8E93] uppercase">{t.subtitle}</p>
          </div>
        </div>
        <div className="w-8" />
      </header>

      {/* RESERVATIONS LIST */}
      <main className="px-5 pt-6 max-w-2xl mx-auto space-y-4">
        {bookings.length > 0 ? (
          bookings.map((item) => (
            <div key={item.id} className="bg-[#1B1B22] border border-[#2C2C35] rounded-2xl p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#2C2C35]">
                <span className="text-xs font-mono text-[#8E8E93]">ID: <strong className="text-[#F5F5F7]">{item.id}</strong></span>
                <span className={`text-[10px] font-bold px-3 py-1 rounded-full border ${
                  item.status === 'Confirmed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 
                  item.status === 'Declined' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' : 
                  'bg-amber-500/10 text-amber-400 border-amber-500/30'
                }`}>
                  {item.status === 'Confirmed' ? t.confirmed : item.status === 'Declined' ? t.declined : t.pending}
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-white">{item.venueName}</h3>
                <p className="text-xs text-[#8E8E93] mt-0.5">{item.tableType} • {item.date} @ {item.time}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                <a
                  href={`https://wa.me/${(item.managerContact || '').replace('+', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#2C2C35] hover:bg-[#383842] transition text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 text-white"
                >
                  <Phone size={14} className="text-[#D4AF37]" />
                  <span>{t.contactHost}</span>
                </a>

                <button
                  onClick={() => handleShareWhatsAppReceipt(item)}
                  className="bg-[#25D366]/20 border border-[#25D366]/40 hover:bg-[#25D366]/30 transition text-[#25D366] text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-2"
                >
                  <MessageCircle size={14} />
                  <span>{t.receiptBtn}</span>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-16 bg-[#1B1B22] border border-[#2C2C35] rounded-2xl p-6">
            <AlertCircle size={32} className="mx-auto text-[#8E8E93] mb-3" />
            <h3 className="font-bold text-sm text-[#F5F5F7]">{t.noBookings}</h3>
            <p className="text-xs text-[#8E8E93] mt-1 mb-4">{t.noBookingsDesc}</p>
            <Link href="/" className="inline-block bg-[#D4AF37] hover:bg-[#b8972e] transition text-[#0F0F12] font-bold text-xs px-5 py-2.5 rounded-xl uppercase tracking-wider">{t.explore}</Link>
          </div>
        )}
      </main>
    </div>
  );
}