import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image, Platform, StatusBar } from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';

export default function OrderDetailScreen({ route, navigation }) {
  const { order } = route.params;

  const getStatusConfig = (status) => {
    switch (status) {
      case 'Delivered': return { color: '#00C853', icon: 'check-circle', bg: '#E8F5E9' };
      case 'Cancelled': return { color: '#FF3D00', icon: 'close-circle', bg: '#FBE9E7' };
      case 'Processing': return { color: '#2979FF', icon: 'clock-outline', bg: '#E3F2FD' };
      case 'Shipped': return { color: '#FF9100', icon: 'truck-delivery', bg: '#FFF3E0' };
      default: return { color: '#9E9E9E', icon: 'help-circle', bg: '#F5F5F5' };
    }
  };

  const steps = ['Processing', 'Shipped', 'Delivered'];
  const currentStepIndex = steps.indexOf(order.status);
  const statusConfig = getStatusConfig(order.status);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Premium Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
        <TouchableOpacity style={styles.headerBtn}>
          <Feather name="help-circle" size={20} color="#1A1A1A" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Order Status Hero Card */}
        <View style={styles.heroCard}>
           <View style={[styles.statusIconBox, { backgroundColor: statusConfig.bg }]}>
              <MaterialCommunityIcons name={statusConfig.icon} size={32} color={statusConfig.color} />
           </View>
           <View style={styles.heroInfo}>
              <Text style={styles.heroStatusText}>Order {order.status}</Text>
              <Text style={styles.heroIdText}>Order ID: #{order._id.slice(-8).toUpperCase()}</Text>
           </View>
        </View>

        {/* Tracking Timeline */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>Tracking</Text>
          <View style={styles.timelineContainer}>
            {steps.map((step, index) => {
              const isCompleted = currentStepIndex >= index || order.status === 'Delivered';
              const isProcessing = order.status === step;
              const isCancelled = order.status === 'Cancelled';
              const isLast = index === steps.length - 1;

              if (isCancelled && index > 0) return null;

              return (
                <View key={step} style={styles.timelineItem}>
                  <View style={styles.timelineLeft}>
                    <View style={[
                      styles.timelineDot, 
                      isCompleted && styles.dotActive,
                      isProcessing && styles.dotProcessing
                    ]}>
                      {isCompleted && <Ionicons name="checkmark" size={12} color="#FFF" />}
                    </View>
                    {!isLast && <View style={[styles.timelineLine, isCompleted && styles.lineActive]} />}
                  </View>
                  <View style={styles.timelineRight}>
                    <Text style={[styles.timelineStepTitle, isCompleted && styles.textActive]}>
                      {isCancelled ? 'Order Cancelled' : step}
                    </Text>
                    <Text style={styles.timelineStepDesc}>
                      {isCompleted ? 'Item has been ' + step.toLowerCase() : 'Pending'}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Items Section */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeader}>Order Items</Text>
            <View style={styles.badgeCount}>
               <Text style={styles.badgeCountText}>{order.items?.length || 0}</Text>
            </View>
          </View>
          
          {order.items?.map((item, index) => {
            const product = item.product || {};
            const salePrice = product?.salePrice || item?.salePrice || item.price;
            
            return (
              <View key={index} style={styles.itemRow}>
                <View style={styles.productImageBox}>
                   {product.image ? (
                     <Image source={{ uri: product.image }} style={styles.productImage} />
                   ) : (
                     <Feather name="package" size={24} color="#DDD" />
                   )}
                </View>
                <View style={styles.productInfo}>
                   <Text style={styles.productName} numberOfLines={1}>{product.name || 'Gift Item'}</Text>
                   <Text style={styles.productSub}>Qty: {item.quantity}  •  Status: {order.status}</Text>
                   <Text style={styles.productPrice}>₹{salePrice}</Text>
                   
                   {(item.expectedDeliveryDate || product.expectedDeliveryDate) && (
                     <View style={styles.deliveryBadgeOrder}>
                        <Feather name="truck" size={10} color="#D82B76" />
                        <Text style={styles.deliveryTextOrder}>
                           Delivery by: {item.expectedDeliveryDate || product.expectedDeliveryDate}
                        </Text>
                     </View>
                   )}
                   
                   {order.status === 'Delivered' && (
                     <TouchableOpacity 
                        style={styles.reviewBtn}
                        onPress={() => navigation.navigate('AddReview', { product, orderId: order._id })}
                     >
                        <Text style={styles.reviewBtnText}>Rate this product</Text>
                        <Feather name="star" size={12} color="#D82B76" style={{ marginLeft: 4 }} />
                     </TouchableOpacity>
                   )}
                </View>
              </View>
            );
          })}
        </View>

        {/* Shipping & Payment Summary */}
        <View style={styles.horizontalRow}>
           <View style={[styles.miniCard, { marginRight: 10, flex: 1.5 }]}>
              <Text style={styles.miniTitle}>Shipping Address</Text>
              <Text style={styles.miniText}>{order.shippingAddress?.fullName}</Text>
              <Text style={styles.miniSubText}>{order.shippingAddress?.address}</Text>
              <Text style={styles.miniSubText}>
                 {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.zipCode}
              </Text>
              <Text style={[styles.miniSubText, { marginTop: 4, color: '#1A1A1A' }]}>
                 Phone: {order.shippingAddress?.phone}
              </Text>
           </View>
           <View style={styles.miniCard}>
              <Text style={styles.miniTitle}>Payment Details</Text>
              <Text style={styles.miniText}>Total Amount</Text>
              <Text style={styles.totalPrice}>₹{order.totalAmount}</Text>
           </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FBFCFE' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 15, 
    height: 60, 
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F3F7'
  },
  headerBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#1A1A1A' },
  scrollContent: { padding: 15 },
  
  heroCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#FFF', 
    padding: 20, 
    borderRadius: 24, 
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2
  },
  statusIconBox: { width: 60, height: 60, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  heroInfo: { marginLeft: 15 },
  heroStatusText: { fontSize: 20, fontWeight: '900', color: '#1A1A1A' },
  heroIdText: { fontSize: 13, color: '#94A3B8', marginTop: 2, fontWeight: '600' },

  sectionCard: { backgroundColor: '#FFF', borderRadius: 24, padding: 20, marginBottom: 20, elevation: 1 },
  sectionHeader: { fontSize: 16, fontWeight: '800', color: '#1A1A1A', marginBottom: 20 },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  badgeCount: { backgroundColor: '#F1F5F9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  badgeCountText: { fontSize: 12, fontWeight: '800', color: '#64748B' },

  timelineContainer: { marginLeft: 5 },
  timelineItem: { flexDirection: 'row', height: 70 },
  timelineLeft: { alignItems: 'center', width: 24 },
  timelineDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#E2E8F0', zIndex: 2 },
  dotActive: { backgroundColor: '#00C853' },
  dotProcessing: { backgroundColor: '#2979FF', borderWidth: 3, borderColor: '#E3F2FD' },
  timelineLine: { width: 2, flex: 1, backgroundColor: '#E2E8F0', marginVertical: -2 },
  lineActive: { backgroundColor: '#00C853' },
  timelineRight: { marginLeft: 15, flex: 1 },
  timelineStepTitle: { fontSize: 15, fontWeight: '700', color: '#94A3B8' },
  textActive: { color: '#1A1A1A' },
  timelineStepDesc: { fontSize: 12, color: '#94A3B8', marginTop: 2 },

  itemRow: { flexDirection: 'row', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
  productImageBox: { width: 80, height: 80, borderRadius: 20, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  productImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  productInfo: { marginLeft: 15, flex: 1, justifyContent: 'center' },
  productName: { fontSize: 15, fontWeight: '700', color: '#1E293B' },
  productSub: { fontSize: 12, color: '#94A3B8', marginTop: 4, fontWeight: '600' },
  productPrice: { fontSize: 16, fontWeight: '900', color: '#D82B76', marginTop: 6 },
  
  reviewBtn: { flexDirection: 'row', alignItems: 'center', marginTop: 8, backgroundColor: '#FFF0F5', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, alignSelf: 'flex-start' },
  reviewBtnText: { fontSize: 11, fontWeight: '800', color: '#D82B76' },

  horizontalRow: { flexDirection: 'row' },
  miniCard: { flex: 1, backgroundColor: '#FFF', borderRadius: 24, padding: 18, elevation: 1 },
  miniTitle: { fontSize: 12, fontWeight: '800', color: '#94A3B8', marginBottom: 10, textTransform: 'uppercase' },
  miniText: { fontSize: 14, fontWeight: '700', color: '#1A1A1A' },
  miniSubText: { fontSize: 12, color: '#64748B', marginTop: 2 },
  deliveryBadgeOrder: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 5, 
    backgroundColor: '#FFF0F5', 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 6, 
    marginTop: 8,
    alignSelf: 'flex-start'
  },
  deliveryTextOrder: { fontSize: 10, fontWeight: '800', color: '#D82B76' },
  totalPrice: { fontSize: 22, fontWeight: '900', color: '#1A1A1A', marginTop: 5 }
});
