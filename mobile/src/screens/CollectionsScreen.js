import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image } from 'react-native';
import categoryService from '../services/categoryService';
import Skeleton from '../components/Skeleton';
import { SafeScreen, ScreenHeader } from '../components/layout';
import { useLayoutInsets } from '../hooks/useLayoutInsets';

export default function CollectionsScreen({ navigation }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { bottom } = useLayoutInsets();

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
    <SafeScreen style={styles.container}>
      <ScreenHeader title="All Collections" onBack={() => navigation.goBack()} border />

      <FlatList
        data={loading ? [1, 2, 3, 4, 5, 6] : categories}
        keyExtractor={(item, index) => loading ? `sk-${index}` : item._id}
        renderItem={loading ? () => (
          <View style={styles.card}>
            <Skeleton width="100%" height={200} borderRadius={20} />
          </View>
        ) : renderCollection}
        numColumns={2}
        contentContainerStyle={[styles.list, { paddingBottom: bottom + 16 }]}
      />
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  list: { padding: 15 },
  card: { flex: 1, height: 200, margin: 8, borderRadius: 20, overflow: 'hidden', elevation: 3 },
  image: { width: '100%', height: '100%' },
  overlay: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.4)', padding: 15, alignItems: 'center' },
  name: { color: '#FFF', fontSize: 18, fontWeight: '800', textAlign: 'center' },
  explore: { color: '#FFF', fontSize: 12, marginTop: 5, fontWeight: '600' },
});
