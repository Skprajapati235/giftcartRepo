import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { addReview, updateReview } from '../services/reviewService';
import apiClient from '../api/apiClient';
import { SafeScreen, ScreenHeader } from '../components/layout';
import { useLayoutInsets } from '../hooks/useLayoutInsets';
import { colors } from '../constants/theme';

export default function AddReviewScreen({ route, navigation }) {
  const { product, orderId, existingReview } = route.params;
  const [rating, setRating] = useState(existingReview?.rating || 5);
  const [comment, setComment] = useState(existingReview?.comment || '');
  const [images, setImages] = useState(existingReview?.images || []);
  const [loading, setLoading] = useState(false);
  const { bottom } = useLayoutInsets();

  const pickImage = async () => {
    if (images.length >= 5) {
      Alert.alert('Limit Reached', 'You can only upload up to 5 images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      const selectedImage = result.assets[0].uri;
      setImages([...images, selectedImage]);
    }
  };

  const removeImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const uploadImages = async () => {
    const uploadedUrls = [];
    for (const imageUri of images) {
      if (imageUri.startsWith('http')) {
        uploadedUrls.push(imageUri);
        continue;
      }
      const formData = new FormData();
      const filename = imageUri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image`;

      formData.append('file', { uri: imageUri, name: filename, type });

      try {
        const response = await apiClient.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        uploadedUrls.push(response.data.url);
      } catch (error) {
        console.error('Image upload failed:', error);
      }
    }
    return uploadedUrls;
  };

  const handleSubmit = async () => {
    if (!comment.trim()) {
      Alert.alert('Feedback Needed', 'Please write a few words about your experience.');
      return;
    }

    setLoading(true);
    try {
      const imageUrls = await uploadImages();
      const reviewPayload = {
        rating,
        comment,
        images: imageUrls,
      };

      if (existingReview) {
        await updateReview(existingReview._id, reviewPayload);
        Alert.alert('Review Updated', 'Your review has been updated successfully! ✨', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        await addReview(product._id, reviewPayload);
        Alert.alert('Thank You!', 'Your review has been submitted successfully! 🎉', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  const getRatingLabel = (r) => {
    switch (r) {
      case 5: return 'Loved it! Exceptional 💖';
      case 4: return 'Very Good! Recommended 👍';
      case 3: return 'Average / Met expectations 🙂';
      case 2: return 'Below expectations 🙁';
      default: return 'Needs improvement 😞';
    }
  };

  return (
    <SafeScreen style={styles.container}>
      <ScreenHeader
        title={existingReview ? 'Edit Review' : 'Write a Review'}
        subtitle="Share your festive experience"
        onBack={() => navigation.goBack()}
        border
      />

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottom + 30 }]}>
        {/* Product Preview Card */}
        <View style={styles.productCard}>
          <Image source={{ uri: product?.image }} style={styles.productImage} />
          <View style={styles.productText}>
            <Text style={styles.productName} numberOfLines={2}>{product?.name}</Text>
            <Text style={styles.productPrice}>₹{product?.salePrice || product?.price}</Text>
          </View>
        </View>

        {/* Rating Stars Card */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>How would you rate this gift?</Text>
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((s) => (
              <TouchableOpacity
                key={s}
                onPress={() => setRating(s)}
                activeOpacity={0.7}
                style={styles.starTouch}
              >
                <Ionicons
                  name={s <= rating ? 'star' : 'star-outline'}
                  size={38}
                  color={s <= rating ? colors.brandGold : '#CBD5E1'}
                />
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.ratingLabelBadge}>
            <Text style={styles.ratingLabelText}>{getRatingLabel(rating)}</Text>
          </View>
        </View>

        {/* Comment Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Your Review</Text>
          <TextInput
            style={styles.input}
            placeholder="Tell us about the quality, taste, packing, and overall gifting experience..."
            placeholderTextColor="#94A3B8"
            multiline
            numberOfLines={5}
            value={comment}
            onChangeText={setComment}
            textAlignVertical="top"
          />
        </View>

        {/* Photos Section */}
        <View style={styles.sectionCard}>
          <View style={styles.imageHeader}>
            <Text style={styles.sectionTitle}>Add Photos (Optional)</Text>
            <Text style={styles.imageCount}>{images.length}/5</Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageList}>
            {images.length < 5 && (
              <TouchableOpacity style={styles.addImgBtn} onPress={pickImage} activeOpacity={0.75}>
                <Feather name="camera" size={22} color={colors.primary} />
                <Text style={styles.addImgText}>Add Photo</Text>
              </TouchableOpacity>
            )}

            {images.map((uri, index) => (
              <View key={index} style={styles.imageWrapper}>
                <Image source={{ uri }} style={styles.pickedImage} />
                <TouchableOpacity
                  style={styles.removeBtn}
                  onPress={() => removeImage(index)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="close-circle" size={20} color="#DC2626" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.mainSubmitBtn, loading && styles.disabledBtn]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.88}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            <View style={styles.submitBtnContent}>
              <Text style={styles.mainSubmitBtnText}>
                {existingReview ? 'Update My Review' : 'Submit Review'}
              </Text>
              <Feather name="check-circle" size={18} color={colors.brandGold} />
            </View>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundWarm,
  },
  content: {
    padding: 16,
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.borderWarm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  productImage: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: colors.backgroundCream,
  },
  productText: {
    marginLeft: 14,
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E293B',
    lineHeight: 19,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: '900',
    color: colors.brandBerry,
    marginTop: 4,
  },
  sectionCard: {
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.borderWarm,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 12,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  starTouch: {
    padding: 4,
  },
  ratingLabelBadge: {
    alignSelf: 'center',
    backgroundColor: colors.backgroundRose,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.borderRose,
  },
  ratingLabelText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.brandBerry,
  },
  input: {
    borderWidth: 1.5,
    borderColor: colors.borderWarm,
    borderRadius: 14,
    padding: 14,
    minHeight: 110,
    fontSize: 14,
    color: '#1E293B',
    backgroundColor: '#FFFDFB',
    lineHeight: 20,
  },
  imageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  imageCount: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
  },
  imageList: {
    flexDirection: 'row',
  },
  addImgBtn: {
    width: 80,
    height: 80,
    borderRadius: 14,
    borderStyle: 'dashed',
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: colors.backgroundRose,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  addImgText: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '700',
    marginTop: 4,
  },
  imageWrapper: {
    position: 'relative',
    marginRight: 10,
  },
  pickedImage: {
    width: 80,
    height: 80,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderWarm,
  },
  removeBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#FFF',
    borderRadius: 10,
  },
  mainSubmitBtn: {
    backgroundColor: colors.brandBerry,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 6,
    shadowColor: colors.brandBerry,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledBtn: {
    opacity: 0.6,
  },
  submitBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mainSubmitBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
  },
});

