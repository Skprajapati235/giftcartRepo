import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Image,
  Easing,
  Platform,
  StatusBar,
} from 'react-native';

const { width } = Dimensions.get('window');

/**
 * Premium Native Android-style Splash & Launch Loader.
 * Designed to mirror modern top Android apps (Flipkart, Swiggy, Blinkit, Material 3):
 * - Smooth branded entrance (silky scale + soft opacity fade)
 * - Clean, stable brand typography (no tacky bouncing letters)
 * - Android Material 3 horizontal indeterminate progress bar
 * - Professional Android footer branding ("from GIFTFESTIVE")
 * - Buttery-smooth exit dissolve (fade out + subtle scale up) directly into the app
 */
export default function Loader({
  isAppReady = true,
  onFinish = null,
  minDuration = 1000,
  maxDuration = 2500,
  overlay = true,
}) {
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  const [hasStartedExit, setHasStartedExit] = useState(false);

  // Entrance & breathing animation values
  const logoScale = useRef(new Animated.Value(0.88)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const contentFade = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Android Material horizontal indeterminate progress bar
  const progressAnim = useRef(new Animated.Value(-60)).current;

  // Exit transition values (fade out & dissolve scale)
  const exitOpacity = useRef(new Animated.Value(1)).current;
  const exitScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // 1. Logo entrance: spring scale + smooth fade in
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 6,
        tension: 70,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Content fade in (title, tagline, progress, footer)
    Animated.timing(contentFade, {
      toValue: 1,
      duration: 400,
      delay: 150,
      useNativeDriver: true,
    }).start();

    // 3. Gentle ambient breathing pulse (subtle, keep it alive without wild hopping)
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.025,
          duration: 1200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();

    // 4. Android Material 3 horizontal indeterminate progress animation
    const progressLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(progressAnim, {
          toValue: 160,
          duration: 1100,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(progressAnim, {
          toValue: -60,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );
    progressLoop.start();

    // Minimum display timer
    const minTimer = setTimeout(() => {
      setMinTimeElapsed(true);
    }, minDuration);

    // Safety fallback maximum timer (never freeze user if network or auth stalls)
    const maxTimer = setTimeout(() => {
      setMinTimeElapsed(true);
    }, maxDuration);

    return () => {
      clearTimeout(minTimer);
      clearTimeout(maxTimer);
      pulseLoop.stop();
      progressLoop.stop();
    };
  }, []);

  // Check if conditions are met to trigger the exit transition
  useEffect(() => {
    if ((isAppReady && minTimeElapsed) && !hasStartedExit) {
      setHasStartedExit(true);

      // Native Android Splash dissolve effect (fade out + subtle scale up)
      Animated.parallel([
        Animated.timing(exitOpacity, {
          toValue: 0,
          duration: 320,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(exitScale, {
          toValue: 1.04,
          duration: 320,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (onFinish) {
          onFinish();
        }
      });
    }
  }, [isAppReady, minTimeElapsed, hasStartedExit, onFinish]);

  return (
    <Animated.View
      pointerEvents={hasStartedExit ? 'none' : 'auto'}
      style={[
        overlay ? styles.overlayContainer : styles.flexContainer,
        {
          opacity: exitOpacity,
          transform: [{ scale: exitScale }],
        },
      ]}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={Platform.OS === 'android'} />

      {/* Soft Ambient Radial Glow */}
      <View style={styles.ambientGlow} />

      {/* Main Center Branding */}
      <View style={styles.centerSection}>
        {/* Animated Brand Logo Icon */}
        <Animated.View
          style={[
            styles.iconWrapper,
            {
              opacity: logoOpacity,
              transform: [
                { scale: Animated.multiply(logoScale, pulseAnim) },
              ],
            },
          ]}
        >
          <Image
            source={require('../../assets/images/GiftFestiveIcon.png')}
            style={styles.logoIcon}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Brand Name & Tagline */}
        <Animated.View style={[styles.brandContainer, { opacity: contentFade }]}>
          <View style={styles.wordmarkRow}>
            <Text style={styles.brandGift}>Gift</Text>
            <Text style={styles.brandFestive}>Festive</Text>
          </View>
          <Text style={styles.tagline}>Delivering Happiness ✨</Text>
        </Animated.View>

        {/* Android Material Indeterminate Progress Bar */}
        <Animated.View style={[styles.progressContainer, { opacity: contentFade }]}>
          <View style={styles.progressTrack}>
            <Animated.View
              style={[
                styles.progressBar,
                {
                  transform: [{ translateX: progressAnim }],
                },
              ]}
            />
          </View>
        </Animated.View>
      </View>

      {/* Android Standard Bottom Footer */}
      <Animated.View style={[styles.footerContainer, { opacity: contentFade }]}>
        <Text style={styles.footerFrom}>FROM</Text>
        <Text style={styles.footerBrand}>GIFTFESTIVE</Text>
        <View style={styles.footerBadgeRow}>
          <Text style={styles.footerSubtext}>100% Safe & Secure • Made with ❤️</Text>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFFFFF',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 99999,
    elevation: 99999,
  },
  flexContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ambientGlow: {
    position: 'absolute',
    top: '32%',
    alignSelf: 'center',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(255, 106, 61, 0.06)',
  },
  centerSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingBottom: 40,
  },
  iconWrapper: {
    width: 96,
    height: 96,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#D82B76',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 7,
    borderWidth: 1,
    borderColor: 'rgba(216, 43, 118, 0.08)',
  },
  logoIcon: {
    width: 72,
    height: 72,
  },
  brandContainer: {
    alignItems: 'center',
    marginTop: 18,
  },
  wordmarkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandGift: {
    fontSize: 30,
    fontWeight: '900',
    color: '#D82B76',
    letterSpacing: -0.5,
  },
  brandFestive: {
    fontSize: 30,
    fontWeight: '900',
    color: '#FF6A3D',
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    letterSpacing: 0.6,
    marginTop: 6,
  },
  progressContainer: {
    marginTop: 28,
    alignItems: 'center',
  },
  progressTrack: {
    width: 140,
    height: 3.5,
    borderRadius: 2,
    backgroundColor: '#F1F5F9',
    overflow: 'hidden',
  },
  progressBar: {
    width: 50,
    height: '100%',
    borderRadius: 2,
    backgroundColor: '#D82B76',
  },
  footerContainer: {
    alignItems: 'center',
    paddingBottom: Platform.OS === 'android' ? 32 : 44,
  },
  footerFrom: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 2.2,
    marginBottom: 2,
  },
  footerBrand: {
    fontSize: 13,
    fontWeight: '900',
    color: '#1E293B',
    letterSpacing: 2,
  },
  footerBadgeRow: {
    marginTop: 6,
  },
  footerSubtext: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94A3B8',
    letterSpacing: 0.2,
  },
});