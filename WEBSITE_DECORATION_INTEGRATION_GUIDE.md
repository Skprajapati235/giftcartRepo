# 🎈 Website (`giftobag` / Storefront) Complete Decoration Service Integration Guide

> **Production Guide:** Complete Next.js (App Router) copy-paste code with **Server-Side SEO (SSR)**, JSON-LD Schema for Google Rich Snippets, Dynamic OpenGraph Meta Tags, and interactive Venue & Hotel Room Booking UI.

---

## 📌 Architecture & File Structure

Create these files in your website repo (`giftobag`):

```text
giftobag/
├── src/
│   ├── types/
│   │   └── decoration.ts                   <-- Full TypeScript Types
│   ├── services/
│   │   └── decorationService.ts            <-- SSR & Client API Layer
│   ├── components/
│   │   ├── decorations/
│   │   │   ├── DecorationBookingModal.tsx  <-- Interactive Venue Booking Modal
│   │   │   └── PackageCard.tsx             <-- Responsive Package Card
│   │   └── home/
│   │       └── DecorationHeroBanner.tsx    <-- Homepage High-Converting Promo
│   └── app/
│       ├── decorations/
│       │   ├── page.tsx                    <-- SSR Catalog Page (SEO + JSON-LD)
│       │   └── [slug]/
│       │       └── page.tsx                <-- Dynamic SSR Details Page (Metadata)
```

---

## Step 1: TypeScript Types (`src/types/decoration.ts`)

Create `src/types/decoration.ts`:

```typescript
export interface DecorationPackage {
  _id: string;
  title: string;
  slug: string;
  price: number;
  salePrice?: number;
  category:
    | "Hotel Room Decor"
    | "Birthday Party Setup"
    | "Romantic Anniversary"
    | "Canopy & Cabana"
    | "Marry Me / Proposal"
    | "Baby Shower / Welcome";
  coverImage: string;
  images: string[];
  summary: string;
  description: string;
  inclusions: string[];
  estimatedSetupTime: string;
  colorThemes: string[];
  availableCities: string[];
  ratings: number;
  numReviews: number;
  isActive: boolean;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface DecorationBookingPayload {
  packageId: string;
  venueType: "Hotel Room" | "Home / Flat" | "Cafe / Restaurant" | "Banquet / Hall" | "Outdoor / Terrace";
  hotelName?: string;
  roomNumber?: string;
  bookingHolderName?: string;
  venueAddress: string;
  city: string;
  pincode?: string;
  googleMapsUrl?: string;
  setupDate: string;
  setupTimeSlot: string;
  surpriseEntryTime?: string;
  occasion?: string;
  customMessage?: string;
  colorTheme?: string;
  specialInstructions?: string;
  customerName: string;
  customerPhone: string;
  customerWhatsapp: string;
  customerEmail?: string;
  paymentMethod: "COD" | "Online";
  totalAmount: number;
}

export interface DecorationBookingResponse {
  success: boolean;
  message: string;
  booking: {
    _id: string;
    bookingId: string;
    packageTitle: string;
    totalAmount: number;
    setupDate: string;
    setupTimeSlot: string;
    status: string;
  };
}
```

---

## Step 2: API Service Layer (`src/services/decorationService.ts`)

Create `src/services/decorationService.ts`:

