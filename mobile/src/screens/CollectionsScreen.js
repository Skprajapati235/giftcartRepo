import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, FlatList, Image, ActivityIndicator } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import categoryService from '../services/categoryService';
import Skeleton from '../components/Skeleton';

export default function CollectionsScreen({ navigation }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    categoryService.getCategories({ limit: 100 })
      .then(resp => setCategories(resp.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const renderCollection = ({ item }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate('Home', { screen: 'HomeScreen', params: { categoryId: item._id } })}
    >
      <Image source={{ uri: item.image || `https://api.dicebear.com/7.x/initials/png?seed=${item.name}` }} style={styles.image} />
      <View style={styles.overlay}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.explore}>Explore Now</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>All Collections</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={loading ? [1, 2, 3, 4, 5, 6] : categories}
        keyExtractor={(item, index) => loading ? `sk-${index}` : item._id}
        renderItem={loading ? () => (
          <View style={styles.card}>
            <Skeleton width="100%" height={200} borderRadius={20} />
          </View>
        ) : renderCollection}
        numColumns={2}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, backgroundColor: '#FFF' },
  title: { fontSize: 20, fontWeight: '800', color: '#000' },
  list: { padding: 15 },
  card: { flex: 1, height: 200, margin: 8, borderRadius: 20, overflow: 'hidden', elevation: 3 },
  image: { width: '100%', height: '100%' },
  overlay: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.4)', padding: 15, alignItems: 'center' },
  name: { color: '#FFF', fontSize: 18, fontWeight: '800', textAlign: 'center' },
  explore: { color: '#FFF', fontSize: 12, marginTop: 5, fontWeight: '600' },
});
