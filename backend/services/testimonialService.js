const Testimonial = require("../models/Testimonial");
require("../models/Product");

const initialTestimonials = [
  {
    name: "Pooja Sharma",
    designation: "Verified Buyer",
    company: "Delhi",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop",
    rating: 5,
    title: "Astonishing Flowers & Timely Midnight Delivery!",
    message: "I ordered a midnight red roses bouquet with customized chocolate hamper for my sister's birthday. The flowers arrived at 12:02 AM sharp, completely fresh and exquisitely packed. Customer support was also very cooperative!",
    platform: "google",
    order: 0,
    isFeatured: true,
    isActive: true,
  },
  {
    name: "Rohit Verma",
    designation: "Corporate HR Manager",
    company: "Infosys, Bengaluru",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop",
    rating: 5,
    title: "Seamless Bulk Gifting for Our Employees",
    message: "We partnered with Giftcart for Diwali and New Year gift hampers for over 350 team members across 12 cities. Every single hamper was delivered on time with zero damages. The personalized branding on boxes was top notch.",
    platform: "website",
    order: 1,
    isFeatured: true,
    isActive: true,
  },
  {
    name: "Ananya Deshmukh",
    designation: "Bride & Event Planner",
    company: "Mumbai",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop",
    rating: 5,
    title: "The Wedding Return Favors Were Loved by Everyone!",
    message: "Thank you so much team! The custom engraved dry fruit hampers and artisanal scented candles made our wedding giveaways so memorable. Everyone kept asking where we ordered them from.",
    platform: "instagram",
    order: 2,
    isFeatured: true,
    isActive: true,
  },
  {
    name: "Vikramaditya Rao",
    designation: "Architect",
    company: "Hyderabad",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop",
    rating: 4,
    title: "Premium Quality Gourmet Basket",
    message: "Superb selection of international chocolates and imported cheeses in the luxury hamper. Delivery was seamless and packaging was pristine. Will definitely reorder for upcoming family celebrations.",
    platform: "trustpilot",
    order: 3,
    isFeatured: false,
    isActive: true,
  },
];

// Automatically seed initial testimonials if collection is empty
const ensureInitialSeeded = async () => {
  try {
    const count = await Testimonial.countDocuments();
    if (count === 0) {
      await Testimonial.insertMany(initialTestimonials);
      console.log("✅ Seeded initial testimonials successfully.");
    }
  } catch (error) {
    console.error("Error seeding testimonials:", error.message);
  }
};

exports.getPublicTestimonials = async ({ featuredOnly = false, limit = 10 } = {}) => {
  await ensureInitialSeeded();
  const query = { isActive: true };
  if (featuredOnly) query.isFeatured = true;

  const data = await Testimonial.find(query)
    .sort({ order: 1, createdAt: -1 })
    .limit(Number(limit) || 10)
    .populate("product", "name price image");

  return data;
};

exports.getTestimonials = async ({
  page = 1,
  limit = 10,
  search = "",
  platform = "",
  rating = "",
  isFeatured = "",
  isActive = "",
  all = false,
}) => {
  await ensureInitialSeeded();
  const query = {};

  if (search && search.trim()) {
    const searchRegex = new RegExp(search.trim(), "i");
    query.$or = [
      { name: searchRegex },
      { company: searchRegex },
      { designation: searchRegex },
      { title: searchRegex },
      { message: searchRegex },
    ];
  }

  if (platform && platform !== "all") {
    query.platform = platform;
  }

  if (rating && rating !== "all") {
    query.rating = { $gte: Number(rating) };
  }

  if (isFeatured !== "" && isFeatured !== "all") {
    query.isFeatured = isFeatured === "true" || isFeatured === true;
  }

  if (isActive !== "" && isActive !== "all") {
    query.isActive = isActive === "true" || isActive === true;
  }

  // Quick stats calculation
  const [totalCount, activeCount, featuredCount, avgRatingResult] = await Promise.all([
    Testimonial.countDocuments(),
    Testimonial.countDocuments({ isActive: true }),
    Testimonial.countDocuments({ isFeatured: true }),
    Testimonial.aggregate([
      { $group: { _id: null, avg: { $avg: "$rating" } } }
    ]),
  ]);

  const stats = {
    total: totalCount,
    active: activeCount,
    featured: featuredCount,
    avgRating: avgRatingResult.length > 0 ? Number(avgRatingResult[0].avg.toFixed(1)) : 5.0,
  };

  if (all === "true" || all === true) {
    const data = await Testimonial.find(query)
      .sort({ order: 1, createdAt: -1 })
      .populate("product", "name price image");
    return { success: true, data, total: data.length, stats };
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, parseInt(limit, 10) || 10);
  const skip = (pageNum - 1) * limitNum;

  const [data, totalFiltered] = await Promise.all([
    Testimonial.find(query)
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate("product", "name price image"),
    Testimonial.countDocuments(query),
  ]);

  return {
    success: true,
    data,
    total: totalFiltered,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(totalFiltered / limitNum) || 1,
    stats,
  };
};

exports.getTestimonialById = async (id) => {
  return Testimonial.findById(id).populate("product", "name price image");
};

exports.createTestimonial = async (data) => {
  const testimonial = new Testimonial({
    name: data.name,
    designation: data.designation || "",
    company: data.company || "",
    avatar: data.avatar || "",
    rating: data.rating !== undefined ? Number(data.rating) : 5,
    title: data.title || "",
    message: data.message,
    platform: data.platform || "website",
    videoUrl: data.videoUrl || "",
    product: data.product || null,
    order: data.order !== undefined ? Number(data.order) : 0,
    isFeatured: Boolean(data.isFeatured),
    isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
    date: data.date ? new Date(data.date) : new Date(),
  });
  return testimonial.save();
};

exports.updateTestimonial = async (id, data) => {
  const updateData = { ...data };
  if (updateData.rating !== undefined) updateData.rating = Number(updateData.rating);
  if (updateData.order !== undefined) updateData.order = Number(updateData.order);
  if (updateData.isActive !== undefined) updateData.isActive = Boolean(updateData.isActive);
  if (updateData.isFeatured !== undefined) updateData.isFeatured = Boolean(updateData.isFeatured);

  return Testimonial.findByIdAndUpdate(id, updateData, { returnDocument: "after", new: true, runValidators: true });
};

exports.updateStatus = async (id, { isActive, isFeatured }) => {
  const updatePayload = {};
  if (isActive !== undefined) updatePayload.isActive = Boolean(isActive);
  if (isFeatured !== undefined) updatePayload.isFeatured = Boolean(isFeatured);

  return Testimonial.findByIdAndUpdate(id, updatePayload, { returnDocument: "after", new: true });
};

exports.deleteTestimonial = async (id) => {
  return Testimonial.findByIdAndDelete(id);
};

exports.bulkDeleteTestimonials = async (ids) => {
  if (!Array.isArray(ids) || ids.length === 0) return { deletedCount: 0 };
  return Testimonial.deleteMany({ _id: { $in: ids } });
};

exports.reorderTestimonials = async (items) => {
  if (!Array.isArray(items)) return [];
  const bulkOps = items.map((item) => ({
    updateOne: {
      filter: { _id: item.id },
      update: { $set: { order: Number(item.order) || 0 } },
    },
  }));
  return Testimonial.bulkWrite(bulkOps);
};
