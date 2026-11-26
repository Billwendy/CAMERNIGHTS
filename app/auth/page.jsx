'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Shield,
  User,
  Mail,
  Lock,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Building2,
  ImageIcon,
  PhoneCall,
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

const MANAGER_FEE_XAF = 100000;
const RECEIVER_NUMBER = '676345078';
const MTN_USSD_HREF = `tel:${encodeURIComponent(`*126*1*1*${RECEIVER_NUMBER}*${MANAGER_FEE_XAF}#`)}`;
const ORANGE_USSD_HREF = `tel:${encodeURIComponent(`*150*1*1*${RECEIVER_NUMBER}*${MANAGER_FEE_XAF}#`)}`;

export default function AuthPage() {
  const router = useRouter();

  const [lang, setLang] = useState('EN');
  const [activeTab, setActiveTab] = useState('user'); // 'user' or 'admin'
  const [isSignUp, setIsSignUp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Common Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // User Specific Fields
  const [fullName, setFullName] = useState('');

  // Admin Specific Fields
  const [venueName, setVenueName] = useState('');
  const [city, setCity] = useState('Buea');
  const [profileImage, setProfileImage] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('MTN'); // 'MTN' or 'ORANGE'
  const [momoNumber, setMomoNumber] = useState('');

  // UI States
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const compressImage = (file, callback, maxWidth = 300, maxHeight = 300) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else if (height > maxHeight) {
          width *= maxHeight / height;
          height = maxHeight;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        callback(canvas.toDataURL('image/jpeg', 0.7));
      };
      if (typeof event.target?.result === 'string') {
        img.src = event.target.result;
      }
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const savedLang = window.localStorage.getItem('camernights_lang') || 'EN';
    setLang(savedLang);

    const params = new URLSearchParams(window.location.search);
    const roleParam = params.get('role');
    if (roleParam === 'admin' || roleParam === 'user') {
      setActiveTab(roleParam);
    }
  }, []);

  const syncProfileToSupabase = async (authUser, profileData) => {
    if (!authUser?.id) return;
    const { error } = await supabase.from('profiles').upsert(
      {
        id: authUser.id,
        email: authUser.email || profileData.email,
        full_name: profileData.fullName || profileData.venueName || '',
        phone: profileData.contactPhone || profileData.momoNumber || '',
        role: profileData.role || 'user',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );
    if (error) {
      console.error('Supabase profile sync error:', error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(true);

    const normalizedEmail = email.trim().toLowerCase();

    try {
      if (activeTab === 'user') {
        const savedUsers =
          typeof window !== 'undefined' ? window.localStorage.getItem('camernights_registered_users') : null;
        const registeredUsers = savedUsers ? JSON.parse(savedUsers) : [];

        if (isSignUp) {
          const { data, error } = await supabase.auth.signUp({
            email: normalizedEmail,
            password,
            options: {
              data: {
                full_name: fullName,
                role: 'user',
              },
            },
          });

          if (error) {
            setErrorMessage(
              error.message.toLowerCase().includes('already')
                ? lang === 'FR'
                  ? 'Cet e-mail est déjà utilisé.'
                  : 'An account with this email already exists.'
                : error.message
            );
            return;
          }

          const supaUser = data?.user;
          const newUser = {
            id: supaUser?.id || `USER-${Date.now()}`,
            fullName,
            email: normalizedEmail,
            role: 'user',
            isLoggedIn: true,
          };

          if (supaUser) {
            await syncProfileToSupabase(supaUser, newUser);
          }

          const existingIndex = registeredUsers.findIndex((u) => u.email === normalizedEmail);
          if (existingIndex >= 0) {
            registeredUsers[existingIndex] = newUser;
          } else {
            registeredUsers.push(newUser);
          }

          if (typeof window !== 'undefined') {
            window.localStorage.setItem('camernights_registered_users', JSON.stringify(registeredUsers));
            window.localStorage.setItem('camernights_user_profile', JSON.stringify(newUser));
          }

          setSuccessMessage(
            lang === 'FR' ? 'Compte VIP créé ! Redirection...' : 'VIP Account created! Redirecting...'
          );
          setTimeout(() => router.push('/profile'), 1200);
        } else {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: normalizedEmail,
            password,
          });

          if (error || !data?.user) {
            setErrorMessage(
              lang === 'FR' ? 'E-mail ou mot de passe incorrect.' : 'Incorrect email or password.'
            );
            return;
          }

          const supaUser = data.user;
          const { data: dbProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', supaUser.id)
            .single();

          const localMatch = registeredUsers.find((u) => u.email === normalizedEmail);
          const signedInUser = {
            id: supaUser.id,
            fullName:
              dbProfile?.full_name ||
              supaUser.user_metadata?.full_name ||
              localMatch?.fullName ||
              normalizedEmail.split('@')[0],
            email: supaUser.email || normalizedEmail,
            phone: dbProfile?.phone || localMatch?.phone || '',
            role: dbProfile?.role || 'user',
            isLoggedIn: true,
          };

          await syncProfileToSupabase(supaUser, signedInUser);
          if (typeof window !== 'undefined') {
            window.localStorage.setItem('camernights_user_profile', JSON.stringify(signedInUser));
          }

          setSuccessMessage(lang === 'FR' ? 'Connexion réussie !' : 'Signed in successfully!');
          setTimeout(() => router.push('/profile'), 1000);
        }
      } else {
        const savedAdmins =
          typeof window !== 'undefined' ? window.localStorage.getItem('camernights_registered_admins') : null;
        const registeredAdmins = savedAdmins ? JSON.parse(savedAdmins) : [];

        const savedVenues =
          typeof window !== 'undefined' ? window.localStorage.getItem('camernights_registered_venues') : null;
        const registeredVenues = savedVenues ? JSON.parse(savedVenues) : [];

        if (isSignUp) {
          if (!momoNumber || momoNumber.trim().length < 9) {
            setErrorMessage(
              lang === 'FR'
                ? 'Veuillez entrer un numéro Mobile Money valide.'
                : 'Please enter a valid Mobile Money number.'
            );
            return;
          }

          const { data, error } = await supabase.auth.signUp({
            email: normalizedEmail,
            password,
            options: {
              data: {
                full_name: venueName,
                venue_name: venueName,
                city,
                role: 'admin',
              },
            },
          });

          if (error) {
            setErrorMessage(
              error.message.toLowerCase().includes('already')
                ? lang === 'FR'
                  ? 'Cet e-mail de gestionnaire existe déjà.'
                  : 'A manager account with this email already exists.'
                : error.message
            );
            return;
          }

          const supaUser = data?.user;
          const venueId = `VEN-${Date.now()}`;
          const fallbackImage =
            'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&q=80&w=1000';
          const newAdmin = {
            id: supaUser?.id || venueId,
            venueId,
            venueName,
            city,
            email: normalizedEmail,
            paymentMethod,
            momoNumber,
            contactPhone,
            image: profileImage || fallbackImage,
            subscriptionStatus: 'ACTIVE',
            role: 'admin',
            isLoggedIn: true,
          };

          const newVenueCard = {
            id: venueId,
            name: venueName,
            city,
            location: `${city} Centre, ${city}`,
            category: 'VERIFIED VIP',
            rating: 5.0,
            reviewsCount: 1,
            minSpend: '25,000 XAF',
            tags: ['VIP Table Service', 'Bottle Service', 'Live DJ'],
            image: profileImage || fallbackImage,
          };

          if (supaUser) {
            await syncProfileToSupabase(supaUser, {
              ...newAdmin,
              fullName: venueName,
            });
          }

          registeredAdmins.push(newAdmin);
          registeredVenues.push(newVenueCard);

          if (typeof window !== 'undefined') {
            window.localStorage.setItem('camernights_registered_admins', JSON.stringify(registeredAdmins));
            window.localStorage.setItem('camernights_registered_venues', JSON.stringify(registeredVenues));
            window.localStorage.setItem('camernights_admin_profile', JSON.stringify(newAdmin));
          }

          setSuccessMessage(
            lang === 'FR'
              ? `Paiement de 100,000 XAF vers ${RECEIVER_NUMBER} initié & Compte créé !`
              : `100,000 XAF payment to ${RECEIVER_NUMBER} recorded & Club Registered!`
          );
          setTimeout(() => router.push('/admin'), 1500);
        } else {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: normalizedEmail,
            password,
          });

          if (error || !data?.user) {
            setErrorMessage(
              lang === 'FR'
                ? 'E-mail ou mot de passe de gestionnaire incorrect.'
                : 'Incorrect manager email or password.'
            );
            return;
          }

          const supaUser = data.user;
          const { data: dbProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', supaUser.id)
            .single();

          const localMatch = registeredAdmins.find((a) => a.email === normalizedEmail);
          const signedInAdmin = localMatch
            ? {
                ...localMatch,
                id: supaUser.id,
                email: supaUser.email || normalizedEmail,
                role: 'admin',
                isLoggedIn: true,
              }
            : {
                id: supaUser.id,
                venueName: dbProfile?.full_name || supaUser.user_metadata?.venue_name || 'CHATEAU VIP',
                city: supaUser.user_metadata?.city || 'Buea',
                email: supaUser.email || normalizedEmail,
                contactPhone: dbProfile?.phone || '',
                role: 'admin',
                isLoggedIn: true,
                image:
                  'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&q=80&w=1000',
              };

          await syncProfileToSupabase(supaUser, {
            ...signedInAdmin,
            fullName: signedInAdmin.venueName,
          });
          if (typeof window !== 'undefined') {
            window.localStorage.setItem('camernights_admin_profile', JSON.stringify(signedInAdmin));
          }

          setSuccessMessage(
            lang === 'FR' ? 'Bienvenue, Gestionnaire !' : 'Welcome back, Manager!'
          );
          setTimeout(() => router.push('/admin'), 1000);
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#111319] text-[#F5F5F7] font-sans flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-md bg-[#181B26] border border-[#282E3E] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* HEADER NAVIGATION */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="p-2 bg-[#111319] border border-[#282E3E] rounded-xl text-[#E5B800] hover:border-[#E5B800] transition"
          >
            <ArrowLeft size={18} />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#E5B800] text-[#111319] flex items-center justify-center font-serif font-black text-xs">
              C
            </div>
            <span className="font-serif font-black tracking-widest text-white text-xs">CAMERNIGHTS</span>
          </div>
        </div>

        {/* ROLE SELECTION TABS */}
        <div className="grid grid-cols-2 p-1 bg-[#111319] border border-[#282E3E] rounded-2xl text-xs font-black">
          <button
            type="button"
            onClick={() => {
              setActiveTab('user');
              setErrorMessage('');
              setSuccessMessage('');
            }}
            className={`py-2.5 rounded-xl transition flex items-center justify-center gap-2 ${
              activeTab === 'user' ? 'bg-[#E5B800] text-[#111319]' : 'text-[#828B9E] hover:text-white'
            }`}
          >
            <User size={14} />
            <span>{lang === 'FR' ? 'VIP FETARD' : 'PARTYGOER'}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('admin');
              setErrorMessage('');
              setSuccessMessage('');
            }}
            className={`py-2.5 rounded-xl transition flex items-center justify-center gap-2 ${
              activeTab === 'admin' ? 'bg-[#E5B800] text-[#111319]' : 'text-[#828B9E] hover:text-white'
            }`}
          >
            <Shield size={14} />
            <span>{lang === 'FR' ? 'GESTIONNAIRE' : 'MANAGER'}</span>
          </button>
        </div>

        {/* TITLE AREA */}
        <div className="text-center space-y-1">
          <h2 className="text-xl font-serif font-black text-white uppercase tracking-wide">
            {activeTab === 'admin'
              ? isSignUp
                ? lang === 'FR'
                  ? 'INSCRIPTION CLUB & PAIEMENT'
                  : 'CLUB REGISTRATION & PAYMENT'
                : lang === 'FR'
                ? 'ESPACE GESTIONNAIRE'
                : 'MANAGER ACCESS'
              : isSignUp
              ? lang === 'FR'
                ? 'CRÉER UN COMPTE VIP'
                : 'CREATE VIP ACCOUNT'
              : lang === 'FR'
              ? 'CONNEXION VIP'
              : 'VIP SIGN IN'}
          </h2>
          <p className="text-xs text-[#828B9E]">
            {activeTab === 'admin'
              ? lang === 'FR'
                ? 'Gérez vos réservations VIP et votre établissement'
                : 'Manage your VIP venue, bottle lists, and bookings'
              : lang === 'FR'
              ? 'Accédez à vos pass de soirée et vos réservations'
              : 'Access your VIP club passes and table reservations'}
          </p>
        </div>

        {/* NOTIFICATIONS */}
        {errorMessage && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3 rounded-xl text-xs flex items-center gap-2 font-bold">
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}
        {successMessage && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-3 rounded-xl text-xs flex items-center gap-2 font-bold">
            <CheckCircle2 size={16} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {activeTab === 'user' && isSignUp && (
            <div>
              <label className="text-[10px] uppercase font-bold text-[#828B9E] block mb-1">
                {lang === 'FR' ? 'Nom Complet' : 'Full Name'}
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-3 text-[#828B9E]" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Brenda Nchinda"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[#111319] border border-[#282E3E] rounded-xl p-3 pl-10 text-white focus:outline-none focus:border-[#E5B800]"
                />
              </div>
            </div>
          )}

          {activeTab === 'admin' && isSignUp && (
            <>
              <div>
                <label className="text-[10px] uppercase font-bold text-[#828B9E] block mb-1">
                  {lang === 'FR' ? 'Nom du Club / Établissement' : 'Venue / Club Name'}
                </label>
                <div className="relative">
                  <Building2 size={16} className="absolute left-3 top-3 text-[#828B9E]" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. CHATEAU VIP"
                    value={venueName}
                    onChange={(e) => setVenueName(e.target.value)}
                    className="w-full bg-[#111319] border border-[#282E3E] rounded-xl p-3 pl-10 text-white focus:outline-none focus:border-[#E5B800]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-[#828B9E] block mb-1">
                  {lang === 'FR' ? 'Ville' : 'City Location'}
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-[#111319] border border-[#282E3E] rounded-xl p-3 text-white focus:outline-none focus:border-[#E5B800]"
                >
                  <option value="Buea">Buea</option>
                  <option value="Douala">Douala</option>
                  <option value="Yaoundé">Yaoundé</option>
                  <option value="Limbe">Limbe</option>
                  <option value="Bamenda">Bamenda</option>
                </select>
              </div>

              {/* PROFILE IMAGE UPLOAD */}
              <div>
                <label className="text-[10px] uppercase font-bold text-[#828B9E] block mb-1">
                  {lang === 'FR' ? 'Photo de Profil / Miniature du Club' : 'Club Profile / Thumbnail Picture'}
                </label>
                <label className="w-full bg-[#111319] border border-[#282E3E] hover:border-[#E5B800] rounded-xl p-3 cursor-pointer flex items-center justify-center gap-2 text-[#E5B800] transition">
                  <ImageIcon size={16} />
                  <span className="text-xs font-bold text-white">
                    {profileImage ? 'Photo Selected ✓' : 'Choose Club Image'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        compressImage(file, (compressedUrl) => setProfileImage(compressedUrl), 400, 400);
                      }
                    }}
                  />
                </label>
              </div>

              {/* CONTACT INFO SECTION */}
              <div>
                <label className="text-[10px] uppercase font-bold text-[#828B9E] block mb-1">
                  {lang === 'FR' ? 'Contact du Service Client / Admin' : 'Customer Service / Admin Contact Number'}
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +237 670000000"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full bg-[#111319] border border-[#282E3E] rounded-xl p-3 text-white focus:outline-none focus:border-[#E5B800]"
                />
              </div>

              {/* PAYMENT SECTION FOR ADMINS */}
              <div className="p-4 bg-[#111319] border border-[#E5B800]/40 rounded-2xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-serif font-black text-white text-xs uppercase">
                    {lang === 'FR' ? 'ABONNEMENT ANNUEL GESTIONNAIRE' : 'ANNUAL MANAGER SUBSCRIPTION'}
                  </span>
                  <span className="text-[#E5B800] font-black">100,000 XAF</span>
                </div>
                <p className="text-[10px] text-[#828B9E]">
                  {lang === 'FR'
                    ? `Numéro récepteur officiel : ${RECEIVER_NUMBER}`
                    : `Official receiver number: ${RECEIVER_NUMBER}`}
                </p>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('MTN')}
                    className={`p-2.5 rounded-xl border text-center font-black transition ${
                      paymentMethod === 'MTN'
                        ? 'bg-amber-400 text-black border-amber-400'
                        : 'bg-[#181B26] border-[#282E3E] text-[#828B9E]'
                    }`}
                  >
                    MTN MoMo ({RECEIVER_NUMBER})
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('ORANGE')}
                    className={`p-2.5 rounded-xl border text-center font-black transition ${
                      paymentMethod === 'ORANGE'
                        ? 'bg-orange-500 text-white border-orange-500'
                        : 'bg-[#181B26] border-[#282E3E] text-[#828B9E]'
                    }`}
                  >
                    Orange Money
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={MTN_USSD_HREF}
                    className="py-2 px-2.5 rounded-xl bg-amber-400/15 border border-amber-400/50 text-amber-300 font-bold text-[10px] flex items-center justify-center gap-1 hover:bg-amber-400/25 transition"
                  >
                    <PhoneCall size={12} />
                    <span>{lang === 'FR' ? 'USSD MTN 100k' : 'MTN USSD 100k'}</span>
                  </a>
                  <a
                    href={ORANGE_USSD_HREF}
                    className="py-2 px-2.5 rounded-xl bg-orange-500/15 border border-orange-500/50 text-orange-300 font-bold text-[10px] flex items-center justify-center gap-1 hover:bg-orange-500/25 transition"
                  >
                    <PhoneCall size={12} />
                    <span>{lang === 'FR' ? 'USSD Orange 100k' : 'Orange USSD 100k'}</span>
                  </a>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-[#828B9E] block mb-1">
                    {paymentMethod} {lang === 'FR' ? 'Votre Numéro Payeur' : 'Your Sender Mobile Number'}
                  </label>
                  <div className="relative">
                    <Smartphone size={16} className="absolute left-3 top-3 text-[#828B9E]" />
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 670000000"
                      value={momoNumber}
                      onChange={(e) => setMomoNumber(e.target.value)}
                      className="w-full bg-[#181B26] border border-[#282E3E] rounded-xl p-3 pl-10 text-white focus:outline-none focus:border-[#E5B800]"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="text-[10px] uppercase font-bold text-[#828B9E] block mb-1">Email / Username</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-3 text-[#828B9E]" />
              <input
                type="email"
                required
                placeholder="e.g. user@camernights.cm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#111319] border border-[#282E3E] rounded-xl p-3 pl-10 text-white focus:outline-none focus:border-[#E5B800]"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-[#828B9E] block mb-1">
              {lang === 'FR' ? 'Mot de passe' : 'Password'}
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-3 text-[#828B9E]" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#111319] border border-[#282E3E] rounded-xl p-3 pl-10 text-white focus:outline-none focus:border-[#E5B800]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#E5B800] text-[#111319] font-black text-xs py-3.5 rounded-xl uppercase tracking-wider shadow-lg hover:bg-[#d4a800] transition mt-2 disabled:opacity-60"
          >
            {isSubmitting
              ? lang === 'FR'
                ? 'TRAITEMENT...'
                : 'PROCESSING...'
              : isSignUp
              ? activeTab === 'admin'
                ? lang === 'FR'
                  ? "PAYER 100,000 XAF AU 676345078 & S'INSCRIRE"
                  : 'PAY 100,000 XAF TO 676345078 & REGISTER'
                : lang === 'FR'
                ? 'CRÉER LE COMPTE'
                : 'CREATE VIP ACCOUNT'
              : lang === 'FR'
              ? 'SE CONNECTER'
              : 'SIGN IN'}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-[#282E3E] text-xs">
          <p className="text-[#828B9E]">
            {isSignUp
              ? lang === 'FR'
                ? 'Vous avez déjà un compte ?'
                : 'Already have an account?'
              : lang === 'FR'
              ? "Vous n'avez pas encore de compte ?"
              : "Don't have an account yet?"}{' '}
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className="text-[#E5B800] font-black underline hover:text-white transition ml-1"
            >
              {isSignUp ? (lang === 'FR' ? 'Se connecter' : 'Sign In') : lang === 'FR' ? "S'inscrire" : 'Create Account'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}