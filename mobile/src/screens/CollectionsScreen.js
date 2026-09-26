import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import categoryService from '../services/categoryService';
import occasionService from '../services/occasionService';
import { SafeScreen, ScreenHeader } from '../components/layout';
import { useLayoutInsets } from '../hooks/useLayoutInsets';
import { colors, shadows } from '../constants/theme';
import { Feather } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const fallbackOccasions = [
  {
    _id: 'birthday',
    name: 'Birthday',
    image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=600&auto=format&fit=crop',
  },
  {
    _id: 'anniversary',
    name: 'Anniversary',
    image: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=600&auto=format&fit=crop',
  },
  {
    _id: 'congratulations',
    name: 'Congratulations',
    image: 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?q=80&w=600&auto=format&fit=crop',
  },
  {
    _id: 'wedding',
    name: 'Wedding',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=600&auto=format&fit=crop',
  },
  {
    _id: 'festivals',
    name: 'Festivals',
    image: 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?q=80&w=600&auto=format&fit=crop',
  },
  {
    _id: 'valentine',
    name: "Valentine's Day",
    image: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?q=80&w=600&auto=format&fit=crop',
  },
];

export default function CollectionsScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('categories'); // 'categories' | 'occasions'
  const [categories, setCategories] = useState([]);
  const [occasions, setOccasions] = useState(fallbackOccasions);
  const [loading, setLoading] = useState(true);
  const { bottom } = useLayoutInsets();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catResp, occResp] = await Promise.all([
          categoryService.getCategories({ limit: 100 }).catch(() => ({ data: [] })),
          occasionService.getOccasions().catch(() => ({ data: [] })),
        ]);
        setCategories(catResp.data || (Array.isArray(catResp) ? catResp : []));
        const occList = Array.isArray(occResp) ? occResp : occResp.data || occResp.occasions || [];
        setOccasions(occList.length > 0 ? occList : fallbackOccasions);
      } catch (e) {
        console.warn('Failed to load collections', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSelect = (item) => {
    if (activeTab === 'categories') {
      navigation.navigate('Home', { categoryId: item._id });
    } else {
      navigation.navigate('Home', { occasionId: item._id });
    }
  };

  const renderCard = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.88}
      onPress={() => handleSelect(item)}
    >
      <Image
        source={{ uri: item.image || `https://api.dicebear.com/7.x/initials/png?seed=${item.name}` }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.gradientOverlay} />

      <View style={styles.cardContent}>
        <View style={styles.typeBadge}>
          <Text style={styles.typeBadgeText}>
            {activeTab === 'categories' ? 'COLLECTION' : 'MOMENT'}
          </Text>
        </View>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {item.name}
        </Text>
        <View style={styles.actionRow}>
          <Text style={styles.exploreText}>Explore Gifts</Text>
          <Feather name="arrow-right" size={13} color={colors.brandGold} />
        </View>
      </View>
    </TouchableOpacity>
  );

  const displayData = activeTab === 'categories' ? categories : occasions;

  return (
    <SafeScreen style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#741343" />
      <ScreenHeader title="Explore Collections" onBack={() => navigation.goBack()} border berry />

      <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        {/* ── Segmented Tab Selector ── */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'categories' && styles.tabBtnActive]}
            onPress={() => setActiveTab('categories')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, activeTab === 'categories' && styles.tabTextActive]}>
              Categories ({categories.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'occasions' && styles.tabBtnActive]}
            onPress={() => setActiveTab('occasions')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, activeTab === 'occasions' && styles.tabTextActive]}>
              Occasions ({occasions.length})
            </Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={colors.brandBerry} />
          </View>
        ) : (
          <FlatList
            data={displayData}
            keyExtractor={(item, index) => item._id || String(index)}
            renderItem={renderCard}
            numColumns={2}
            contentContainerStyle={[styles.list, { paddingBottom: bottom + 24 }]}
            columnWrapperStyle={styles.columnWrapper}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#741343',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 14,
    marginTop: 10,
    marginBottom: 12,
    backgroundColor: colors.brandCream,
    borderRadius: 14,
    padding: 3,
    borderWidth: 1,
    borderColor: colors.borderWarm,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: 11,
  },
  tabBtnActive: {
    backgroundColor: colors.brandBerry,
    ...shadows.button,
  },
  tabText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.textMuted,
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  loadingBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    paddingHorizontal: 14,
    paddingTop: 4,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 14,
  },
  card: {
    width: (width - 28 - 12) / 2,
    height: 160,
    borderRadius: 18,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: colors.brandCreamAlt,
    borderWidth: 1,
    borderColor: colors.borderWarm,
    ...shadows.sm,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(33, 9, 26, 0.45)',
  },
  cardContent: {
    ...StyleSheet.absoluteFillObject,
    padding: 12,
    justifyContent: 'space-between',
  },
  typeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 209, 102, 0.9)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  typeBadgeText: {
    fontSize: 8.5,
    fontWeight: '900',
    color: colors.brandBerry,
    letterSpacing: 0.5,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.2,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  exploreText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.brandGold,
  },
});
