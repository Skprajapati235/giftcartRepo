import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatDeliveryDate, parseDateParts } from '../services/giftingService';

const SLOT_ICON = {
  standard: 'car-outline',
  fixed_time: 'time-outline',
  fixed: 'time-outline',
  midnight: 'moon',
  early_morning: 'sunny-outline',
};

const slotKey = (slot) => slot._id || slot.name;

/**
 * Delivery date chips + slot cards. Pure UI: the server decides which dates
 * and slots are open (cutoff, sold-out, IST) and this just renders it.
 */
export default function DeliverySchedulePicker({
  availability,
  refreshing,
  selectedDate,
  selectedSlotKey,
  onDateChange,
  onSelectSlot,
}) {
  if (!availability) return null;
  const { dates = [], slots = [], today } = availability;

  return (
    <View>
      {/* ── Date chips ── */}
      <Text style={styles.label}>Delivery date</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.dateRow}
      >
        {dates.map((d) => {
          const isSelected = d.date === selectedDate;
          const full = d.availableCount === 0;
          const p = parseDateParts(d.date);
          const relative = formatDeliveryDate(d.date, today);
          const isRelative = relative === 'Today' || relative === 'Tomorrow';
          return (
            <TouchableOpacity
              key={d.date}
              activeOpacity={0.8}
              onPress={() => onDateChange(d.date)}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`${relative}${full ? ', no slots left' : ''}`}
              style={[
                styles.dateChip,
                isSelected && styles.dateChipSelected,
                full && !isSelected && styles.dateChipFull,
              ]}
            >
              <Text style={[styles.dateTop, isSelected && styles.dateTextSelected]}>
                {isRelative ? relative : p.weekdayShort}
              </Text>
              <Text style={[styles.dateDay, isSelected && styles.dateTextSelected, full && !isSelected && styles.dateDayFull]}>
                {p.day}
              </Text>
              <Text style={[styles.dateMonth, isSelected && styles.dateTextSelected]}>{p.monthShort}</Text>
              {full && <Text style={styles.fullTag}>Full</Text>}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* ── Slots ── */}
      <Text style={[styles.label, { marginTop: 14 }]}>Time slot</Text>
      <View style={{ gap: 10, opacity: refreshing ? 0.55 : 1 }}>
        {refreshing && (
          <ActivityIndicator size="small" color="#D82B76" style={styles.refreshing} />
        )}
        {slots.map((slot) => {
          const isSelected = selectedSlotKey === slotKey(slot) && slot.available;
          const isMidnight = slot.type === 'midnight';
          const disabled = !slot.available;
          const charge = Number(slot.extraCharge || 0);
          const lowStock = slot.available && slot.remaining !== null && slot.remaining !== undefined && slot.remaining <= 3;

          return (
            <TouchableOpacity
              key={slotKey(slot)}
              activeOpacity={0.85}
              disabled={disabled}
              onPress={() => onSelectSlot(slot)}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected, disabled }}
              style={[
                styles.slot,
                isMidnight ? styles.slotMidnight : styles.slotNormal,
                isSelected && (isMidnight ? styles.slotMidnightSelected : styles.slotSelected),
                disabled && styles.slotDisabled,
              ]}
            >
              <View style={styles.slotTop}>
                <View style={[styles.iconWrap, isMidnight ? styles.iconWrapDark : styles.iconWrapLight]}>
                  <Ionicons
                    name={SLOT_ICON[slot.type] || 'car-outline'}
                    size={20}
                    color={isMidnight ? '#ffd166' : isSelected ? '#D82B76' : '#6B7280'}
                  />
                </View>

                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text
                    style={[
                      styles.slotName,
                      isMidnight ? { color: '#ffd166' } : isSelected ? { color: '#D82B76' } : null,
                    ]}
                  >
                    {slot.name}
                  </Text>
                  <Text style={[styles.slotWindow, isMidnight && { color: '#E5E7EB' }]}>
                    Window: <Text style={{ fontWeight: '800' }}>{slot.timeRange}</Text>
                  </Text>

                  {disabled ? (
                    <Text style={[styles.slotNote, { color: isMidnight ? '#FCD34D' : '#B45309' }]}>
                      {slot.unavailableReason}
                    </Text>
                  ) : slot.cutoffText ? (
                    <Text style={[styles.slotNote, { color: isMidnight ? '#FBCFE8' : '#6B7280' }]}>
                      {slot.cutoffText}
                    </Text>
                  ) : null}

                  {lowStock && (
                    <Text style={[styles.slotNote, { color: '#DC2626', fontWeight: '800' }]}>
                      Only {slot.remaining} left for this date
                    </Text>
                  )}

                  {slot.badge ? (
                    <View style={[styles.badge, isMidnight ? styles.badgeGold : styles.badgePink]}>
                      <Text style={[styles.badgeText, { color: isMidnight ? '#741343' : '#D82B76' }]}>
                        ★ {slot.badge}
                      </Text>
                    </View>
                  ) : null}
                </View>

                <View style={{ alignItems: 'flex-end' }}>
                  <Text
                    style={[
                      styles.charge,
                      { color: charge > 0 ? (isMidnight ? '#ffd166' : '#D97706') : '#16A34A' },
                    ]}
                  >
                    {charge > 0 ? `+₹${charge}` : 'FREE'}
                  </Text>
                  {isSelected && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={isMidnight ? '#ffd166' : '#D82B76'}
                      style={{ marginTop: 6 }}
                    />
                  )}
                </View>
              </View>

              {disabled && slot.nextAvailableDate ? (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => onDateChange(slot.nextAvailableDate)}
                  style={styles.nextBtn}
                >
                  <Text style={styles.nextBtnText}>
                    Available {formatDeliveryDate(slot.nextAvailableDate, today)} → Switch date
                  </Text>
                </TouchableOpacity>
              ) : null}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 12, fontWeight: '800', color: '#374151', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  dateRow: { gap: 8, paddingRight: 8 },
  dateChip: {
    width: 66,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFF',
    alignItems: 'center',
  },
  dateChipSelected: { borderColor: '#D82B76', backgroundColor: '#D82B76' },
  dateChipFull: { backgroundColor: '#F9FAFB', opacity: 0.7 },
  dateTop: { fontSize: 10, fontWeight: '700', color: '#6B7280' },
  dateDay: { fontSize: 20, fontWeight: '900', color: '#111827', marginVertical: 1 },
  dateDayFull: { color: '#9CA3AF' },
  dateMonth: { fontSize: 10, fontWeight: '700', color: '#6B7280' },
  dateTextSelected: { color: '#FFF' },
  fullTag: { fontSize: 9, fontWeight: '800', color: '#DC2626', marginTop: 2 },

  slot: { borderRadius: 16, borderWidth: 1.5, padding: 12 },
  slotNormal: { borderColor: '#E5E7EB', backgroundColor: '#FFF' },
  slotSelected: { borderColor: '#D82B76', backgroundColor: '#FFF0F5' },
  slotMidnight: { borderColor: 'rgba(116,19,67,0.35)', backgroundColor: '#2b0d20' },
  slotMidnightSelected: { borderColor: '#ffd166', backgroundColor: '#3a0e28' },
  slotDisabled: { opacity: 0.6 },
  slotTop: { flexDirection: 'row', alignItems: 'flex-start' },
  iconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  iconWrapLight: { backgroundColor: '#F3F4F6' },
  iconWrapDark: { backgroundColor: 'rgba(255,255,255,0.1)' },
  slotName: { fontSize: 14, fontWeight: '800', color: '#111827' },
  slotWindow: { fontSize: 12, color: '#6B7280', marginTop: 3 },
  slotNote: { fontSize: 11, fontWeight: '600', marginTop: 3 },
  badge: { alignSelf: 'flex-start', marginTop: 6, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  badgeGold: { backgroundColor: '#ffd166' },
  badgePink: { backgroundColor: '#FDF2F8', borderWidth: 1, borderColor: '#FBCFE8' },
  badgeText: { fontSize: 10, fontWeight: '800' },
  charge: { fontSize: 14, fontWeight: '900' },
  refreshing: { position: 'absolute', top: 8, alignSelf: 'center', zIndex: 2 },
  nextBtn: { marginTop: 10, paddingVertical: 8, borderRadius: 10, backgroundColor: '#FFF7ED', borderWidth: 1, borderColor: '#FED7AA', alignItems: 'center' },
  nextBtnText: { fontSize: 12, fontWeight: '800', color: '#C2410C' },
});
