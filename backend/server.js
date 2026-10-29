// const express = require("express");
// const cors = require("cors");
// const axios = require("axios");
// require("dotenv").config();

// const PORT = process.env.PORT || 5000;
// const connectDB = require("./config/db");
// const authMiddleware = require("./middleware/authMiddleware");
// const adminMiddleware = require("./middleware/adminMiddleware");

// const app = express();

// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// connectDB();

// app.get("/", (req, res) => {
//   res.send("Backend is Live 🚀");
// });

// // Customer tracking page (token-based deep link)
// app.get("/track/:token", (req, res) => {
//   const { token } = req.params;
//   const safeToken = String(token || "").replace(/[^a-fA-F0-9]/g, "");

//   res.setHeader("Content-Type", "text/html; charset=utf-8");
//   res.send(`<!doctype html>
// <html lang="en">
//   <head>
//     <meta charset="utf-8" />
//     <meta name="viewport" content="width=device-width,initial-scale=1" />
//     <title>Track your order</title>
//     <style>
//       :root { color-scheme: light dark; }
//       body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; margin: 24px; }
//       .card { max-width: 720px; margin: 0 auto; border: 1px solid rgba(127,127,127,.3); border-radius: 12px; padding: 16px; }
//       .muted { opacity: .75; }
//       .row { display: flex; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
//       .status { font-weight: 700; }
//       ul { padding-left: 18px; }
//       code { padding: 2px 6px; border-radius: 6px; background: rgba(127,127,127,.15); }
//     </style>
//   </head>
//   <body>
//     <div class="card">
//       <div class="row">
//         <h2 style="margin:0">Track your order</h2>
//         <div class="muted">Giftcart</div>
//       </div>
//       <p class="muted" style="margin-top:8px">Token: <code id="token"></code></p>
//       <p id="loading">Loading…</p>
//       <div id="content" style="display:none">
//         <p class="status" id="status"></p>
//         <p class="muted" id="meta"></p>
//         <h3>Items</h3>
//         <ul id="items"></ul>
//       </div>
//       <p id="error" style="display:none"></p>
//     </div>
//     <script>
//       const token = ${JSON.stringify(safeToken)};
//       document.getElementById('token').textContent = token || '(invalid)';

//       async function run() {
//         if (!token) {
//           document.getElementById('loading').style.display = 'none';
//           const el = document.getElementById('error');
//           el.style.display = 'block';
//           el.textContent = 'Invalid tracking token.';
//           return;
//         }
//         const res = await fetch('/api/order/public/' + token, { headers: { 'Accept': 'application/json' }});
//         const data = await res.json().catch(() => ({}));
//         if (!res.ok || !data || !data.success) {
//           document.getElementById('loading').style.display = 'none';
//           const el = document.getElementById('error');
//           el.style.display = 'block';
//           el.textContent = (data && data.message) ? data.message : 'Order not found.';
//           return;
//         }

//         const order = data.order;
//         document.getElementById('loading').style.display = 'none';
//         document.getElementById('content').style.display = 'block';

//         document.getElementById('status').textContent = 'Status: ' + (order.status || '—');
//         document.getElementById('meta').textContent =
//           'Order ID: ' + order._id + ' • Total: ₹' + order.totalAmount + ' • Payment: ' + (order.paymentStatus || '—');

//         const itemsEl = document.getElementById('items');
//         itemsEl.innerHTML = '';
//         (order.items || []).forEach(it => {
//           const li = document.createElement('li');
//           li.textContent = (it.name || 'Item') + ' × ' + (it.quantity || 1);
//           itemsEl.appendChild(li);
//         });
//       }
//       run();
//     </script>
//   </body>
// </html>`);
// });

