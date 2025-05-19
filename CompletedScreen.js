import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const CompletedScreen = ({ navigation, route }) => {
  const completedTasks = route.params?.completedTasks || [];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Completed Tasks</Text>
      </View>

      <ScrollView style={styles.taskList}>
        {completedTasks.map((task) => (
          <View key={task.id} style={styles.taskItem}>
            <View style={[styles.taskColor, { backgroundColor: task.color }]} />
            <View style={styles.taskContent}>
              <Text style={styles.taskSubject}>{task.subject}</Text>
              <Text style={styles.taskTitle}>{task.title}</Text>
              <Text style={styles.completedDate}>
                Completed on: {new Date(task.completedDate).toLocaleDateString()}
              </Text>
            </View>
            <Text style={styles.checkmark}>✓</Text>
          </View>
        ))}
        {completedTasks.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>🎉</Text>
            <Text style={styles.emptyStateTitle}>No completed tasks yet</Text>
            <Text style={styles.emptyStateText}>
              Your completed tasks will appear here
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('Tasks')}
        >
          <Text style={styles.navIcon}>📋</Text>
          <Text style={styles.navLabel}>Task</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('Calendar')}
        >
          <Text style={styles.navIcon}>📅</Text>
          <Text style={styles.navLabel}>Calendar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navItem, styles.activeNavItem]}>
          <Text style={[styles.navIcon, styles.activeNavText]}>✓</Text>
          <Text style={[styles.navLabel, styles.activeNavText]}>Completed</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  backButton: {
    fontSize: 24,
    marginRight: 16,
    color: '#374151',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
  },
  taskList: {
    flex: 1,
    padding: 16,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  taskColor: {
    width: 4,
    height: '100%',
    borderRadius: 2,
    marginRight: 12,
  },
  taskContent: {
    flex: 1,
  },
  taskSubject: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  taskTitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  completedDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  checkmark: {
    fontSize: 20,
    color: '#34D399',
    marginLeft: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6B7280',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  navItem: {
    alignItems: 'center',
  },
  activeNavItem: {
    opacity: 1,
  },
  navIcon: {
    fontSize: 24,
    marginBottom: 4,
    color: '#6B7280',
  },
  navLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  activeNavText: {
    color: '#3B82F6',
  },
});

export default CompletedScreen;
