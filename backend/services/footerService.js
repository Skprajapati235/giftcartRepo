const Footer = require("../models/Footer");

// Initial standard default footer dataset matching current storefront
const getDefaultFooterData = () => ({
  key: "main_footer",
  brand: {
    brandName: "GiftFestive",
    logoUrl: "/images/websitelogoimages.png",
    tagline:
      "Making celebrations unforgettable with artisanal cakes, farm-fresh flowers, and personalized gifts curated with pure warmth and care.",
    phone: "+91 84007 87712",
    phoneLabel: "+91 84007 87712 (WhatsApp / Call)",
    whatsappUrl: "https://wa.me/918400787712",
    email: "support@giftfestive.in",
    address: "Sector 15, Faridabad, Haryana – 121001",
    mapUrl: "https://maps.google.com/?q=Faridabad",
    socialLinks: [
      { platform: "instagram", url: "https://instagram.com/giftfestive", icon: "instagram", isActive: true },
      { platform: "facebook", url: "https://facebook.com/giftfestive", icon: "facebook", isActive: true },
      { platform: "whatsapp", url: "https://wa.me/918400787712", icon: "whatsapp", isActive: true },
      { platform: "youtube", url: "https://youtube.com/@giftfestive", icon: "youtube", isActive: true },
    ],
  },
  trustBadges: [
    {
      title: "100% Fresh Bakes",
      subtitle: "Crafted upon order",
      icon: "award",
      color: "#ffd166",
      sortOrder: 1,
      isActive: true,
    },
    {
      title: "Handpicked Blooms",
      subtitle: "Farm-fresh daily",
      icon: "heart",
      color: "#D82B76",
      sortOrder: 2,
      isActive: true,
    },
    {
      title: "Express & Midnight",
      subtitle: "Surprise slots",
      icon: "truck",
      color: "#ffd166",
      sortOrder: 3,
      isActive: true,
    },
    {
      title: "Secure Checkout",
      subtitle: "Encrypted UPI",
      icon: "shield",
      color: "#4ade80",
      sortOrder: 4,
      isActive: true,
    },
  ],
  columns: [
    {
      title: "Explore",
      sortOrder: 1,
      isActive: true,
      links: [
        { label: "All Categories", url: "/categories", badge: "", isExternal: false, sortOrder: 1, isActive: true },
        { label: "Moments Gallery", url: "/gallery", badge: "New", isExternal: false, sortOrder: 2, isActive: true },
        { label: "Celebrations", url: "/occasions", badge: "", isExternal: false, sortOrder: 3, isActive: true },
        { label: "Festive Offers", url: "/offers", badge: "", isExternal: false, sortOrder: 4, isActive: true },
        { label: "Saved Wishlist", url: "/wishlist", badge: "", isExternal: false, sortOrder: 5, isActive: true },
        { label: "Track Orders", url: "/orders", badge: "", isExternal: false, sortOrder: 6, isActive: true },
      ],
    },
    {
      title: "Company & Trust",
      sortOrder: 2,
      isActive: true,
      links: [
        {
          label: "Google Reviews (4.9 ★)",
          url: "https://www.google.com/search?q=GiftFestive+Faridabad+Reviews",
          badge: "4.9 ★",
          isExternal: true,
          sortOrder: 1,
          isActive: true,
        },
        { label: "About Us (Sonu Prajapati)", url: "/about", badge: "", isExternal: false, sortOrder: 2, isActive: true },
        { label: "Contact Support", url: "/contact", badge: "", isExternal: false, sortOrder: 3, isActive: true },
        { label: "Shipping & Delivery Info", url: "/shipping", badge: "", isExternal: false, sortOrder: 4, isActive: true },
        { label: "Quality & Freshness Guarantee", url: "/refunds", badge: "", isExternal: false, sortOrder: 5, isActive: true },
        { label: "Privacy Policy", url: "/privacy", badge: "", isExternal: false, sortOrder: 6, isActive: true },
        { label: "Terms of Service", url: "/terms", badge: "", isExternal: false, sortOrder: 7, isActive: true },
      ],
    },
  ],
  newsletter: {
    title: "The Festive Club",
    description: "Subscribe for secret promo codes, new arrivals & festive discounts.",
    placeholder: "Enter your email...",
    buttonText: "Subscribe",
    disclaimer: "No spam. Unsubscribe anytime.",
    isEnabled: true,
  },
  bottomStrip: {
    copyrightText: "© {year} GiftFestive. All rights reserved. Founded with love for celebrations.",
    paymentMethods: ["UPI", "Cards", "NetBanking", "Cash on Delivery"],
    taglineBadge: "100% Safe & Secure • Made with ❤️",
  },
  seo: {
    organizationName: "GiftFestive",
    founderName: "Sonu Prajapati",
    telephone: "+91 98765 43210",
    email: "support@giftfestive.in",
    addressLocality: "Faridabad",
    addressRegion: "Haryana",
    postalCode: "121001",
    addressCountry: "IN",
    googleReviewsRating: "4.9",
    googleReviewsCount: "500+",
    googleReviewsUrl: "https://www.google.com/search?q=GiftFestive+Faridabad+Reviews",
    richSnippetsEnabled: true,
    customSchemaJson: "",
    seoKeywords: [
      "Online cake delivery Faridabad",
      "Surprise gift service",
      "Flower bouquet Faridabad",
      "Midnight cake delivery",
    ],
  },
});