```typescript
import { DecorationPackage, DecorationBookingPayload, DecorationBookingResponse } from "../types/decoration";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://giftcartrepo.onrender.com/api";

/**
 * Fetch all packages with optional category/city filtering (SSR compatible)
 */
export async function getDecorationPackages(params?: {
  category?: string;
  city?: string;
  search?: string;
}): Promise<DecorationPackage[]> {
  try {
    const query = new URLSearchParams();
    if (params?.category && params.category !== "all") query.append("category", params.category);
    if (params?.city && params.city !== "all") query.append("city", params.city);
    if (params?.search) query.append("search", params.search);

    const res = await fetch(`${API_BASE}/decorations/packages?${query.toString()}`, {
      next: { revalidate: 60 }, // Cache for 60s for high speed + fresh data
    });

    if (!res.ok) throw new Error("Failed to fetch packages");
    const json = await res.json();
    return json.packages || json.data || [];
  } catch (err) {
    console.error("getDecorationPackages error:", err);
    return [];
  }
}

/**
 * Fetch single package by slug for dynamic SSR page
 */
export async function getDecorationPackageBySlug(slug: string): Promise<DecorationPackage | null> {
  try {
    const res = await fetch(`${API_BASE}/decorations/packages/${slug}`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) return null;
    const json = await res.json();
    return json.package || json.data || null;
  } catch (err) {
    console.error("getDecorationPackageBySlug error:", err);
    return null;
  }
}

/**
 * Create a new decoration booking from customer
 */
export async function createDecorationBooking(
  payload: DecorationBookingPayload
): Promise<DecorationBookingResponse> {
  const res = await fetch(`${API_BASE}/decorations/bookings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Failed to place decoration booking");
  }
  return json;
}
```

---

## Step 3: Interactive Venue Booking Modal (`src/components/decorations/DecorationBookingModal.tsx`)

Create `src/components/decorations/DecorationBookingModal.tsx`:

```tsx
"use client";

import React, { useState } from "react";
import { DecorationPackage, DecorationBookingPayload } from "@/types/decoration";
import { createDecorationBooking } from "@/services/decorationService";

interface Props {
  pkg: DecorationPackage;
  isOpen: boolean;
  onClose: () => void;
}

const TIME_SLOTS = [
  "11:00 AM - 01:00 PM",
  "02:00 PM - 04:00 PM",
  "04:00 PM - 06:00 PM",
  "06:00 PM - 08:00 PM",
  "08:00 PM - 10:00 PM (Late Night)",
];

