"use client";

import React, { useState, useMemo } from "react";
import {
  Upload,
  X,
  Plus,
  Trash2,
  ClipboardPaste,
  ArrowUpDown,
  FileText,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { useAdmin } from "../../context/AdminContext";
import MediaModal from "../ui/MediaModal";
import { useToast } from "../../../context/ToastContext";

interface AddEditCityProps {
  city: any;
  onClose: () => void;
}

/**
 * Splits raw text by commas, newlines, or semicolons,
 * trims each entry, and removes empty strings.
 */
function parseCityString(raw: string): string[] {
  if (!raw) return [];
  return raw
    .split(/[,\n\r;]+/)
    .map((c) => c.trim())
    .filter(Boolean);
}

/**
 * Merges a list of cities into an existing list, deduplicating case-insensitively.
 */
function mergeCities(
  existingList: string[],
  newCities: string[]
): { updated: string[]; addedCount: number; duplicateCount: number } {
  const seen = new Set<string>();
  const result: string[] = [];

  // First, add existing non-empty cities
  for (const item of existingList) {
    const trimmed = item.trim();
    const lower = trimmed.toLowerCase();
    if (trimmed && !seen.has(lower)) {
      seen.add(lower);
      result.push(trimmed);
    }
  }

  let addedCount = 0;
  let duplicateCount = 0;

  for (const item of newCities) {
    const trimmed = item.trim();
    const lower = trimmed.toLowerCase();
    if (!trimmed) continue;
    if (seen.has(lower)) {
      duplicateCount++;
    } else {
      seen.add(lower);
      result.push(trimmed);
      addedCount++;
    }
  }

  return {
    updated: result.length > 0 ? result : [""],
    addedCount,
    duplicateCount,
  };
}

export default function AddEditCity({ city, onClose }: AddEditCityProps) {
  const { createCity, updateCity } = useAdmin();
  const { showToast } = useToast();

  const [stateName, setStateName] = useState(city?.state || "");
  const [image, setImage] = useState(city?.image || "");
  const [cityInputs, setCityInputs] = useState<string[]>(
    city?.cities?.length ? city.cities : [""]
  );
  const [saving, setSaving] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);

  // Bulk paste state
  const [showBulkBox, setShowBulkBox] = useState(false);
  const [bulkText, setBulkText] = useState("");

  const detectedBulkCities = useMemo(() => parseCityString(bulkText), [bulkText]);

  // Handle single input field change:
  // If user types or mobile-pastes text containing commas, automatically split!
  const handleCityChange = (index: number, value: string) => {
    if (value.includes(",") || value.includes("\n") || value.includes(";")) {
      const parsed = parseCityString(value);
      if (parsed.length > 1) {
        setCityInputs((prev) => {
          const next = [...prev];
          next.splice(index, 1, ...parsed);
          const { updated, addedCount } = mergeCities([], next);
          showToast(`Extracted ${addedCount} cities from comma-separated input`, "success");
          return updated;
        });
        return;
      }
    }
    setCityInputs((prev) => prev.map((item, idx) => (idx === index ? value : item)));
  };

  // Intercept paste event on ANY city input field:
  // If the pasted clipboard content has commas or newlines, split it immediately into separate cards!
  const handleCityPaste = (
    index: number,
    e: React.ClipboardEvent<HTMLInputElement>
  ) => {
    const pastedText = e.clipboardData.getData("text");
    if (!pastedText) return;

    if (
      pastedText.includes(",") ||
      pastedText.includes("\n") ||
      pastedText.includes(";")
    ) {
      e.preventDefault();
      const parsed = parseCityString(pastedText);
      if (parsed.length === 0) return;

      setCityInputs((prev) => {
        const next = [...prev];
        // If current row is empty, replace it with the first parsed city
        if (!next[index] || next[index].trim() === "") {
          next.splice(index, 1, ...parsed);
        } else {
          // If current row has content, insert right after
          next.splice(index + 1, 0, ...parsed);
        }

        const { updated, addedCount, duplicateCount } = mergeCities([], next);
        if (duplicateCount > 0) {
          showToast(
            `Added ${addedCount} cities (${duplicateCount} duplicate(s) skipped)`,
            "info"
          );
        } else {
          showToast(`Added ${addedCount} cities from clipboard!`, "success");
        }
        return updated;
      });
    }
  };

  const handleCityKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      // Add a new empty field right after or at the bottom
      setCityInputs((prev) => {
        const next = [...prev];
        next.splice(index + 1, 0, "");
        return next;
      });
    }
  };

  const addCityField = () => {
    setCityInputs((prev) => [...prev, ""]);
  };

  const removeCityField = (index: number) => {
    setCityInputs((prev) => {
      const next = prev.filter((_, idx) => idx !== index);
      return next.length > 0 ? next : [""];
    });
  };

  // Bulk add actions
  const handleApplyBulkAdd = () => {
    if (detectedBulkCities.length === 0) return;

    // Filter out existing blank inputs if only 1 blank exists
    const baseList =
      cityInputs.length === 1 && !cityInputs[0].trim() ? [] : cityInputs;

    const { updated, addedCount, duplicateCount } = mergeCities(
      baseList,
      detectedBulkCities
    );

    setCityInputs(updated);
    setBulkText("");
    setShowBulkBox(false);

    if (duplicateCount > 0) {
      showToast(
        `Added ${addedCount} cities (${duplicateCount} duplicate(s) skipped)`,
        "success"
      );
    } else {
      showToast(`Added ${addedCount} cities to list!`, "success");
    }
  };

  const handleReplaceWithBulk = () => {
    if (detectedBulkCities.length === 0) return;
    const { updated, addedCount } = mergeCities([], detectedBulkCities);
    setCityInputs(updated);
    setBulkText("");
    setShowBulkBox(false);
    showToast(`List replaced with ${addedCount} cities!`, "success");
  };

  // Helper utilities
  const handleSortAZ = () => {
    const cleaned = cityInputs.map((c) => c.trim()).filter(Boolean);
    if (cleaned.length <= 1) return;
    cleaned.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
    setCityInputs(cleaned);
    showToast("Cities sorted alphabetically A-Z", "info");
  };

  const handleRemoveDuplicates = () => {
    const { updated, duplicateCount } = mergeCities([], cityInputs);
    setCityInputs(updated);
    if (duplicateCount > 0) {
      showToast(`Removed ${duplicateCount} duplicate cities`, "success");
    } else {
      showToast("No duplicates found", "info");
    }
  };

  const handleClearAll = () => {
    const count = cityInputs.filter((c) => c.trim()).length;
    if (count === 0) return;
    if (window.confirm(`Clear all ${count} cities from this state?`)) {
      setCityInputs([""]);
      showToast("City list cleared", "info");
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Final safety: parse all comma/newline separated entries across all inputs
    const parsedCities: string[] = [];
    const seen = new Set<string>();

    cityInputs.forEach((raw) => {
      parseCityString(raw).forEach((c) => {
        const lower = c.toLowerCase();
        if (!seen.has(lower)) {
          seen.add(lower);
          parsedCities.push(c);
        }
      });
    });

    if (!stateName.trim()) {
      showToast("Please enter a state name", "error");
      return;
    }

    if (parsedCities.length === 0) {
      showToast("Please add at least one city", "error");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        state: stateName.trim(),
        cities: parsedCities,
        image,
      };

      if (city?._id) {
        await updateCity(city._id, payload);
        showToast("City group updated successfully", "success");
      } else {
        await createCity(payload);
        showToast("City group created successfully", "success");
      }
      onClose();
    } catch (err) {
      console.error("Error saving city group.", err);
      showToast("Failed to save city group", "error");
    } finally {
      setSaving(false);
    }
  };

  const activeCitiesCount = cityInputs.filter((c) => c.trim()).length;

  return (
    <section className="bg-card rounded-3xl border border-border-theme p-6 sm:p-8 shadow-sm">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            {city?._id ? "Update City Group" : "New City Group"}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Group delivery cities under a state/region for checkout & fulfillment
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition p-2 rounded-xl hover:bg-hover-theme cursor-pointer"
        >
          <X size={20} />
        </button>
      </div>

      <form className="grid gap-8" onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              State / Region Name <span className="text-rose-500">*</span>
            </label>
            <input
              value={stateName}
              onChange={(e) => setStateName(e.target.value)}
              placeholder="e.g. Maharashtra, Rajasthan, Delhi NCR..."
              className="w-full rounded-2xl border border-border-theme bg-background px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition font-medium text-slate-900 dark:text-white"
              required
            />
            <p className="text-[11px] text-slate-400 mt-1.5">
              Customers will see delivery coverage categorized under this state.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              State Banner / Icon (Optional)
            </label>
            <div className="relative aspect-[3/1] sm:aspect-video w-full rounded-2xl border-2 border-dashed border-border-theme bg-background flex flex-col items-center justify-center overflow-hidden group">
              {image ? (
                <>
                  <img
                    src={image}
                    alt={stateName || "State preview"}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowMediaModal(true)}
                      className="cursor-pointer bg-white text-slate-900 px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-md hover:bg-slate-100 transition"
                    >
                      Change
                    </button>
                    <button
                      type="button"
                      onClick={() => setImage("")}
                      className="cursor-pointer bg-rose-600 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-md hover:bg-rose-700 transition"
                    >
                      Remove
                    </button>
                  </div>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowMediaModal(true)}
                  className="cursor-pointer flex flex-col items-center gap-2 text-slate-400 hover:text-primary transition py-4"
                >
                  <Upload size={24} />
                  <span className="text-xs font-bold text-primary">
                    Upload or Select Image
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Cities Section ── */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-border-theme/60 pt-6">
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Covered Cities
                </h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                  {activeCitiesCount} {activeCitiesCount === 1 ? "City" : "Cities"}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Paste comma-separated cities or add individual fields below.
              </p>
            </div>

            {/* Action Buttons Toolbar */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setShowBulkBox((prev) => !prev)}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition shadow-sm cursor-pointer border ${
                  showBulkBox
                    ? "bg-primary text-white border-primary"
                    : "bg-primary/10 text-primary border-primary/20 hover:bg-primary/15"
                }`}
                title="Paste multiple comma-separated cities at once"
              >
                <ClipboardPaste size={14} />
                <span>{showBulkBox ? "Hide Bulk Paste" : "Paste Multiple (Bulk)"}</span>
              </button>

              <button
                type="button"
                onClick={addCityField}
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-bold text-white hover:opacity-90 transition shadow-sm cursor-pointer"
              >
                <Plus size={14} />
                <span>Add Single</span>
              </button>

              {activeCitiesCount > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handleSortAZ}
                    className="inline-flex items-center gap-1 rounded-xl border border-border-theme bg-background px-2.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-hover-theme transition cursor-pointer"
                    title="Sort cities alphabetically"
                  >
                    <ArrowUpDown size={13} />
                    <span>A-Z</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleRemoveDuplicates}
                    className="inline-flex items-center gap-1 rounded-xl border border-border-theme bg-background px-2.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-hover-theme transition cursor-pointer"
                    title="Deduplicate city names"
                  >
                    <Sparkles size={13} />
                    <span>Dedupe</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="inline-flex items-center gap-1 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20 px-2.5 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-100/50 transition cursor-pointer"
                    title="Clear all cities"
                  >
                    <Trash2 size={13} />
                    <span>Clear</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* ── DEDICATED BULK PASTE BOX ── */}
          {showBulkBox && (
            <div className="rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 p-4 sm:p-5 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-primary" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Paste Multiple Cities (Comma or Line Separated)
                  </span>
                </div>
                {detectedBulkCities.length > 0 && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-primary text-white shadow-xs">
                    <CheckCircle2 size={12} />
                    {detectedBulkCities.length}{" "}
                    {detectedBulkCities.length === 1 ? "city" : "cities"} ready
                  </span>
                )}
              </div>

              <textarea
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder="Paste cities here copied from Excel, Google Docs, WhatsApp, or anywhere!&#10;e.g. Mumbai, Pune, Nagpur, Nashik, Aurangabad, Solapur, Kolhapur, Thane, Navi Mumbai"
                rows={3}
                className="w-full rounded-xl border border-border-theme bg-background px-3.5 py-2.5 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 outline-none transition resize-y leading-relaxed"
                autoFocus
              />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
                <p className="text-[11px] text-slate-500">
                  ⚡ Supported separators: comma (<code className="text-primary font-bold">,</code>), newline, or semicolon (<code className="text-primary font-bold">;</code>). Duplicate cities are skipped automatically.
                </p>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setBulkText("");
                      setShowBulkBox(false);
                    }}
                    className="px-3 py-1.5 rounded-xl border border-border-theme bg-background text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-hover-theme transition cursor-pointer"
                  >
                    Cancel
                  </button>

                  {cityInputs.some((c) => c.trim()) && detectedBulkCities.length > 0 && (
                    <button
                      type="button"
                      onClick={handleReplaceWithBulk}
                      className="px-3.5 py-1.5 rounded-xl border border-amber-300 bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs font-bold hover:bg-amber-500/20 transition cursor-pointer"
                    >
                      Replace List
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleApplyBulkAdd}
                    disabled={detectedBulkCities.length === 0}
                    className="px-4 py-1.5 rounded-xl bg-primary text-white text-xs font-bold hover:opacity-90 disabled:opacity-40 transition shadow-sm cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus size={14} />
                    <span>
                      Add {detectedBulkCities.length > 0 ? `(${detectedBulkCities.length})` : ""} Cities
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── CITY INPUTS GRID ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {cityInputs.map((value, index) => (
              <div
                key={index}
                className="flex items-center gap-2 rounded-2xl border border-border-theme bg-background p-2 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/40 transition group"
              >
                <span className="flex-shrink-0 w-7 h-7 rounded-xl bg-hover-theme flex items-center justify-center text-[11px] font-bold text-slate-500">
                  {index + 1}
                </span>

                <input
                  value={value}
                  onChange={(e) => handleCityChange(index, e.target.value)}
                  onPaste={(e) => handleCityPaste(index, e)}
                  onKeyDown={(e) => handleCityKeyDown(index, e)}
                  placeholder="City name or paste comma-separated..."
                  className="flex-1 bg-transparent px-2 py-1 text-xs sm:text-sm outline-none font-medium text-slate-900 dark:text-white placeholder:text-slate-400 placeholder:text-xs"
                />

                {cityInputs.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeCityField(index)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition flex-shrink-0 cursor-pointer opacity-70 group-hover:opacity-100"
                    title="Remove city"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* ── BOTTOM DUAL ACTION BAR ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              onClick={addCityField}
              className="w-full py-3 border-2 border-dashed border-border-theme hover:border-primary text-slate-700 dark:text-slate-200 hover:text-primary hover:bg-primary/5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Plus size={16} />
              <span>Add Another City</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setShowBulkBox(true);
                window.scrollTo({ top: 300, behavior: "smooth" });
              }}
              className="w-full py-3 border-2 border-dashed border-primary/30 hover:border-primary text-primary hover:bg-primary/10 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer bg-primary/5"
            >
              <ClipboardPaste size={16} />
              <span>Paste Multiple Cities (Comma-Separated)</span>
            </button>
          </div>
        </div>

        {/* ── FORM FOOTER ── */}
        <div className="pt-4 border-t border-border-theme flex flex-col sm:flex-row items-center justify-end gap-3 md:col-span-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-32 border border-border-theme text-slate-700 dark:text-slate-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold hover:bg-hover-theme transition text-center cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-40 bg-primary text-white rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold hover:opacity-90 transition shadow-lg shadow-primary/20 disabled:opacity-50 text-center cursor-pointer flex items-center justify-center gap-2"
          >
            {saving ? (
              <span>Saving...</span>
            ) : (
              <span>{city?._id ? "Update City Group" : "Create City Group"}</span>
            )}
          </button>
        </div>
      </form>

      {showMediaModal && (
        <MediaModal
          onClose={() => setShowMediaModal(false)}
          onSelect={(url) => setImage(url as string)}
          multiple={false}
        />
      )}
    </section>
  );
}
