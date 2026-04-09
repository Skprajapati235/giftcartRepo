import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';

export default function OrderDetailScreen({ route, navigation }) {
  const { order } = route.params;

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return '#4CAF50';
      case 'Cancelled': return '#F44336';
      case 'Processing': return '#2196F3';
      case 'Shipped': return '#FF9800';
      default: return '#9E9E9E';
    }
  };

  const steps = ['Processing', 'Shipped', 'Delivered'];
  const currentStepIndex = steps.indexOf(order.status);

  console.log(order);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Order Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.orderInfoCard}>
          <Text style={styles.orderId}>Order #{order._id.slice(-6).toUpperCase()}</Text>
          <Text style={styles.orderDate}>{new Date(order.createdAt).toLocaleString()}</Text>
          <View style={styles.statusBadge}>
            <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>{order.status}</Text>
          </View>
        </View>

        {/* Tracking Section */}
        <View style={styles.trackingCard}>
          <Text style={styles.sectionTitle}>Order Status</Text>
          <View style={styles.timeline}>
            {steps.map((step, index) => {
              const isCompleted = currentStepIndex >= index || order.status === 'Delivered';
              const isCancelled = order.status === 'Cancelled';

              if (isCancelled && index > 0) return null; // If cancelled, only show cancelled step
              
              const isLast = index === steps.length - 1;

              return (
                <View key={step} style={styles.timelineStep}>
                  <View style={styles.timelineIconContainer}>
                    {/* Circle/Tick */}
                    <View style={[styles.timelineDot, isCompleted ? styles.timelineDotCompleted : {}, isCancelled ? styles.timelineDotCancelled : {}]}>
                      {isCompleted && !isCancelled && <Ionicons name="checkmark" size={12} color="#FFF" />}
                    </View>
                    
                    {/* Connecting Line */}
                    {!isLast && (!isCancelled) && (
                      <View style={[styles.timelineLine, isCompleted ? styles.timelineLineCompleted : {}]} />
                    )}
                  </View>
                  <View style={styles.timelineTextContainer}>
                    <Text style={[styles.timelineStepText, isCompleted && styles.timelineStepTextCompleted, isCancelled && styles.timelineStepTextCancelled]}>
                      {isCancelled ? 'Cancelled' : step}
                    </Text>
                    {isCompleted && !isCancelled && step === 'Processing' && (
                      <Text style={styles.timelineDateText}>{new Date(order.createdAt).toDateString()}</Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Items Section */}
        <View style={styles.itemsCard}>
          <Text style={styles.sectionTitle}>Items ({order.items?.length || 0})</Text>
          {order.items?.map((item, index) => {
            const product = item.product || {};
            const itemImage = product.image;
            const originalPrice = item.price;
            const salePrice = product?.salePrice || item?.salePrice || item.price;
            const hasDiscount = originalPrice > salePrice;
            
            return (
              <View key={index} style={styles.itemRow}>
                {itemImage ? (
                  <Image source={{ uri: itemImage }} style={styles.itemImage} />
                ) : (
                  <View style={[styles.itemImage, { justifyContent: 'center', alignItems: 'center' }]}>
                    <Feather name="package" size={24} color="#999" />
                  </View>
                )}
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName}>{product.name || item.name || 'Product'}</Text>
                  <Text style={styles.itemQty}>Qty: {item.quantity}</Text>
                  <View style={styles.priceRow}>
                    <Text style={styles.itemPrice}>₹{salePrice}</Text>
                    {hasDiscount && (
                      <Text style={styles.itemListPrice}>₹{originalPrice}</Text>
                    )}
                  </View>
                  {order.status === 'Delivered' && (
                    <TouchableOpacity 
                      style={styles.reviewBtn}
                      onPress={() => navigation.navigate('AddReview', { product, orderId: order._id })}
                    >
                      <Text style={styles.reviewBtnText}>Rate & Review product</Text>
                      <Ionicons name="chevron-forward" size={14} color="#D82B76" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* Address */}
        <View style={styles.addressCard}>
          <Text style={styles.sectionTitle}>Shipping Address</Text>
          <Text style={styles.addressText}>{order.shippingAddress?.fullName}</Text>
          <Text style={styles.addressText}>{order.shippingAddress?.phone}</Text>
          <Text style={styles.addressText}>{`${order.shippingAddress?.address || ''}, ${order.shippingAddress?.city || ''}, ${order.shippingAddress?.state || ''} - ${order.shippingAddress?.zipCode || ''}`}</Text>
        </View>

        {/* Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Amount</Text>
            <Text style={styles.summaryValue}>₹{order.totalAmount}</Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  title: { fontSize: 20, fontWeight: '800', color: '#000' },
  content: { padding: 15 },
  orderInfoCard: { backgroundColor: '#FFF', padding: 15, borderRadius: 12, marginBottom: 15, elevation: 1 },
  orderId: { fontSize: 18, fontWeight: '800', color: '#333' },
  orderDate: { fontSize: 14, color: '#666', marginTop: 5 },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, backgroundColor: '#F0F0F0', marginTop: 10 },
  statusText: { fontWeight: '700', fontSize: 13 },
  trackingCard: { backgroundColor: '#FFF', padding: 15, borderRadius: 12, marginBottom: 15, elevation: 1 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#333', marginBottom: 15 },
  timeline: { paddingLeft: 10, marginTop: 10 },
  timelineStep: { flexDirection: 'row', minHeight: 60 },
  timelineIconContainer: { alignItems: 'center', width: 30 },
  timelineDot: { width: 18, height: 18, borderRadius: 9, backgroundColor: '#E0E0E0', zIndex: 2, justifyContent: 'center', alignItems: 'center' },
  timelineDotCompleted: { backgroundColor: '#26A541' }, // Flipkart Green
  timelineDotCancelled: { backgroundColor: '#FF6161' },
  timelineLine: { width: 3, flex: 1, backgroundColor: '#E0E0E0', zIndex: 1, marginTop: -2, marginBottom: -2 },
  timelineLineCompleted: { backgroundColor: '#26A541' },
  timelineTextContainer: { marginLeft: 15, paddingBottom: 30 },
  timelineStepText: { fontSize: 16, color: '#878787', fontWeight: '600' },
  timelineStepTextCompleted: { color: '#000', fontWeight: '800' },
  timelineStepTextCancelled: { color: '#FF6161', fontWeight: '800' },
  timelineDateText: { fontSize: 12, color: '#878787', marginTop: 4 },
  itemsCard: { backgroundColor: '#FFF', padding: 15, borderRadius: 12, marginBottom: 15, elevation: 1 },
  itemRow: { flexDirection: 'row', marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#F0F0F0', paddingBottom: 10 },
  itemImage: { width: 70, height: 70, borderRadius: 8, backgroundColor: '#F5F5F5' },
  itemDetails: { marginLeft: 15, flex: 1, justifyContent: 'center' },
  itemName: { fontSize: 15, fontWeight: '700', color: '#212121', marginBottom: 2 },
  itemQty: { fontSize: 13, color: '#878787', marginBottom: 4 },
  priceRow: { flexDirection: 'row', alignItems: 'center' },
  itemPrice: { fontSize: 16, fontWeight: '800', color: '#212121' },
  itemListPrice: { fontSize: 12, color: '#878787', textDecorationLine: 'line-through', marginLeft: 8 },
  addressCard: { backgroundColor: '#FFF', padding: 15, borderRadius: 12, marginBottom: 15, elevation: 1 },
  addressText: { fontSize: 14, color: '#555', marginTop: 2 },
  summaryCard: { backgroundColor: '#FFF', padding: 15, borderRadius: 12, marginBottom: 30, elevation: 1 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 },
  summaryLabel: { fontSize: 15, color: '#666', fontWeight: '500' },
  summaryValue: { fontSize: 18, fontWeight: '800', color: '#000' },
  reviewBtn: { flexDirection: 'row', alignItems: 'center', marginTop: 10, alignSelf: 'flex-start' },
  reviewBtnText: { color: '#D82B76', fontWeight: '700', fontSize: 13, marginRight: 2 }
});
