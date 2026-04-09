import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, TextInput, Image, ActivityIndicator, Alert } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { addReview, updateReview } from '../services/reviewService';
import apiClient from '../api/apiClient';

export default function AddReviewScreen({ route, navigation }) {
  const { product, orderId, existingReview } = route.params;
  const [rating, setRating] = useState(existingReview?.rating || 5);
  const [comment, setComment] = useState(existingReview?.comment || '');
  const [images, setImages] = useState(existingReview?.images || []);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    if (images.length >= 5) {
      Alert.alert('Limit Reached', 'You can only upload up to 5 images.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
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
      Alert.alert('Error', 'Please enter a comment.');
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
        Alert.alert('Success', 'Your review has been updated!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        await addReview(product._id, reviewPayload);
        Alert.alert('Success', 'Your review has been submitted successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Write Review</Text>
        <TouchableOpacity onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator size="small" color="#D82B76" /> : <Text style={styles.submitBtn}>Submit</Text>}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.productInfo}>
          <Image source={{ uri: product.image }} style={styles.productImage} />
          <View style={styles.productText}>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productPrice}>₹{product.salePrice || product.price}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.ratingSection}>
          <Text style={styles.sectionTitle}>Rating</Text>
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((s) => (
              <TouchableOpacity key={s} onPress={() => setRating(s)}>
                <Ionicons 
                  name={s <= rating ? "star" : "star-outline"} 
                  size={40} 
                  color={s <= rating ? "#FFD700" : "#E0E0E0"} 
                />
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.ratingLabel}>
            {rating === 5 ? 'Excellent' : rating === 4 ? 'Very Good' : rating === 3 ? 'Good' : rating === 2 ? 'Fair' : 'Poor'}
          </Text>
        </View>

        <View style={styles.reviewSection}>
          <Text style={styles.sectionTitle}>Your Review</Text>
          <TextInput
            style={styles.input}
            placeholder="Share your experience with this product..."
            multiline
            numberOfLines={5}
            value={comment}
            onChangeText={setComment}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.imageSection}>
          <View style={styles.imageHeader}>
            <Text style={styles.sectionTitle}>Add Photos</Text>
            <Text style={styles.imageCount}>{images.length}/5</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageList}>
            <TouchableOpacity style={styles.addImgBtn} onPress={pickImage}>
              <Feather name="camera" size={24} color="#666" />
              <Text style={styles.addImgText}>Add</Text>
            </TouchableOpacity>
            {images.map((uri, index) => (
              <View key={index} style={styles.imageWrapper}>
                <Image source={{ uri }} style={styles.pickedImage} />
                <TouchableOpacity style={styles.removeBtn} onPress={() => removeImage(index)}>
                  <Ionicons name="close-circle" size={20} color="#F44336" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>

        <TouchableOpacity 
          style={[styles.mainSubmitBtn, loading && styles.disabledBtn]} 
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.mainSubmitBtnText}>{existingReview ? 'Update Review' : 'Submit Review'}</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  title: { fontSize: 18, fontWeight: '700' },
  submitBtn: { color: '#D82B76', fontWeight: '800', fontSize: 16 },
  content: { padding: 20 },
  productInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  productImage: { width: 60, height: 60, borderRadius: 8, backgroundColor: '#F5F5F5' },
  productText: { marginLeft: 15 },
  productName: { fontSize: 16, fontWeight: '700', color: '#212121' },
  productPrice: { fontSize: 14, color: '#666', marginTop: 2 },
  divider: { height: 1, backgroundColor: '#F0F0F0', marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#333', marginBottom: 10 },
  ratingSection: { alignItems: 'center', marginBottom: 30 },
  starsContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 10 },
  ratingLabel: { fontSize: 14, fontWeight: '600', color: '#666' },
  reviewSection: { marginBottom: 30 },
  input: { borderWidth: 1, borderColor: '#DDD', borderRadius: 12, padding: 15, minHeight: 120, fontSize: 16, color: '#333', backgroundColor: '#FAFAFA' },
  imageSection: { marginBottom: 30 },
  imageHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  imageCount: { color: '#999', fontSize: 12 },
  imageList: { flexDirection: 'row' },
  addImgBtn: { width: 80, height: 80, borderRadius: 12, borderStyle: 'dashed', borderWidth: 1, borderColor: '#999', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  addImgText: { fontSize: 12, color: '#666', marginTop: 4 },
  imageWrapper: { position: 'relative', marginRight: 10 },
  pickedImage: { width: 80, height: 80, borderRadius: 12 },
  removeBtn: { position: 'absolute', top: -5, right: -5, backgroundColor: '#FFF', borderRadius: 10 },
  mainSubmitBtn: { backgroundColor: '#D82B76', paddingVertical: 18, borderRadius: 15, alignItems: 'center', marginTop: 20, marginBottom: 20, shadowColor: '#D82B76', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  mainSubmitBtnText: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  disabledBtn: { backgroundColor: '#E0E0E0', shadowOpacity: 0, elevation: 0 }
});
