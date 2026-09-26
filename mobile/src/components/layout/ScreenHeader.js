import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SCREEN_PADDING_H } from '../../constants/layout';
import { colors, shadows } from '../../constants/theme';

export default function ScreenHeader({
  title,
  onBack,
  right,
  border = false,
  light = false,
  berry = false,
  subtitle,
  style,
}) {
  const isBerry = berry || light;
  const iconColor = isBerry ? colors.white : colors.brandBerry;
  const titleColor = isBerry ? colors.white : colors.brandBerry;
  const subtitleColor = isBerry ? 'rgba(255, 235, 240, 0.85)' : colors.textMuted;

  return (
    <View
      style={[
        styles.header,
        isBerry ? styles.headerBerry : styles.headerWhite,
        border && (isBerry ? styles.borderBerry : styles.borderWhite),
        style,
      ]}
    >
      {onBack ? (
        <TouchableOpacity
          onPress={onBack}
          style={[styles.backButton, isBerry && styles.backButtonBerry]}
          activeOpacity={0.7}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Feather name="chevron-left" size={22} color={iconColor} />
        </TouchableOpacity>
      ) : (
        <View style={styles.side} />
      )}
      <View style={styles.titleContainer}>
        <Text style={[styles.title, { color: titleColor }]} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: subtitleColor }]} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <View style={[styles.side, styles.sideRight]}>{right || null}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SCREEN_PADDING_H,
    paddingVertical: 10,
    minHeight: 56,
  },
  headerBerry: {
    backgroundColor: '#741343',
  },
  headerWhite: {
    backgroundColor: colors.white,
  },
  borderBerry: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 209, 102, 0.25)',
  },
  borderWhite: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  side: {
    minWidth: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sideRight: {
    alignItems: 'flex-end',
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.brandCream,
    borderWidth: 1,
    borderColor: colors.borderWarm,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  backButtonBerry: {
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    elevation: 0,
    shadowOpacity: 0,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },
});
