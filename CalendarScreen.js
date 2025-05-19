import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar } from 'react-native-calendars';

const CalendarScreen = ({ navigation, route }) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [tasks, setTasks] = useState(route.params?.tasks || []);
  const [markedDates, setMarkedDates] = useState({});

  // Update marked dates when tasks change
  React.useEffect(() => {
    const newMarkedDates = {};
    tasks.forEach(task => {
      if (!task.completed) {
        newMarkedDates[task.dueDate] = {
          marked: true,
          dotColor: task.color,
          selectedColor: '#3B82F6'
        };
      }
    });
    setMarkedDates(newMarkedDates);
  }, [tasks]);

  const getTasksForDate = (date) => {
    return tasks.filter(task => task.dueDate === date && !task.completed);
  };

  const handleDayPress = (day) => {
    setSelectedDate(day.dateString);
    setShowAddModal(true);
  };

  const handleAddTask = (date) => {
    navigation.navigate('Tasks', { 
      screen: 'Tasks',
      params: { selectedDate: date }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Calendar</Text>
      </View>

      <Calendar
        style={styles.calendar}
        theme={{
          backgroundColor: '#ffffff',
          calendarBackground: '#ffffff',
          textSectionTitleColor: '#1F2937',
          selectedDayBackgroundColor: '#3B82F6',
          selectedDayTextColor: '#ffffff',
          todayTextColor: '#3B82F6',
          dayTextColor: '#1F2937',
          textDisabledColor: '#9CA3AF',
          dotColor: '#3B82F6',
          selectedDotColor: '#ffffff',
          arrowColor: '#3B82F6',
          monthTextColor: '#1F2937',
          textDayFontWeight: '400',
          textMonthFontWeight: '600',
          textDayHeaderFontWeight: '500'
        }}
        markedDates={markedDates}
        onDayPress={handleDayPress}
      />

      <ScrollView style={styles.taskList}>
        {selectedDate && (
          <View>
            <Text style={styles.dateTitle}>
              Tasks for {new Date(selectedDate).toLocaleDateString()}
            </Text>
            {getTasksForDate(selectedDate).map((task) => (
              <View key={task.id} style={styles.taskItem}>
                <View style={[styles.taskColor, { backgroundColor: task.color }]} />
                <View style={styles.taskContent}>
                  <Text style={styles.taskSubject}>{task.subject}</Text>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                </View>
              </View>
            ))}
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
        <TouchableOpacity style={[styles.navItem, styles.activeNavItem]}>
          <Text style={[styles.navIcon, styles.activeNavText]}>📅</Text>
          <Text style={[styles.navLabel, styles.activeNavText]}>Calendar</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('Completed')}
        >
          <Text style={styles.navIcon}>✓</Text>
          <Text style={styles.navLabel}>Completed</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showAddModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Add Task for {new Date(selectedDate).toLocaleDateString()}
            </Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.addButton]}
                onPress={() => {
                  setShowAddModal(false);
                  handleAddTask(selectedDate);
                }}
              >
                <Text style={styles.addButtonText}>Add Task</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  calendar: {
    marginBottom: 16,
  },
  taskList: {
    flex: 1,
    padding: 16,
  },
  dateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 24,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  cancelButtonText: {
    color: '#4B5563',
    fontWeight: '500',
  },
  addButton: {
    backgroundColor: '#3B82F6',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
});

export default CalendarScreen;
