import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTaskContext } from '../context/TaskContext';

// Weekly timetable data
const weeklySchedule = {
  Monday: [
    { id: 1, subject: 'English 10', time: '08:00 AM - 09:30 AM', room: 'Room 101', professor: 'Dr. Smith', startTime: '08:00', endTime: '09:30' },
    { id: 2, subject: 'Math 115', time: '10:00 AM - 11:30 AM', room: 'Room 203', professor: 'Prof. Johnson', startTime: '10:00', endTime: '11:30' },
    { id: 3, subject: 'History 10', time: '01:00 PM - 02:30 PM', room: 'Room 305', professor: 'Dr. Thompson', startTime: '13:00', endTime: '14:30' }
  ],
  Tuesday: [
    { id: 4, subject: 'Physics 101', time: '09:00 AM - 10:30 AM', room: 'Lab 201', professor: 'Dr. Brown', startTime: '09:00', endTime: '10:30' },
    { id: 5, subject: 'Computer Science 201', time: '11:00 AM - 12:30 PM', room: 'Lab 102', professor: 'Prof. Davis', startTime: '11:00', endTime: '12:30' }
  ],
  Wednesday: [
    { id: 6, subject: 'Chemistry 101', time: '08:00 AM - 09:30 AM', room: 'Lab 301', professor: 'Dr. Miller', startTime: '08:00', endTime: '09:30' },
    { id: 7, subject: 'Math 115', time: '10:00 AM - 11:30 AM', room: 'Room 203', professor: 'Prof. Johnson', startTime: '10:00', endTime: '11:30' },
    { id: 8, subject: 'English 10', time: '02:00 PM - 03:30 PM', room: 'Room 101', professor: 'Dr. Smith', startTime: '14:00', endTime: '15:30' }
  ],
  Thursday: [
    { id: 9, subject: 'History 10', time: '09:00 AM - 10:30 AM', room: 'Room 305', professor: 'Dr. Thompson', startTime: '09:00', endTime: '10:30' },
    { id: 10, subject: 'Physics 101', time: '11:00 AM - 12:30 PM', room: 'Lab 201', professor: 'Dr. Brown', startTime: '11:00', endTime: '12:30' }
  ],
  Friday: [
    { id: 11, subject: 'Computer Science 201', time: '08:00 AM - 09:30 AM', room: 'Lab 102', professor: 'Prof. Davis', startTime: '08:00', endTime: '09:30' },
    { id: 12, subject: 'Chemistry 101', time: '10:00 AM - 11:30 AM', room: 'Lab 301', professor: 'Dr. Miller', startTime: '10:00', endTime: '11:30' }
  ]
};

