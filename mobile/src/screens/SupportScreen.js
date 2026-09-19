import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Linking,
  Modal,
} from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeScreen, ScreenHeader } from '../components/layout';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLayoutInsets } from '../hooks/useLayoutInsets';
import supportService from '../services/supportService';

const ISSUE_CATEGORIES = [
  { id: 'order_status', label: 'Order Status & Tracking', icon: 'truck' },
  { id: 'damaged_item', label: 'Damaged / Wrong Item', icon: 'alert-triangle' },
  { id: 'refund_cancel', label: 'Cancellation & Refund', icon: 'dollar-sign' },
  { id: 'delivery_delay', label: 'Delivery Delay', icon: 'clock' },
  { id: 'payment_issue', label: 'Payment / Billing Issue', icon: 'credit-card' },
  { id: 'general', label: 'General Inquiry', icon: 'help-circle' },
];

export default function SupportScreen({ navigation, route }) {
  const { user } = useContext(AuthContext);
  const { showToast } = useToast();
  const { bottom } = useLayoutInsets();

  const initialOrderId = route.params?.orderId || '';

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    mobileNumber: user?.mobileNumber ? String(user.mobileNumber) : '',
    subject: '',
    orderId: initialOrderId,
    message: '',
    priority: 'medium',
  });

  const [selectedCategory, setSelectedCategory] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [submittedTicket, setSubmittedTicket] = useState(null);

  useEffect(() => {
    if (initialOrderId) {
      setFormData((prev) => ({ ...prev, orderId: initialOrderId, subject: `Inquiry for Order #${initialOrderId.slice(-6).toUpperCase()}` }));
    }
  }, [initialOrderId]);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category.id);
    setFormData((prev) => ({
      ...prev,
      subject: category.label,
    }));
    if (errors.subject) {
      setErrors((prev) => ({ ...prev, subject: null }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Full name is required';
    if (!formData.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errs.email = 'Please enter a valid email address';
    }
    if (!formData.mobileNumber.trim()) {
      errs.mobileNumber = 'Mobile number is required';
    } else if (formData.mobileNumber.replace(/\D/g, '').length < 10) {
      errs.mobileNumber = 'Please enter a valid 10-digit mobile number';
    }
    if (!formData.subject.trim()) errs.subject = 'Please select or enter an issue subject';
    if (!formData.message.trim()) {
      errs.message = 'Please provide details about your issue';
    } else if (formData.message.trim().length < 10) {
      errs.message = 'Message must be at least 10 characters long';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      showToast('Please correct the errors in the form', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        mobileNumber: formData.mobileNumber.trim(),
        subject: formData.subject.trim(),
        orderId: formData.orderId.trim() || undefined,
        message: formData.message.trim(),
        priority: formData.priority || 'medium',
      };

      const res = await supportService.createTicket(payload);
      setSubmittedTicket(res.data || { _id: 'SUBMITTED' });
      showToast('Inquiry submitted successfully!', 'success');
    } catch (err) {
      console.error('Support ticket submit error:', err);
      showToast(err.message || 'Failed to submit inquiry. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const openHelpline = () => {
    Linking.openURL('tel:+919876543210').catch(() => {
      showToast('Could not open phone dialer', 'error');
    });
  };

  const openWhatsApp = () => {
    const text = encodeURIComponent('Hello GiftFestive Support, I need assistance with my order.');
    Linking.openURL(`https://wa.me/919876543210?text=${text}`).catch(() => {
      showToast('Could not open WhatsApp', 'error');
    });
  };

  const openEmail = () => {
    Linking.openURL('mailto:support@giftfestive.com?subject=Customer Support Inquiry').catch(() => {
      showToast('Could not open email app', 'error');
    });
  };

  return (
    <SafeScreen style={styles.container}>
      <ScreenHeader
        title="Customer Support"
        onBack={() => navigation.goBack()}
        border
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: bottom + 32 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Top Info Banner */}
          <View style={styles.bannerCard}>
            <View style={styles.bannerIconBox}>
              <MaterialCommunityIcons name="headset" size={28} color="#D82B76" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.bannerTitle}>We're Here to Help</Text>
              <Text style={styles.bannerDesc}>
                Have a question or facing an issue? Fill out the details below and our team will get in touch with you shortly.
              </Text>
            </View>
          </View>

          {/* Quick Issue Category Chips */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What can we help you with?</Text>
            <Text style={styles.sectionSubtitle}>Tap an issue category to quickly set the topic:</Text>
            <View style={styles.categoryGrid}>
              {ISSUE_CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.categoryChip, isSelected && styles.categoryChipActive]}
                    onPress={() => handleCategorySelect(cat)}
                    activeOpacity={0.8}
                  >
                    <Feather
                      name={cat.icon}
                      size={14}
                      color={isSelected ? '#FFF' : '#D82B76'}
                    />
                    <Text style={[styles.categoryChipText, isSelected && styles.categoryChipTextActive]}>
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Inquiry Details</Text>

            {/* Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Full Name <Text style={styles.required}>*</Text>
              </Text>
              <View style={[styles.inputWrapper, errors.name && styles.inputError]}>
                <Feather name="user" size={16} color="#888" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your name"
                  placeholderTextColor="#AAA"
                  value={formData.name}
                  onChangeText={(val) => {
                    setFormData((p) => ({ ...p, name: val }));
                    if (errors.name) setErrors((p) => ({ ...p, name: null }));
                  }}
                />
              </View>
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Email Address <Text style={styles.required}>*</Text>
              </Text>
              <View style={[styles.inputWrapper, errors.email && styles.inputError]}>
                <Feather name="mail" size={16} color="#888" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="you@example.com"
                  placeholderTextColor="#AAA"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={formData.email}
                  onChangeText={(val) => {
                    setFormData((p) => ({ ...p, email: val }));
                    if (errors.email) setErrors((p) => ({ ...p, email: null }));
                  }}
                />
              </View>
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            {/* Mobile Number */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Mobile Number <Text style={styles.required}>*</Text>
              </Text>
              <View style={[styles.inputWrapper, errors.mobileNumber && styles.inputError]}>
                <Text style={styles.countryCode}>+91</Text>
                <TextInput
                  style={styles.input}
                  placeholder="10-digit mobile number"
                  placeholderTextColor="#AAA"
                  keyboardType="phone-pad"
                  maxLength={10}
                  value={formData.mobileNumber}
                  onChangeText={(val) => {
                    setFormData((p) => ({ ...p, mobileNumber: val.replace(/\D/g, '') }));
                    if (errors.mobileNumber) setErrors((p) => ({ ...p, mobileNumber: null }));
                  }}
                />
              </View>
              {errors.mobileNumber && <Text style={styles.errorText}>{errors.mobileNumber}</Text>}
            </View>

            {/* Subject */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Subject / Issue <Text style={styles.required}>*</Text>
              </Text>
              <View style={[styles.inputWrapper, errors.subject && styles.inputError]}>
                <Feather name="tag" size={16} color="#888" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Delivery status inquiry"
                  placeholderTextColor="#AAA"
                  value={formData.subject}
                  onChangeText={(val) => {
                    setFormData((p) => ({ ...p, subject: val }));
                    if (errors.subject) setErrors((p) => ({ ...p, subject: null }));
                  }}
                />
              </View>
              {errors.subject && <Text style={styles.errorText}>{errors.subject}</Text>}
            </View>

            {/* Order ID (Optional) */}
            <View style={styles.inputGroup}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={styles.label}>Order ID</Text>
                <Text style={styles.optionalBadge}>Optional</Text>
              </View>
              <View style={styles.inputWrapper}>
                <Feather name="package" size={16} color="#888" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 660e8400..."
                  placeholderTextColor="#AAA"
                  value={formData.orderId}
                  onChangeText={(val) => setFormData((p) => ({ ...p, orderId: val }))}
                />
              </View>
              {initialOrderId ? (
                <Text style={styles.helpHint}>Linked to order #{initialOrderId.slice(-6).toUpperCase()}</Text>
              ) : null}
            </View>

            {/* Priority */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Urgency Level</Text>
              <View style={styles.priorityRow}>
                {[
                  { id: 'low', label: 'Normal' },
                  { id: 'medium', label: 'Important' },
                  { id: 'urgent', label: 'Urgent' },
                ].map((p) => (
                  <TouchableOpacity
                    key={p.id}
                    style={[styles.priorityBtn, formData.priority === p.id && styles.priorityBtnActive]}
                    onPress={() => setFormData((prev) => ({ ...prev, priority: p.id }))}
                  >
                    <Text style={[styles.priorityText, formData.priority === p.id && styles.priorityTextActive]}>
                      {p.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Message */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Describe your inquiry / message <Text style={styles.required}>*</Text>
              </Text>
              <View style={[styles.textAreaWrapper, errors.message && styles.inputError]}>
                <TextInput
                  style={styles.textArea}
                  placeholder="Please describe your issue or question in detail..."
                  placeholderTextColor="#AAA"
                  multiline
                  numberOfLines={5}
                  textAlignVertical="top"
                  value={formData.message}
                  onChangeText={(val) => {
                    setFormData((p) => ({ ...p, message: val }));
                    if (errors.message) setErrors((p) => ({ ...p, message: null }));
                  }}
                />
              </View>
              {errors.message && <Text style={styles.errorText}>{errors.message}</Text>}
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={submitting}
              activeOpacity={0.85}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <>
                  <Feather name="send" size={18} color="#FFF" style={{ marginRight: 8 }} />
                  <Text style={styles.submitBtnText}>Submit Support Ticket</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Quick Direct Contacts */}
          <View style={styles.contactSection}>
            <Text style={styles.contactSectionTitle}>Instant Assistance</Text>
            <View style={styles.quickCardsRow}>
              <TouchableOpacity style={styles.quickCard} onPress={openWhatsApp}>
                <View style={[styles.quickIconBox, { backgroundColor: '#E8F5E9' }]}>
                  <MaterialCommunityIcons name="whatsapp" size={24} color="#25D366" />
                </View>
                <Text style={styles.quickCardTitle}>WhatsApp</Text>
                <Text style={styles.quickCardSub}>Live Chat</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.quickCard} onPress={openHelpline}>
                <View style={[styles.quickIconBox, { backgroundColor: '#E0F2FE' }]}>
                  <Feather name="phone-call" size={22} color="#0284C7" />
                </View>
                <Text style={styles.quickCardTitle}>Call Us</Text>
                <Text style={styles.quickCardSub}>+91 98765 43210</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.quickCard} onPress={openEmail}>
                <View style={[styles.quickIconBox, { backgroundColor: '#FDF2F8' }]}>
                  <Feather name="mail" size={22} color="#D82B76" />
                </View>
                <Text style={styles.quickCardTitle}>Email</Text>
                <Text style={styles.quickCardSub}>24x7 Help</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Success Modal */}
      <Modal
        visible={!!submittedTicket}
        transparent
        animationType="fade"
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.successIconBox}>
              <Ionicons name="checkmark-circle" size={64} color="#10B981" />
            </View>
            <Text style={styles.modalTitle}>Inquiry Submitted!</Text>
            <Text style={styles.modalSubtitle}>
              Thank you for contacting GiftFestive support. Your ticket has been registered successfully.
            </Text>

            {submittedTicket?._id && (
              <View style={styles.ticketIdBadge}>
                <Text style={styles.ticketIdLabel}>Reference Ticket ID:</Text>
                <Text style={styles.ticketIdValue}>#{String(submittedTicket._id).slice(-8).toUpperCase()}</Text>
              </View>
            )}

            <Text style={styles.modalTimeNotice}>
              Our customer happiness team will review your inquiry and reach out to you within 2-4 hours.
            </Text>

            <TouchableOpacity
              style={styles.modalDoneBtn}
              onPress={() => {
                setSubmittedTicket(null);
                navigation.goBack();
              }}
            >
              <Text style={styles.modalDoneBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  scroll: {
    padding: 16,
  },
  bannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0F5',
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FCE7F3',
    gap: 14,
  },
  bannerIconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#FFE4E6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#9F1239',
    marginBottom: 4,
  },
  bannerDesc: {
    fontSize: 12,
    color: '#881337',
    lineHeight: 18,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 12,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#FBCFE8',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  categoryChipActive: {
    backgroundColor: '#D82B76',
    borderColor: '#D82B76',
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D82B76',
  },
  categoryChipTextActive: {
    color: '#FFF',
  },
  formCard: {
    backgroundColor: '#FFF',
    borderRadius: 22,
    padding: 20,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  required: {
    color: '#E11D48',
  },
  optionalBadge: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 48,
  },
  inputError: {
    borderColor: '#E11D48',
    backgroundColor: '#FFF1F2',
  },
  inputIcon: {
    marginRight: 10,
  },
  countryCode: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
    marginRight: 8,
    borderRightWidth: 1,
    borderRightColor: '#CBD5E1',
    paddingRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    paddingVertical: 8,
  },
  textAreaWrapper: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 12,
    minHeight: 110,
  },
  textArea: {
    fontSize: 14,
    color: '#0F172A',
    minHeight: 90,
  },
  errorText: {
    fontSize: 11,
    color: '#E11D48',
    marginTop: 4,
    fontWeight: '600',
  },
  helpHint: {
    fontSize: 11,
    color: '#10B981',
    marginTop: 4,
    fontWeight: '600',
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  priorityBtnActive: {
    backgroundColor: '#D82B76',
    borderColor: '#D82B76',
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  priorityTextActive: {
    color: '#FFF',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D82B76',
    borderRadius: 16,
    paddingVertical: 15,
    marginTop: 8,
    elevation: 3,
    shadowColor: '#D82B76',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFF',
  },
  contactSection: {
    marginTop: 4,
  },
  contactSectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 12,
  },
  quickCardsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  quickCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    elevation: 1,
  },
  quickIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickCardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  quickCardSub: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
    textAlign: 'center',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
  },
  successIconBox: {
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  ticketIdBadge: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    marginBottom: 14,
    width: '100%',
  },
  ticketIdLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  ticketIdValue: {
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: '800',
    color: '#D82B76',
    marginTop: 2,
  },
  modalTimeNotice: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 17,
    marginBottom: 20,
  },
  modalDoneBtn: {
    backgroundColor: '#D82B76',
    borderRadius: 14,
    paddingVertical: 13,
    width: '100%',
    alignItems: 'center',
  },
  modalDoneBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
