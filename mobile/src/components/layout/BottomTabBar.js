import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useLayoutInsets } from '../../hooks/useLayoutInsets';
import { TAB_BAR_BASE_HEIGHT } from '../../constants/layout';
import { colors } from '../../constants/theme';

const DEFAULT_TABS = [
  { name: 'Home', icon: 'home', screen: 'Home' },
  { name: 'Collections', icon: 'grid', screen: 'Collections' },
  { name: 'Wishlist', icon: 'heart', screen: 'Wishlist' },
  { name: 'Cart', icon: 'shopping-cart', screen: 'Cart' },
  { name: 'Orders', icon: 'shopping-bag', screen: 'MyOrders' },
];

export default function BottomTabBar({
  navigation,
  activeScreen = 'Home',
  cartBadge = 0,
  tabs = DEFAULT_TABS,
}) {
  const { bottom } = useLayoutInsets();

  return (
    <View style={[styles.bar, { paddingBottom: bottom, height: TAB_BAR_BASE_HEIGHT + bottom }]}>
      {tabs.map((tab) => {
        const isActive = tab.screen === activeScreen;
        return (
          <TouchableOpacity
            key={tab.screen}
            style={styles.item}
            onPress={() => navigation.navigate(tab.screen)}
            activeOpacity={0.75}
          >
            <View style={styles.iconContainer}>
              <Feather
                name={tab.icon}
                size={22}
                color={isActive ? colors.primary : '#71717A'}
              />
              {tab.screen === 'Cart' && cartBadge > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{cartBadge > 9 ? '9+' : cartBadge}</Text>
                </View>
              )}
            </View>
            <Text style={[styles.label, isActive && styles.labelActive]} numberOfLines={1}>
              {tab.name}
            </Text>
            {isActive && <View style={styles.activeDot} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: colors.borderWarm,
    elevation: 12,
    shadowColor: '#741343',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
  },
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 3,
    color: '#71717A',
  },
  labelActive: {
    color: colors.primary,
    fontWeight: '900',
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
    marginTop: 2,
  },
  badge: {
    position: 'absolute',
    right: -10,
    top: -5,
    backgroundColor: colors.secondary,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
    borderWidth: 1,
    borderColor: '#FFF',
  },
  badgeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '900',
  },
});
