import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, FlatList, Image, ActivityIndicator } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import categoryService from '../services/categoryService';

export default function CollectionsScreen({ navigation }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    categoryService.getCategories()
      .then(data => setCategories(data || []))
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

      {loading ? (
        <ActivityIndicator size="large" color="#D82B76" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={categories}
          keyExtractor={item => item._id}
          renderItem={renderCollection}
          numColumns={2}
          contentContainerStyle={styles.list}
        />
      )}
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
