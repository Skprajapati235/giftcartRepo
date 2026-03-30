# Giftcart Mobile

This is the Expo mobile app for your backend.

## Setup

1. Open terminal in `e:\giftcart\mobile`
2. Run `npm install`
3. Update `src/api/apiClient.js`:
   - Replace `http://10.0.2.2:5000` with your computer IP if using a physical device.
   - Example: `http://192.168.1.100:5000`
4. Start backend from `e:\giftcart\backend`:
   - `npm install`
   - `npm run dev`
5. Start Expo app:
   - `npm start`

## Features

- User register and login
- Home page shows categories and all products
- Filter products by category
- Product detail page with `Buy Now` and `Add to Cart`
- Token expiration sends user back to login
- Pink / black / white UI theme

## Backend APIs used

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/category`
- `GET /api/product`
