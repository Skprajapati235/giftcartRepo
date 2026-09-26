import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Image,
  StatusBar,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import userService from '../services/userService';
import { SafeScreen, ScreenHeader } from '../components/layout';
import { useLayoutInsets } from '../hooks/useLayoutInsets';
import { colors } from '../constants/theme';

export default function UserEditProfileScreen({ navigation }) {
  const { user, updateUser } = useContext(AuthContext);
  const { showToast } = useToast();
  const [name, setName] = useState(user?.name || '');
  const [mobileNumber, setMobileNumber] = useState(user?.mobileNumber || user?.phone || '');
  const [profileImage, setProfileImage] = useState(user?.image || user?.profilePic || '');
  const [loading, setLoading] = useState(false);
  const { bottom } = useLayoutInsets();

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        showToast('Photo library permission is required to choose photo', 'warning');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      showToast('Failed to select image', 'error');
    }
  };

  const uploadImage = async (imageUri) => {
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: imageUri,
        type: 'image/jpeg',
        name: `profile-${Date.now()}.jpg`,
      });

      const uploadedData = await userService.uploadImage(formData);
      return (
        uploadedData?.url ||
        uploadedData?.secure_url ||
        uploadedData?.data?.url ||
        uploadedData?.imageUrl ||
        imageUri
      );
    } catch (error) {
      console.log('Image upload error:', error);
      return imageUri;
    }
  };

  const handleUpdateProfile = async () => {
    if (!name.trim()) {
      showToast('Please enter your full name', 'warning');
      return;
    }
    if (name.trim().length < 2) {
      showToast('Name must be at least 2 characters', 'warning');
      return;
    }

    setLoading(true);
    try {
      let imageUrl = profileImage;

      // Upload image if it's a new local file from picker
      if (profileImage && (profileImage.startsWith('file://') || profileImage.startsWith('content://'))) {
        imageUrl = await uploadImage(profileImage);
      }

      const updatedUser = await userService.updateProfile({
        name: name.trim(),
        profilePic: imageUrl,
      });

      await updateUser(updatedUser);
      showToast('Profile updated successfully! ✨', 'success');
      navigation.goBack();
    } catch (error) {
      console.log('Profile update error:', error);
      showToast(error?.response?.data?.message || error?.message || 'Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeScreen style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#741343" />
      <ScreenHeader
        title="Edit Profile"
        subtitle="Update your personal details"
        onBack={() => navigation.goBack()}
        border
        berry
      />
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.backgroundWarm }}
        contentContainerStyle={[styles.container, { paddingBottom: bottom + 30 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar Section */}
        <View style={styles.imageSection}>
          <TouchableOpacity onPress={pickImage} style={styles.imageWrapper} activeOpacity={0.8}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text style={styles.avatarInitial}>{name?.charAt(0).toUpperCase() || 'U'}</Text>
              </View>
            )}
            <View style={styles.cameraBadge}>
              <Feather name="camera" size={16} color="#FFF" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={pickImage} style={styles.changeImageButton} activeOpacity={0.75}>
            <Text style={styles.changeImageText}>Change Profile Photo</Text>
          </TouchableOpacity>
        </View>

        {/* Form Fields Card */}
        <View style={styles.card}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name *</Text>
            <View style={styles.inputBox}>
              <Feather name="user" size={18} color="#94A3B8" style={{ marginRight: 10 }} />
              <TextInput
                style={styles.input}
                placeholder="Enter your name"
                value={name}
                onChangeText={setName}
                placeholderTextColor="#94A3B8"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mobile Number</Text>
            <View style={[styles.inputBox, styles.readOnlyBox]}>
              <Feather name="phone" size={18} color="#94A3B8" style={{ marginRight: 10 }} />
              <Text style={styles.readOnlyText}>
                {mobileNumber ? `+91 ${mobileNumber}` : 'Not registered'}
              </Text>
              <Feather name="lock" size={14} color="#94A3B8" style={{ marginLeft: 'auto' }} />
            </View>
            <Text style={styles.helperText}>Used for OTP verification and cannot be changed here.</Text>
          </View>

          {(user?.state || user?.city) && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Delivery City & State</Text>
              <View style={[styles.inputBox, styles.readOnlyBox]}>
                <Feather name="map-pin" size={18} color="#94A3B8" style={{ marginRight: 10 }} />
                <Text style={styles.readOnlyText}>
                  {[user?.city, user?.state].filter(Boolean).join(', ')}
                </Text>
              </View>
            </View>
          )}

          <View style={styles.btnRow}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => navigation.goBack()}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveBtn, loading && styles.buttonDisabled]}
              onPress={handleUpdateProfile}
              disabled={loading}
              activeOpacity={0.88}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <View style={styles.saveBtnContent}>
                  <Text style={styles.saveBtnText}>Save Changes</Text>
                  <Feather name="check" size={16} color={colors.brandGold} />
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#741343',
  },
  container: {
    padding: 16,
  },
  imageSection: {
    alignItems: 'center',
    marginVertical: 14,
  },
  imageWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  profileImage: {
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 2.5,
    borderColor: colors.borderWarm,
  },
  imagePlaceholder: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: colors.backgroundRose,
    borderWidth: 2.5,
    borderColor: colors.borderRose,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    color: colors.brandBerry,
    fontSize: 40,
    fontWeight: '900',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: colors.brandBerry,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  changeImageButton: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    backgroundColor: colors.backgroundCream,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderWarm,
  },
  changeImageText: {
    color: colors.brandBerry,
    fontSize: 12,
    fontWeight: '800',
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.borderWarm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.borderWarm,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 50,
    backgroundColor: '#FFFDFB',
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  readOnlyBox: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  readOnlyText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  helperText: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 5,
    fontWeight: '500',
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 10,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cancelBtnText: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '800',
  },
  saveBtn: {
    flex: 2,
    backgroundColor: colors.brandBerry,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.brandBerry,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  saveBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  saveBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
  },
});