// app.use("/api/auth", require("./routes/authRoutes"));
// app.use("/api/admin/auth", require("./routes/admin/authRoutes"));
// app.use("/api/category", require("./routes/categoryRoutes"));
// app.use("/api/city", require("./routes/cityRoutes"));
// app.use("/api/product", require("./routes/productRoutes"));
// app.use("/api/order", require("./routes/orderRoutes"));
// app.use("/api/review", require("./routes/reviewRoutes"));
// app.use("/api/wishlist", require("./routes/wishlistRoutes"));
// app.use("/api/upload", authMiddleware, require("./routes/uploadRoutes"));
// app.use("/api/admin/users", adminMiddleware, require("./routes/userRoutes"));
// app.use("/api/coupons", require("./routes/couponRoutes"));
// app.use("/api/flavor", require("./routes/flavorRoutes"));
// app.use("/api/occasion", require("./routes/occasionRoutes"));
// app.use("/api/website", require("./routes/werbsiteContactRoutes"));
// app.use("/api/cart", require("./routes/cartRoutes"));
// app.use("/api/inventory", require("./routes/inventoryRoutes"));
// app.use("/api/support", require("./routes/supportRoutes"));
// app.use("/api/store-settings", require("./routes/storeSettingsRoutes"));
// app.use("/api/leads", require("./routes/leadRoutes"));
// app.use("/api/crm", require("./routes/crmRoutes"));
// app.use("/api/heroslides", require("./routes/heroSlideRoutes"));
// app.use("/api/hero-slides", require("./routes/heroSlideRoutes"));
// app.use("/api/seo", require("./routes/seoRoutes"));
// app.use("/api/footer", require("./routes/footerRoutes"));
// app.use("/api/testimonials", require("./routes/testimonialRoutes"));
// app.use("/api/testimonial", require("./routes/testimonialRoutes"));
// app.use("/api/gallery", require("./routes/galleryRoutes"));
// app.use("/api/galleries", require("./routes/galleryRoutes"));
// app.use("/api/delivery-slots", require("./routes/deliverySlotRoutes"));
// app.use("/api/addons", require("./routes/addonRoutes"));
// app.use("/api/addon-categories", require("./routes/addonCategoryRoutes"));
// app.use("/api/stories", require("./routes/storyRoutes"));
// app.use("/api/audit-logs", require("./routes/auditLogRoutes"));
// app.use("/api/delivery-riders", require("./routes/deliveryRiderRoutes"));
// app.use("/api/abandoned-carts", require("./routes/abandonedCartRoutes"));
// app.use("/api/stores", require("./routes/partnerStoreRoutes"));
// app.use("/api/decoration", require("./routes/decorationRoutes"));
// app.use("/api/decorations", require("./routes/decorationRoutes"));
// app.use("/api/webhook/twilio", require("./routes/twilioWebhookRoutes"));
// app.use("/api/webhook/meta-whatsapp", require("./routes/metaWebhookRoutes"));
// // // AI Chat endpoint for Admin Panel
// // const PYTHON_AI_URL = process.env.PYTHON_AI_URL || "http://localhost:8001";
// // const AI_INTERNAL_KEY = process.env.AI_INTERNAL_KEY || "";

// // app.post("/api/ask-agent", authMiddleware, async (req, res) => {
// //   try {
// //     const { message, history } = req.body;
// //     const token = req.headers.authorization?.split(" ")[1];

// //     if (!message || !token) {
// //       return res.status(400).json({ success: false, message: "Message and authorization required" });
// //     }

// //     const response = await axios.post(
// //       `${PYTHON_AI_URL}/api/ai/chat`,
// //       { message, history: history || [] },
// //       {
// //         headers: {
// //           "Authorization": `Bearer ${token}`,
// //           "X-AI-Internal-Key": AI_INTERNAL_KEY,
// //           "Content-Type": "application/json",
// //         },
// //         timeout: 30000,
// //       }
// //     );

// //     res.json(response.data);
// //   } catch (error) {
// //     console.error("AI Chat Error:", error.message);
// //     res.status(500).json({
// //       success: false,
// //       message: error.response?.data?.detail || "AI service error",
// //       answer: "Sorry, I couldn't process that request. Please try again.",
// //     });
// //   }
// // });

// // AI Chat (Admin Panel) — chat history is stored in MongoDB (models/AiChat.js)
// const aiChatController = require("./controllers/aiChatController");
// app.post("/api/ask-agent", adminMiddleware, aiChatController.askAgent);
// app.use("/api/ai-chat", adminMiddleware, require("./routes/aiChatRoutes"));



