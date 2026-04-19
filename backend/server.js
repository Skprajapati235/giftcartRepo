const express = require("express");
const cors = require("cors");
require("dotenv").config();

const PORT = process.env.PORT || 5000;
const connectDB = require("./config/db");
const authMiddleware = require("./middleware/authMiddleware");
const adminMiddleware = require("./middleware/adminMiddleware");

const app = express();

app.use(cors());
app.use(express.json());

connectDB();

app.get("/", (req, res) => {
  res.send("Backend is Live 🚀");
});

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
app.use("/api/upload", authMiddleware, require("./routes/uploadRoutes"));
app.use("/api/admin/users", adminMiddleware, require("./routes/userRoutes"));
app.use("/api/coupons", require("./routes/couponRoutes"));


app.listen(PORT, () =>
  console.log(`Server running on ${PORT}`)
);