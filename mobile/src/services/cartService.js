import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/apiClient';

// ─────────────────────────────────────────────────────────────
// Same contract as the website's cartService: this file never
// computes price, discount, tax or totals — it only decides WHERE
// the cart list is stored (server for logged-in users, a small
// local list for guests) and always prices it through the backend.
// ─────────────────────────────────────────────────────────────

const GUEST_CART_KEY = '@giftcart_cart_guest';
const TOKEN_KEY = '@giftcart_token';

const emptyTotals = () => ({
  subTotal: 0,
  totalDiscount: 0,
  totalTax: 0,
  totalShipping: 0,
  grandTotal: 0,
  totalQuantity: 0,
});

const isLoggedIn = async () => {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  return !!token;
};

const getGuestLines = async () => {
  try {
    const raw = await AsyncStorage.getItem(GUEST_CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveGuestLines = async (lines) => {
  await AsyncStorage.setItem(GUEST_CART_KEY, JSON.stringify(lines));
};

const lineKey = (line) =>
  [line.productId, line.weight || '', line.flowerCount || '', line.flavor?._id || line.flavor || '', line.isEggless ? 'eggless' : 'regular'].join('|');

const quoteGuestCart = async () => {
  const lines = await getGuestLines();
  if (lines.length === 0) return { items: [], totals: emptyTotals() };
  const { data } = await api.post('/cart/quote', { items: lines });
  return { items: data.items, totals: data.totals };
};

const getCart = async () => {
  if (await isLoggedIn()) {
    const { data } = await api.get('/cart');
    return { items: data.items, totals: data.totals };
  }
  return quoteGuestCart();
};

const addToCart = async (product, quantity = 1, selectedVariant = null) => {
  const payload = {
    productId: product._id,
    quantity,
    weight: selectedVariant?.weight || product.weight || null,
    flowerCount: selectedVariant?.flowerCount || product.flowerCount || null,
    flavor: product.flavor?._id || product.flavor || null,
    isEggless: Boolean(selectedVariant?.isEggless),
  };

  if (await isLoggedIn()) {
    const { data } = await api.post('/cart/add', payload);
    return { items: data.items, totals: data.totals };
  }

  const lines = await getGuestLines();
  const key = lineKey(payload);
  const existing = lines.find((l) => lineKey(l) === key);
  if (existing) {
    existing.quantity += quantity;
  } else {
    lines.push(payload);
  }
  await saveGuestLines(lines);
  return quoteGuestCart();
};

const updateQuantity = async (quantity, { itemId, productId, variantKey }) => {
  if (await isLoggedIn()) {
    if (!itemId) throw new Error('itemId is required to update a server cart line');
    const { data } = await api.put(`/cart/item/${itemId}`, { quantity });
    return { items: data.items, totals: data.totals };
  }

  const lines = await getGuestLines();
  const next = lines
    .map((l) => {
      const matches = variantKey ? lineKey(l) === variantKey : l.productId === productId;
      if (!matches) return l;
      return quantity > 0 ? { ...l, quantity } : null;
    })
    .filter(Boolean);
  await saveGuestLines(next);
  return quoteGuestCart();
};

const removeFromCart = async ({ itemId, productId, variantKey }) => {
  if (await isLoggedIn()) {
    if (!itemId) throw new Error('itemId is required to remove a server cart line');
    const { data } = await api.delete(`/cart/item/${itemId}`);
    return { items: data.items, totals: data.totals };
  }

  const lines = (await getGuestLines()).filter((l) =>
    variantKey ? lineKey(l) !== variantKey : l.productId !== productId
  );
  await saveGuestLines(lines);
  return quoteGuestCart();
};

const clearCart = async () => {
  if (await isLoggedIn()) {
    const { data } = await api.delete('/cart/clear');
    return { items: data.items, totals: data.totals };
  }
  await saveGuestLines([]);
  return { items: [], totals: emptyTotals() };
};

// Called once right after login/register so a cart built up while
// browsing as a guest is not lost.
const mergeGuestCartIntoAccount = async () => {
  const lines = await getGuestLines();
  if (lines.length === 0) return null;
  const { data } = await api.post('/cart/merge', { items: lines });
  await saveGuestLines([]);
  return { items: data.items, totals: data.totals };
};

export default {
  getCart,
  addToCart,
  updateQuantity,
  removeFromCart,
  clearCart,
  mergeGuestCartIntoAccount,
};
