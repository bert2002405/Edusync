import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SettingsScreen = ({ navigation }) => {
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [autoPlayVideos, setAutoPlayVideos] = useState(true);
  const [downloadOverWifi, setDownloadOverWifi] = useState(true);
  const [language, setLanguage] = useState('English');

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { 
          text: 'No', 
          style: 'cancel',
          onPress: () => {} 
        },
        { 
          text: 'Yes', 
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (error) {
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          }
        },
      ],
      { cancelable: false }
    );
  };

  const renderSettingItem = (icon, title, subtitle, value, onPress, type = 'toggle') => (
    <TouchableOpacity 
      style={styles.settingItem}
      onPress={type === 'toggle' ? null : onPress}
    >
      <View style={styles.settingItemLeft}>
        <View style={[styles.iconContainer, { backgroundColor: getIconBackground(icon) }]}>
          <Ionicons name={icon} size={22} color={getIconColor(icon)} />
        </View>
        <View style={styles.settingTexts}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {type === 'toggle' ? (
        <Switch
          value={value}
          onValueChange={onPress}
          trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
          thumbColor={value ? '#3B82F6' : '#9CA3AF'}
        />
      ) : (
        <View style={styles.settingItemRight}>
          {value && <Text style={styles.settingValue}>{value}</Text>}
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </View>
      )}
    </TouchableOpacity>
  );

  const getIconBackground = (icon) => {
    switch (icon) {
      case 'notifications-outline': return '#EBF5FF';
      case 'mail-outline': return '#FEF3C7';
      case 'moon-outline': return '#F3E8FF';
      case 'play-circle-outline': return '#ECFDF5';
      case 'wifi-outline': return '#FEE2E2';
      case 'language-outline': return '#DBEAFE';
      case 'shield-checkmark-outline': return '#E0E7FF';
      case 'help-circle-outline': return '#F3F4F6';
      case 'log-out-outline': return '#FEE2E2';
      default: return '#F3F4F6';
    }
  };

  const getIconColor = (icon) => {
    switch (icon) {
      case 'notifications-outline': return '#3B82F6';
      case 'mail-outline': return '#F59E0B';
      case 'moon-outline': return '#8B5CF6';
      case 'play-circle-outline': return '#10B981';
      case 'wifi-outline': return '#EF4444';
      case 'language-outline': return '#2563EB';
      case 'shield-checkmark-outline': return '#4F46E5';
      case 'help-circle-outline': return '#6B7280';
      case 'log-out-outline': return '#DC2626';
      default: return '#6B7280';
    }
  };

  return (
    <View style={styles.container}>
      <Header navigation={navigation} title="Settings" />
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          {renderSettingItem(
            'notifications-outline',
            'Push Notifications',
            'Get notified about updates',
            pushNotifications,
            setPushNotifications
          )}
          {renderSettingItem(
            'mail-outline',
            'Email Notifications',
            'Receive emails about activity',
            emailNotifications,
            setEmailNotifications
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          {renderSettingItem(
            'moon-outline',
            'Dark Mode',
            'Switch to dark theme',
            darkMode,
            setDarkMode
          )}
          {renderSettingItem(
            'play-circle-outline',
            'Auto-play Videos',
            'Play videos automatically',
            autoPlayVideos,
            setAutoPlayVideos
          )}
          {renderSettingItem(
            'wifi-outline',
            'Download over Wi-Fi only',
            'Save mobile data',
            downloadOverWifi,
            setDownloadOverWifi
          )}
          {renderSettingItem(
            'language-outline',
            'Language',
            'Choose your preferred language',
            language,
            () => {/* Add language selection */},
            'select'
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Help & Support</Text>
          {renderSettingItem(
            'help-circle-outline',
            'Help Center',
            'Get help with using the app',
            null,
            () => {/* Add help center navigation */},
            'select'
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 1,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingTexts: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 4,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  settingItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValue: {
    fontSize: 14,
    color: '#6B7280',
    marginRight: 8,
  }
});

export default SettingsScreen;