/**
 * Ensures a footer document exists in MongoDB, seeding defaults if missing.
 */
const getOrCreateFooterDoc = async () => {
  let doc = await Footer.findOne({ key: "main_footer" });
  if (!doc) {
    doc = await Footer.create(getDefaultFooterData());
  }
  return doc;
};

/**
 * Public compiled footer for website with only active trust badges, columns, and links.
 * Highly optimized and SEO friendly.
 */
exports.getPublicFooter = async () => {
  const doc = await getOrCreateFooterDoc();
  const raw = doc.toObject();

  // Filter and sort trust badges
  const activeBadges = (raw.trustBadges || [])
    .filter((b) => b.isActive !== false)
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

  // Filter and sort columns and their links
  const activeColumns = (raw.columns || [])
    .filter((c) => c.isActive !== false)
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
    .map((col) => ({
      ...col,
      links: (col.links || [])
        .filter((l) => l.isActive !== false)
        .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)),
    }));

  return {
    ...raw,
    trustBadges: activeBadges,
    columns: activeColumns,
  };
};

/**
 * Admin view of complete footer config including inactive elements and stats
 */
exports.getAdminFooter = async () => {
  const doc = await getOrCreateFooterDoc();
  return doc.toObject();
};

/**
 * Update root footer fields or entire configuration
 */
exports.updateFooter = async (payload, adminId) => {
  const doc = await getOrCreateFooterDoc();
  if (payload.brand) doc.brand = { ...doc.brand, ...payload.brand };
  if (payload.newsletter) doc.newsletter = { ...doc.newsletter, ...payload.newsletter };
  if (payload.bottomStrip) doc.bottomStrip = { ...doc.bottomStrip, ...payload.bottomStrip };
  if (payload.seo) doc.seo = { ...doc.seo, ...payload.seo };
  if (Array.isArray(payload.trustBadges)) doc.trustBadges = payload.trustBadges;
  if (Array.isArray(payload.columns)) doc.columns = payload.columns;
  if (adminId) doc.lastUpdatedBy = adminId;

  await doc.save();
  return doc.toObject();
};

/**
 * Update Brand & Contact Information
 */
exports.updateBrand = async (brandData, adminId) => {
  const doc = await getOrCreateFooterDoc();
  doc.brand = { ...doc.brand, ...brandData };
  if (adminId) doc.lastUpdatedBy = adminId;
  await doc.save();
  return doc.brand;
};

/**
 * Update Newsletter Settings
 */
exports.updateNewsletter = async (newsletterData, adminId) => {
  const doc = await getOrCreateFooterDoc();
  doc.newsletter = { ...doc.newsletter, ...newsletterData };
  if (adminId) doc.lastUpdatedBy = adminId;
  await doc.save();
  return doc.newsletter;
};

/**
 * Update Bottom Strip & Legal Settings
 */
exports.updateBottomStrip = async (bottomData, adminId) => {
  const doc = await getOrCreateFooterDoc();
  doc.bottomStrip = { ...doc.bottomStrip, ...bottomData };
  if (adminId) doc.lastUpdatedBy = adminId;
  await doc.save();
  return doc.bottomStrip;
};

/**
 * Update Footer SEO & Schema Settings
 */
exports.updateSeo = async (seoData, adminId) => {
  const doc = await getOrCreateFooterDoc();
  doc.seo = { ...doc.seo, ...seoData };
  if (adminId) doc.lastUpdatedBy = adminId;
  await doc.save();
  return doc.seo;
};

/**
 * Add a new Trust Badge
 */
exports.addBadge = async (badgeData, adminId) => {
  const doc = await getOrCreateFooterDoc();
  const maxOrder = doc.trustBadges.reduce((max, b) => Math.max(max, b.sortOrder || 0), 0);
  doc.trustBadges.push({
    ...badgeData,
    sortOrder: badgeData.sortOrder !== undefined ? badgeData.sortOrder : maxOrder + 1,
  });
  if (adminId) doc.lastUpdatedBy = adminId;
  await doc.save();
  return doc.trustBadges[doc.trustBadges.length - 1];
};