function DashboardScreen({ navigation }) {
  const { tasks, completedTasks, completeTask } = useTaskContext();
  const [activeTasks, setActiveTasks] = useState([]);
  const [dueTasks, setDueTasks] = useState([]);
  const [recentCompletedTasks, setRecentCompletedTasks] = useState([]);
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showNextDay, setShowNextDay] = useState(false);
  const [scheduledClasses, setScheduledClasses] = useState([]);

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  // Load schedule and stats
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load timetable data from AsyncStorage
        const timetableData = await AsyncStorage.getItem('@timetable_data');
        const scheduledClassesData = await AsyncStorage.getItem('@scheduled_classes');
        
        let schedule;
        let scheduledClasses = [];
        
        if (timetableData) {
          schedule = JSON.parse(timetableData);
        } else {
          schedule = {
            Monday: [
              { id: 1, subject: 'PROG1', time: '3:00 PM - 4:30 PM', room: 'Lab 1', professor: 'Prof. Wilson', type: 'Laboratory' },
            ],
          };
        }

        if (scheduledClassesData) {
          scheduledClasses = JSON.parse(scheduledClassesData);
          setScheduledClasses(scheduledClasses);
        }
        
        // Get current day and next day
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const today = days[currentTime.getDay()];
        const tomorrow = days[(currentTime.getDay() + 1) % 7];
        
        // Get today's classes from regular schedule
        const todayClasses = schedule[today] || [];
        
        // Get today's scheduled classes
        const todayScheduledClasses = scheduledClasses.filter(class_ => 
          isSameDay(new Date(class_.scheduledDate), currentTime)
        );

        // Combine regular and scheduled classes
        const allTodayClasses = [...todayClasses, ...todayScheduledClasses];
        
        // Get current time in 24-hour format
        const now = currentTime.toLocaleTimeString('en-US', { 
          hour12: false,
          hour: '2-digit', 
          minute: '2-digit'
        });

        // Check if all today's classes are done
        const allClassesDone = allTodayClasses.every(class_ => {
          const [_, endTime] = class_.time.split(' - ');
          const [endTimeStr, endPeriod] = endTime.split(' ');
          let [endHours, endMinutes] = endTimeStr.split(':').map(Number);
          
          if (endPeriod === 'PM' && endHours !== 12) endHours += 12;
          if (endPeriod === 'AM' && endHours === 12) endHours = 0;
          
          const classEndTime = `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
          return classEndTime.localeCompare(now) <= 0;
        });

        if (allClassesDone) {
          // Show tomorrow's classes
          const tomorrowClasses = schedule[tomorrow] || [];
          const tomorrowScheduledClasses = scheduledClasses.filter(class_ => 
            isSameDay(new Date(class_.scheduledDate), new Date(currentTime.getTime() + 24 * 60 * 60 * 1000))
          );
          const allTomorrowClasses = [...tomorrowClasses, ...tomorrowScheduledClasses];
          
          setShowNextDay(true);
          setTodaySchedule(allTomorrowClasses);
        } else {
          // Show today's remaining classes
          const relevantClasses = allTodayClasses
            .filter(class_ => {
              const [startTime, endTime] = class_.time.split(' - ');
              const [startTimeStr, startPeriod] = startTime.split(' ');
              const [endTimeStr, endPeriod] = endTime.split(' ');
              
              let [startHours, startMinutes] = startTimeStr.split(':').map(Number);
              let [endHours, endMinutes] = endTimeStr.split(':').map(Number);
              
              if (startPeriod === 'PM' && startHours !== 12) startHours += 12;
              if (startPeriod === 'AM' && startHours === 12) startHours = 0;
              if (endPeriod === 'PM' && endHours !== 12) endHours += 12;
              if (endPeriod === 'AM' && endHours === 12) endHours = 0;
              
              const classStartTime = `${startHours.toString().padStart(2, '0')}:${startMinutes.toString().padStart(2, '0')}`;
              const classEndTime = `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
              
              return classEndTime.localeCompare(now) > 0;
            })
            .sort((a, b) => {
              const [aStart] = a.time.split(' - ');
              const [bStart] = b.time.split(' - ');
              return aStart.localeCompare(bStart);
            });
          
          setShowNextDay(false);
          setTodaySchedule(relevantClasses);
        }
      } catch (error) {
        console.error('Error loading timetable data:', error);
      }
    };

    loadData();
    // Update schedule every minute
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, [currentTime]);

  const getClassStatus = (class_) => {
    const now = currentTime.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit', 
      minute: '2-digit'
    });

    const [startTime, endTime] = class_.time.split(' - ');
    const [startTimeStr, startPeriod] = startTime.split(' ');
    const [endTimeStr, endPeriod] = endTime.split(' ');
    
    let [startHours, startMinutes] = startTimeStr.split(':').map(Number);
    let [endHours, endMinutes] = endTimeStr.split(':').map(Number);
    
    // Convert to 24-hour format
    if (startPeriod === 'PM' && startHours !== 12) startHours += 12;
    if (startPeriod === 'AM' && startHours === 12) startHours = 0;
    if (endPeriod === 'PM' && endHours !== 12) endHours += 12;
    if (endPeriod === 'AM' && endHours === 12) endHours = 0;
    
    const classStartTime = `${startHours.toString().padStart(2, '0')}:${startMinutes.toString().padStart(2, '0')}`;
    const classEndTime = `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
    
    console.log('Class:', class_.subject, 'Start:', classStartTime, 'End:', classEndTime, 'Now:', now); // Debug log
    
    if (now >= classStartTime && now <= classEndTime) {
      return 'ongoing';
    } else if (now < classStartTime) {
      return 'upcoming';
    } else {
      return 'ended';
    }
  };

  const isCurrentClass = (class_) => {
    const now = currentTime.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit', 
      minute: '2-digit'
    });
    return class_.startTime.localeCompare(now) <= 0 && class_.endTime.localeCompare(now) > 0;
  };
  const [menuVisible, setMenuVisible] = useState(false);
  const [userAvatar, setUserAvatar] = useState(null);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showProfileDetails, setShowProfileDetails] = useState(false);

  // Fetch user data on mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = await AsyncStorage.getItem('userData');
        if (userData) {
          const { avatar, name, email } = JSON.parse(userData);
          setUserAvatar(avatar);
          setUserName(name || email?.split('@')[0] || 'User');
          setUserEmail(email || '');
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        setIsLoggedIn(false);
      }
    };
    const updateCurrentDateTime = () => {
    const now = new Date();
    setCurrentTime(now);
  };

  const loadTodaySchedule = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = days[currentTime.getDay()];
    
    // Get today's classes
    const todayClasses = weeklySchedule[today] || [];
    
    // Get current time in 24-hour format
    const now = currentTime.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit', 
      minute: '2-digit'
    });

    // Filter and sort classes
    const upcomingClasses = todayClasses
      .filter(class_ => {
        // Convert class start time to 24-hour format for comparison
        const [startTime] = class_.time.split(' - ');
        const [time, period] = startTime.split(' ');
        let [hours, minutes] = time.split(':').map(Number);
        
        if (period === 'PM' && hours !== 12) {
          hours += 12;
        } else if (period === 'AM' && hours === 12) {
          hours = 0;
        }
        
        const classStartTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        return classStartTime.localeCompare(now) > 0;
      })
      .sort((a, b) => {
        const [aStart] = a.time.split(' - ');
        const [bStart] = b.time.split(' - ');
        return aStart.localeCompare(bStart);
      });
    
    setTodaySchedule(upcomingClasses);
  };
    loadUserData();
    loadTodaySchedule();
    loadAnalytics();
    updateCurrentDateTime(); // Initial time update

    // Update time every second
    const timeTimer = setInterval(updateCurrentDateTime, 1000);

    // Update schedule every minute
    const scheduleTimer = setInterval(loadTodaySchedule, 60000);

    return () => {
      clearInterval(timeTimer);
      clearInterval(scheduleTimer);
    };
  }, []);

  // Track study session
  const startStudySession = () => {
    const newStudyHours = analytics.studyHours + 1;
    setAnalytics(prev => ({
      ...prev,
      studyHours: newStudyHours,
      lastStudyUpdate: new Date().toISOString()
    }));
    // Save to AsyncStorage
    saveAnalytics({ ...analytics, studyHours: newStudyHours });
  };

  // Mark attendance
  const markAttendance = (classId) => {
    if (!analytics.attendedClasses.includes(classId)) {
      const newAttendedClasses = [...analytics.attendedClasses, classId];
      const newAttendanceRate = Math.round((newAttendedClasses.length / analytics.totalClasses) * 100);
      setAnalytics(prev => ({
        ...prev,
        attendedClasses: newAttendedClasses,
        attendanceRate: newAttendanceRate
      }));
      saveAnalytics({ 
        ...analytics, 
        attendedClasses: newAttendedClasses, 
        attendanceRate: newAttendanceRate 
      });
    }
  };

  // Save analytics to AsyncStorage
  const saveAnalytics = async (data) => {
    try {
      await AsyncStorage.setItem('analytics', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving analytics:', error);
    }
  };

  // Load analytics from AsyncStorage
  const loadAnalytics = async () => {
    try {
      const savedAnalytics = await AsyncStorage.getItem('analytics');
      if (savedAnalytics) {
        setAnalytics(JSON.parse(savedAnalytics));
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  const [analytics, setAnalytics] = useState({
    studyHours: 0,
    lastStudyUpdate: null,
    completedTasks: 0,
    totalClasses: 24,
    attendedClasses: [],
    attendanceRate: 0,
    tasks: [
      { id: 1, title: 'Math Assignment', dueDate: '2025-04-30', completed: false },
      { id: 2, title: 'Physics Lab Report', dueDate: '2025-05-01', completed: false },
      { id: 3, title: 'English Essay', dueDate: '2025-04-29', completed: false }
    ]
  });
  const [attendedClasses, setAttendedClasses] = useState([]);

  const [showGoalModal, setShowGoalModal] = useState(false);
  const [modalSubject, setModalSubject] = useState('');
  const [modalType, setModalType] = useState('Lecture');

  // Update task lists whenever tasks or completedTasks change
  useEffect(() => {
    updateTaskLists();
  }, [tasks, completedTasks]);

  const updateTaskLists = () => {
    const now = new Date();
    
    // Filter active tasks
    const activeList = tasks.filter(task => {
      const dueDate = new Date(task.dueDate);
      return dueDate >= now && task.status === 'active';
    });
    setActiveTasks(activeList);

    // Filter due tasks
    const dueList = tasks.filter(task => {
      const dueDate = new Date(task.dueDate);
      return dueDate < now && task.status === 'active';
    });
    setDueTasks(dueList);

    // Sort and limit completed tasks
    const recentCompleted = completedTasks
      .sort((a, b) => new Date(b.completedDate) - new Date(a.completedDate))
      .slice(0, 5);
    setRecentCompletedTasks(recentCompleted);
  };

  const handleAddGoal = async () => {
    if (!modalSubject) return;
    
    const newClass = {
      subject: modalSubject,
      type: modalType,
      date: currentTime.toISOString(),
      week: getWeekNumber(currentTime)
    };

    const updatedClasses = [...attendedClasses, newClass];
    setAttendedClasses(updatedClasses);
    await AsyncStorage.setItem('attendedClasses', JSON.stringify(updatedClasses));
    setModalSubject('');
    setModalType('Lecture');
    setShowGoalModal(false);
  };

  const getWeekNumber = (date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  const renderDateTime = () => {
    const formattedDate = currentTime.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const formattedTime = currentTime.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    return (
      <View style={styles.dateTimeContainer}>
        <Text style={styles.dateText}>{formattedDate}</Text>
        <Text style={styles.timeText}>{formattedTime}</Text>
      </View>
    );
  };

  const renderNoClassesMessage = () => {
    return (
      <View style={styles.noClassesContainer}>
        <Ionicons name="calendar-outline" size={48} color="#9CA3AF" />
        <Text style={styles.noClassesTitle}>No Classes Today</Text>
        <Text style={styles.noClassesText}>Enjoy your free time!</Text>
      </View>
    );
  };

  const handleCompleteTask = async (taskId) => {
    try {
      await completeTask(taskId);
      Alert.alert('Success', 'Task marked as complete!');
    } catch (error) {
      console.error('Error completing task:', error);
      Alert.alert('Error', 'Failed to complete task');
    }
  };

  const renderTasks = () => {
    return (
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Tasks & Deadlines</Text>
        {activeTasks.length === 0 && dueTasks.length === 0 ? (
          <Text style={styles.emptyText}>No active tasks</Text>
        ) : (
          <>
            {dueTasks.map(task => (
              <TouchableOpacity 
                key={task.id} 
                style={[styles.taskItem, styles.overdueTask]}
                onPress={() => handleCompleteTask(task.id)}
              >
                <View style={[styles.taskIndicator, { backgroundColor: task.color }]} />
                <View style={styles.taskContent}>
                  <Text style={[styles.taskTitle, styles.overdueText]}>{task.title}</Text>
                  <Text style={styles.taskSubject}>{task.subject}</Text>
                  <Text style={styles.taskDueDate}>Due: {new Date(task.dueDate).toLocaleDateString()}</Text>
                </View>
              </TouchableOpacity>
            ))}
            {activeTasks.map(task => (
              <TouchableOpacity 
                key={task.id} 
                style={styles.taskItem}
                onPress={() => handleCompleteTask(task.id)}
              >
                <View style={[styles.taskIndicator, { backgroundColor: task.color }]} />
                <View style={styles.taskContent}>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                  <Text style={styles.taskSubject}>{task.subject}</Text>
                  <Text style={styles.taskDueDate}>Due: {new Date(task.dueDate).toLocaleDateString()}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}
      </View>
    );
  };

  const renderCompletedTasks = () => {
    return (
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Recently Completed</Text>
        {recentCompletedTasks.length === 0 ? (
          <Text style={styles.emptyText}>No completed tasks</Text>
        ) : (
          recentCompletedTasks.map(task => (
            <View key={task.id} style={[styles.taskItem, styles.completedTask]}>
              <View style={[styles.taskIndicator, { backgroundColor: task.color }]} />
              <View style={styles.taskContent}>
                <Text style={[styles.taskTitle, styles.completedText]}>{task.title}</Text>
                <Text style={styles.taskSubject}>{task.subject}</Text>
                <Text style={styles.taskCompletedDate}>
                  Completed: {new Date(task.completedDate).toLocaleDateString()}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>
    );
  };

  const getRemainingTime = (class_) => {
    const now = currentTime;
    const [startTime, endTime] = class_.time.split(' - ');
    const [endTimeStr, endPeriod] = endTime.split(' ');
    let [endHours, endMinutes] = endTimeStr.split(':').map(Number);
    
    if (endPeriod === 'PM' && endHours !== 12) endHours += 12;
    if (endPeriod === 'AM' && endHours === 12) endHours = 0;
    
    const endDateTime = new Date(now);
    endDateTime.setHours(endHours, endMinutes, 0);
    
    const diffMs = endDateTime - now;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 0) return '0 minutes';
    return `${diffMins} minutes`;
  };

  const formatClassTime = (timeStr) => {
    // Convert "3:00 PM - 4:30 PM" to "3:00-4:30"
    const [startTime, endTime] = timeStr.split(' - ');
    const [startTimeStr] = startTime.split(' ');
    const [endTimeStr] = endTime.split(' ');
    return `${startTimeStr}-${endTimeStr}`;
  };

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const isSameDay = (date1, date2) => {
    return formatDate(date1) === formatDate(date2);
  };

  const renderSchedule = () => {
    return (
      <View style={styles.scheduleSection}>
        <View style={styles.scheduleSection}>
          <Text style={styles.sectionTitle}>
            {showNextDay ? "Tomorrow's Schedule" : "Today's Schedule"}
          </Text>
          <TouchableOpacity 
            style={styles.viewAllButton}
            onPress={() => navigation.navigate('TimeTable')}
          >
            <Text style={styles.viewAllText}>View All</Text>
            <Ionicons name="chevron-forward" size={16} color="#3B82F6" />
          </TouchableOpacity>
          <View style={styles.scheduleList}>
            {todaySchedule.length === 0 ? (
              <View style={styles.noClassesContainer}>
                <Ionicons name="calendar-outline" size={48} color="#9CA3AF" />
                <Text style={styles.noClassesTitle}>
                  {showNextDay ? "No Classes Tomorrow" : "No Classes Today"}
                </Text>
                <Text style={styles.noClassesText}>
                  {showNextDay ? "Enjoy your free time tomorrow!" : "Enjoy your free time!"}
                </Text>
              </View>
            ) : (
              todaySchedule.map((class_, index) => {
                const status = showNextDay ? 'upcoming' : getClassStatus(class_);
                const isOngoing = status === 'ongoing';
                const isScheduled = class_.scheduledDate !== undefined;
                
                return (
                  <View 
                    key={class_.id} 
                    style={[
                      styles.scheduleCard,
                      isOngoing && styles.ongoingCard,
                      isScheduled && styles.scheduledCard,
                      index < todaySchedule.length - 1 && styles.scheduleCardBorder
                    ]}
                  >
                    <View style={styles.scheduleTime}>
                      <View style={styles.timeContainer}>
                        <Ionicons 
                          name={isOngoing ? "time" : "time-outline"} 
                          size={14} 
                          color={isOngoing ? "#059669" : "#3B82F6"} 
                        />
                        <Text style={[styles.timeText, isOngoing && styles.currentTimeText]}>
                          {formatClassTime(class_.time)}
                        </Text>
                        {isOngoing && (
                          <View style={styles.remainingTimeContainer}>
                            <Text style={styles.remainingTime}>
                              {getRemainingTime(class_)} left
                            </Text>
                          </View>
                        )}
                      </View>
                      <View style={[
                        styles.statusBadge,
                        isOngoing ? styles.startedBadge : 
                        isScheduled ? styles.scheduledBadge : styles.upcomingBadge
                      ]}>
                        <Text style={[
                          styles.statusText,
                          isOngoing ? styles.startedText : 
                          isScheduled ? styles.scheduledText : styles.upcomingText
                        ]}>
                          {isOngoing ? 'Ongoing' : isScheduled ? 'Scheduled' : 'Upcoming'}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.scheduleDetails}>
                      <Text style={[styles.subjectName, isOngoing && styles.ongoingSubjectName]}>
                        {class_.subject}
                      </Text>
                      <View style={styles.scheduleInfo}>
                        <View style={styles.infoItem}>
                          <Ionicons 
                            name="location-outline" 
                            size={14} 
                            color={isOngoing ? "#059669" : "#6B7280"} 
                          />
                          <Text style={[styles.infoText, isOngoing && styles.ongoingInfoText]}>
                            {class_.room}
                          </Text>
                        </View>
                        <View style={styles.infoItem}>
                          <Ionicons 
                            name="person-outline" 
                            size={14} 
                            color={isOngoing ? "#059669" : "#6B7280"} 
                          />
                          <Text style={[styles.infoText, isOngoing && styles.ongoingInfoText]}>
                            {class_.professor}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderAnalytics = () => {
    return (
      <View style={styles.analyticsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Analytics Overview</Text>
          <TouchableOpacity style={styles.viewAllButton}>
            <Text style={styles.viewAllText}>View Details</Text>
            <Ionicons name="chevron-forward" size={16} color="#3B82F6" />
          </TouchableOpacity>
        </View>

        <View style={styles.analyticsContainer}>
          {/* Main Stats */}
          <View style={styles.mainStats}>
            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <Ionicons name="time" size={20} color="#3B82F6" />
                <Text style={styles.statValue}>{analytics.studyHours}h</Text>
              </View>
              <Text style={styles.statLabel}>Study Hours</Text>
              <Text style={styles.statTrend}>+2h this week</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <Ionicons name="school" size={20} color="#059669" />
                <Text style={styles.statValue}>{analytics.attendanceRate}%</Text>
              </View>
              <Text style={styles.statLabel}>Attendance</Text>
              <Text style={styles.statDetail}>{analytics.attendedClasses}/{analytics.totalClasses} classes</Text>
            </View>
          </View>

          {/* Tasks Section */}
          <View style={styles.tasksSection}>
            <Text style={styles.sectionSubtitle}>Active Tasks</Text>
            {analytics.tasks
              .filter(task => !task.completed)
              .map(task => (
                <TouchableOpacity 
                  key={task.id} 
                  style={styles.taskItem}
                  onPress={() => completeTask(task.id)}
                >
                  <View style={styles.taskInfo}>
                    <Text style={styles.taskTitle}>{task.title}</Text>
                    <Text style={styles.taskDue}>
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.completeButton}
                    onPress={() => completeTask(task.id)}
                  >
                    <Ionicons name="checkmark" size={16} color="#059669" />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
          </View>
        </View>
      </View>
    );
  };

  const renderGoals = () => {
    return (
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Current Goal</Text>
        <TouchableOpacity style={styles.goalCard} onPress={() => setShowGoalModal(true)}>
          <Text style={styles.goalSubject}>Mathematics</Text>
          <Text style={styles.goalModule}>Calculus Module 4</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '75%' }]} />
          </View>
          <Text style={styles.progressText}>75% Complete</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { 
          text: 'No', 
          style: 'cancel',
          onPress: () => {
            setMenuVisible(false);
          }
        },
        { 
          text: 'Yes', 
          style: 'destructive',
          onPress: async () => {
            try {
              setMenuVisible(false);
              await AsyncStorage.clear();
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (error) {
              Alert.alert('Error', 'Failed to logout. Please try again.');
              setMenuVisible(false);
            }
          }
        },
      ],
      { cancelable: false }
    );
  };

  const scheduleClass = async (classData, date) => {
    try {
      const newScheduledClass = {
        ...classData,
        scheduledDate: formatDate(date),
        id: Date.now().toString()
      };

      const updatedClasses = [...scheduledClasses, newScheduledClass];
      setScheduledClasses(updatedClasses);
      await AsyncStorage.setItem('@scheduled_classes', JSON.stringify(updatedClasses));
      
      // Reload today's schedule to include the new class
      loadData();
    } catch (error) {
      console.error('Error scheduling class:', error);
      Alert.alert('Error', 'Failed to schedule class');
    }
  };

  const handleAddClassForDate = async (classData, date) => {
    try {
      await scheduleClass(classData, date);
      Alert.alert('Success', 'Class scheduled successfully');
    } catch (error) {
      console.error('Error adding class for date:', error);
      Alert.alert('Error', 'Failed to schedule class');
    }
  };

  return (
    <SafeAreaView style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setMenuVisible(true)} style={styles.menuButton}>
          <Ionicons name="menu" size={28} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <TouchableOpacity 
          onPress={() => isLoggedIn ? setShowProfileDetails(true) : navigation.navigate('Login')} 
          style={styles.profileButton}
        >
          {isLoggedIn ? (
            userAvatar ? (
              <Image source={{ uri: userAvatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {userName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={20} color="#6B7280" />
            </View>
          )}
        </TouchableOpacity>

        {/* Profile Details Popup */}
        <Modal
          visible={showProfileDetails}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowProfileDetails(false)}
        >
          <TouchableOpacity 
            style={styles.profileOverlay}
            activeOpacity={1}
            onPress={() => setShowProfileDetails(false)}
          >
            <View style={[styles.profilePopup, {
              top: 60, // Position below header
              right: 16,
            }]}>
              <View style={styles.profileHeader}>
                {userAvatar ? (
                  <Image source={{ uri: userAvatar }} style={styles.popupAvatar} />
                ) : (
                  <View style={styles.popupAvatarPlaceholder}>
                    <Text style={styles.popupAvatarText}>
                      {userName.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
                <View style={styles.profileDetails}>
                  <Text style={styles.profileName}>{userName}</Text>
                  <Text style={styles.profileEmail}>{userEmail}</Text>
                </View>
              </View>
              
              <TouchableOpacity 
                style={styles.viewProfileButton}
                onPress={() => {
                  setShowProfileDetails(false);
                  navigation.navigate('Profile');
                }}
              >
                <Text style={styles.viewProfileText}>View Full Profile</Text>
                <Ionicons name="chevron-forward" size={20} color="#3B82F6" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      </View>

      {/* Burger Menu Modal */}
      <Modal
        visible={menuVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity 
          style={styles.menuOverlay} 
          activeOpacity={1} 
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.menuContent}>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                navigation.navigate('Notifications');
              }}
            >
              <Ionicons name="notifications" size={24} color="#1F2937" />
              <Text style={styles.menuItemText}>Notifications</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                navigation.navigate('Feedback');
              }}
            >
              <Ionicons name="chatbox" size={24} color="#1F2937" />
              <Text style={styles.menuItemText}>Feedback</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                navigation.navigate('Settings');
              }}
            >
              <Ionicons name="settings" size={24} color="#1F2937" />
              <Text style={styles.menuItemText}>Settings</Text>
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity 
              style={[styles.menuItem, styles.logoutItem]}
              onPress={handleLogout}
            >
              <Ionicons name="log-out" size={24} color="#EF4444" />
              <Text style={[styles.menuItemText, styles.logoutText]}>Logout</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>
        {renderDateTime()}
        {renderTasks()}
        {renderCompletedTasks()}
        {renderSchedule()}
        {renderAnalytics()}
        {renderGoals()}
      </ScrollView>

      <Modal visible={showGoalModal} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Goal</Text>
            <TextInput
              style={styles.input}
              placeholder="Subject"
              value={modalSubject}
              onChangeText={setModalSubject}
            />
            <View style={styles.typeSelector}>
              <TouchableOpacity
                style={[styles.typeButton, modalType === 'Lecture' && styles.selectedType]}
                onPress={() => setModalType('Lecture')}
              >
                <Text style={[styles.typeText, modalType === 'Lecture' && styles.selectedTypeText]}>
                  Lecture
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeButton, modalType === 'Laboratory' && styles.selectedType]}
                onPress={() => setModalType('Laboratory')}
              >
                <Text style={[styles.typeText, modalType === 'Laboratory' && styles.selectedTypeText]}>
                  Laboratory
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowGoalModal(false)}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.addButton} onPress={handleAddGoal}>
                <Text style={styles.buttonText}>Add Goal</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Bottom Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={[styles.tabItem, styles.tabItemActive]} 
          onPress={() => navigation.navigate('Dashboard')}
        >
          <Ionicons name="home" size={24} color="#3B82F6" />
          <Text style={[styles.tabText, styles.tabTextActive]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.tabItem} 
          onPress={() => navigation.navigate('TimeTable')}
        >
          <Ionicons name="calendar" size={24} color="#6B7280" />
          <Text style={styles.tabText}>Timetable</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.tabItem} 
          onPress={() => navigation.navigate('Subjects')}
        >
          <Ionicons name="book" size={24} color="#6B7280" />
          <Text style={styles.tabText}>Subjects</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.tabItem} 
          onPress={() => navigation.navigate('Tasks')}
        >
          <Ionicons name="checkbox" size={24} color="#6B7280" />
          <Text style={styles.tabText}>Tasks</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  taskItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  taskIndicator: {
    width: 4,
    height: '100%',
    borderRadius: 2,
    marginRight: 12,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  taskSubject: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  taskDueDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  taskCompletedDate: {
    fontSize: 12,
    color: '#10B981',
  },
  overdueTask: {
    borderColor: '#EF4444',
    borderWidth: 1,
  },
  overdueText: {
    color: '#EF4444',
  },
  completedTask: {
    opacity: 0.8,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#6B7280',
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 12,
  },
  timeTableModal: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
  },
  timeTableHeader: {
    marginBottom: 16,
  },
  timeTableTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  timeTableDate: {
    fontSize: 14,
    color: '#6B7280',
  },
  timeTableList: {
    gap: 12,
  },
  timeTableCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
  },
  timeTableCardBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  timeTableTime: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  timeTableTimeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeTableTimeText: {
    fontSize: 14,
    color: '#4B5563',
  },
  modalTimeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  startedBadge: {
    backgroundColor: '#DCFCE7',
  },
  startedText: {
    color: '#059669',
    fontWeight: '600',
  },
  noClassesContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    marginVertical: 8,
    gap: 8,
  },
  noClassesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4B5563',
    marginTop: 8,
  },
  noClassesText: {
    fontSize: 14,
    color: '#6B7280',
  },
  tasksSection: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 8,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 2,
  },
  taskDue: {
    fontSize: 12,
    color: '#6B7280',
  },
  completeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallTimeText: {
    fontSize: 12,
  },
  analyticsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    margin: 16,
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
  analyticsContainer: {
    gap: 16,
  },
  mainStats: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  statTrend: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '500',
  },
  statDetail: {
    fontSize: 12,
    color: '#6B7280',
  },
  secondaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
  },
  miniStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  miniStatLabel: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '500',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '500',
  },
  upcomingBadge: {
    backgroundColor: '#EFF6FF',
  },
  upcomingText: {
    color: '#3B82F6',
  },
  currentTimeText: {
    color: '#059669',
    fontWeight: '600',
  },
  scheduleSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    margin: 16,
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3B82F6',
  },
  scheduleList: {
    gap: 12,
  },
  scheduleCard: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  scheduleCardBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  scheduleTime: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  timeText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#3B82F6',
    letterSpacing: -0.2,
  },
  scheduleDetails: {
    marginLeft: 24,
  },
  subjectName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  scheduleInfo: {
    flexDirection: 'row',
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  infoText: {
    fontSize: 12,
    color: '#6B7280',
  },
  noSchedule: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    gap: 12,
  },
  noScheduleText: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  profileOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  profilePopup: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    width: 280,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  popupAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  popupAvatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  popupAvatarText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#3B82F6',
  },
  profileDetails: {
    marginLeft: 12,
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#6B7280',
  },
  viewProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  viewProfileText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3B82F6',
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    padding: 8,
    borderRadius: 20,
  },
  profileInfo: {
    marginRight: 12,
    alignItems: 'flex-end',
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  viewProfile: {
    fontSize: 12,
    color: '#6B7280',
  },
  loginText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3B82F6',
    marginRight: 8,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3B82F6',
  },
  menuButton: {
    padding: 8,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  menuContent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '80%',
    maxWidth: 300,
    backgroundColor: '#FFFFFF',
    paddingTop: 20,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  menuItemText: {
    marginLeft: 16,
    fontSize: 16,
    color: '#1F2937',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 8,
  },
  logoutItem: {
    marginTop: 'auto',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  logoutText: {
    color: '#EF4444',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  tabItemActive: {
    borderTopWidth: 2,
    borderTopColor: '#3B82F6',
    marginTop: -2,
  },
  tabText: {
    marginTop: 4,
    fontSize: 12,
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#3B82F6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileButton: {
    padding: 4,
  },
  navMenu: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  navScroll: {
    paddingHorizontal: 12,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  navItemActive: {
    backgroundColor: '#EBF5FF',
  },
  navText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  navTextActive: {
    color: '#3B82F6',
  },
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    position: 'relative',
  },
  scrollView: {
    flex: 1,
    paddingBottom: 60, // Add padding for tab bar
  },
  dateTimeContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
  },
  dateText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
  },
  timeText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#111827',
    marginTop: 4,
  },
  sectionContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#D1D5DB',
    marginHorizontal: 8,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 8,
  },
  scheduleType: {
    width: 4,
    height: '100%',
    borderRadius: 2,
    marginRight: 12,
  },
  scheduleInfo: {
    flex: 1,
  },
  subjectText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  timeInfoText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  goalCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 16,
  },
  goalSubject: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  goalModule: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
    marginBottom: 12,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
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
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  typeButton: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  selectedType: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  typeText: {
    fontSize: 14,
    color: '#6B7280',
  },
  selectedTypeText: {
    color: '#FFFFFF',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    backgroundColor: '#EF4444',
    borderRadius: 6,
    padding: 12,
    marginRight: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 6,
    padding: 12,
    minWidth: 100,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  remainingTime: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '600',
  },
  ongoingCard: {
    backgroundColor: '#F0FDF4',
    borderColor: '#059669',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  remainingTimeContainer: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  ongoingSubjectName: {
    color: '#059669',
    fontSize: 16,
  },
  ongoingInfoText: {
    color: '#059669',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  startedBadge: {
    backgroundColor: '#DCFCE7',
  },
  startedText: {
    color: '#059669',
    fontWeight: '600',
  },
  scheduleCard: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  scheduleTime: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  timeText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#3B82F6',
    letterSpacing: -0.2,
  },
  currentTimeText: {
    color: '#059669',
    fontWeight: '600',
  },
  scheduledCard: {
    backgroundColor: '#F0F9FF',
    borderColor: '#3B82F6',
    borderWidth: 1,
  },
  scheduledBadge: {
    backgroundColor: '#EFF6FF',
  },
  scheduledText: {
    color: '#3B82F6',
    fontWeight: '600',
  },
});

export default DashboardScreen;