// app.listen(PORT, () =>
//   console.log(`Server running on ${PORT}`)
// );



const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const PORT = process.env.PORT || 5000;
const connectDB = require("./config/db");
const authMiddleware = require("./middleware/authMiddleware");
const optionalAuth = require("./middleware/optionalAuth");
const adminMiddleware = require("./middleware/adminMiddleware");

const helmet = require("helmet");
const {
  apiLimiter,
  customerAuthLimiter,
  adminAuthLimiter,
  adminRefreshLimiter,
  trackingLimiter,
  orderWriteLimiter,
} = require("./middleware/rateLimiters");

const app = express();

// Render / Vercel sit behind a proxy — needed so rate limiting sees the real client IP.
app.set("trust proxy", 1);

// API server: no CSP (the tiny /track page below uses an inline script), but keep
// the other helmet protections. Cross-origin resource policy relaxed so images load.
app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: { policy: "cross-origin" } }));

// CORS: set CORS_ORIGINS="https://giftfestive.com,https://www.giftfestive.com,https://giftcart-repo.vercel.app"
// to restrict browsers to your own sites. Mobile apps send no Origin header, so they are unaffected.
// If CORS_ORIGINS is empty everything is allowed (old behaviour) — a warning is logged.
const { allowedOrigins, isOriginAllowed } = require("./utils/allowedOrigins");
if (allowedOrigins.length === 0) {
  console.warn("[security] CORS_ORIGINS is not set — allowing requests from any origin.");
}
app.use(
  cors({
    credentials: true,
    exposedHeaders: ["X-Renewed-Token"],
    origin(origin, cb) {
      if (!origin) return cb(null, true);
      if (isOriginAllowed(origin)) return cb(null, true);
      return cb(null, false);
    },
  })
);

// CSRF guard for cookie sessions (no-op for the mobile app's Authorization header)
app.use(require("./middleware/csrfGuard"));

// Keep the exact raw bytes of webhook bodies — Razorpay's signature is computed on them.
app.use(
  express.json({
    limit: "2mb",
    verify: (req, res, buf) => {
      if (req.originalUrl.startsWith("/api/webhook/")) req.rawBody = buf;
    },
  })
);
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

connectDB();

app.get("/", (req, res) => {
  res.send("Backend is Live 🚀");
});

// Lightweight health check — point UptimeRobot / Render health check here so the
// free instance stays warm and you get alerted when it is down.
app.get("/health", (req, res) => {
  const dbReady = require("mongoose").connection.readyState === 1;
  res.status(dbReady ? 200 : 503).json({ ok: dbReady, uptime: Math.round(process.uptime()) });
});

// Webhooks first (no rate limit: Razorpay/Twilio/Meta must always get through)
app.use("/api/webhook/razorpay", require("./routes/razorpayWebhookRoutes"));

// Rate limits
app.use("/api", apiLimiter);
// Only the endpoints that can be brute-forced / cost money are limited tightly.
// (The admin panel calls verify-session every 15 s and refresh every ~15 min — those must NOT be throttled like logins.)
app.use("/api/auth/send-otp", customerAuthLimiter);
app.use("/api/auth/verify-otp", customerAuthLimiter);
["login", "register", "forgot-password", "reset-password", "google-login"].forEach((p) =>
  app.use(`/api/admin/auth/${p}`, adminAuthLimiter)
);
app.use("/api/admin/auth/refresh", adminRefreshLimiter);
app.use("/api/order/public", trackingLimiter);
app.use("/api/order/create", orderWriteLimiter);
app.use("/api/order/verify", orderWriteLimiter);

