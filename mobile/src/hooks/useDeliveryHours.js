import { useState, useEffect, useCallback } from 'react';
import deliveryHoursService from '../services/deliveryHoursService';

export default function useDeliveryHours() {
  const [deliveryStatus, setDeliveryStatus] = useState({
    isRestricted: false,
    isCurrentlyRestricted: false,
    nextAvailableTime: null,
    formattedEnd: '7:00 AM',
    message: 'Delivery is operating normally.',
    blockOrders: false,
    allowBrowsing: true,
    loading: true,
  });

  const fetchStatus = useCallback(async () => {
    try {
      const res = await deliveryHoursService.getDeliveryHours();
      if (res?.data) {
        setDeliveryStatus({
          ...res.data,
          loading: false,
        });
      } else {
        setDeliveryStatus((prev) => ({ ...prev, loading: false }));
      }
    } catch (err) {
      setDeliveryStatus((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    // Periodically re-evaluate every 2 minutes in case time crosses threshold
    const interval = setInterval(fetchStatus, 120000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  return {
    ...deliveryStatus,
    refresh: fetchStatus,
  };
}
