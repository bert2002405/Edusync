import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const GetStartedScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <View style={styles.logoWrapper}>
            <View style={styles.clockCircle}>
              <View style={styles.clockCenter} />
              <View style={[styles.clockHand, { transform: [{ rotate: '45deg' }] }]} />
            </View>
            <View style={styles.colorStrips}>
              <View style={[styles.strip, { backgroundColor: '#FF6B6B' }]} />
              <View style={[styles.strip, { backgroundColor: '#4ECDC4' }]} />
              <View style={[styles.strip, { backgroundColor: '#45B7D1' }]} />
              <View style={[styles.strip, { backgroundColor: '#96CEB4' }]} />
            </View>
          </View>
        </View>
        <Text style={styles.title}>EduSync</Text>
        <Text style={styles.subtitle}>Smart Academic Planning</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.navigationDots}>
        <View style={styles.dot} />
        <View style={[styles.dot, styles.activeDot]} />
        <View style={styles.dot} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  logoContainer: {
    backgroundColor: '#F3F4F6',
    padding: 24,
    borderRadius: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  logoWrapper: {
    width: 160,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  clockCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginRight: 10,
  },
  clockCenter: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFF',
    position: 'absolute',
  },
  clockHand: {
    width: 4,
    height: 30,
    backgroundColor: '#FFF',
    position: 'absolute',
    bottom: '50%',
    borderRadius: 2,
    transformOrigin: 'bottom',
  },
  colorStrips: {
    height: 80,
    justifyContent: 'space-between',
  },
  strip: {
    width: 40,
    height: 15,
    borderRadius: 8,
    marginVertical: 2,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#3B82F6',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 48,
  },
  button: {
    backgroundColor: '#6B4EAE',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    width: '100%',
    maxWidth: 280,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  navigationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: 40,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1D5DB',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#6B4EAE',
    width: 24,
  },
});

export default GetStartedScreen;
