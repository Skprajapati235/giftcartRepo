const SeoGlobal = require("../models/SeoGlobal");
const SeoPage = require("../models/SeoPage");
const SeoRedirect = require("../models/SeoRedirect");
const Product = require("../models/Product");
const Category = require("../models/Category");
const Occasion = require("../models/Occasion");
const Flavor = require("../models/Flavor");

// -------------------------------------------------------------
// High-Speed In-Memory Cache (Sub-millisecond responses for SEO)
// -------------------------------------------------------------
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes default TTL

const memoryCache = {
  global: null,
  globalTimestamp: 0,
  pages: new Map(), // path -> { data, timestamp }
  redirects: new Map(), // path -> { data, timestamp }
  sitemap: null,
  sitemapTimestamp: 0,
  robots: null,
  robotsTimestamp: 0,
};

const invalidateAllSeoCache = () => {
  memoryCache.global = null;
  memoryCache.globalTimestamp = 0;
  memoryCache.pages.clear();
  memoryCache.redirects.clear();
  memoryCache.sitemap = null;
  memoryCache.sitemapTimestamp = 0;
  memoryCache.robots = null;
  memoryCache.robotsTimestamp = 0;
};

const invalidatePageCache = (normalizedPath) => {
  if (normalizedPath) {
    memoryCache.pages.delete(normalizedPath);
  } else {
    memoryCache.pages.clear();
  }
  memoryCache.sitemap = null;
  memoryCache.sitemapTimestamp = 0;
};

const invalidateRedirectCache = (normalizedPath) => {
  if (normalizedPath) {
    memoryCache.redirects.delete(normalizedPath);
  } else {
    memoryCache.redirects.clear();
  }
};

// Normalize URL paths e.g. "/About/" -> "/about", "" -> "/"
const normalizePath = (path) => {
  if (!path) return "/";
  let normalized = path.trim().toLowerCase();
  if (!normalized.startsWith("/")) normalized = "/" + normalized;
  if (normalized.length > 1 && normalized.endsWith("/")) {
    normalized = normalized.slice(0, -1);
  }
  return normalized;
};

// -------------------------------------------------------------
// 1. GLOBAL SEO SETTINGS
// -------------------------------------------------------------

exports.getGlobalSeo = async () => {
  const now = Date.now();
  if (memoryCache.global && (now - memoryCache.globalTimestamp < CACHE_TTL_MS)) {
    return memoryCache.global;
  }

  let global = await SeoGlobal.findOne().lean();
  if (!global) {
    const created = await SeoGlobal.create({
      siteName: "GiftFestive",
      defaultTitle: "GiftFestive | Faridabad Most Trusted Online Gift, Cake & Flower Delivery",
      titleTemplate: "%s | GiftFestive",
      defaultDescription:
        "Faridabad most trusted online gifting platform. Order fresh flowers, artisan cakes, customized gift hampers & surprises with express same-day and midnight delivery across all sectors of Faridabad.",
      defaultKeywords: [
        "GiftFestive",
        "gift delivery faridabad",
        "cake delivery faridabad",
        "flowers delivery faridabad",
        "buy gifts online faridabad",
        "midnight cake delivery faridabad",
        "same day gift delivery faridabad",
      ],
      siteUrl: "https://www.giftfestive.com",
      defaultOgImage: "https://res.cloudinary.com/dqraerylq/image/upload/v1790399811/giftcart/onoltlcvokmoh7f8b4wk.jpg",
      twitterHandle: "@giftfestive",
      twitterCardType: "summary_large_image",
      organization: {
        legalName: "GiftFestive",
        founder: "Sonu Prajapati",
        telephone: "8400787712",
        email: "support@giftfestive.com",
        logoUrl: "https://giftfestive.com/icon-512.png",
        priceRange: "₹₹",
        currenciesAccepted: "INR",
        streetAddress: "Faridabad",
        addressLocality: "Faridabad",
        addressRegion: "Haryana",
        postalCode: "121001",
        addressCountry: "IN",
        geoLatitude: 28.4089,
        geoLongitude: 77.3178,
        openingHours: "Mo-Su 08:00-23:00",
        socialLinks: [
          "https://www.instagram.com/giftfestive",
          "https://www.facebook.com/giftfestive",
          "https://twitter.com/giftfestive",
        ],
      },
    });
    global = created.toObject();
  }

  memoryCache.global = global;
  memoryCache.globalTimestamp = now;
  return global;
};