/**
 * Update a Trust Badge
 */
exports.updateBadge = async (badgeId, badgeData, adminId) => {
  const doc = await getOrCreateFooterDoc();
  const badge = doc.trustBadges.id(badgeId);
  if (!badge) throw new Error("Trust badge not found");
  Object.assign(badge, badgeData);
  if (adminId) doc.lastUpdatedBy = adminId;
  await doc.save();
  return badge;
};

/**
 * Delete a Trust Badge
 */
exports.deleteBadge = async (badgeId, adminId) => {
  const doc = await getOrCreateFooterDoc();
  doc.trustBadges.pull({ _id: badgeId });
  if (adminId) doc.lastUpdatedBy = adminId;
  await doc.save();
  return { success: true };
};

/**
 * Add a new Navigation Column
 */
exports.addColumn = async (columnData, adminId) => {
  const doc = await getOrCreateFooterDoc();
  const maxOrder = doc.columns.reduce((max, c) => Math.max(max, c.sortOrder || 0), 0);
  doc.columns.push({
    title: columnData.title,
    sortOrder: columnData.sortOrder !== undefined ? columnData.sortOrder : maxOrder + 1,
    isActive: columnData.isActive !== false,
    links: columnData.links || [],
  });
  if (adminId) doc.lastUpdatedBy = adminId;
  await doc.save();
  return doc.columns[doc.columns.length - 1];
};

/**
 * Update a Navigation Column
 */
exports.updateColumn = async (columnId, columnData, adminId) => {
  const doc = await getOrCreateFooterDoc();
  const col = doc.columns.id(columnId);
  if (!col) throw new Error("Column not found");
  if (columnData.title !== undefined) col.title = columnData.title;
  if (columnData.sortOrder !== undefined) col.sortOrder = columnData.sortOrder;
  if (columnData.isActive !== undefined) col.isActive = columnData.isActive;
  if (Array.isArray(columnData.links)) col.links = columnData.links;
  if (adminId) doc.lastUpdatedBy = adminId;
  await doc.save();
  return col;
};

/**
 * Delete a Navigation Column
 */
exports.deleteColumn = async (columnId, adminId) => {
  const doc = await getOrCreateFooterDoc();
  doc.columns.pull({ _id: columnId });
  if (adminId) doc.lastUpdatedBy = adminId;
  await doc.save();
  return { success: true };
};

/**
 * Add a link to a Column
 */
exports.addLink = async (columnId, linkData, adminId) => {
  const doc = await getOrCreateFooterDoc();
  const col = doc.columns.id(columnId);
  if (!col) throw new Error("Column not found");
  const maxOrder = col.links.reduce((max, l) => Math.max(max, l.sortOrder || 0), 0);
  col.links.push({
    label: linkData.label,
    url: linkData.url,
    badge: linkData.badge || "",
    badgeColor: linkData.badgeColor || "",
    isExternal: !!linkData.isExternal,
    sortOrder: linkData.sortOrder !== undefined ? linkData.sortOrder : maxOrder + 1,
    isActive: linkData.isActive !== false,
  });
  if (adminId) doc.lastUpdatedBy = adminId;
  await doc.save();
  return col.links[col.links.length - 1];
};

/**
 * Update a link in a Column
 */
exports.updateLink = async (columnId, linkId, linkData, adminId) => {
  const doc = await getOrCreateFooterDoc();
  const col = doc.columns.id(columnId);
  if (!col) throw new Error("Column not found");
  const link = col.links.id(linkId);
  if (!link) throw new Error("Link not found");
  Object.assign(link, linkData);
  if (adminId) doc.lastUpdatedBy = adminId;
  await doc.save();
  return link;
};

/**
 * Delete a link from a Column
 */
exports.deleteLink = async (columnId, linkId, adminId) => {
  const doc = await getOrCreateFooterDoc();
  const col = doc.columns.id(columnId);
  if (!col) throw new Error("Column not found");
  col.links.pull({ _id: linkId });
  if (adminId) doc.lastUpdatedBy = adminId;
  await doc.save();
  return { success: true };
};

/**
 * Reset footer to standard defaults
 */
exports.resetDefaults = async (adminId) => {
  let doc = await Footer.findOne({ key: "main_footer" });
  const defaults = getDefaultFooterData();
  if (!doc) {
    doc = await Footer.create(defaults);
  } else {
    Object.assign(doc, defaults);
    if (adminId) doc.lastUpdatedBy = adminId;
    await doc.save();
  }
  return doc.toObject();
};