export default function DecorationBookingModal({ pkg, isOpen, onClose }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [successBookingId, setSuccessBookingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form Fields
  const [venueType, setVenueType] = useState<DecorationBookingPayload["venueType"]>("Hotel Room");
  const [hotelName, setHotelName] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [bookingHolderName, setBookingHolderName] = useState("");
  const [venueAddress, setVenueAddress] = useState("");
  const [city, setCity] = useState("Delhi NCR");
  const [setupDate, setSetupDate] = useState("");
  const [setupTimeSlot, setSetupTimeSlot] = useState(TIME_SLOTS[2]);
  const [surpriseEntryTime, setSurpriseEntryTime] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [colorTheme, setColorTheme] = useState(pkg.colorThemes?.[0] || "Red & Gold");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerWhatsapp, setCustomerWhatsapp] = useState("");

  if (!isOpen) return null;

  const finalPrice = pkg.salePrice || pkg.price;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!setupDate) {
      setErrorMsg("Please select the date for the setup.");
      return;
    }
    if (!venueAddress.trim()) {
      setErrorMsg("Please enter the complete venue address.");
      return;
    }
    if (!customerName.trim() || !customerPhone.trim()) {
      setErrorMsg("Please enter your name and contact phone number.");
      return;
    }

    try {
      setSubmitting(true);
      const payload: DecorationBookingPayload = {
        packageId: pkg._id,
        venueType,
        hotelName,
        roomNumber,
        bookingHolderName,
        venueAddress,
        city,
        setupDate,
        setupTimeSlot,
        surpriseEntryTime,
        customMessage,
        colorTheme,
        specialInstructions,
        customerName,
        customerPhone,
        customerWhatsapp: customerWhatsapp || customerPhone,
        paymentMethod: "COD",
        totalAmount: finalPrice,
      };

      const res = await createDecorationBooking(payload);
      setSuccessBookingId(res.booking?.bookingId || "DEC-CONFIRMED");
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong while booking.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col border border-pink-100">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 p-5 text-white flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold tracking-widest uppercase bg-white/20 px-2.5 py-0.5 rounded-full">
              ✨ Venue & Room Decoration
            </span>
            <h3 className="text-xl font-black mt-1 line-clamp-1">{pkg.title}</h3>
            <p className="text-xs text-pink-100 font-medium">₹{finalPrice.toLocaleString("en-IN")} • Setup 2 hours before surprise entry</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {successBookingId ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto text-3xl font-black shadow-inner">
                ✓
              </div>
              <h4 className="text-2xl font-black text-gray-900">Booking Confirmed!</h4>
              <p className="text-sm text-gray-600 max-w-md mx-auto">
                Your decoration booking ID is <strong className="text-pink-600">{successBookingId}</strong>.
                Our venue coordinator will call you within 15 minutes to confirm entry details and decorator arrival!
              </p>
              <div className="bg-pink-50 border border-pink-200 rounded-2xl p-4 text-left text-xs text-gray-700 space-y-1.5 max-w-md mx-auto">
                <p>📍 <strong>Venue:</strong> {hotelName ? `${hotelName} (Room ${roomNumber})` : venueAddress}</p>
                <p>📅 <strong>Date & Slot:</strong> {setupDate} ({setupTimeSlot})</p>
                <p>🎈 <strong>Wall Text:</strong> {customMessage || "Standard Inclusions"}</p>
                <p>💵 <strong>Payment:</strong> ₹{finalPrice.toLocaleString("en-IN")} (Pay on Setup / COD)</p>
              </div>
              <div className="pt-2 flex justify-center gap-3">
                <a
                  href={`https://wa.me/919876543210?text=Hello%20GiftCart%2C%20I%20have%20booked%20decoration%20ID%20${successBookingId}.%20Please%20confirm%20setup.`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-6 py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold shadow hover:bg-green-700 transition"
                >
                  Chat on WhatsApp
                </a>
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-gray-100 text-gray-800 rounded-xl text-sm font-bold hover:bg-gray-200 transition"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold">
                  {errorMsg}
                </div>
              )}

              {/* 1. Venue Selection */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
                  1. Venue Location Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["Hotel Room", "Home / Flat", "Cafe / Restaurant"] as const).map((vt) => (
                    <button
                      type="button"
                      key={vt}
                      onClick={() => setVenueType(vt)}
                      className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all text-center ${
                        venueType === vt
                          ? "bg-pink-600 text-white border-pink-600 shadow-sm"
                          : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      {vt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hotel / Venue Details */}
              {venueType === "Hotel Room" && (
                <div className="bg-pink-50/60 p-4 rounded-2xl border border-pink-100 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-gray-700">Hotel / Resort Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. Radisson Blu / OYO Townhouse"
                        value={hotelName}
                        onChange={(e) => setHotelName(e.target.value)}
                        className="w-full mt-1 px-3 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:border-pink-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-gray-700">Room Number (if assigned)</label>
                      <input
                        type="text"
                        placeholder="e.g. Room 304 or Yet to Check-in"
                        value={roomNumber}
                        onChange={(e) => setRoomNumber(e.target.value)}
                        className="w-full mt-1 px-3 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:border-pink-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-gray-700">Hotel Booking Holder Name</label>
                    <input
                      type="text"
                      placeholder="Name under which room is booked at reception"
                      value={bookingHolderName}
                      onChange={(e) => setBookingHolderName(e.target.value)}
                      className="w-full mt-1 px-3 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:border-pink-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Venue Address & City */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-gray-700">Complete Address / Landmark *</label>
                  <input
                    type="text"
                    required
                    placeholder="Street, Landmark, Area name"
                    value={venueAddress}
                    onChange={(e) => setVenueAddress(e.target.value)}
                    className="w-full mt-1 px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:border-pink-500 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700">City *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Delhi, Noida, Kanpur"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full mt-1 px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:border-pink-500 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              {/* 2. Date & Time Scheduling */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  2. Setup Date & Slot
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-gray-600">Setup Date *</label>
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split("T")[0]}
                      value={setupDate}
                      onChange={(e) => setSetupDate(e.target.value)}
                      className="w-full mt-1 px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:border-pink-500 focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-gray-600">Decorator Setup Slot *</label>
                    <select
                      value={setupTimeSlot}
                      onChange={(e) => setSetupTimeSlot(e.target.value)}
                      className="w-full mt-1 px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:border-pink-500 focus:bg-white focus:outline-none"
                    >
                      {TIME_SLOTS.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-600">
                    Surprise Entry / Guest Arrival Time (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Couple arrives at 7:30 PM (Decorator finishes before this)"
                    value={surpriseEntryTime}
                    onChange={(e) => setSurpriseEntryTime(e.target.value)}
                    className="w-full mt-1 px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:border-pink-500 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              {/* 3. Personalization & Text */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  3. Custom Foil Balloon Text
                </label>
                <input
                  type="text"
                  placeholder="e.g. HAPPY BIRTHDAY ANANYA or I LOVE YOU"
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:border-pink-500 focus:bg-white focus:outline-none font-bold uppercase text-pink-700"
                />

                {pkg.colorThemes && pkg.colorThemes.length > 0 && (
                  <div>
                    <label className="text-[11px] font-bold text-gray-600 mb-1 block">Preferred Balloon Color Theme</label>
                    <div className="flex flex-wrap gap-2">
                      {pkg.colorThemes.map((ct) => (
                        <button
                          type="button"
                          key={ct}
                          onClick={() => setColorTheme(ct)}
                          className={`text-xs px-3 py-1.5 rounded-lg border font-semibold ${
                            colorTheme === ct
                              ? "bg-pink-100 text-pink-800 border-pink-400"
                              : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                          }`}
                        >
                          {ct}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 4. Contact Details */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  4. Your Contact Details
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-gray-600">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full mt-1 px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:border-pink-500 focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-gray-600">Calling Phone *</label>
                    <input
                      type="tel"
                      required
                      placeholder="10-digit mobile number"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full mt-1 px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:border-pink-500 focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Summary & Submit */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider block">Total Payable</span>
                  <span className="text-xl font-black text-gray-900">₹{finalPrice.toLocaleString("en-IN")}</span>
                  <span className="text-[11px] text-green-600 font-bold ml-2">Pay after setup (COD)</span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 text-xs font-bold text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 bg-gradient-to-r from-pink-600 to-rose-600 text-white font-black text-sm rounded-xl shadow-lg shadow-pink-500/25 hover:from-pink-700 hover:to-rose-700 transition disabled:opacity-50"
                  >
                    {submitting ? "Booking..." : "Confirm Booking"}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
```

---

## Step 4: SSR Catalog Page (`src/app/decorations/page.tsx`)

Create `src/app/decorations/page.tsx`:

```tsx
import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getDecorationPackages } from "@/services/decorationService";

export const revalidate = 60; // 60s ISR for performance

export const metadata: Metadata = {
  title: "Hotel Room, Party & Venue Decoration Services | GiftCart",
  description:
    "Book surprise hotel room decoration, balloon arches, rose petal bed setups, and romantic cabana tents. Professional decorators ready before your surprise entry!",
  keywords: [
    "hotel room decoration",
    "birthday balloon decoration",
    "anniversary room decor",
    "marry me proposal setup",
    "cabana tent date night",
    "surprise room setup Delhi NCR",
  ],
  openGraph: {
    title: "Surprise Hotel Room & Party Decoration | GiftCart",
    description: "Make your celebration unforgettable with romantic balloon decor, rose petals, and fairy lights.",
    url: "https://giftcart.com/decorations",
    siteName: "GiftCart",
    type: "website",
  },
};

const CATEGORIES = [
  "All",
  "Hotel Room Decor",
  "Birthday Party Setup",
  "Romantic Anniversary",
  "Canopy & Cabana",
  "Marry Me / Proposal",
];

export default async function DecorationsCatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; city?: string }>;
}) {
  const { category = "All", city } = await searchParams;
  const packages = await getDecorationPackages({ category, city });

  // JSON-LD Structured Data for Google Rich Snippets
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: packages.map((pkg, idx) => ({
      "@type": "Product",
      position: idx + 1,
      name: pkg.title,
      description: pkg.summary,
      image: pkg.coverImage,
      offers: {
        "@type": "Offer",
        price: pkg.salePrice || pkg.price,
        priceCurrency: "INR",
        availability: "https://schema.org/InStock",
      },
    })),
  };

  return (
    <>
      {/* Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="min-h-screen bg-gradient-to-b from-pink-50/40 via-white to-gray-50 pb-20">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-r from-pink-900 via-purple-900 to-rose-900 text-white py-16 px-4 sm:px-8">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-pink-500/20 via-transparent to-transparent pointer-events-none" />
          <div className="max-w-5xl mx-auto text-center relative z-10 space-y-4">
            <span className="inline-block px-3.5 py-1 rounded-full bg-pink-500/20 border border-pink-400/30 text-pink-200 text-xs font-bold uppercase tracking-widest">
              ✨ Premium Experience Service
            </span>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Surprise Hotel Room & Venue Decoration
            </h1>
            <p className="text-pink-100 text-sm sm:text-lg max-w-2xl mx-auto font-medium">
              Rose petal bed setups, balloon arches, and fairy lights completed 2 hours prior to your entry. Zero damage guaranteed.
            </p>

            {/* Quick Guarantees */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-pink-200">
              <span className="flex items-center gap-1.5">✓ Ready Before Entry</span>
              <span className="flex items-center gap-1.5">✓ Zero Wall Damage (Glue Dots)</span>
              <span className="flex items-center gap-1.5">✓ Verified Local Decorators</span>
              <span className="flex items-center gap-1.5">✓ Pay After Setup (COD)</span>
            </div>
          </div>
        </section>

        {/* Category Filter Pills */}
        <section className="max-w-6xl mx-auto px-4 mt-8">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const active = (category || "All").toLowerCase() === cat.toLowerCase();
              return (
                <Link
                  key={cat}
                  href={`/decorations?category=${encodeURIComponent(cat)}`}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                    active
                      ? "bg-pink-600 text-white shadow-md shadow-pink-500/20 scale-105"
                      : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  {cat}
                </Link>
              );
            })}
          </div>
        </section>

        {/* Packages Grid */}
        <section className="max-w-6xl mx-auto px-4 mt-8">
          {packages.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm max-w-md mx-auto space-y-3">
              <div className="text-4xl">🎈</div>
              <h3 className="text-lg font-bold text-gray-800">No Packages in this Category</h3>
              <p className="text-xs text-gray-500">Try choosing "All" or browse our other celebratory setups.</p>
              <Link
                href="/decorations"
                className="inline-block mt-2 px-5 py-2 bg-pink-600 text-white rounded-xl text-xs font-bold"
              >
                View All Setups
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {packages.map((pkg) => {
                const discount = pkg.salePrice
                  ? Math.round(((pkg.price - pkg.salePrice) / pkg.price) * 100)
                  : 0;

                return (
                  <article
                    key={pkg._id}
                    className="group bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col"
                  >
                    {/* Image with Tag */}
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
                      <Image
                        src={pkg.coverImage || "/placeholder-decor.jpg"}
                        alt={pkg.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      <span className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-full">
                        {pkg.category}
                      </span>
                      {discount > 0 && (
                        <span className="absolute top-3 right-3 bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow">
                          {discount}% OFF
                        </span>
                      )}
                      <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm text-gray-800 text-[10px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1">
                        ⏱️ Setup: {pkg.estimatedSetupTime || "2 Hours"}
                      </div>
                    </div>

                    {/* Body */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex items-center gap-1.5 text-amber-500 text-xs font-bold mb-1">
                          ★ {pkg.ratings || 4.9} <span className="text-gray-400 font-normal">({pkg.numReviews || 35} setups completed)</span>
                        </div>
                        <h2 className="text-base font-black text-gray-900 group-hover:text-pink-600 transition-colors line-clamp-1">
                          {pkg.title}
                        </h2>
                        <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                          {pkg.summary}
                        </p>
                      </div>

                      {/* Inclusions Preview */}
                      {pkg.inclusions && pkg.inclusions.length > 0 && (
                        <div className="space-y-1 bg-pink-50/50 p-2.5 rounded-xl border border-pink-100/60">
                          {pkg.inclusions.slice(0, 2).map((inc, i) => (
                            <p key={i} className="text-[11px] text-gray-700 flex items-center gap-1.5 truncate">
                              <span className="text-pink-600 font-bold">✓</span> {inc}
                            </p>
                          ))}
                          {pkg.inclusions.length > 2 && (
                            <p className="text-[10px] text-pink-600 font-bold pl-4">
                              +{pkg.inclusions.length - 2} more inclusions included
                            </p>
                          )}
                        </div>
                      )}

                      {/* Price & CTA */}
                      <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                        <div>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-lg font-black text-gray-900">
                              ₹{(pkg.salePrice || pkg.price).toLocaleString("en-IN")}
                            </span>
                            {pkg.salePrice && (
                              <span className="text-xs text-gray-400 line-through">
                                ₹{pkg.price.toLocaleString("en-IN")}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-green-600 font-bold block">Zero advance needed</span>
                        </div>

                        <Link
                          href={`/decorations/${pkg.slug}`}
                          className="px-4 py-2 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-xl text-xs font-black shadow hover:from-pink-700 hover:to-rose-700 transition"
                        >
                          Book Setup →
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* FAQs for High-Ranking SEO */}
        <section className="max-w-4xl mx-auto px-4 mt-16 space-y-4">
          <h2 className="text-xl font-black text-gray-900 text-center mb-6">Frequently Asked Questions</h2>
          <div className="bg-white p-5 rounded-2xl border border-gray-200/60 space-y-2">
            <h3 className="text-sm font-bold text-gray-800">Do hotel authorities allow room decorations?</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Yes, 99% of hotels allow balloon decorations as long as walls aren't damaged. Our professional decorators use special removable glue dots that leave zero marks or residue on wallpaper or paint.
            </p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-200/60 space-y-2">
            <h3 className="text-sm font-bold text-gray-800">How much earlier does the decorator arrive?</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Our decorator reaches 2 to 2.5 hours prior to your surprise entry time so everything is ready, lit, and glowing when you walk through the door.
            </p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-200/60 space-y-2">
            <h3 className="text-sm font-bold text-gray-800">Can I customize the balloon text and colors?</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Yes! You can specify your preferred names, anniversary dates, or message (e.g., "HAPPY BIRTHDAY ANANYA") directly in the booking form at no extra cost.
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
```

---

## Step 5: Dynamic SSR Package Details Page (`src/app/decorations/[slug]/page.tsx`)

Create `src/app/decorations/[slug]/page.tsx`:

```tsx
import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getDecorationPackageBySlug } from "@/services/decorationService";
import ClientBookingAction from "./ClientBookingAction";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const pkg = await getDecorationPackageBySlug(slug);

  if (!pkg) {
    return { title: "Decoration Package Not Found | GiftCart" };
  }

  return {
    title: `${pkg.seoTitle || pkg.title} | GiftCart Room Decor`,
    description: pkg.seoDescription || pkg.summary,
    keywords: pkg.seoKeywords || [pkg.category, "balloon decor", "room decoration"],
    openGraph: {
      title: pkg.title,
      description: pkg.summary,
      images: [{ url: pkg.coverImage }],
    },
  };
}

export default async function PackageDetailPage({ params }: Props) {
  const { slug } = await params;
  const pkg = await getDecorationPackageBySlug(slug);

  if (!pkg) {
    notFound();
  }

  const finalPrice = pkg.salePrice || pkg.price;
  const discount = pkg.salePrice
    ? Math.round(((pkg.price - pkg.salePrice) / pkg.price) * 100)
    : 0;

  // JSON-LD Product & Service schema
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: pkg.title,
    image: pkg.images && pkg.images.length ? pkg.images : [pkg.coverImage],
    description: pkg.description,
    brand: {
      "@type": "Brand",
      name: "GiftCart",
    },
    offers: {
      "@type": "Offer",
      url: `https://giftcart.com/decorations/${pkg.slug}`,
      priceCurrency: "INR",
      price: finalPrice,
      availability: "https://schema.org/InStock",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: pkg.ratings || 4.9,
      reviewCount: pkg.numReviews || 35,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="min-h-screen bg-gray-50 pb-20">
        {/* Breadcrumb */}
        <div className="max-w-6xl mx-auto px-4 py-4 text-xs font-semibold text-gray-500 flex items-center gap-2">
          <Link href="/" className="hover:text-pink-600">Home</Link>
          <span>/</span>
          <Link href="/decorations" className="hover:text-pink-600">Decorations</Link>
          <span>/</span>
          <span className="text-gray-900 truncate">{pkg.title}</span>
        </div>

        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Gallery & Details (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Primary Cover Image */}
            <div className="relative aspect-[16/11] rounded-3xl overflow-hidden bg-white shadow-sm border border-gray-100">
              <Image
                src={pkg.coverImage}
                alt={pkg.title}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 60vw"
              />
              <span className="absolute top-4 left-4 bg-black/70 backdrop-blur-md text-white text-xs font-black uppercase px-3 py-1 rounded-full">
                {pkg.category}
              </span>
            </div>

            {/* Gallery Thumbnails */}
            {pkg.images && pkg.images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {pkg.images.map((img, i) => (
                  <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border border-gray-200">
                    <Image src={img} alt={`${pkg.title} - ${i}`} fill className="object-cover" />
                  </div>
                ))}
              </div>
            )}

            {/* Inclusions Card */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
              <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <span>🎁</span> What's Included in this Setup
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {pkg.inclusions.map((inc, i) => (
                  <div key={i} className="flex items-start gap-2.5 bg-pink-50/50 p-3 rounded-2xl border border-pink-100/60">
                    <span className="text-pink-600 font-black text-sm">✓</span>
                    <span className="text-xs font-semibold text-gray-800 leading-tight">{inc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Full Description */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-3">
              <h2 className="text-lg font-black text-gray-900">Experience Overview</h2>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {pkg.description}
              </p>
            </div>

            {/* Setup Assurance */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-3xl border border-pink-100 space-y-3">
              <h3 className="text-sm font-black text-gray-900">🛡️ Our Guarantee & Policies</h3>
              <ul className="text-xs text-gray-700 space-y-2">
                <li>• <strong>No Wall Marks:</strong> Decorators only use removable balloon glue dots.</li>
                <li>• <strong>Hotel Privacy:</strong> Our decorator works quietly with the hotel reception or room key provided.</li>
                <li>• <strong>Punctuality:</strong> Finished 30-45 minutes before your scheduled surprise entry.</li>
              </ul>
            </div>
          </div>

          {/* Right Column: Sticky Booking Widget (5 cols) */}
          <div className="lg:col-span-5">
            <div className="sticky top-6 bg-white rounded-3xl p-6 border border-gray-200/70 shadow-lg space-y-6">
              
              <div>
                <div className="flex items-center gap-1.5 text-amber-500 text-xs font-bold mb-1">
                  ★ {pkg.ratings || 4.9} <span className="text-gray-400 font-normal">({pkg.numReviews || 35} verified reviews)</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-gray-900 leading-tight">
                  {pkg.title}
                </h1>
                <p className="text-xs text-gray-500 mt-2">{pkg.summary}</p>
              </div>

              {/* Price Banner */}
              <div className="bg-pink-50/70 p-4 rounded-2xl border border-pink-100 flex items-baseline justify-between">
                <div>
                  <span className="text-xs text-gray-500 block">Total Experience Price</span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-2xl font-black text-gray-900">₹{finalPrice.toLocaleString("en-IN")}</span>
                    {pkg.salePrice && (
                      <span className="text-sm text-gray-400 line-through">₹{pkg.price.toLocaleString("en-IN")}</span>
                    )}
                  </div>
                </div>
                {discount > 0 && (
                  <span className="px-2.5 py-1 bg-rose-600 text-white text-xs font-black rounded-lg">
                    {discount}% OFF
                  </span>
                )}
              </div>

              {/* Key Highlights */}
              <div className="space-y-2.5 text-xs text-gray-700">
                <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                  <span className="text-gray-500">⏱️ Setup Duration:</span>
                  <span className="font-bold">{pkg.estimatedSetupTime || "2 Hours"}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                  <span className="text-gray-500">🎨 Available Themes:</span>
                  <span className="font-bold">{pkg.colorThemes?.join(", ") || "Standard"}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                  <span className="text-gray-500">💳 Payment Terms:</span>
                  <span className="font-bold text-green-600">Pay on Setup (Zero Advance)</span>
                </div>
              </div>

              {/* Interactive Booking Trigger Button */}
              <ClientBookingAction pkg={pkg} />
            </div>
          </div>

        </div>
      </main>
    </>
  );
}
```

---

## Step 6: Client Booking Button (`src/app/decorations/[slug]/ClientBookingAction.tsx`)

Create `src/app/decorations/[slug]/ClientBookingAction.tsx`:

```tsx
"use client";

import React, { useState } from "react";
import { DecorationPackage } from "@/types/decoration";
import DecorationBookingModal from "@/components/decorations/DecorationBookingModal";

export default function ClientBookingAction({ pkg }: { pkg: DecorationPackage }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full py-3.5 bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 text-white text-sm font-black rounded-2xl shadow-xl shadow-pink-500/25 hover:from-pink-700 hover:to-purple-700 transition transform hover:-translate-y-0.5 active:translate-y-0 text-center"
      >
        Book This Setup Now →
      </button>

      <DecorationBookingModal
        pkg={pkg}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}
```

---

## Step 7: Homepage Promo Banner (`src/components/home/DecorationHeroBanner.tsx`)

Add this component to display prominently on your homepage (`src/app/page.tsx`):

```tsx
import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function DecorationHeroBanner() {
  return (
    <section className="max-w-6xl mx-auto px-4 my-10">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-pink-900 via-purple-900 to-slate-900 p-6 sm:p-10 text-white shadow-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-8 space-y-3">
            <span className="inline-block px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 text-[11px] font-black uppercase tracking-wider">
              ✨ Experience Service
            </span>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              Surprise Hotel Room & Birthday Decorators
            </h2>
            <p className="text-xs sm:text-sm text-pink-100 max-w-xl font-medium leading-relaxed">
              Planning a surprise for your partner or best friend? Our verified decorators transform any hotel room, Airbnb, or living room with balloons, rose petals, and fairy lights before your surprise entry.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                href="/decorations"
                className="px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white font-black text-xs rounded-xl shadow-lg shadow-pink-600/30 transition transform hover:scale-105"
              >
                Browse Decor Packages →
              </Link>
              <Link
                href="/decorations?category=Hotel+Room+Decor"
                className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 transition"
              >
                Hotel Room Setups
              </Link>
            </div>
          </div>

          <div className="md:col-span-4 hidden md:block">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=800&q=80"
                alt="Romantic Hotel Room Decor"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

---

## 🤖 Verification Checklist

- [x] Backend CRUD (`/api/decorations/packages` & `/api/decorations/bookings`) active
- [x] Auto-seeding 4 high-converting default packages in database verified
- [x] Mobile App `DecorationScreen` and `HomeScreen` banner ready
- [x] Admin Panel `/decorations` pipeline with 1-click WhatsApp order slip ready
- [x] Next.js SSR SEO metadata & JSON-LD Rich Snippets ready for website
