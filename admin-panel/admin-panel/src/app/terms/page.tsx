"use client";

import ProtectedRoute from "../components/ProtectedRoute";
import AdminMain from "../components/AdminMain";

export default function TermsPolicyPage() {
  return (
    <ProtectedRoute>
      <AdminMain>
        <div className="mb-6 lg:mb-8">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500 sm:text-sm">
            Terms & Policy
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
            GiftCart Terms & Policy
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            This page contains the terms and conditions and privacy policy for GiftCart.
          </p>
        </div>

        <section className="space-y-6">
          <div className="rounded-3xl border border-border-theme bg-card p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">Terms and Conditions</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Welcome to GiftCart. By using our platform, you agree to follow these terms and conditions.
            </p>
            <div className="mt-5 space-y-4 text-sm leading-7 text-slate-600">
              <p>
                1. Use of Service: GiftCart is provided for lawful personal and business orders. You must not use the platform
                for illegal products, fraud, or any activity that violates local laws.
              </p>
              <p>
                2. Account Security: Keep your account credentials private, and inform us immediately if you suspect unauthorized access.
              </p>
              <p>
                3. Orders and Payments: All orders are subject to product availability and payment verification. Delivery times may vary.
              </p>
              <p>
                4. Cancellations and Refunds: Refunds are handled according to our refund policy and may require verification of the order.
              </p>
              <p>
                5. Changes to Terms: We may update these terms from time to time. Continued use after changes means you accept them.
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-border-theme bg-card p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">Privacy Policy</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              GiftCart respects your privacy. This policy explains how we collect, use, and protect your personal information.
            </p>
            <div className="mt-5 space-y-4 text-sm leading-7 text-slate-600">
              <p>
                1. Data Collection: We collect information such as name, email, address, order details, and payment status
                to process orders and improve your experience.
              </p>
              <p>
                2. Data Use: Your data is used to fulfill orders, send updates, personalize the app experience, and provide support.
              </p>
              <p>
                3. Data Protection: We use security practices to protect your information from unauthorized access.
              </p>
              <p>
                4. Third Party Services: We may share necessary order data with payment processors, shipping partners, and analytics providers.
              </p>
              <p>
                5. Your Rights: You can request access, correction, or removal of your personal data by contacting our support team.
              </p>
            </div>
          </div>
        </section>
      </AdminMain>
    </ProtectedRoute>
  );
}
