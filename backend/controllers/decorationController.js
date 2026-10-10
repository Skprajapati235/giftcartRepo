/**
 * Legacy facade for decorationController
 * Re-exports methods from modularized controllers in ./decoration/
 */
const {
  decorationPackageController,
  decorationPartnerController,
  decorationBookingController,
  decorationSampleController,
  decorationAnalyticsController,
} = require("./decoration");

module.exports = {
  // Packages
  getPackages: (req, res) => decorationPackageController.getPackages(req, res),
  getPackageBySlug: (req, res) => decorationPackageController.getPackageBySlug(req, res),
  createPackage: (req, res) => decorationPackageController.createPackage(req, res),
  updatePackage: (req, res) => decorationPackageController.updatePackage(req, res),
  deletePackage: (req, res) => decorationPackageController.deletePackage(req, res),

  // Partners
  getDecoratorPartners: (req, res) => decorationPartnerController.getDecoratorPartners(req, res),
  getDecoratorPartnerById: (req, res) => decorationPartnerController.getDecoratorPartnerById(req, res),
  createDecoratorPartner: (req, res) => decorationPartnerController.createDecoratorPartner(req, res),
  updateDecoratorPartner: (req, res) => decorationPartnerController.updateDecoratorPartner(req, res),
  deleteDecoratorPartner: (req, res) => decorationPartnerController.deleteDecoratorPartner(req, res),

  // Bookings & Live Customer Tracking
  createBooking: (req, res) => decorationBookingController.createBooking(req, res),
  trackBooking: (req, res) => decorationBookingController.trackBooking(req, res),
  getAllBookings: (req, res) => decorationBookingController.getAllBookings(req, res),
  getBookingById: (req, res) => decorationBookingController.getBookingById(req, res),
  updateBookingStatus: (req, res) => decorationBookingController.updateBookingStatus(req, res),
  assignDecorator: (req, res) => decorationBookingController.assignDecorator(req, res),
  emailActionPreview: (req, res) => decorationBookingController.emailActionPreview(req, res),
  emailActionConfirm: (req, res) => decorationBookingController.emailActionConfirm(req, res),

  // Samples
  getSamples: (req, res) => decorationSampleController.getSamples(req, res),
  getSampleById: (req, res) => decorationSampleController.getSampleById(req, res),
  createSample: (req, res) => decorationSampleController.createSample(req, res),
  updateSample: (req, res) => decorationSampleController.updateSample(req, res),
  deleteSample: (req, res) => decorationSampleController.deleteSample(req, res),
  toggleSampleStorefront: (req, res) => decorationSampleController.toggleSampleStorefront(req, res),

  // Analytics
  getDecorationAnalytics: (req, res) => decorationAnalyticsController.getDecorationAnalytics(req, res),
};