// Customer tracking page (token-based deep link)
app.get("/track/:token", (req, res) => {
  const { token } = req.params;
  const safeToken = String(token || "").replace(/[^a-fA-F0-9]/g, "");

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Track your order</title>
    <style>
      :root { color-scheme: light dark; }
      body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; margin: 24px; }
      .card { max-width: 720px; margin: 0 auto; border: 1px solid rgba(127,127,127,.3); border-radius: 12px; padding: 16px; }
      .muted { opacity: .75; }
      .row { display: flex; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
      .status { font-weight: 700; }
      ul { padding-left: 18px; }
      code { padding: 2px 6px; border-radius: 6px; background: rgba(127,127,127,.15); }
    </style>
  </head>
  <body>
    <div class="card">
      <div class="row">
        <h2 style="margin:0">Track your order</h2>
        <div class="muted">Giftcart</div>
      </div>
      <p class="muted" style="margin-top:8px">Token: <code id="token"></code></p>
      <p id="loading">Loading…</p>
      <div id="content" style="display:none">
        <p class="status" id="status"></p>
        <p class="muted" id="meta"></p>
        <h3>Items</h3>
        <ul id="items"></ul>
      </div>
      <p id="error" style="display:none"></p>
    </div>
    <script>
      const token = ${JSON.stringify(safeToken)};
      document.getElementById('token').textContent = token || '(invalid)';

      async function run() {
        if (!token) {
          document.getElementById('loading').style.display = 'none';
          const el = document.getElementById('error');
          el.style.display = 'block';
          el.textContent = 'Invalid tracking token.';
          return;
        }
        const res = await fetch('/api/order/public/' + token, { headers: { 'Accept': 'application/json' }});
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data || !data.success) {
          document.getElementById('loading').style.display = 'none';
          const el = document.getElementById('error');
          el.style.display = 'block';
          el.textContent = (data && data.message) ? data.message : 'Order not found.';
          return;
        }

        const order = data.order;
        document.getElementById('loading').style.display = 'none';
        document.getElementById('content').style.display = 'block';

        document.getElementById('status').textContent = 'Status: ' + (order.status || '—');
        document.getElementById('meta').textContent =
          'Order ID: ' + order._id + ' • Total: ₹' + order.totalAmount + ' • Payment: ' + (order.paymentStatus || '—');

        const itemsEl = document.getElementById('items');
        itemsEl.innerHTML = '';
        (order.items || []).forEach(it => {
          const li = document.createElement('li');
          li.textContent = (it.name || 'Item') + ' × ' + (it.quantity || 1);
          itemsEl.appendChild(li);
        });
      }
      run();
    </script>
  </body>
</html>`);
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/admin/auth", require("./routes/admin/authRoutes"));
app.use("/api/category", require("./routes/categoryRoutes"));
app.use("/api/city", require("./routes/cityRoutes"));
app.use("/api/product", require("./routes/productRoutes"));
app.use("/api/order", require("./routes/orderRoutes"));
app.use("/api/review", require("./routes/reviewRoutes"));
app.use("/api/wishlist", require("./routes/wishlistRoutes"));
app.use("/api/upload", optionalAuth, require("./routes/uploadRoutes"));
app.use("/api/admin/users", adminMiddleware, require("./routes/userRoutes"));
app.use("/api/coupons", require("./routes/couponRoutes"));
app.use("/api/flavor", require("./routes/flavorRoutes"));
app.use("/api/occasion", require("./routes/occasionRoutes"));
app.use("/api/website", require("./routes/werbsiteContactRoutes"));
app.use("/api/cart", require("./routes/cartRoutes"));
app.use("/api/inventory", require("./routes/inventoryRoutes"));
app.use("/api/support", require("./routes/supportRoutes"));
app.use("/api/store-settings", require("./routes/storeSettingsRoutes"));
app.use("/api/leads", require("./routes/leadRoutes"));
app.use("/api/crm", require("./routes/crmRoutes"));
app.use("/api/heroslides", require("./routes/heroSlideRoutes"));
app.use("/api/hero-slides", require("./routes/heroSlideRoutes"));
app.use("/api/seo", require("./routes/seoRoutes"));
app.use("/api/footer", require("./routes/footerRoutes"));
app.use("/api/testimonials", require("./routes/testimonialRoutes"));
app.use("/api/testimonial", require("./routes/testimonialRoutes"));
app.use("/api/gallery", require("./routes/galleryRoutes"));
app.use("/api/galleries", require("./routes/galleryRoutes"));
app.use("/api/delivery-slots", require("./routes/deliverySlotRoutes"));
app.use("/api/addons", require("./routes/addonRoutes"));
app.use("/api/addon-categories", require("./routes/addonCategoryRoutes"));
app.use("/api/stories", require("./routes/storyRoutes"));
app.use("/api/audit-logs", require("./routes/auditLogRoutes"));
app.use("/api/delivery-riders", require("./routes/deliveryRiderRoutes"));
app.use("/api/abandoned-carts", require("./routes/abandonedCartRoutes"));
app.use("/api/stores", require("./routes/partnerStoreRoutes"));
app.use("/api/decoration", require("./routes/decorationRoutes"));
app.use("/api/decorations", require("./routes/decorationRoutes"));
app.use("/api/webhook/twilio", require("./routes/twilioWebhookRoutes"));
app.use("/api/webhook/meta-whatsapp", require("./routes/metaWebhookRoutes"));
// // AI Chat endpoint for Admin Panel
// const PYTHON_AI_URL = process.env.PYTHON_AI_URL || "http://localhost:8001";
// const AI_INTERNAL_KEY = process.env.AI_INTERNAL_KEY || "";

// app.post("/api/ask-agent", authMiddleware, async (req, res) => {
//   try {
//     const { message, history } = req.body;
//     const token = req.headers.authorization?.split(" ")[1];

//     if (!message || !token) {
//       return res.status(400).json({ success: false, message: "Message and authorization required" });
//     }

//     const response = await axios.post(
//       `${PYTHON_AI_URL}/api/ai/chat`,
//       { message, history: history || [] },
//       {
//         headers: {
//           "Authorization": `Bearer ${token}`,
//           "X-AI-Internal-Key": AI_INTERNAL_KEY,
//           "Content-Type": "application/json",
//         },
//         timeout: 30000,
//       }
//     );

//     res.json(response.data);
//   } catch (error) {
//     console.error("AI Chat Error:", error.message);
//     res.status(500).json({
//       success: false,
//       message: error.response?.data?.detail || "AI service error",
//       answer: "Sorry, I couldn't process that request. Please try again.",
//     });
//   }
// });

// AI Chat (Admin Panel) — chat history is stored in MongoDB (models/AiChat.js)
const aiChatController = require("./controllers/aiChatController");
app.post("/api/ask-agent", adminMiddleware, aiChatController.askAgent);
app.use("/api/ai-chat", adminMiddleware, require("./routes/aiChatRoutes"));



// Unknown API route → JSON 404 (instead of Express's HTML page)
app.use("/api", (req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Last-resort error handler: never leak stack traces / internals to clients.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err?.type === "entity.too.large") {
    return res.status(413).json({ success: false, message: "Request is too large" });
  }
  if (err?.type === "entity.parse.failed") {
    return res.status(400).json({ success: false, message: "Invalid JSON body" });
  }
  console.error("Unhandled error:", err);
  res.status(err?.statusCode || 500).json({ success: false, message: "Something went wrong" });
});

process.on("unhandledRejection", (reason) => console.error("Unhandled promise rejection:", reason));
process.on("uncaughtException", (err) => console.error("Uncaught exception:", err));

if (!process.env.JWT_SECRET) {
  console.error("FATAL: JWT_SECRET is not set. Refusing to start.");
  process.exit(1);
}

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);

  // Releases online decoration bookings that were never paid (frees the slot). Runs every 10 minutes.
  const decorationBookingService = require("./services/decoration/decorationBookingService");
  const releaseUnpaid = () =>
    decorationBookingService
      .expireUnpaidBookings()
      .then((n) => n && console.log(`[decoration] released ${n} unpaid booking(s)`))
      .catch((e) => console.error("[decoration] expiry job failed:", e.message));
  setTimeout(releaseUnpaid, 60 * 1000);
  setInterval(releaseUnpaid, 10 * 60 * 1000);
});