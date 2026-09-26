import { useState, useEffect, useCallback, useMemo } from 'react';
import deliveryHoursService from '../services/deliveryHoursService';

const DEFAULT_HOURS = {
  isRestricted: false,
  isCurrentlyRestricted: false,
  dailyStart: '23:00',
  dailyEnd: '07:00',
  nextAvailableTime: null,
  formattedEnd: '7:00 AM',
  formattedStart: '11:00 PM',
  message: 'Delivery is operating normally.',
  blockOrders: false,
  allowBrowsing: true,
  loading: true,
};

function formatTime12h(timeStr) {
  if (!timeStr) return '7:00 AM';
  const [hStr, mStr] = String(timeStr).split(':');
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr || '0', 10);
  if (isNaN(h)) return timeStr;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  const minuteStr = m < 10 ? `0${m}` : `${m}`;
  return `${hour12}:${minuteStr} ${ampm}`;
}

export function getISTMinutesNow() {
  try {
    const formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    const parts = formatter.formatToParts(new Date());
    const h = parseInt(parts.find((p) => p.type === 'hour')?.value || '0', 10);
    const m = parseInt(parts.find((p) => p.type === 'minute')?.value || '0', 10);
    return h * 60 + m;
  } catch (e) {
    const d = new Date();
    // UTC to IST (+5:30)
    const utcMins = d.getUTCHours() * 60 + d.getUTCMinutes();
    return (utcMins + 330) % 1440;
  }
}

export function isRestrictedAtMinutes(startStr, endStr, nowMins) {
  const [sH, sM] = String(startStr || '23:00').split(':').map(Number);
  const [eH, eM] = String(endStr || '07:00').split(':').map(Number);
  const startMins = (isNaN(sH) ? 23 : sH) * 60 + (isNaN(sM) ? 0 : sM);
  const endMins = (isNaN(eH) ? 7 : eH) * 60 + (isNaN(eM) ? 0 : eM);

  if (startMins > endMins) {
    // Spans midnight, e.g. 23:00 (11 PM) to 07:00 (7 AM)
    return nowMins >= startMins || nowMins < endMins;
  } else if (startMins < endMins) {
    // Same day, e.g. 14:00 to 18:00
    return nowMins >= startMins && nowMins < endMins;
  }
  return false;
}

// Module-level shared singleton cache to keep all components synchronized
let cachedRawStatus = DEFAULT_HOURS;
let listeners = new Set();
let isFetching = false;

async function fetchSharedDeliveryHours() {
  if (isFetching) return;
  isFetching = true;
  try {
    const res = await deliveryHoursService.getDeliveryHours();
    if (res?.data) {
      cachedRawStatus = {
        ...DEFAULT_HOURS,
        ...res.data,
        loading: false,
      };
    } else {
      cachedRawStatus = { ...cachedRawStatus, loading: false };
    }
  } catch (err) {
    cachedRawStatus = { ...cachedRawStatus, loading: false };
  } finally {
    isFetching = false;
    listeners.forEach((listener) => listener(cachedRawStatus));
  }
}

export default function useDeliveryHours() {
  const [rawStatus, setRawStatus] = useState(cachedRawStatus);
  const [nowMins, setNowMins] = useState(() => getISTMinutesNow());

  useEffect(() => {
    listeners.add(setRawStatus);
    if (cachedRawStatus.loading && !isFetching) {
      fetchSharedDeliveryHours();
    }
    return () => {
      listeners.delete(setRawStatus);
    };
  }, []);

  // Update IST clock every 2 seconds for smooth real-time transition
  useEffect(() => {
    const timer = setInterval(() => {
      setNowMins(getISTMinutesNow());
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  // Poll backend every 2 minutes
  useEffect(() => {
    const pollInterval = setInterval(() => {
      fetchSharedDeliveryHours();
    }, 120000);
    return () => clearInterval(pollInterval);
  }, []);

  const computedStatus = useMemo(() => {
    const isConfigured = Boolean(rawStatus.isRestricted);
    const isCurrentlyRestricted = isConfigured
      ? isRestrictedAtMinutes(rawStatus.dailyStart, rawStatus.dailyEnd, nowMins)
      : false;

    // Block orders whenever delivery is currently restricted
    const blockOrders = isCurrentlyRestricted;
    const formattedEnd = formatTime12h(rawStatus.dailyEnd || '07:00');
    const formattedStart = formatTime12h(rawStatus.dailyStart || '23:00');

    let resumeTimeLabel = rawStatus.nextAvailableTime;
    if (!resumeTimeLabel) {
      const [sH] = String(rawStatus.dailyStart || '23:00').split(':').map(Number);
      const [eH] = String(rawStatus.dailyEnd || '07:00').split(':').map(Number);
      if (sH > eH && nowMins >= sH * 60) {
        resumeTimeLabel = `Tomorrow at ${formattedEnd}`;
      } else {
        resumeTimeLabel = `Today at ${formattedEnd}`;
      }
    }

    const activeMessage = isCurrentlyRestricted
      ? (rawStatus.message || rawStatus.customMessage || `Night delivery is currently paused. Deliveries resume after ${resumeTimeLabel}.`)
      : 'Delivery is operating normally.';

    return {
      ...rawStatus,
      isCurrentlyRestricted,
      blockOrders,
      formattedEnd,
      formattedStart,
      resumeTimeLabel,
      message: activeMessage,
      loading: rawStatus.loading,
      refresh: fetchSharedDeliveryHours,
    };
  }, [rawStatus, nowMins]);

  return computedStatus;
}
