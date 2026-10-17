"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  ArrowUp,
  ArrowDown,
  Save,
  X,
  RefreshCw,
  Clock,
  Palette,
  MapPin,
  SlidersHorizontal,
  Check,
  Info,
  Eye,
  EyeOff,
  Loader2,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import * as service from "@/app/services/adminService";
import { useToast } from "@/context/ToastContext";

type Tab = "venues" | "slots" | "themes" | "rules";
type Kind = "venue-types" | "time-slots" | "color-themes";

const KIND_OF: Record<Exclude<Tab, "rules">, Kind> = {
  venues: "venue-types",
  slots: "time-slots",
  themes: "color-themes",
};

const EMOJIS = ["🏨", "🏠", "🍽️", "🌇", "🏖️", "🎪", "🏰", "🌳", "🛏️", "🎉", "🏢", "🛥️"];

const fmt12 = (hhmm: string) => {
  if (!/^\d{2}:\d{2}$/.test(hhmm || "")) return "--:--";
  const [h, m] = hhmm.split(":").map(Number);
  return `${String(h % 12 === 0 ? 12 : h % 12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
};

const inputCls =
  "w-full px-3.5 py-2.5 rounded-xl text-sm font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/10 transition";
const labelCls = "block text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5";
const cardCls = "bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm";

function Toggle({ checked, onChange, label, hint }: { checked: boolean; onChange: (v: boolean) => void; label: string; hint?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex items-start gap-3 text-left w-full"
    >
      <span className={`mt-0.5 relative inline-flex h-6 w-11 shrink-0 rounded-full transition ${checked ? "bg-pink-600" : "bg-slate-300 dark:bg-slate-700"}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${checked ? "left-[22px]" : "left-0.5"}`} />
      </span>
      <span>
        <span className="block text-sm font-bold text-slate-800 dark:text-slate-100">{label}</span>
        {hint && <span className="block text-xs text-slate-500 dark:text-slate-400 mt-0.5">{hint}</span>}
      </span>
    </button>
  );
}

function FormShell({
  title,
  saving,
  onCancel,
  onSubmit,
  children,
}: {
  title: string;
  saving: boolean;
  onCancel: () => void;
  onSubmit: () => void;
  children: React.ReactNode;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className={`${cardCls} p-5 sm:p-6 space-y-4 border-pink-200 dark:border-pink-900/50`}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-pink-500" /> {title}
        </h3>
        <button type="button" onClick={onCancel} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white" aria-label="Close form">
          <X className="h-4 w-4" />
        </button>
      </div>
      {children}
      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 disabled:opacity-60 text-white text-xs font-black transition"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save
        </button>
        <button type="button" onClick={onCancel} className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-black hover:bg-slate-200 dark:hover:bg-slate-700 transition">
          Cancel
        </button>
      </div>
    </form>
  );
}

// ───────────────────────── forms ─────────────────────────
function VenueForm({ initial, saving, onSave, onCancel }: any) {
  const [name, setName] = useState(initial?.name || "");
  const [icon, setIcon] = useState(initial?.icon || "📍");
  const [description, setDescription] = useState(initial?.description || "");
  const [askHotelDetails, setAsk] = useState(Boolean(initial?.askHotelDetails));
  const [isActive, setActive] = useState(initial ? Boolean(initial.isActive) : true);

  return (
    <FormShell title={initial ? "Edit venue type" : "New venue type"} saving={saving} onCancel={onCancel} onSubmit={() => onSave({ name, icon, description, askHotelDetails, isActive })}>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2">
          <label className={labelCls}>Name shown to customers</label>
          <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} maxLength={60} placeholder="e.g. Hotel Room" required />
        </div>
        <div>
          <label className={labelCls}>Icon</label>
          <input className={inputCls} value={icon} onChange={(e) => setIcon(e.target.value)} maxLength={8} />
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {EMOJIS.map((e) => (
          <button key={e} type="button" onClick={() => setIcon(e)} className={`h-9 w-9 rounded-xl text-lg border transition ${icon === e ? "border-pink-500 bg-pink-50 dark:bg-pink-950/40" : "border-slate-200 dark:border-slate-700 hover:border-pink-300"}`}>
            {e}
          </button>
        ))}
      </div>
      <div>
        <label className={labelCls}>Short description (optional)</label>
        <input className={inputCls} value={description} onChange={(e) => setDescription(e.target.value)} maxLength={140} placeholder="One line customers see under the name" />
      </div>
      <Toggle checked={askHotelDetails} onChange={setAsk} label="Ask for hotel name & room number" hint="Turn on for hotels / resorts so the decorator knows where to go." />
      <Toggle checked={isActive} onChange={setActive} label="Visible to customers" />
    </FormShell>
  );
}

function SlotForm({ initial, saving, onSave, onCancel }: any) {
  const [startTime, setStart] = useState(initial?.startTime || "16:00");
  const [endTime, setEnd] = useState(initial?.endTime || "18:00");
  const [tag, setTag] = useState(initial?.tag || "");
  const [maxBookings, setMax] = useState(String(initial?.maxBookings ?? 0));
  const [isActive, setActive] = useState(initial ? Boolean(initial.isActive) : true);
  const invalid = !startTime || !endTime || endTime <= startTime;

  return (
    <FormShell title={initial ? "Edit time slot" : "New time slot"} saving={saving} onCancel={onCancel} onSubmit={() => onSave({ startTime, endTime, tag, maxBookings: Number(maxBookings) || 0, isActive })}>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div>
          <label className={labelCls}>From</label>
          <input type="time" step={300} className={inputCls} value={startTime} onChange={(e) => setStart(e.target.value)} required />
        </div>
        <div>
          <label className={labelCls}>To</label>
          <input type="time" step={300} className={inputCls} value={endTime} onChange={(e) => setEnd(e.target.value)} required />
        </div>
        <div>
          <label className={labelCls}>Badge (optional)</label>
          <input className={inputCls} value={tag} onChange={(e) => setTag(e.target.value)} maxLength={40} placeholder="Midnight Surprise" />
        </div>
        <div>
          <label className={labelCls}>Max bookings / day</label>
          <input type="number" min={0} max={500} className={inputCls} value={maxBookings} onChange={(e) => setMax(e.target.value)} />
        </div>
      </div>
      <div className={`rounded-2xl px-4 py-3 text-xs font-bold flex items-center gap-2 ${invalid ? "bg-rose-50 dark:bg-rose-950/30 text-rose-600" : "bg-pink-50 dark:bg-pink-950/30 text-pink-700 dark:text-pink-300"}`}>
        <Clock className="h-4 w-4" />
        {invalid ? "End time must be after the start time" : <>Customers will see: <b>{fmt12(startTime)} - {fmt12(endTime)}</b>{tag ? ` · ${tag}` : ""}</>}
      </div>
      <p className="text-[11px] text-slate-500 dark:text-slate-400">0 = unlimited. When a date reaches the limit, this slot shows “Fully booked” for that date.</p>
      <Toggle checked={isActive} onChange={setActive} label="Visible to customers" />
    </FormShell>
  );
}

function ThemeForm({ initial, saving, onSave, onCancel }: any) {
  const [name, setName] = useState(initial?.name || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [primaryColor, setP] = useState(initial?.primaryColor || "#D82B76");
  const [secondaryColor, setS] = useState(initial?.secondaryColor || "#FFFFFF");
  const [isActive, setActive] = useState(initial ? Boolean(initial.isActive) : true);
  const hex = (v: string) => (/^#[0-9a-fA-F]{6}$/.test(v) ? v : "#cccccc");

  return (
    <FormShell title={initial ? "Edit colour theme" : "New colour theme"} saving={saving} onCancel={onCancel} onSubmit={() => onSave({ name, description, primaryColor, secondaryColor, isActive })}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Theme name</label>
          <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} maxLength={60} placeholder="Red & Gold" required />
        </div>
        <div>
          <label className={labelCls}>Short description (optional)</label>
          <input className={inputCls} value={description} onChange={(e) => setDescription(e.target.value)} maxLength={100} />
        </div>
        {[
          ["Main colour", primaryColor, setP],
          ["Accent colour", secondaryColor, setS],
        ].map(([label, value, set]: any) => (
          <div key={label}>
            <label className={labelCls}>{label}</label>
            <div className="flex items-center gap-2">
              <input type="color" value={hex(value)} onChange={(e) => set(e.target.value.toUpperCase())} className="h-11 w-14 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent cursor-pointer" aria-label={label} />
              <input className={inputCls} value={value} onChange={(e) => set(e.target.value)} maxLength={7} />
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 px-4 py-3">
        <span className="h-9 w-16 rounded-xl border border-white/40 shadow" style={{ background: `linear-gradient(135deg, ${hex(primaryColor)} 55%, ${hex(secondaryColor)} 55%)` }} />
        <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Preview shown on the booking form</span>
      </div>
      <Toggle checked={isActive} onChange={setActive} label="Visible to customers" />
    </FormShell>
  );
}

// ───────────────────────── rules ─────────────────────────
function NumberField({ label, value, onChange, min, max, suffix, hint }: any) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <div className="flex items-center gap-2">
        <input type="number" min={min} max={max} className={inputCls} value={value} onChange={(e) => onChange(e.target.value)} />
        {suffix && <span className="text-xs font-bold text-slate-400 shrink-0">{suffix}</span>}
      </div>
      {hint && <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{hint}</p>}
    </div>
  );
}

function RulesForm({ settings, saving, onSave }: any) {
  const [s, setS] = useState<any>(() => JSON.parse(JSON.stringify(settings)));
  const [hotel, setHotel] = useState("");
  useEffect(() => setS(JSON.parse(JSON.stringify(settings))), [settings]);

  const dirty = useMemo(() => JSON.stringify(s) !== JSON.stringify(settings), [s, settings]);
  const set = (k: string, v: any) => setS((p: any) => ({ ...p, [k]: v }));
  const setCustom = (k: string, v: any) => setS((p: any) => ({ ...p, customSlot: { ...p.customSlot, [k]: v } }));

  const exampleAdvance = (total: number) => {
    const raw = (total * Number(s.advancePercent || 0)) / 100;
    const step = Math.max(1, Number(s.advanceRoundTo) || 1);
    return Math.min(total, Math.max(Number(s.minAdvanceAmount) || 0, Math.round(raw / step) * step));
  };

  const addHotel = () => {
    const h = hotel.trim();
    if (!h) return;
    if ((s.popularHotels || []).some((x: string) => x.toLowerCase() === h.toLowerCase())) return setHotel("");
    set("popularHotels", [...(s.popularHotels || []), h]);
    setHotel("");
  };

  const submit = () =>
    onSave({
      allowCustomTimeSlot: s.allowCustomTimeSlot,
      customSlot: {
        earliest: s.customSlot.earliest,
        latest: s.customSlot.latest,
        stepMinutes: Number(s.customSlot.stepMinutes),
        defaultDurationMinutes: Number(s.customSlot.defaultDurationMinutes),
        minDurationMinutes: Number(s.customSlot.minDurationMinutes),
      },
      minLeadHours: Number(s.minLeadHours),
      maxAdvanceDays: Number(s.maxAdvanceDays),
      cancelHours: Number(s.cancelHours),
      unpaidExpiryMinutes: Number(s.unpaidExpiryMinutes),
      maxUnpaidPerUser: Number(s.maxUnpaidPerUser),
      advancePercent: Number(s.advancePercent),
      minAdvanceAmount: Number(s.minAdvanceAmount),
      advanceRoundTo: Number(s.advanceRoundTo),
      popularHotels: s.popularHotels,
      supportWhatsapp: s.supportWhatsapp,
      supportPhone: s.supportPhone,
    });

  return (
    <div className="space-y-5">
      <section className={`${cardCls} p-5 sm:p-6 space-y-4`}>
        <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2"><Clock className="h-4 w-4 text-pink-500" /> Custom time chosen by the customer</h3>
        <Toggle checked={Boolean(s.allowCustomTimeSlot)} onChange={(v) => set("allowCustomTimeSlot", v)} label="Let customers pick their own time" hint="Customers can type a start time instead of choosing a listed slot. Such bookings are flagged “Custom time” for you." />
        <div className={`grid grid-cols-2 sm:grid-cols-5 gap-4 ${s.allowCustomTimeSlot ? "" : "opacity-50 pointer-events-none"}`}>
          <div>
            <label className={labelCls}>Earliest</label>
            <input type="time" className={inputCls} value={s.customSlot.earliest} onChange={(e) => setCustom("earliest", e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Latest end</label>
            <input type="time" className={inputCls} value={s.customSlot.latest} onChange={(e) => setCustom("latest", e.target.value)} />
          </div>
          <NumberField label="Time step" suffix="min" min={5} max={120} value={s.customSlot.stepMinutes} onChange={(v: string) => setCustom("stepMinutes", v)} />
          <NumberField label="Default length" suffix="min" min={15} max={720} value={s.customSlot.defaultDurationMinutes} onChange={(v: string) => setCustom("defaultDurationMinutes", v)} />
          <NumberField label="Minimum length" suffix="min" min={15} max={720} value={s.customSlot.minDurationMinutes} onChange={(v: string) => setCustom("minDurationMinutes", v)} />
        </div>
      </section>

      <section className={`${cardCls} p-5 sm:p-6 space-y-4`}>
        <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2"><SlidersHorizontal className="h-4 w-4 text-pink-500" /> Booking rules</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <NumberField label="Minimum notice" suffix="hours" min={0} max={168} value={s.minLeadHours} onChange={(v: string) => set("minLeadHours", v)} hint="Earliest a setup can start from now" />
          <NumberField label="Book up to" suffix="days ahead" min={1} max={730} value={s.maxAdvanceDays} onChange={(v: string) => set("maxAdvanceDays", v)} />
          <NumberField label="Free cancellation until" suffix="hours before" min={0} max={720} value={s.cancelHours} onChange={(v: string) => set("cancelHours", v)} hint="After this, customers must contact support" />
          <NumberField label="Hold unpaid online booking" suffix="min" min={10} max={2880} value={s.unpaidExpiryMinutes} onChange={(v: string) => set("unpaidExpiryMinutes", v)} hint="Then the slot is released" />
          <NumberField label="Unpaid bookings per customer" min={1} max={20} value={s.maxUnpaidPerUser} onChange={(v: string) => set("maxUnpaidPerUser", v)} />
        </div>
      </section>

      <section className={`${cardCls} p-5 sm:p-6 space-y-4`}>
        <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2"><Sparkles className="h-4 w-4 text-pink-500" /> Advance token</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <NumberField label="Advance" suffix="% of total" min={1} max={100} value={s.advancePercent} onChange={(v: string) => set("advancePercent", v)} />
          <NumberField label="Never below" suffix="₹" min={0} max={100000} value={s.minAdvanceAmount} onChange={(v: string) => set("minAdvanceAmount", v)} />
          <NumberField label="Round to nearest" suffix="₹" min={1} max={1000} value={s.advanceRoundTo} onChange={(v: string) => set("advanceRoundTo", v)} />
        </div>
        <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 rounded-xl px-4 py-3">
          Example: ₹2,000 package → advance <b>₹{exampleAdvance(2000)}</b> · ₹3,500 → <b>₹{exampleAdvance(3500)}</b> · ₹8,000 → <b>₹{exampleAdvance(8000)}</b>
        </p>
      </section>

      <section className={`${cardCls} p-5 sm:p-6 space-y-4`}>
        <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2"><MapPin className="h-4 w-4 text-pink-500" /> Popular hotels & support</h3>
        <div>
          <label className={labelCls}>Hotel suggestions (shown while customers type a hotel name)</label>
          <div className="flex gap-2">
            <input className={inputCls} value={hotel} onChange={(e) => setHotel(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addHotel())} maxLength={80} placeholder="Add a hotel and press Enter" />
            <button type="button" onClick={addHotel} className="px-4 rounded-xl bg-pink-600 text-white text-xs font-black hover:bg-pink-700 shrink-0">Add</button>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {(s.popularHotels || []).length === 0 && <span className="text-xs text-slate-400">No suggestions yet — customers just type the hotel name.</span>}
            {(s.popularHotels || []).map((h: string) => (
              <span key={h} className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1 rounded-full bg-pink-50 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300 text-xs font-bold">
                {h}
                <button type="button" aria-label={`Remove ${h}`} onClick={() => set("popularHotels", s.popularHotels.filter((x: string) => x !== h))} className="p-0.5 rounded-full hover:bg-pink-200/60"><X className="h-3 w-3" /></button>
              </span>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>WhatsApp (with country code)</label>
            <input className={inputCls} value={s.supportWhatsapp || ""} onChange={(e) => set("supportWhatsapp", e.target.value)} placeholder="918400787712" />
          </div>
          <div>
            <label className={labelCls}>Support phone</label>
            <input className={inputCls} value={s.supportPhone || ""} onChange={(e) => set("supportPhone", e.target.value)} placeholder="+91 84007 87712" />
          </div>
        </div>
      </section>

      <div className="sticky bottom-3 z-10 flex justify-end">
        <button
          type="button"
          disabled={!dirty || saving}
          onClick={submit}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-pink-600 hover:bg-pink-700 disabled:opacity-50 text-white text-sm font-black shadow-lg shadow-pink-600/25 transition"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} {dirty ? "Save rules" : "All changes saved"}
        </button>
      </div>
    </div>
  );
}

// ───────────────────────── main view ─────────────────────────
export default function DecorationBookingSetupView() {
  const { showToast } = useToast();
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("venues");
  const [editing, setEditing] = useState<{ id: string | null; item: any | null } | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      setData(await service.getDecorationSetup());
      setError(null);
    } catch (err: any) {
      setError(err.message || "Could not load the booking setup");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const list: any[] = useMemo(() => {
    if (!data) return [];
    return tab === "venues" ? data.venueTypes : tab === "slots" ? data.timeSlots : tab === "themes" ? data.colorThemes : [];
  }, [data, tab]);

  const changeTab = (t: Tab) => {
    setTab(t);
    setEditing(null);
  };

  const kind = tab === "rules" ? null : KIND_OF[tab];

  const saveItem = async (payload: any) => {
    if (!kind) return;
    setSaving(true);
    try {
      if (editing?.id) await service.updateDecorationOption(kind, editing.id, payload);
      else await service.createDecorationOption(kind, payload);
      showToast(editing?.id ? "Saved" : "Added", "success");
      setEditing(null);
      await load(true);
    } catch (err: any) {
      showToast(err.message || "Could not save", "error");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (item: any) => {
    if (!kind) return;
    try {
      await service.updateDecorationOption(kind, item._id, { isActive: !item.isActive });
      showToast(item.isActive ? "Hidden from customers" : "Visible to customers", "success");
      await load(true);
    } catch (err: any) {
      showToast(err.message || "Could not update", "error");
    }
  };

  const removeItem = async (item: any) => {
    if (!kind) return;
    const name = item.name || item.label;
    if (!confirm(`Delete "${name}"? Old bookings keep their details; customers just won't see it any more.`)) return;
    try {
      await service.deleteDecorationOption(kind, item._id);
      showToast("Deleted", "success");
      if (editing?.id === item._id) setEditing(null);
      await load(true);
    } catch (err: any) {
      showToast(err.message || "Could not delete", "error");
    }
  };

  const move = async (index: number, dir: -1 | 1) => {
    if (!kind) return;
    const next = [...list];
    const j = index + dir;
    if (j < 0 || j >= next.length) return;
    [next[index], next[j]] = [next[j], next[index]];
    try {
      await service.reorderDecorationOptions(kind, next.map((i) => i._id));
      await load(true);
    } catch (err: any) {
      showToast(err.message || "Could not reorder", "error");
    }
  };

  const saveRules = async (payload: any) => {
    setSaving(true);
    try {
      const updated = await service.saveDecorationSettings(payload);
      setData((d: any) => ({ ...d, settings: updated }));
      showToast("Rules saved — live for customers within seconds", "success");
    } catch (err: any) {
      showToast(err.message || "Could not save the rules", "error");
    } finally {
      setSaving(false);
    }
  };

  const tabs: { key: Tab; label: string; icon: any; count?: number }[] = [
    { key: "venues", label: "Venue types", icon: MapPin, count: data?.venueTypes?.length },
    { key: "slots", label: "Time slots", icon: Clock, count: data?.timeSlots?.length },
    { key: "themes", label: "Colour themes", icon: Palette, count: data?.colorThemes?.length },
    { key: "rules", label: "Rules & support", icon: SlidersHorizontal },
  ];

  const Form = tab === "venues" ? VenueForm : tab === "slots" ? SlotForm : ThemeForm;

  return (
    <div className="space-y-6 pb-10">
      <div className={`${cardCls} p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-black text-gray-900 dark:text-white">Booking Setup</h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-pink-100 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400 border border-pink-200 dark:border-pink-900/40">Live on website & app</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Everything customers can choose while booking a decoration — managed here, shown instantly on the website and the mobile app.</p>
        </div>
        <button onClick={() => load()} className="self-start sm:self-auto p-3 rounded-2xl bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition" aria-label="Refresh">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/30 p-4 text-sm text-rose-700 dark:text-rose-300">
          <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">{error}</p>
            <p className="text-xs mt-1 opacity-80">Only the super admin / admin can change the booking setup.</p>
          </div>
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => changeTab(t.key)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black whitespace-nowrap transition border ${
              tab === t.key ? "bg-pink-600 text-white border-pink-600 shadow-md shadow-pink-600/20" : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-pink-300"
            }`}
          >
            <t.icon className="h-4 w-4" /> {t.label}
            {typeof t.count === "number" && <span className={`px-1.5 rounded-md text-[10px] ${tab === t.key ? "bg-white/20" : "bg-slate-100 dark:bg-slate-800"}`}>{t.count}</span>}
          </button>
        ))}
      </div>

      {loading && !data ? (
        <div className="py-20 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-pink-500" /></div>
      ) : data && tab === "rules" ? (
        <RulesForm settings={data.settings} saving={saving} onSave={saveRules} />
      ) : data ? (
        <div className="space-y-4">
          {editing ? (
            <Form key={editing.id || "new"} initial={editing.item} saving={saving} onSave={saveItem} onCancel={() => setEditing(null)} />
          ) : (
            <button onClick={() => setEditing({ id: null, item: null })} className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-pink-600 hover:bg-pink-700 text-white text-xs font-black shadow-md shadow-pink-600/20 transition">
              <Plus className="h-4 w-4" /> Add {tab === "venues" ? "venue type" : tab === "slots" ? "time slot" : "colour theme"}
            </button>
          )}

          {tab === "slots" && data.settings?.allowCustomTimeSlot && (
            <p className="flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400 px-1">
              <Info className="h-4 w-4 shrink-0 mt-0.5" /> Customers can also type their own time between {fmt12(data.settings.customSlot.earliest)} and {fmt12(data.settings.customSlot.latest)} (change this in “Rules & support”).
            </p>
          )}

          {list.length === 0 ? (
            <div className={`${cardCls} py-14 text-center`}>
              <p className="text-sm font-bold text-gray-600 dark:text-gray-300">Nothing here yet</p>
              <p className="text-xs text-gray-400 mt-1">Add your first one — customers see it as soon as you save.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {list.map((item, i) => (
                <li key={item._id} className={`${cardCls} p-4 sm:p-5 flex items-center gap-4 ${item.isActive ? "" : "opacity-60"}`}>
                  <div className="flex flex-col">
                    <button disabled={i === 0} onClick={() => move(i, -1)} className="p-1 text-slate-400 hover:text-pink-600 disabled:opacity-30" aria-label="Move up"><ArrowUp className="h-4 w-4" /></button>
                    <button disabled={i === list.length - 1} onClick={() => move(i, 1)} className="p-1 text-slate-400 hover:text-pink-600 disabled:opacity-30" aria-label="Move down"><ArrowDown className="h-4 w-4" /></button>
                  </div>

                  {tab === "venues" && <span className="text-3xl w-10 text-center">{item.icon || "📍"}</span>}
                  {tab === "slots" && (
                    <span className="h-11 w-11 rounded-2xl bg-pink-50 dark:bg-pink-950/40 text-pink-600 flex items-center justify-center shrink-0"><Clock className="h-5 w-5" /></span>
                  )}
                  {tab === "themes" && (
                    <span className="h-11 w-16 rounded-xl shrink-0 shadow border border-white/40" style={{ background: `linear-gradient(135deg, ${item.primaryColor} 55%, ${item.secondaryColor} 55%)` }} />
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-black text-gray-900 dark:text-white truncate">{tab === "slots" ? item.label : item.name}</p>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                      {tab === "venues" && item.askHotelDetails && <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-300">Asks hotel & room</span>}
                      {tab === "slots" && item.tag && <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300">{item.tag}</span>}
                      {tab === "slots" && <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">{item.maxBookings > 0 ? `Max ${item.maxBookings}/day` : "Unlimited"}</span>}
                      {!item.isActive && <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-50 dark:bg-rose-950/40 text-rose-600">Hidden</span>}
                      {item.description && <span className="text-xs text-slate-500 dark:text-slate-400 truncate">{item.description}</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => toggleActive(item)} title={item.isActive ? "Hide from customers" : "Show to customers"} className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                      {item.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                    <button onClick={() => setEditing({ id: item._id, item })} title="Edit" className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => removeItem(item)} title="Delete" className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
