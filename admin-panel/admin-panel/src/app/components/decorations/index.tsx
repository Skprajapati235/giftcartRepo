"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Sparkles, Calendar, Plus, Layers, Building } from "lucide-react";
import DecorationBookingsView from "./DecorationBookingsView";
import DecorationPackagesView from "./DecorationPackagesView";
import AddEditDecorationPackage from "./addEditDecorationPackage";
import DeleteModal from "../ui/DeleteModal";
import * as service from "../../services/adminService";
import { useToast } from "../../../context/ToastContext";

export default function DecorationsManagerView() {
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<"bookings" | "packages">("bookings");

  // Bookings state
  const [bookings, setBookings] = useState<any[]>([]);
  const [bookingStats, setBookingStats] = useState<any>({});
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [bookingSearch, setBookingSearch] = useState("");

  // Packages state
  const [packages, setPackages] = useState<any[]>([]);
  const [loadingPackages, setLoadingPackages] = useState(true);

  // Single in-page Add/Edit Package state
  const [showPackageForm, setShowPackageForm] = useState(false);
  const [editingPackage, setEditingPackage] = useState<any>(null);

  // Delete modal state
  const [pkgToDelete, setPkgToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Partners for decorator assignment
  const [partners, setPartners] = useState<any[]>([]);

  // Fetch Bookings
  const fetchBookings = useCallback(async () => {
    setLoadingBookings(true);
    try {
      const res = await service.getDecorationBookings({
        status: statusFilter,
        search: bookingSearch.trim(),
        limit: 30,
      });
      if (res?.bookings || res?.data) {
        setBookings(res.bookings || res.data || []);
        if (res.stats) setBookingStats(res.stats);
      }
    } catch (err: any) {
      console.error("Error fetching decoration bookings:", err);
    } finally {
      setLoadingBookings(false);
    }
  }, [statusFilter, bookingSearch]);

  // Fetch Packages
  const fetchPackages = useCallback(async () => {
    setLoadingPackages(true);
    try {
      const res = await service.getDecorationPackages({ limit: 50 });
      if (res?.packages || res?.data) {
        setPackages(res.packages || res.data || []);
      }
    } catch (err: any) {
      console.error("Error fetching packages:", err);
    } finally {
      setLoadingPackages(false);
    }
  }, []);

  // Fetch Partners
  const fetchPartners = useCallback(async () => {
    try {
      const res = await service.getStores({ limit: 100 });
      if (res?.stores || res?.data) {
        setPartners(res.stores || res.data || []);
      }
    } catch (err) {
      console.error("Error fetching partners:", err);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
    fetchPackages();
    fetchPartners();
  }, [fetchBookings, fetchPackages, fetchPartners]);

  // Package Form handlers
  const openAddPackage = () => {
    setEditingPackage(null);
    setShowPackageForm(true);
  };

  const openEditPackage = (pkg: any) => {
    setEditingPackage(pkg);
    setShowPackageForm(true);
  };

  const closePackageForm = () => {
    setShowPackageForm(false);
    setEditingPackage(null);
    fetchPackages();
  };

  const confirmDeletePackage = async () => {
    if (!pkgToDelete?._id) return;
    setIsDeleting(true);
    try {
      await service.deleteDecorationPackage(pkgToDelete._id);
      showToast("Package deleted successfully", "success");
      setPkgToDelete(null);
      fetchPackages();
    } catch (err: any) {
      showToast(err?.response?.data?.message || "Failed to delete package", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* If form is open, show single-file AddEditDecorationPackage component */}
      {showPackageForm ? (
        <AddEditDecorationPackage pkg={editingPackage} onClose={closePackageForm} />
      ) : (
        <>
          {/* Main Top Nav Tabs */}
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-surface border border-border-theme max-w-fit">
            <button
              onClick={() => setActiveTab("bookings")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === "bookings"
                  ? "bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-md shadow-pink-500/20"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Building size={15} />
              <span>🎈 Live Bookings Pipeline</span>
              {bookingStats?.activeSetups > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/20 text-white">
                  {bookingStats.activeSetups}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("packages")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === "packages"
                  ? "bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-md shadow-pink-500/20"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Sparkles size={15} />
              <span>🎁 Decoration Packages ({packages.length})</span>
            </button>
          </div>

          {/* Active Tab Content */}
          {activeTab === "bookings" ? (
            <DecorationBookingsView
              bookings={bookings}
              partners={partners}
              loading={loadingBookings}
              stats={bookingStats}
              statusFilter={statusFilter}
              search={bookingSearch}
              onStatusChange={setStatusFilter}
              onSearchChange={setBookingSearch}
              onRefresh={fetchBookings}
            />
          ) : (
            <DecorationPackagesView
              packages={packages}
              loading={loadingPackages}
              onAdd={openAddPackage}
              onEdit={openEditPackage}
              onDelete={setPkgToDelete}
            />
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      {pkgToDelete && (
        <DeleteModal
          isOpen={Boolean(pkgToDelete)}
          onClose={() => setPkgToDelete(null)}
          onConfirm={confirmDeletePackage}
          title="Delete Decoration Package"
          description={`Are you sure you want to delete "${pkgToDelete.title}"?`}
          itemName={pkgToDelete.title}
          isLoading={isDeleting}
        />
      )}
    </div>
  );
}
