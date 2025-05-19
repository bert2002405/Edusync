import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

const BottomNavigation = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const navigateToScreen = (screenName) => {
    navigation.navigate(screenName);
  };

  const getTabStyle = (screenName) => {
    return {
      ...styles.tabItem,
      ...(route.name === screenName && styles.activeTabItem)
    };
  };

  const getIconColor = (screenName) => {
    return route.name === screenName ? '#007AFF' : '#333';
  };

  const getTextStyle = (screenName) => {
    return {
      ...styles.tabText,
      ...(route.name === screenName && styles.activeTabText)
    };
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={getTabStyle('Dashboard')}
        onPress={() => navigateToScreen('Dashboard')}
      >
        <Ionicons name="home" size={24} color={getIconColor('Dashboard')} />
        <Text style={getTextStyle('Dashboard')}>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={getTabStyle('TimeTable')}
        onPress={() => navigateToScreen('TimeTable')}
      >
        <Ionicons name="calendar" size={24} color={getIconColor('TimeTable')} />
        <Text style={getTextStyle('TimeTable')}>Schedule</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={getTabStyle('Subjects')}
        onPress={() => navigateToScreen('Subjects')}
      >
        <Ionicons name="book" size={24} color={getIconColor('Subjects')} />
        <Text style={getTextStyle('Subjects')}>Subjects</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={getTabStyle('Tasks')}
        onPress={() => navigateToScreen('Tasks')}
      >
        <Ionicons name="checkmark-circle" size={24} color={getIconColor('Tasks')} />
        <Text style={getTextStyle('Tasks')}>Tasks</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 15,
  },
  activeTabItem: {
    borderRadius: 20,
    backgroundColor: '#F0F8FF',
  },
  tabText: {
    fontSize: 12,
    marginTop: 4,
    color: '#333',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
});

export default BottomNavigation;
