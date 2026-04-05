// import React, { useEffect, useRef } from 'react';
// import { View, StyleSheet, Animated, Image, Dimensions } from 'react-native';

// const { width } = Dimensions.get('window');

// export default function Loader() {
//     const spinAnim = useRef(new Animated.Value(0)).current;
//     const fadeAnim = useRef(new Animated.Value(0)).current;

//     useEffect(() => {
//         // Rotate animation
//         Animated.loop(
//             Animated.timing(spinAnim, {
//                 toValue: 1,
//                 duration: 2000,
//                 useNativeDriver: true,
//             })
//         ).start();

//         // Fade in/out animation
//         Animated.loop(
//             Animated.sequence([
//                 Animated.timing(fadeAnim, {
//                     toValue: 1,
//                     duration: 1000,
//                     useNativeDriver: true,
//                 }),
//                 Animated.timing(fadeAnim, {
//                     toValue: 0.3,
//                     duration: 1000,
//                     useNativeDriver: true,
//                 }),
//             ])
//         ).start();
//     }, []);

//     const spin = spinAnim.interpolate({
//         inputRange: [0, 1],
//         outputRange: ['0deg', '360deg'],
//     });

//     return (
//         <View style={styles.container}>
//             <Animated.Image
//                 source={require('../../assets/images/GiftorawithText2.png')} // apna logo yahan lagao
//                 style={[styles.logo, { transform: [{ rotate: spin }], opacity: fadeAnim }]}
//                 resizeMode="contain"
//             />
//         </View>
//     );
// }

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: '#f5f5f5', // light background
//         justifyContent: 'center',
//         alignItems: 'center',
//     },
//     logo: {
//         width: width * 0.4, // 40% of screen width
//         height: width * 0.4,
//     },
// });

// Loader.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export default function Loader() {
    // Animated values for letters
    const letters = 'iftora'.split('');
    const letterAnim = letters.map(() => new Animated.Value(0));

    // Animated values for dots
    const dots = [0, 1, 2].map(() => new Animated.Value(0));

    useEffect(() => {
        // Letters bounce animation
        const animations = letterAnim.map((anim, idx) =>
            Animated.loop(
                Animated.sequence([
                    Animated.delay(idx * 100),
                    Animated.timing(anim, {
                        toValue: -10,
                        duration: 500,
                        useNativeDriver: true,
                    }),
                    Animated.timing(anim, {
                        toValue: 0,
                        duration: 500,
                        useNativeDriver: true,
                    }),
                ])
            )
        );
        Animated.stagger(50, animations).start();

        // Dots bounce animation
        const dotAnimations = dots.map((dot, idx) =>
            Animated.loop(
                Animated.sequence([
                    Animated.delay(idx * 200),
                    Animated.timing(dot, {
                        toValue: -10,
                        duration: 400,
                        useNativeDriver: true,
                    }),
                    Animated.timing(dot, {
                        toValue: 0,
                        duration: 400,
                        useNativeDriver: true,
                    }),
                ])
            )
        );
        Animated.stagger(100, dotAnimations).start();
    }, []);

    return (
        <View style={styles.container}>
            <View style={styles.loader}>
                {/* Circle G */}
                <Animated.View style={styles.circle}>
                    <Text style={styles.circleText}>G</Text>
                </Animated.View>

                {/* Letters */}
                {letters.map((letter, idx) => (
                    <Animated.Text
                        key={idx}
                        style={[
                            styles.letter,
                            { transform: [{ translateY: letterAnim[idx] }] },
                        ]}
                    >
                        {letter}
                    </Animated.Text>
                ))}
            </View>

            {/* Animated dots */}
            <View style={styles.dots}>
                {dots.map((dot, idx) => (
                    <Animated.View
                        key={idx}
                        style={[
                            styles.dot,
                            { transform: [{ translateY: dot }] },
                        ]}
                    />
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff', // dark pink background
        justifyContent: 'center',
        alignItems: 'center',
    },
    loader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    circle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#FF3399',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
        shadowColor: '#70df40ff',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.7,
        shadowRadius: 10,
        elevation: 10,
    },
    circleText: {
        color: '#eaf109ff',
        fontSize: 48,
        fontWeight: '900',
    },
    letter: {
        fontSize: 60,
        fontWeight: '900',
        color: '#f366c4ff', // pink gradient not directly possible in RN Text
        marginHorizontal: 2,
    },
    dots: {
        flexDirection: 'row',
        marginTop: 20,
    },
    dot: {
        width: 12,
        height: 12,
        backgroundColor: '#FF66CC',
        borderRadius: 6,
        marginHorizontal: 5,
    },
});