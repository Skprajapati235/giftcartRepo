import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const Skeleton = ({ width: w, height: h, borderRadius = 8, style }) => {
  const shimmerValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmerAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    shimmerAnimation.start();
    return () => shimmerAnimation.stop();
  }, [shimmerValue]);

  const opacity = shimmerValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        {
          width: w,
          height: h,
          borderRadius,
          backgroundColor: '#E1E9EE',
          opacity,
        },
        style,
      ]}
    />
  );
};

export const ProductCardSkeleton = () => (
  <View style={styles.productCard}>
    <Skeleton width="100%" height={150} borderRadius={20} />
    <View style={{ padding: 10 }}>
      <Skeleton width="80%" height={16} style={{ marginBottom: 8 }} />
      <Skeleton width="40%" height={14} style={{ marginBottom: 12 }} />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Skeleton width="30%" height={18} />
        <Skeleton width={30} height={30} borderRadius={15} />
      </View>
    </View>
  </View>
);

export const CategorySkeleton = () => (
  <View style={styles.categoryItem}>
    <Skeleton width={60} height={60} borderRadius={30} />
    <Skeleton width={50} height={12} style={{ marginTop: 8 }} />
  </View>
);

export const BannerSkeleton = () => (
  <View style={styles.bannerContainer}>
    <Skeleton width="100%" height={180} borderRadius={25} />
  </View>
);

export const SearchBarSkeleton = () => (
  <View style={styles.searchBar}>
    <Skeleton width="100%" height={50} borderRadius={15} />
  </View>
);

export const OrderSkeleton = () => (
  <View style={styles.orderCard}>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 }}>
      <Skeleton width="40%" height={18} />
      <Skeleton width="20%" height={14} />
    </View>
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Skeleton width={60} height={60} borderRadius={12} />
      <View style={{ marginLeft: 15, flex: 1 }}>
        <Skeleton width="70%" height={14} style={{ marginBottom: 8 }} />
        <Skeleton width="30%" height={12} />
      </View>
    </View>
    <View style={{ marginTop: 15, paddingTop: 15, borderTopWidth: 1, borderTopColor: '#F0F0F0', flexDirection: 'row', justifyContent: 'space-between' }}>
      <Skeleton width="30%" height={14} />
      <Skeleton width="20%" height={18} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  productCard: {
    width: (width - 45) / 2,
    backgroundColor: '#FFF',
    borderRadius: 20,
    marginBottom: 15,
    overflow: 'hidden',
    padding: 5,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: 20,
  },
  bannerContainer: {
    marginHorizontal: 15,
    marginVertical: 20,
  },
  searchBar: {
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
  },
  orderCard: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
  }
});

export default Skeleton;