exports.updateGlobalSeo = async (data) => {
  let global = await SeoGlobal.findOne();
  if (!global) {
    global = await SeoGlobal.create(data);
  } else {
    Object.assign(global, data);
    await global.save();
  }
  invalidateAllSeoCache();
  return global;
};

// -------------------------------------------------------------
// 2. PAGE-BY-PAGE SEO (WITH FULL FALLBACK ENRICHMENT)
// -------------------------------------------------------------

exports.getPageSeoByPath = async (rawPath) => {
  const path = normalizePath(rawPath);
  const now = Date.now();

  const cached = memoryCache.pages.get(path);
  if (cached && (now - cached.timestamp < CACHE_TTL_MS)) {
    return cached.data;
  }

  const global = await exports.getGlobalSeo();
  let page = await SeoPage.findOne({ path, isActive: true }).lean();

  const siteUrl = global.siteUrl || "https://www.giftfestive.com";
  const siteName = global.siteName || "GiftFestive";
  const canonicalUrl = page?.canonicalUrl?.trim() || `${siteUrl}${path === "/" ? "" : path}`;

  const metaTitle = page?.metaTitle?.trim() || global.defaultTitle;
  const metaDescription = page?.metaDescription?.trim() || global.defaultDescription;
  const metaKeywords = (page?.metaKeywords && page.metaKeywords.length > 0)
    ? page.metaKeywords
    : (global.defaultKeywords || []);

  const ogTitle = page?.ogTitle?.trim() || metaTitle;
  const ogDescription = page?.ogDescription?.trim() || metaDescription;
  const ogImage = page?.ogImage?.trim() || global.defaultOgImage || "https://giftfestive.com/opengraph-image";

  const enrichedPage = {
    _id: page?._id || null,
    path,
    pageName: page?.pageName || (path === "/" ? "Home" : path.replace(/^\//, "").replace(/-/g, " ")),
    metaTitle,
    metaDescription,
    metaKeywords,
    canonicalUrl,
    ogTitle,
    ogDescription,
    ogImage,
    twitterTitle: ogTitle,
    twitterDescription: ogDescription,
    twitterImage: ogImage,
    twitterHandle: global.twitterHandle || "@giftfestive",
    twitterCardType: global.twitterCardType || "summary_large_image",
    noIndex: !!page?.noIndex,
    noFollow: !!page?.noFollow,
    structuredData: page?.structuredData || "",
    sitemapPriority: page?.sitemapPriority ?? (path === "/" ? 1.0 : 0.8),
    changeFrequency: page?.changeFrequency || (path === "/" ? "daily" : "weekly"),
    includeInSitemap: page?.includeInSitemap !== false,
    isActive: page?.isActive !== false,
    siteName,
    siteUrl,
    titleTemplate: global.titleTemplate || "%s | GiftFestive",
    googleSiteVerification: global.googleSiteVerification || "",
    bingSiteVerification: global.bingSiteVerification || "",
    pinterestVerification: global.pinterestVerification || "",
    googleAnalyticsId: global.googleAnalyticsId || "",
    googleTagManagerId: global.googleTagManagerId || "",
    organization: global.organization || {},
    isFallback: !page,
  };

  memoryCache.pages.set(path, { data: enrichedPage, timestamp: now });
  return enrichedPage;
};

exports.getAllSeoPages = async ({ page = 1, limit = 20, search = "" } = {}) => {
  const query = {};
  if (search) {
    query.$or = [
      { path: { $regex: search, $options: "i" } },
      { pageName: { $regex: search, $options: "i" } },
      { metaTitle: { $regex: search, $options: "i" } },
      { metaDescription: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);
  const pages = await SeoPage.find(query)
    .sort({ path: 1 })
    .skip(skip)
    .limit(parseInt(limit, 10))
    .lean();

  const total = await SeoPage.countDocuments(query);

  return {
    data: pages,
    total,
    page: parseInt(page, 10),
    totalPages: Math.ceil(total / parseInt(limit, 10)),
  };
};

exports.createSeoPage = async (data) => {
  data.path = normalizePath(data.path);
  const exists = await SeoPage.findOne({ path: data.path });
  if (exists) {
    throw new Error(`SEO settings for path "${data.path}" already exist.`);
  }
  const created = await SeoPage.create(data);
  invalidatePageCache(data.path);
  return created;
};

exports.updateSeoPage = async (id, data) => {
  if (data.path) {
    data.path = normalizePath(data.path);
  }
  const updated = await SeoPage.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  invalidatePageCache();
  return updated;
};

exports.deleteSeoPage = async (id) => {
  const deleted = await SeoPage.findByIdAndDelete(id);
  invalidatePageCache();
  return deleted;
};

// Auto seed default static pages if empty
exports.seedDefaultPages = async () => {
  const defaults = [
    {
      path: "/",
      pageName: "Home Page",
      metaTitle: "Online cake delivery in Faridabad Surprise Gift Service: Send Free Virtual Gifts Online - online gift giftfestive",
      metaDescription:
        "Order fresh cakes, flower bouquets & gift hampers in Faridabad. Same-day & midnight delivery across all sectors of Faridabad. 100% eggless options available!",
      metaKeywords: [
        "giftfestive",
        "cake delivery faridabad",
        "gift delivery faridabad",
        "flowers delivery faridabad",
        "midnight cake delivery faridabad",
        "same day gift delivery faridabad"
      ],
      sitemapPriority: 1.0,
      changeFrequency: "daily",
    },
    {
      path: "/categories",
      pageName: "All Categories",
      metaTitle: "Browse Gift Categories | Cakes, Flowers, Hampers & More | GiftFestive",
      metaDescription:
        "Explore curated gift categories at GiftFestive. Fresh flowers, birthday cakes, personalized hampers, chocolates & plants delivered in Faridabad.",
      metaKeywords: ["gift categories", "cakes category", "flower bouquets", "gifts online faridabad"],
      sitemapPriority: 0.9,
      changeFrequency: "daily",
    },
    {
      path: "/occasions",
      pageName: "Occasions Gifting",
      metaTitle: "Gifts for Every Occasion | Birthday, Anniversary & Festivals | GiftFestive",
      metaDescription:
        "Find the perfect celebration gift for Birthdays, Anniversaries, Valentine's Day, and festivals with fast same-day delivery in Faridabad.",
      metaKeywords: ["birthday gifts", "anniversary gifts", "festival hampers faridabad"],
      sitemapPriority: 0.9,
      changeFrequency: "weekly",
    },
    {
      path: "/offers",
      pageName: "Special Offers & Coupons",
      metaTitle: "Special Offers, Discount Coupons & Deals | GiftFestive",
      metaDescription:
        "Save on gifts, cakes, and floral arrangements. Check today's active coupon codes, combo discounts, and festive deals at GiftFestive.",
      metaKeywords: ["gift coupons", "cake discounts faridabad", "gifting offers"],
      sitemapPriority: 0.8,
      changeFrequency: "weekly",
    },
    {
      path: "/about",
      pageName: "About Us",
      metaTitle: "About GiftFestive | Faridabad's Premier Gifting Destination",
      metaDescription:
        "Learn about GiftFestive's journey, founded by Sonu Prajapati. Our commitment to quality artisan cakes, fresh handpicked blooms, and same-day delivery in Faridabad.",
      metaKeywords: ["about giftfestive", "best gift shop faridabad", "sonu prajapati giftfestive"],
      sitemapPriority: 0.7,
      changeFrequency: "monthly",
    },
    {
      path: "/contact",
      pageName: "Contact Us",
      metaTitle: "Contact GiftFestive | Customer Care & Delivery Helpdesk",
      metaDescription:
        "Need help with your order or customized surprise? Reach out to GiftFestive support via WhatsApp (8400787712), phone, or email.",
      metaKeywords: ["giftfestive contact", "gift delivery customer support", "faridabad gift phone"],
      sitemapPriority: 0.7,
      changeFrequency: "monthly",
    },
    {
      path: "/shipping",
      pageName: "Shipping & Delivery Policy",
      metaTitle: "Express Same-Day & Midnight Delivery Policy | GiftFestive",
      metaDescription:
        "Read our delivery slots (standard, fixed-time, midnight) and serviceable areas across Faridabad and Delhi NCR.",
      metaKeywords: ["delivery policy", "midnight delivery faridabad", "shipping terms"],
      sitemapPriority: 0.6,
      changeFrequency: "monthly",
    },
    {
      path: "/refunds",
      pageName: "Cancellation & Refund Policy",
      metaTitle: "Hassle-Free Cancellation & Refund Policy | GiftFestive",
      metaDescription:
        "Learn about our replacement, cancellation, and refund process for cakes, perishable flowers, and personalized gifts.",
      metaKeywords: ["refund policy", "gift cancellation", "return policy"],
      sitemapPriority: 0.6,
      changeFrequency: "monthly",
    },
    {
      path: "/privacy",
      pageName: "Privacy Policy",
      metaTitle: "Privacy Policy | Data Protection & Security | GiftFestive",
      metaDescription:
        "Your privacy matters to us. Read how GiftFestive protects your personal details, transactions, and delivery addresses securely.",
      metaKeywords: ["privacy policy", "data security giftfestive"],
      sitemapPriority: 0.5,
      changeFrequency: "yearly",
    },
    {
      path: "/terms",
      pageName: "Terms & Conditions",
      metaTitle: "Terms of Service & Usage Conditions | GiftFestive",
      metaDescription:
        "Review the terms and conditions governing purchases, payments, warranties, and delivery commitments at GiftFestive.",
      metaKeywords: ["terms and conditions", "terms of service"],
      sitemapPriority: 0.5,
      changeFrequency: "yearly",
    },
  ];

  let addedCount = 0;
  for (const item of defaults) {
    const existing = await SeoPage.findOne({ path: item.path });
    if (!existing) {
      await SeoPage.create(item);
      addedCount++;
    }
  }

  invalidatePageCache();
  return { message: "Seeding complete", addedCount };
};

// -------------------------------------------------------------
// 3. 301 / 302 URL REDIRECTS (INSTANT CHECK)
// -------------------------------------------------------------

exports.getAllRedirects = async ({ page = 1, limit = 20, search = "" } = {}) => {
  const query = {};
  if (search) {
    query.$or = [
      { fromPath: { $regex: search, $options: "i" } },
      { toPath: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);
  const redirects = await SeoRedirect.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit, 10))
    .lean();

  const total = await SeoRedirect.countDocuments(query);

  return {
    data: redirects,
    total,
    page: parseInt(page, 10),
    totalPages: Math.ceil(total / parseInt(limit, 10)),
  };
};

exports.createRedirect = async (data) => {
  data.fromPath = normalizePath(data.fromPath);
  data.toPath = data.toPath.trim();
  const exists = await SeoRedirect.findOne({ fromPath: data.fromPath });
  if (exists) {
    throw new Error(`A redirect rule for "${data.fromPath}" already exists.`);
  }
  const created = await SeoRedirect.create(data);
  invalidateRedirectCache();
  return created;
};

exports.updateRedirect = async (id, data) => {
  if (data.fromPath) data.fromPath = normalizePath(data.fromPath);
  if (data.toPath) data.toPath = data.toPath.trim();
  const updated = await SeoRedirect.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  invalidateRedirectCache();
  return updated;
};

exports.deleteRedirect = async (id) => {
  const deleted = await SeoRedirect.findByIdAndDelete(id);
  invalidateRedirectCache();
  return deleted;
};

exports.checkRedirect = async (rawPath) => {
  const path = normalizePath(rawPath);
  const now = Date.now();

  const cached = memoryCache.redirects.get(path);
  if (cached && (now - cached.timestamp < CACHE_TTL_MS)) {
    return cached.data;
  }

  const redirect = await SeoRedirect.findOne({ fromPath: path, isActive: true }).lean();
  let result;
  if (redirect) {
    // Non-blocking increment hit count
    SeoRedirect.findByIdAndUpdate(redirect._id, { $inc: { hits: 1 } }).catch(() => {});
    result = {
      redirect: true,
      toPath: redirect.toPath,
      statusCode: redirect.statusCode || 301,
    };
  } else {
    result = { redirect: false };
  }

  memoryCache.redirects.set(path, { data: result, timestamp: now });
  return result;
};

// -------------------------------------------------------------
// 4. DYNAMIC SITEMAP DATA GENERATOR
// -------------------------------------------------------------

exports.getSitemapData = async () => {
  const now = Date.now();
  if (memoryCache.sitemap && (now - memoryCache.sitemapTimestamp < CACHE_TTL_MS)) {
    return memoryCache.sitemap;
  }

  const global = await exports.getGlobalSeo();
  const baseUrl = (global.siteUrl || "https://www.giftfestive.com").replace(/\/+$/, "");

  // 1. Configured Pages from SeoPage
  const pages = await SeoPage.find({
    isActive: true,
    includeInSitemap: { $ne: false },
    noIndex: { $ne: true },
  }).select("path updatedAt sitemapPriority changeFrequency").lean();

  const pageRoutes = pages.map((p) => ({
    url: `${baseUrl}${p.path === "/" ? "" : p.path}`,
    lastModified: p.updatedAt ? new Date(p.updatedAt).toISOString() : new Date().toISOString(),
    changeFrequency: p.changeFrequency || "weekly",
    priority: p.sitemapPriority ?? 0.8,
  }));

  // Fallback core pages if not configured
  if (pageRoutes.length === 0) {
    pageRoutes.push(
      { url: baseUrl, lastModified: new Date().toISOString(), changeFrequency: "daily", priority: 1.0 },
      { url: `${baseUrl}/categories`, lastModified: new Date().toISOString(), changeFrequency: "daily", priority: 0.9 },
      { url: `${baseUrl}/occasions`, lastModified: new Date().toISOString(), changeFrequency: "weekly", priority: 0.9 },
      { url: `${baseUrl}/offers`, lastModified: new Date().toISOString(), changeFrequency: "weekly", priority: 0.8 },
      { url: `${baseUrl}/about`, lastModified: new Date().toISOString(), changeFrequency: "monthly", priority: 0.7 },
      { url: `${baseUrl}/contact`, lastModified: new Date().toISOString(), changeFrequency: "monthly", priority: 0.7 },
      { url: `${baseUrl}/shipping`, lastModified: new Date().toISOString(), changeFrequency: "monthly", priority: 0.6 },
      { url: `${baseUrl}/refunds`, lastModified: new Date().toISOString(), changeFrequency: "monthly", priority: 0.6 },
      { url: `${baseUrl}/privacy`, lastModified: new Date().toISOString(), changeFrequency: "yearly", priority: 0.5 },
      { url: `${baseUrl}/terms`, lastModified: new Date().toISOString(), changeFrequency: "yearly", priority: 0.5 },
    );
  }

  // 2. Active Products
  const products = await Product.find({
    noIndex: { $ne: true },
  }).select("_id name updatedAt").lean();

  const productRoutes = products.map((prod) => ({
    url: `${baseUrl}/product/${prod._id}`,
    lastModified: prod.updatedAt ? new Date(prod.updatedAt).toISOString() : new Date().toISOString(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // 3. Categories
  const categories = await Category.find({
    noIndex: { $ne: true },
  }).select("_id name slug updatedAt").lean();

  const categoryRoutes = categories.map((cat) => ({
    url: `${baseUrl}/categories?category=${cat._id}`,
    lastModified: cat.updatedAt ? new Date(cat.updatedAt).toISOString() : new Date().toISOString(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // 4. Occasions
  let occasionRoutes = [];
  try {
    const occasions = await Occasion.find({ isActive: { $ne: false } }).select("_id name updatedAt").lean();
    occasionRoutes = occasions.map((occ) => ({
      url: `${baseUrl}/occasions?occasion=${occ._id}`,
      lastModified: occ.updatedAt ? new Date(occ.updatedAt).toISOString() : new Date().toISOString(),
      changeFrequency: "weekly",
      priority: 0.8,
    }));
  } catch (err) {
    // Optional fallback
  }

  // 5. Flavors
  let flavorRoutes = [];
  try {
    const flavors = await Flavor.find({ noIndex: { $ne: true } }).select("_id name slug updatedAt").lean();
    flavorRoutes = flavors.map((flv) => ({
      url: `${baseUrl}/categories?flavor=${flv._id}`,
      lastModified: flv.updatedAt ? new Date(flv.updatedAt).toISOString() : new Date().toISOString(),
      changeFrequency: "weekly",
      priority: 0.8,
    }));
  } catch (err) {
    // Optional fallback
  }

  const sitemapData = {
    baseUrl,
    totalUrls: pageRoutes.length + productRoutes.length + categoryRoutes.length + occasionRoutes.length + flavorRoutes.length,
    routes: [...pageRoutes, ...productRoutes, ...categoryRoutes, ...occasionRoutes, ...flavorRoutes],
  };

  memoryCache.sitemap = sitemapData;
  memoryCache.sitemapTimestamp = now;
  return sitemapData;
};

// -------------------------------------------------------------
// 5. DYNAMIC ROBOTS.TXT DIRECTIVES
// -------------------------------------------------------------

exports.getRobotsData = async () => {
  const now = Date.now();
  if (memoryCache.robots && (now - memoryCache.robotsTimestamp < CACHE_TTL_MS)) {
    return memoryCache.robots;
  }

  const global = await exports.getGlobalSeo();
  const baseUrl = (global.siteUrl || "https://www.giftfestive.com").replace(/\/+$/, "");

  const robotsData = {
    host: baseUrl,
    sitemap: `${baseUrl}/sitemap.xml`,
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/checkout",
          "/checkout/",
          "/cart",
          "/cart/",
          "/profile",
          "/profile/",
          "/orders",
          "/orders/",
          "/login",
          "/register",
          "/api/",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: [
          "/checkout",
          "/checkout/",
          "/cart",
          "/cart/",
          "/profile",
          "/profile/",
          "/orders",
          "/orders/",
          "/login",
          "/register",
        ],
      },
    ],
    customRules: global.robotsCustomRules || "",
  };

  memoryCache.robots = robotsData;
  memoryCache.robotsTimestamp = now;
  return robotsData;
};

// -------------------------------------------------------------
// 6. CATEGORY & OCCASION SPECIFIC SEO HELPERS
// -------------------------------------------------------------

exports.getCategorySeo = async (idOrSlug) => {
  const global = await exports.getGlobalSeo();
  const siteUrl = global.siteUrl || "https://www.giftfestive.com";
  let category = null;

  try {
    if (idOrSlug && idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
      category = await Category.findById(idOrSlug).lean();
    } else if (idOrSlug) {
      category = await Category.findOne({ slug: idOrSlug.toLowerCase() }).lean();
    }
  } catch (e) {}

  if (!category) {
    return exports.getPageSeoByPath("/categories");
  }

  const metaTitle = category.seoTitle || `${category.name} in Faridabad | Express Same-Day Delivery | GiftFestive`;
  const metaDescription =
    category.seoDescription ||
    `Order ${category.name.toLowerCase()} in Faridabad with same-day and midnight express delivery. Handcrafted quality and fresh surprises at GiftFestive.`;

  return {
    category,
    path: `/categories?category=${category._id}`,
    pageName: category.name,
    metaTitle,
    metaDescription,
    metaKeywords: (category.seoKeywords && category.seoKeywords.length > 0)
      ? category.seoKeywords
      : [category.name, `${category.name} faridabad`, "online gifts faridabad", "GiftFestive"],
    canonicalUrl: category.canonicalUrl || `${siteUrl}/categories?category=${category._id}`,
    ogTitle: metaTitle,
    ogDescription: metaDescription,
    ogImage: category.ogImage || category.image || global.defaultOgImage,
    noIndex: !!category.noIndex,
    headingText: category.headingText || category.name,
    subheadingText: category.subheadingText || "",
    bottomContent: category.bottomContent || "",
    siteName: global.siteName,
    siteUrl,
  };
};

exports.getOccasionSeo = async (idOrSlug) => {
  const global = await exports.getGlobalSeo();
  const siteUrl = global.siteUrl || "https://www.giftfestive.com";
  let occasion = null;

  try {
    if (idOrSlug && idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
      occasion = await Occasion.findById(idOrSlug).lean();
    } else if (idOrSlug) {
      occasion = await Occasion.findOne({ slug: idOrSlug.toLowerCase() }).lean();
    }
  } catch (e) {}

  if (!occasion) {
    return exports.getPageSeoByPath("/occasions");
  }

  const metaTitle = occasion.seoTitle || `${occasion.name} Gifts in Faridabad | GiftFestive`;
  const metaDescription =
    occasion.seoDescription ||
    `Find curated ${occasion.name.toLowerCase()} gifts, cakes, flower bouquets and surprise hampers delivered across Faridabad.`;

  return {
    occasion,
    path: `/occasions?occasion=${occasion._id}`,
    pageName: occasion.name,
    metaTitle,
    metaDescription,
    metaKeywords: (occasion.seoKeywords && occasion.seoKeywords.length > 0)
      ? occasion.seoKeywords
      : [occasion.name, `${occasion.name} gifts`, `${occasion.name} delivery faridabad`, "GiftFestive"],
    canonicalUrl: `${siteUrl}/occasions?occasion=${occasion._id}`,
    ogTitle: metaTitle,
    ogDescription: metaDescription,
    ogImage: occasion.image || global.defaultOgImage,
    noIndex: !!occasion.noIndex,
    headingText: occasion.headingText || occasion.name,
    bottomContent: occasion.bottomContent || "",
    siteName: global.siteName,
    siteUrl,
  };
};

// -------------------------------------------------------------
// 7. SEO HEALTH AUDIT & DIAGNOSTICS
// -------------------------------------------------------------

exports.getSeoAuditStats = async () => {
  const [
    totalProducts,
    productsMissingMetaTitle,
    productsMissingMetaDesc,
    productsMissingOgImage,
    productsNoIndex,
    totalCategories,
    categoriesMissingSeoTitle,
    categoriesMissingBottomContent,
    totalPages,
    totalRedirects,
  ] = await Promise.all([
    Product.countDocuments(),
    Product.countDocuments({ $or: [{ seoTitle: { $exists: false } }, { seoTitle: "" }] }),
    Product.countDocuments({ $or: [{ seoDescription: { $exists: false } }, { seoDescription: "" }] }),
    Product.countDocuments({
      $or: [{ ogImage: { $exists: false } }, { ogImage: "" }, { ogImage: null }],
    }),
    Product.countDocuments({ noIndex: true }),
    Category.countDocuments(),
    Category.countDocuments({ $or: [{ seoTitle: { $exists: false } }, { seoTitle: "" }] }),
    Category.countDocuments({ $or: [{ bottomContent: { $exists: false } }, { bottomContent: "" }] }),
    SeoPage.countDocuments(),
    SeoRedirect.countDocuments(),
  ]);

  let deductions = 0;
  if (totalProducts > 0) {
    deductions += (productsMissingMetaTitle / totalProducts) * 30;
    deductions += (productsMissingMetaDesc / totalProducts) * 20;
    deductions += (productsMissingOgImage / totalProducts) * 15;
  }
  if (totalCategories > 0) {
    deductions += (categoriesMissingSeoTitle / totalCategories) * 15;
  }
  if (totalPages < 5) deductions += 20;

  const score = Math.max(10, Math.min(100, Math.round(100 - deductions)));

  return {
    healthScore: score,
    products: {
      total: totalProducts,
      missingTitle: productsMissingMetaTitle,
      missingDescription: productsMissingMetaDesc,
      missingOgImage: productsMissingOgImage,
      noIndexCount: productsNoIndex,
      optimizedCount: Math.max(0, totalProducts - productsMissingMetaTitle),
    },
    categories: {
      total: totalCategories,
      missingTitle: categoriesMissingSeoTitle,
      missingBottomContent: categoriesMissingBottomContent,
    },
    pages: {
      totalConfigured: totalPages,
    },
    redirects: {
      total: totalRedirects,
    },
  };
};
