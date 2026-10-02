import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  Dimensions,
  StatusBar,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, Ionicons } from '@expo/vector-icons';
import { fetchStories } from '../services/giftingService';

const { width, height } = Dimensions.get('window');

export default function StoryHighlights({ navigation }) {
  const [stories, setStories] = useState([]);
  const [activeStoryIndex, setActiveStoryIndex] = useState(null);
  const [progress] = useState(new Animated.Value(0));
  const progressAnimRef = useRef(null);

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    try {
      const data = await fetchStories();
      if (Array.isArray(data) && data.length > 0) {
        setStories(data);
      }
    } catch (err) {
      console.error('Failed to load stories:', err);
    }
  };

  const openStory = (index) => {
    setActiveStoryIndex(index);
    startProgress(index);
  };

  const closeStory = () => {
    if (progressAnimRef.current) progressAnimRef.current.stop();
    progress.setValue(0);
    setActiveStoryIndex(null);
  };

  const startProgress = (index) => {
    progress.setValue(0);
    if (progressAnimRef.current) progressAnimRef.current.stop();

    progressAnimRef.current = Animated.timing(progress, {
      toValue: 1,
      duration: 5000, // 5 seconds per story
      useNativeDriver: false,
    });

    progressAnimRef.current.start(({ finished }) => {
      if (finished) {
        if (index < stories.length - 1) {
          openStory(index + 1);
        } else {
          closeStory();
        }
      }
    });
  };

  const handleNext = () => {
    if (activeStoryIndex < stories.length - 1) {
      openStory(activeStoryIndex + 1);
    } else {
      closeStory();
    }
  };

  const handlePrev = () => {
    if (activeStoryIndex > 0) {
      openStory(activeStoryIndex - 1);
    }
  };

  const handleCtaPress = (story) => {
    closeStory();
    const categoryId = story?.ctaCategory?._id || story?.ctaCategory;
    if (categoryId) {
      navigation?.navigate('Home', { categoryId });
      return;
    }
    if (!story?.ctaLink) return;
    // If it's category link, navigate to Collections
    if (story.ctaLink.includes('category') || story.ctaLink.includes('cake') || story.ctaLink.includes('flower')) {
      navigation?.navigate('Collections', { initialFilter: story.tag || story.title });
    } else {
      navigation?.navigate('Collections');
    }
  };

  if (!stories || stories.length === 0) return null;

  const currentStory = activeStoryIndex !== null ? stories[activeStoryIndex] : null;

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {stories.map((story, index) => (
          <TouchableOpacity
            key={story._id || index}
            style={styles.storyBubbleItem}
            activeOpacity={0.8}
            onPress={() => openStory(index)}
          >
            {/* Gradient Ring */}
            <LinearGradient
              colors={['#D82B76', '#F59E0B', '#E11D48']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientRing}
            >
              <View style={styles.avatarInner}>
                <Image
                  source={{ uri: story.thumbnail || story.mediaUrl }}
                  style={styles.avatarImage}
                  resizeMode="cover"
                />
              </View>
            </LinearGradient>

            <Text style={styles.storyTitle} numberOfLines={1}>
              {story.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Full-screen Story Viewer Modal */}
      {currentStory && (
        <Modal
          visible={activeStoryIndex !== null}
          transparent={false}
          animationType="fade"
          onRequestClose={closeStory}
        >
          <StatusBar hidden />
          <View style={styles.modalContainer}>
            {/* Background Story Media */}
            <Image
              source={{ uri: currentStory.mediaUrl || currentStory.thumbnail }}
              style={styles.fullMedia}
              resizeMode="cover"
            />
            <LinearGradient
              colors={['rgba(0,0,0,0.6)', 'transparent', 'rgba(0,0,0,0.85)']}
              style={StyleSheet.absoluteFillObject}
            />

            {/* Tap areas to navigate prev/next */}
            <View style={styles.touchAreaContainer}>
              <TouchableOpacity style={styles.touchLeft} onPress={handlePrev} />
              <TouchableOpacity style={styles.touchRight} onPress={handleNext} />
            </View>

            {/* Top Progress Bars & Header */}
            <View style={styles.topBar}>
              <View style={styles.progressRow}>
                {stories.map((_, i) => (
                  <View key={i} style={styles.progressBarTrack}>
                    {i === activeStoryIndex ? (
                      <Animated.View
                        style={[
                          styles.progressBarFill,
                          {
                            width: progress.interpolate({
                              inputRange: [0, 1],
                              outputRange: ['0%', '100%'],
                            }),
                          },
                        ]}
                      />
                    ) : (
                      <View
                        style={[
                          styles.progressBarFill,
                          { width: i < activeStoryIndex ? '100%' : '0%' },
                        ]}
                      />
                    )}
                  </View>
                ))}
              </View>

              <View style={styles.headerRow}>
                <View style={styles.authorInfo}>
                  <Image
                    source={{ uri: currentStory.thumbnail || currentStory.mediaUrl }}
                    style={styles.headerThumbnail}
                  />
                  <View>
                    <Text style={styles.headerTitle}>{currentStory.title}</Text>
                    {currentStory.tag && (
                      <View style={styles.headerTagBadge}>
                        <Text style={styles.headerTagText}>{currentStory.tag}</Text>
                      </View>
                    )}
                  </View>
                </View>

                <TouchableOpacity style={styles.closeBtn} onPress={closeStory}>
                  <Feather name="x" size={22} color="#FFF" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Bottom Call to Action Card */}
            <View style={styles.bottomCard}>
              <Text style={styles.bottomStoryTitle}>{currentStory.title}</Text>
              <TouchableOpacity
                style={styles.ctaButton}
                activeOpacity={0.85}
                onPress={() => handleCtaPress(currentStory)}
              >
                <LinearGradient
                  colors={['#D82B76', '#E11D48']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.ctaGradient}
                >
                  <Text style={styles.ctaText}>{currentStory.ctaText || 'Shop This Look'}</Text>
                  <Feather name="arrow-right" size={16} color="#FFF" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  scrollContent: {
    paddingHorizontal: 14,
    gap: 14,
  },
  storyBubbleItem: {
    alignItems: 'center',
    width: 68,
  },
  gradientRing: {
    width: 66,
    height: 66,
    borderRadius: 33,
    padding: 2.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInner: {
    width: '100%',
    height: '100%',
    borderRadius: 31,
    backgroundColor: '#FFF',
    padding: 2,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 29,
  },
  storyTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#374151',
    marginTop: 4,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'space-between',
  },
  fullMedia: {
    ...StyleSheet.absoluteFillObject,
    width,
    height,
  },
  touchAreaContainer: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
  },
  touchLeft: {
    flex: 1,
  },
  touchRight: {
    flex: 2,
  },
  topBar: {
    paddingTop: 36,
    paddingHorizontal: 16,
  },
  progressRow: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 12,
  },
  progressBarTrack: {
    flex: 1,
    height: 2.5,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FFF',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerThumbnail: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#FFF',
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  headerTagBadge: {
    backgroundColor: 'rgba(216, 43, 118, 0.85)',
    paddingHorizontal: 7,
    paddingVertical: 1.5,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  headerTagText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  closeBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  bottomCard: {
    padding: 20,
    paddingBottom: 36,
    alignItems: 'center',
    gap: 12,
  },
  bottomStoryTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  ctaButton: {
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  ctaText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
