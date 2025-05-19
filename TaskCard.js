import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTaskContext } from '../context/TaskContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TaskScreen = ({ navigation }) => {
  const { tasks, completedTasks, addTask, completeTask, deleteTask } = useTaskContext();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newTask, setNewTask] = useState({
    subject: '',
    title: '',
    priority: 'medium',
    dueDate: ''
  });

  const priorityColors = {
    high: '#FF4B6E',
    medium: '#FFA726',
    low: '#34A853'
  };

  const getTaskCategory = (dueDate) => {
    const today = new Date();
    const taskDate = new Date(dueDate);
    const diffDays = Math.ceil((taskDate - today) / (1000 * 60 * 60 * 24));

    if (diffDays <= 1) return 'Today';
    if (diffDays <= 7) return 'This Week';
    return 'Next Month';
  };

  const saveTasks = async (updatedTasks) => {
    try {
      await AsyncStorage.setItem('tasks', JSON.stringify(updatedTasks));
    } catch (error) {
      console.error('Error saving tasks:', error);
    }
  };

  const saveCompletedTasks = async (updatedCompletedTasks) => {
    try {
      await AsyncStorage.setItem('completedTasks', JSON.stringify(updatedCompletedTasks));
    } catch (error) {
      console.error('Error saving completed tasks:', error);
    }
  };



  const handleAddTask = async () => {
    if (!newTask.subject || !newTask.title || !newTask.dueDate) {
      Alert.alert('Missing Information', 'Please fill in all required fields');
      return;
    }

    try {
      const category = getTaskCategory(newTask.dueDate);
      const task = {
        ...newTask,
        category,
        color: priorityColors[newTask.priority],
        id: Date.now().toString()
      };
      
      await addTask(task);
      
      setNewTask({
        subject: '',
        title: '',
        priority: 'medium',
        dueDate: ''
      });
      setShowAddModal(false);
      
      // Show success message
      Alert.alert('Success', 'Task added successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to add task. Please try again.');
    }
  };

  const handleEditTask = () => {
    if (selectedTask && selectedTask.subject && selectedTask.title && selectedTask.dueDate) {
      const category = getTaskCategory(selectedTask.dueDate);
      const updatedTasks = tasks.map(task =>
        task.id === selectedTask.id
          ? { ...selectedTask, category, color: priorityColors[selectedTask.priority] }
          : task
      );
      setTasks(updatedTasks);
      setSelectedTask(null);
      setShowEditModal(false);
    }
  };

  const handleDeleteTask = (taskId) => {
    // Check if we're currently adding a new task
    if (showAddModal) {
      Alert.alert('Cannot Delete', 'Please finish adding the new task first');
      return;
    }

    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          onPress: async () => {
            try {
              await deleteTask(taskId);
              Alert.alert('Success', 'Task deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete task. Please try again.');
            }
          },
          style: 'destructive'
        }
      ]
    );
  };

  const handleCompleteTask = (taskId) => {
    Alert.alert(
      'Complete Task',
      'Are you sure you want to mark this task as complete?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Complete', 
          onPress: () => completeTask(taskId)
        }
      ]
    );
  };

  const checkOverdueTasks = () => {
    const now = new Date();
    const overdueTasks = tasks.filter(task => {
      const taskDate = new Date(task.dueDate);
      taskDate.setHours(23, 59, 59, 999); // End of the due date
      return taskDate < now;
    });

    if (overdueTasks.length > 0) {
      overdueTasks.forEach(task => {
        completeTask(task.id);
      });
    }
  };

  // Check for overdue tasks every minute
  useEffect(() => {
    checkOverdueTasks(); // Initial check
    const interval = setInterval(checkOverdueTasks, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [tasks]);

  // Filter tasks based on search query
  const filteredTasks = tasks.filter(task =>
    task.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedTasks = filteredTasks.reduce((acc, task) => {
    if (!acc[task.category]) {
      acc[task.category] = [];
    }
    acc[task.category].push(task);
    return acc;
  }, {});

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Homework & Deadline</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView style={styles.taskList}>
        {/* Completed Tasks Section */}
        {completedTasks.length > 0 && (
          <View>
            <Text style={styles.categoryTitle}>Completed</Text>
            {completedTasks.map(task => (
              <View key={task.id} style={[styles.taskItem, styles.completedTaskItem]}>
                <View style={[styles.taskColor, { backgroundColor: task.color }]} />
                <View style={styles.taskContent}>
                  <Text style={[styles.taskSubject, styles.completedTaskText]}>{task.subject}</Text>
                  <Text style={[styles.taskTitle, styles.completedTaskText]}>{task.title}</Text>
                  <Text style={styles.completedDate}>
                    Completed: {new Date(task.completedDate).toLocaleDateString()}
                    {task.status === 'Overdue' ? ' (Overdue)' : ''}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => setCompletedTasks(completedTasks.filter(t => t.id !== task.id))}
                >
                  <Text style={styles.deleteButtonText}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
        {Object.entries(groupedTasks).map(([category, categoryTasks]) => (
          <View key={category}>
            <Text style={styles.categoryTitle}>{category}</Text>
            {categoryTasks.map(task => (
              <TouchableOpacity
                key={task.id}
                style={styles.taskItem}
                onPress={() => {
                  setSelectedTask(task);
                  setShowEditModal(true);
                }}
              >
                <View style={[styles.taskColor, { backgroundColor: task.color }]} />
                <View style={styles.taskContent}>
                  <Text style={styles.taskSubject}>{task.subject}</Text>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                </View>
                <TouchableOpacity
                  style={styles.completeButton}
                  onPress={() => handleCompleteTask(task.id)}
                >
                  <Text style={styles.completeButtonText}>✓</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteTask(task.id)}
                >
                  <Text style={styles.deleteButtonText}>×</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </ScrollView>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={[styles.navItem, styles.activeNavItem]}>
          <Text style={[styles.navIcon, styles.activeNavText]}>📋</Text>
          <Text style={[styles.navLabel, styles.activeNavText]}>Task</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('Calendar', { tasks })}
        >
          <Text style={styles.navIcon}>📅</Text>
          <Text style={styles.navLabel}>Calendar</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('Completed', { completedTasks })}
        >
          <Text style={styles.navIcon}>✓</Text>
          <Text style={styles.navLabel}>Completed</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setShowAddModal(true)}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>

      {/* Add Task Modal */}
      <Modal
        visible={showAddModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Add New Task</Text>
              
              <TextInput
                style={styles.input}
                placeholder="Subject"
                value={newTask.subject}
                onChangeText={(text) => setNewTask({...newTask, subject: text})}
              />
              
              <TextInput
                style={styles.input}
                placeholder="Title/Description"
                value={newTask.title}
                onChangeText={(text) => setNewTask({...newTask, title: text})}
              />

              <TextInput
                style={styles.input}
                placeholder="Due Date (YYYY-MM-DD)"
                value={newTask.dueDate}
                onChangeText={(text) => setNewTask({...newTask, dueDate: text})}
              />

              <View style={styles.priorityContainer}>
                <Text style={styles.priorityLabel}>Priority:</Text>
                <View style={styles.priorityButtons}>
                  {['low', 'medium', 'high'].map((priority) => (
                    <TouchableOpacity
                      key={priority}
                      style={[
                        styles.priorityButton,
                        newTask.priority === priority && styles.selectedPriority,
                        { backgroundColor: priorityColors[priority] }
                      ]}
                      onPress={() => setNewTask({...newTask, priority})}
                    >
                      <Text style={styles.priorityButtonText}>
                        {priority.charAt(0).toUpperCase() + priority.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => {
                    setShowAddModal(false);
                    setNewTask({
                      subject: '',
                      title: '',
                      priority: 'medium',
                      dueDate: ''
                    });
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.modalButton, styles.addModalButton]}
                  onPress={handleAddTask}
                >
                  <Text style={styles.addButtonText}>Add Task</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Edit Task Modal */}
      <Modal
        visible={showEditModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Edit Task</Text>
              
              <TextInput
                style={styles.input}
                placeholder="Subject"
                value={selectedTask?.subject}
                onChangeText={(text) => setSelectedTask({...selectedTask, subject: text})}
              />
              
              <TextInput
                style={styles.input}
                placeholder="Title/Description"
                value={selectedTask?.title}
                onChangeText={(text) => setSelectedTask({...selectedTask, title: text})}
              />

              <TextInput
                style={styles.input}
                placeholder="Due Date (YYYY-MM-DD)"
                value={selectedTask?.dueDate}
                onChangeText={(text) => setSelectedTask({...selectedTask, dueDate: text})}
              />

              <View style={styles.priorityContainer}>
                <Text style={styles.priorityLabel}>Priority:</Text>
                <View style={styles.priorityButtons}>
                  {['low', 'medium', 'high'].map((priority) => (
                    <TouchableOpacity
                      key={priority}
                      style={[
                        styles.priorityButton,
                        selectedTask?.priority === priority && styles.selectedPriority,
                        { backgroundColor: priorityColors[priority] }
                      ]}
                      onPress={() => setSelectedTask({...selectedTask, priority})}
                    >
                      <Text style={styles.priorityButtonText}>
                        {priority.charAt(0).toUpperCase() + priority.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => {
                    setShowEditModal(false);
                    setSelectedTask(null);
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.modalButton, styles.addModalButton]}
                  onPress={handleEditTask}
                >
                  <Text style={styles.addButtonText}>Save Changes</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  completedTaskItem: {
    opacity: 0.8,
    backgroundColor: '#F9FAFB',
  },
  completedTaskText: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  completedDate: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    fontStyle: 'italic',
  },
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
  searchContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchInput: {
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  taskList: {
    flex: 1,
    padding: 16,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
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
  deleteButton: {
    padding: 8,
  },
  deleteButtonText: {
    fontSize: 20,
    color: '#EF4444',
    fontWeight: '600',
  },
  completeButton: {
    padding: 8,
    marginRight: 8,
  },
  completeButtonText: {
    fontSize: 20,
    color: '#34D399',
    fontWeight: '600',
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
  navIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  navLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  activeNavItem: {
    opacity: 1,
  },
  activeNavText: {
    color: '#3B82F6',
  },
  addButton: {
    position: 'absolute',
    right: 16,
    bottom: 90,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  addButtonText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '600',
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
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 12,
  },
  priorityContainer: {
    marginBottom: 16,
  },
  priorityLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  priorityButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priorityButton: {
    flex: 1,
    padding: 8,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  selectedPriority: {
    opacity: 0.8,
  },
  priorityButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
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
  addModalButton: {
    backgroundColor: '#3B82F6',
  },
});

export default TaskScreen;
