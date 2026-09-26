const SeoGlobal = require("../models/SeoGlobal");
const SeoPage = require("../models/SeoPage");
const SeoRedirect = require("../models/SeoRedirect");
const Product = require("../models/Product");
const Category = require("../models/Category");
const Occasion = require("../models/Occasion");
const Flavor = require("../models/Flavor");

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
  let global = await SeoGlobal.findOne();
  if (!global) {
    global = await SeoGlobal.create({
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
      siteUrl: "https://giftfestive.com",
      defaultOgImage: "https://giftfestive.com/opengraph-image",
      twitterHandle: "@giftfestive",
      twitterCardType: "summary_large_image",
      organization: {
        legalName: "GiftFestive",
        founder: "Sonu Prajapati",
        telephone: "+91-9999999999",
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
  }
  return global;
};

exports.updateGlobalSeo = async (data) => {
  let global = await SeoGlobal.findOne();
  if (!global) {
    return await SeoGlobal.create(data);
  }
  Object.assign(global, data);
  return await global.save();
};

// -------------------------------------------------------------
// 2. PAGE-BY-PAGE SEO
// -------------------------------------------------------------

exports.getPageSeoByPath = async (rawPath) => {
  const path = normalizePath(rawPath);
  let page = await SeoPage.findOne({ path, isActive: true });
  if (!page) {
    // Return fallback populated from global SEO
    const global = await exports.getGlobalSeo();
    return {
      path,
      pageName: path === "/" ? "Home" : path.replace("/", "").replace(/-/g, " "),
      metaTitle: global.defaultTitle,
      metaDescription: global.defaultDescription,
      metaKeywords: global.defaultKeywords || [],
      canonicalUrl: `${global.siteUrl}${path === "/" ? "" : path}`,
      ogTitle: global.defaultTitle,
      ogDescription: global.defaultDescription,
      ogImage: global.defaultOgImage,
      noIndex: false,
      noFollow: false,
      isFallback: true,
    };
  }
  return page;
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
    .limit(parseInt(limit, 10));

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
  return await SeoPage.create(data);
};

exports.updateSeoPage = async (id, data) => {
  if (data.path) {
    data.path = normalizePath(data.path);
  }
  return await SeoPage.findByIdAndUpdate(id, data, { new: true, runValidators: true });
};

exports.deleteSeoPage = async (id) => {
  return await SeoPage.findByIdAndDelete(id);
};

// Auto seed default static pages if empty
exports.seedDefaultPages = async () => {
  const defaults = [
    {
      path: "/",
      pageName: "Home Page",
      metaTitle: "GiftFestive | Faridabad Most Trusted Online Gift, Cake & Flower Delivery",
      metaDescription:
        "Order fresh flowers, artisan cakes, customized gift hampers & surprises in Faridabad with same-day express and midnight delivery across all sectors.",
      metaKeywords: ["giftfestive", "gift delivery faridabad", "cake delivery faridabad", "flowers faridabad"],
      sitemapPriority: 1.0,
      changeFrequency: "daily",
    },
    {
      path: "/categories",
      pageName: "All Categories",
      metaTitle: "Browse Gift Categories | Cakes, Flowers, Hampers & More | GiftFestive",
      metaDescription:
        "Explore curated gift categories at GiftFestive. Fresh flowers, birthday cakes, personalized hampers, chocolates & plants delivered in Faridabad.",
      metaKeywords: ["gift categories", "cakes category", "flower bouquets", "gifts online"],
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
        "Learn about GiftFestive's journey, our commitment to quality artisan cakes, fresh handpicked blooms, and same-day smiles across Faridabad.",
      metaKeywords: ["about giftfestive", "best gift shop faridabad", "gift delivery team"],
      sitemapPriority: 0.7,
      changeFrequency: "monthly",
    },
    {
      path: "/contact",
      pageName: "Contact Us",
      metaTitle: "Contact GiftFestive | 24/7 Customer Care & Delivery Helpdesk",
      metaDescription:
        "Need help with your order or custom corporate gifting? Reach out to GiftFestive support via WhatsApp, phone, or email.",
      metaKeywords: ["giftfestive contact", "gift delivery customer support", "faridabad gift phone"],
      sitemapPriority: 0.7,
      changeFrequency: "monthly",
    },
    {
      path: "/shipping",
      pageName: "Shipping & Delivery Policy",
      metaTitle: "Express Same-Day & Midnight Delivery Policy | GiftFestive",
      metaDescription:
        "Read our shipping details, delivery slots (standard, fixed-time, midnight), and serviceable areas across Faridabad and NCR.",
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

  return { message: "Seeding complete", addedCount };
};

// -------------------------------------------------------------
// 3. 301 / 302 URL REDIRECTS
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
    .limit(parseInt(limit, 10));

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
  return await SeoRedirect.create(data);
};

exports.updateRedirect = async (id, data) => {
  if (data.fromPath) data.fromPath = normalizePath(data.fromPath);
  if (data.toPath) data.toPath = data.toPath.trim();
  return await SeoRedirect.findByIdAndUpdate(id, data, { new: true, runValidators: true });
};

exports.deleteRedirect = async (id) => {
  return await SeoRedirect.findByIdAndDelete(id);
};

exports.checkRedirect = async (rawPath) => {
  const path = normalizePath(rawPath);
  const redirect = await SeoRedirect.findOne({ fromPath: path, isActive: true });
  if (redirect) {
    // Non-blocking increment hit count
    SeoRedirect.findByIdAndUpdate(redirect._id, { $inc: { hits: 1 } }).catch(() => {});
    return {
      redirect: true,
      toPath: redirect.toPath,
      statusCode: redirect.statusCode || 301,
    };
  }
  return { redirect: false };
};

// -------------------------------------------------------------
// 4. DYNAMIC SITEMAP DATA GENERATOR
// -------------------------------------------------------------

exports.getSitemapData = async () => {
  const global = await exports.getGlobalSeo();
  const baseUrl = global.siteUrl || "https://giftfestive.com";

  // 1. Pages from SeoPage
  const pages = await SeoPage.find({
    isActive: true,
    includeInSitemap: { $ne: false },
    noIndex: { $ne: true },
  }).select("path updatedAt sitemapPriority changeFrequency");

  const pageRoutes = pages.map((p) => ({
    url: `${baseUrl}${p.path === "/" ? "" : p.path}`,
    lastModified: p.updatedAt || new Date(),
    changeFrequency: p.changeFrequency || "weekly",
    priority: p.sitemapPriority || 0.8,
  }));

  // 2. Active Products
  const products = await Product.find({
    noIndex: { $ne: true },
  }).select("_id name updatedAt");

  const productRoutes = products.map((prod) => ({
    url: `${baseUrl}/product/${prod._id}`,
    lastModified: prod.updatedAt || new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // 3. Categories
  const categories = await Category.find({
    noIndex: { $ne: true },
  }).select("_id name slug updatedAt");

  const categoryRoutes = categories.map((cat) => ({
    url: `${baseUrl}/categories?category=${cat._id}`,
    lastModified: cat.updatedAt || new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // 4. Occasions
  let occasionRoutes = [];
  try {
    const occasions = await Occasion.find({ isActive: { $ne: false } }).select("_id name updatedAt");
    occasionRoutes = occasions.map((occ) => ({
      url: `${baseUrl}/occasions?occasion=${occ._id}`,
      lastModified: occ.updatedAt || new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    }));
  } catch (err) {
    // Optional fallback if model not loaded
  }

  // 5. Flavors (e.g. Chocolate, Red Velvet, Pineapple cakes)
  let flavorRoutes = [];
  try {
    const flavors = await Flavor.find({ noIndex: { $ne: true } }).select("_id name slug updatedAt");
    flavorRoutes = flavors.map((flv) => ({
      url: `${baseUrl}/categories?flavor=${flv._id}`,
      lastModified: flv.updatedAt || new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    }));
  } catch (err) {
    // Optional fallback
  }

  return {
    baseUrl,
    totalUrls: pageRoutes.length + productRoutes.length + categoryRoutes.length + occasionRoutes.length + flavorRoutes.length,
    routes: [...pageRoutes, ...productRoutes, ...categoryRoutes, ...occasionRoutes, ...flavorRoutes],
  };
};

// -------------------------------------------------------------
// 5. DYNAMIC ROBOTS.TXT DIRECTIVES
// -------------------------------------------------------------

exports.getRobotsData = async () => {
  const global = await exports.getGlobalSeo();
  const baseUrl = global.siteUrl || "https://giftfestive.com";

  return {
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
};

// -------------------------------------------------------------
// 6. SEO HEALTH AUDIT & DIAGNOSTICS
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

  // Calculate simple health score (0 to 100)
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
