import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useLayoutInsets } from '../../hooks/useLayoutInsets';
import { TAB_BAR_BASE_HEIGHT } from '../../constants/layout';

const DEFAULT_TABS = [
  { name: 'HOME', icon: 'home', screen: 'Home' },
  { name: 'COLLECTIONS', icon: 'grid', screen: 'Collections' },
  { name: 'WISHLIST', icon: 'heart', screen: 'Wishlist' },
  { name: 'CART', icon: 'shopping-cart', screen: 'Cart' },
  { name: 'MY ORDERS', icon: 'shopping-bag', screen: 'MyOrders' },
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
            activeOpacity={0.7}
          >
            <View>
              <Feather name={tab.icon} size={22} color={isActive ? '#D82B76' : '#555'} />
              {tab.screen === 'Cart' && cartBadge > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{cartBadge > 9 ? '9+' : cartBadge}</Text>
                </View>
              )}
            </View>
            <Text style={[styles.label, isActive && styles.labelActive]} numberOfLines={1}>
              {tab.name}
            </Text>
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
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 6,
  },
  label: {
    fontSize: 9,
    fontWeight: '800',
    marginTop: 4,
    color: '#555',
  },
  labelActive: {
    color: '#D82B76',
  },
  badge: {
    position: 'absolute',
    right: -10,
    top: -6,
    backgroundColor: '#D82B76',
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '900',
  },
});
