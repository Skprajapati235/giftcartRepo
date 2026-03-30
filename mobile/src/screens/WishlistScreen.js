import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, FlatList } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';

export default function WishlistScreen({ navigation }) {
  // Dummy data for wishlist
  const WISHLIST = [
    { id: '1', name: 'Premium Gift Hamper', price: 1299, image: 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=400&h=400&fit=crop' },
    { id: '2', name: 'Designer Coffee Mug', price: 499, image: 'https://images.unsplash.com/photo-1511389026070-a14ae610a1be?w=400&h=400&fit=crop' },
  ];

  const renderWishItem = ({ item }) => (
    <TouchableOpacity style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.price}>₹{item.price}</Text>
      </View>
      <TouchableOpacity style={styles.addBtn}>
        <Feather name="shopping-cart" size={20} color="#FFF" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>My Wishlist</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={WISHLIST}
        keyExtractor={item => item.id}
        renderItem={renderWishItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <Feather name="heart" size={60} color="#DDD" />
            <Text style={styles.emptyText}>Wishlist is empty</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, backgroundColor: '#FFF' },
  title: { fontSize: 20, fontWeight: '800', color: '#000' },
  list: { padding: 15 },
  card: { flexDirection: 'row', backgroundColor: '#FFF', borderRadius: 15, padding: 10, marginBottom: 15, elevation: 1 },
  image: { width: 70, height: 70, borderRadius: 10 },
  info: { flex: 1, marginLeft: 15, justifyContent: 'center' },
  name: { fontSize: 16, fontWeight: '600', color: '#333' },
  price: { fontSize: 18, fontWeight: '800', color: '#D82B76', marginTop: 4 },
  addBtn: { backgroundColor: '#D82B76', width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', alignSelf: 'center' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 150 },
  emptyText: { fontSize: 18, color: '#999', marginTop: 15 },
});
