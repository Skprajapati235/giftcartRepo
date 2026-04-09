# Implementation Plan - Coupon & Offer System

This plan outlines the implementation of a Coupon and Offer system to allow users to get discounts on their orders using promo codes.

## User Review Required

> [!IMPORTANT]
> Please confirm if you want "Category-specific" coupons or just global "Cart-wide" coupons for the initial version. This plan assumes global coupons for simplicity.

> [!NOTE]
> We will implement both Percentage-based (e.g., 10% off) and Fixed-amount (e.g., ₹100 off) discounts.

## Proposed Changes

### Backend (Node.js/Express)

#### [NEW] [Coupon.js](file:///e:/giftcart/backend/models/Coupon.js)
Define the schema for storing coupons:
- `code` (String, unique)
- `discountType` ('percentage' | 'fixed')
- `discountValue` (Number)
- `minOrderAmount` (Number)
- `maxDiscount` (Number, for percentage types)
- `expiryDate` (Date)
- `isActive` (Boolean)
- `usageLimit` (Number)
- `usedCount` (Number)

#### [MODIFY] [Order.js](file:///e:/giftcart/backend/models/Order.js)
Update the Order model to track applied discounts:
- `appliedCoupon`: String
- `couponDiscount`: Number

#### [NEW] [couponService.js](file:///e:/giftcart/backend/services/couponService.js)
Handel CRUD and validation:
- `validateCoupon(code, amount)`: Checks validity, expiry, and conditions.

#### [NEW] [couponRoutes.js](file:///e:/giftcart/backend/routes/couponRoutes.js)
- `POST /api/coupons/validate`: For mobile app to check before checkout.
- `GET/POST/PUT/DELETE /api/admin/coupons`: For admin panel.

---

### Admin Panel (Next.js)

#### [NEW] [Coupons Page](file:///e:/giftcart/admin-panel/admin-panel/src/app/coupons/page.tsx)
A dedicated management page with:
- A table listing all active/expired coupons.
- A "Create Coupon" modal with validation (expiry date, code generation).
- Status toggle (Active/Inactive).

#### [NEW] [Coupon Service](file:///e:/giftcart/admin-panel/admin-panel/src/app/services/couponService.ts)
Frontend service to communicate with the new backend routes.

---

### Mobile Application (React Native)

#### [MODIFY] [CheckoutScreen.js](file:///e:/giftcart/mobile/src/screens/CheckoutScreen.js)
- Add a "Apply Coupon" section below the order summary.
- Input field for entering the code.
- "Apply" button that hits the validation API.
- Dynamic price update (Grand Total should recalculate based on discount).
- Visual feedback (Success/Error toasts).

---

## Verification Plan

### Automated Tests
- Postman tests for `POST /api/coupons/validate` with:
    - Valid coupon.
    - Expired coupon.
    - Coupon with order value below `minOrderAmount`.
    - Non-existent coupon.

### Manual Verification
1. Create a 10% coupon in the Admin Panel.
2. Open the Mobile App and go to Checkout with ₹1000 items.
3. Apply the coupon; verify Grand Total becomes ₹900.
4. Complete order and verify `couponDiscount` is saved in the database.
5. Try using the same coupon again if `usageLimit` is 1; verify it fails.
