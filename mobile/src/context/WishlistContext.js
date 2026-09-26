import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { AuthContext } from './AuthContext';
import wishlistService from '../services/wishlistService';

export const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [wishlistMap, setWishlistMap] = useState({});
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setWishlistMap({});
      return;
    }
    setLoading(true);
    try {
      const data = await wishlistService.getWishlist();
      const list = Array.isArray(data) ? data : data?.data || [];
      const map = {};
      list.forEach((item) => {
        const productId = item.product?._id || item.product;
        if (productId) map[productId] = item._id;
      });
      setWishlistMap(map);
    } catch {
      // Non-fatal — hearts stay outline until next successful refresh
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const isWishlisted = (productId) => Boolean(wishlistMap[productId]);

  const toggleWishlist = async (productId) => {
    const wasWishlisted = isWishlisted(productId);

    // Optimistic update
    setWishlistMap((prev) => {
      const next = { ...prev };
      if (wasWishlisted) delete next[productId];
      else next[productId] = 'pending';
      return next;
    });

    try {
      const res = await wishlistService.toggleWishlist(productId);
      const added = res?.status === 'added';
      setWishlistMap((prev) => {
        const next = { ...prev };
        if (added) next[productId] = res?.item?._id || 'added';
        else delete next[productId];
        return next;
      });
      return added;
    } catch (err) {
      // Revert on failure
      setWishlistMap((prev) => {
        const next = { ...prev };
        if (wasWishlisted) next[productId] = 'pending';
        else delete next[productId];
        return next;
      });
      throw err;
    }
  };

  return (
    <WishlistContext.Provider value={{ wishlistMap, loading, isWishlisted, toggleWishlist, refresh }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within WishlistProvider');
  return context;
};

export default WishlistContext;
