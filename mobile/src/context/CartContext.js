import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import cartService from '../services/cartService';
import { useToast } from './ToastContext';
import { AuthContext } from './AuthContext';

const emptyTotals = {
  subTotal: 0,
  totalDiscount: 0,
  totalTax: 0,
  totalShipping: 0,
  grandTotal: 0,
  totalQuantity: 0,
};

export const CartContext = createContext(undefined);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [totals, setTotals] = useState(emptyTotals);
  const [cartLoading, setCartLoading] = useState(true);
  const { showToast } = useToast();
  const { user, loading: authLoading } = useContext(AuthContext);
  const mergedForUser = useRef(null);

  const refreshCart = useCallback(async () => {
    setCartLoading(true);
    try {
      const priced = await cartService.getCart();
      setCart(priced.items);
      setTotals(priced.totals);
    } catch (err) {
      console.warn('Failed to load cart', err);
    } finally {
      setCartLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    refreshCart();
  }, [authLoading, user?._id, user?.id, refreshCart]);

  useEffect(() => {
    const userId = user?._id || user?.id;
    if (authLoading || !userId || mergedForUser.current === userId) return;
    mergedForUser.current = userId;

    cartService.mergeGuestCartIntoAccount().then((merged) => {
      if (merged) {
        setCart(merged.items);
        setTotals(merged.totals);
      }
    }).catch((err) => console.warn('Cart merge failed', err));
  }, [authLoading, user?._id, user?.id]);

  const addToCart = async (product, quantity = 1, selectedVariant = null) => {
    try {
      const priced = await cartService.addToCart(product, quantity, selectedVariant);
      setCart(priced.items);
      setTotals(priced.totals);
      showToast('Added to cart', 'success');
    } catch (err) {
      showToast(err?.response?.data?.message || 'Could not add to cart', 'error');
    }
  };

  const removeFromCart = async (item) => {
    try {
      const priced = await cartService.removeFromCart({ itemId: item._id, productId: item.product, variantKey: item.variantKey });
      setCart(priced.items);
      setTotals(priced.totals);
      showToast('Item removed from cart', 'success');
    } catch (err) {
      showToast(err?.response?.data?.message || 'Could not remove item', 'error');
    }
  };

  const updateQuantity = async (item, quantity) => {
    try {
      const priced = await cartService.updateQuantity(quantity, {
        itemId: item._id,
        productId: item.product,
        variantKey: item.variantKey,
      });
      setCart(priced.items);
      setTotals(priced.totals);
    } catch (err) {
      showToast(err?.response?.data?.message || 'Could not update quantity', 'error');
    }
  };

  const clearCart = async () => {
    const priced = await cartService.clearCart();
    setCart(priced.items);
    setTotals(priced.totals);
  };

  const getCartTotal = () => totals.grandTotal;

  return (
    <CartContext.Provider
      value={{ cart, totals, cartLoading, addToCart, removeFromCart, updateQuantity, clearCart, getCartTotal, refreshCart }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
