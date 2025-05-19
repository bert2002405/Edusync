import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';

const NotificationsScreen = () => {
  // Example notifications data - replace with your actual notifications data
  const notifications = [
    { id: '1', message: 'Welcome to FinslEducSync!' },
    { id: '2', message: 'Your learning progress is on track.' },
  ];

  const renderNotification = ({ item }) => (
    <View style={styles.notificationItem}>
      <Text style={styles.notificationText}>{item.message}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Notifications</Text>
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={item => item.id}
        style={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  list: {
    flex: 1,
  },
  notificationItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: '#f8f8f8',
  },
  notificationText: {
    fontSize: 16,
  },
});

export default NotificationsScreen;
