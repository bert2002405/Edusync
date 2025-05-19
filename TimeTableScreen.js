import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomNavigation from '../components/BottomNavigation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';

const TIMETABLE_STORAGE_KEY = '@timetable_data';

const formatTime = (time) => {
  const { hours, minutes, period } = time;
  return `${hours}:${minutes.toString().padStart(2, '0')} ${period}`;
};

const parseTimeString = (timeStr) => {
  const [time, period] = timeStr.split(' ');
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes + (period === 'PM' && hours !== 12 ? 12 * 60 : 0);
};

const getCurrentDay = () => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const today = new Date().getDay();
  return days[today - 1] || days[0];
};

const TimeTableScreen = ({ navigation }) => {
  const [schedule, setSchedule] = useState({
    Monday: [
      { id: 1, subject: 'ENG10', time: '8:00 - 9:30 AM', room: 'Room 101', professor: 'Dr. Smith', type: 'Lecture' },
      { id: 2, subject: 'MATH115', time: '10:00 - 11:30 AM', room: 'Room 202', professor: 'Prof. Johnson', type: 'Lecture' },
      { id: 3, subject: 'HIST10', time: '1:00 - 2:30 PM', room: 'Room 303', professor: 'Dr. Thompson', type: 'Lecture' },
      { id: 4, subject: 'PROG1', time: '3:00 - 4:30 PM', room: 'Lab 1', professor: 'Prof. Wilson', type: 'Laboratory' }
    ],
    Tuesday: [
      { id: 5, subject: 'PROG1', time: '9:00 - 10:30 AM', room: 'Lab 1', professor: 'Prof. Wilson', type: 'Laboratory' },
      { id: 6, subject: 'STS11', time: '11:00 - 12:30 PM', room: 'Room 404', professor: 'Prof. Brown', type: 'Lecture' },
      { id: 7, subject: 'HIST11', time: '2:00 - 3:30 PM', room: 'Room 305', professor: 'Dr. Anderson', type: 'Lecture' }
    ],
    Wednesday: [
      { id: 8, subject: 'ENG10', time: '8:00 - 9:30 AM', room: 'Room 101', professor: 'Dr. Smith', type: 'Lecture' },
      { id: 9, subject: 'MATH115', time: '10:00 - 11:30 AM', room: 'Room 202', professor: 'Prof. Johnson', type: 'Lecture' }
    ],
    Thursday: [
      { id: 10, subject: 'PROG1', time: '9:00 - 10:30 AM', room: 'Lab 1', professor: 'Prof. Wilson', type: 'Laboratory' },
      { id: 11, subject: 'STS11', time: '11:00 - 12:30 PM', room: 'Room 404', professor: 'Prof. Brown', type: 'Lecture' },
      { id: 12, subject: 'HIST11', time: '2:00 - 3:30 PM', room: 'Room 305', professor: 'Dr. Anderson', type: 'Lecture' },
      { id: 13, subject: 'LIT10', time: '3:00 - 4:30 PM', room: 'Room 505', professor: 'Dr. Miller', type: 'Lecture' }
    ],
    Friday: [
      { id: 14, subject: 'LIT10', time: '10:00 - 11:30 AM', room: 'Room 505', professor: 'Dr. Miller', type: 'Lecture' },
      { id: 15, subject: 'HIST10', time: '1:00 - 2:30 PM', room: 'Room 303', professor: 'Dr. Thompson', type: 'Lecture' },
      { id: 16, subject: 'MATH115', time: '3:00 - 4:30 PM', room: 'Room 202', professor: 'Prof. Johnson', type: 'Lecture' }
    ]
  });

  const [selectedDay, setSelectedDay] = useState(getCurrentDay());
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedClassDay, setSelectedClassDay] = useState(null);
  const [newClass, setNewClass] = useState({
    subject: '',
    time: '',
    room: '',
    professor: '',
    day: 'Monday',
    type: 'Lecture'
  });
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [startTime, setStartTime] = useState({ hours: 8, minutes: 0, period: 'AM' });
  const [endTime, setEndTime] = useState({ hours: 9, minutes: 0, period: 'AM' });
  const [currentClass, setCurrentClass] = useState(null);
  const [nextClass, setNextClass] = useState(null);
  const [completedClasses, setCompletedClasses] = useState([]);
  const [upcomingClasses, setUpcomingClasses] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentDateTime(now);
      updateClassStatus(now);
    }, 60000); // Update every minute

    updateClassStatus(currentDateTime);
    return () => clearInterval(interval);
  }, [selectedDay]);

  const formatTimeForComparison = (timeStr) => {
    if (!timeStr) return null;
    const [time, period] = timeStr.split(' ');
    const [hours, minutes] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes;
    if (period === 'PM' && hours !== 12) {
      return totalMinutes + 12 * 60;
    } else if (period === 'AM' && hours === 12) {
      return totalMinutes - 12 * 60;
    }
    return totalMinutes;
  };

  const getCurrentTime = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const period = hours >= 12 ? 'PM' : 'AM';
    return { hours: hours % 12 || 12, minutes, period };
  };

  const getClassStatus = (class_) => {
    if (!class_ || !class_.time) return 'none';

    // Only show status for current day's classes
    const currentDay = getCurrentDay();
    if (selectedDay !== currentDay) return 'none';

    // Parse the class time range
    const [startTime, endTime] = class_.time.split(' - ').map(t => {
      // Add AM/PM if not present
      if (!t.includes('AM') && !t.includes('PM')) {
        const hour = parseInt(t.split(':')[0]);
        return `${t} ${hour >= 12 ? 'PM' : 'AM'}`;
      }
      return t;
    });

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeStr = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;

    const classStartTime = formatTimeForComparison(startTime);
    const classEndTime = formatTimeForComparison(endTime);

    if (currentTimeStr >= classStartTime && currentTimeStr <= classEndTime) {
      return 'ongoing';
    } else if (currentTimeStr < classStartTime) {
      return 'upcoming';
    } else {
      return 'ended';
    }
  };

  function updateCurrentAndNextClass() {
    const currentTime = getCurrentTime();
    const todayClasses = schedule[selectedDay] || [];
    
    let current = null;
    let next = null;
    let completed = [];

    for (let i = 0; i <todayClasses.length; i++) {
      const classItem = todayClasses[i];
      if (!classItem.time) continue;
      
      const [startTime, endTime] = classItem.time.split(' - ').map(t => t.trim());
      if (!startTime || !endTime) continue;

      if (currentTime >= startTime && currentTime <= endTime) {
        current = { ...classItem, status: 'ongoing' };
      } else if (currentTime < startTime) {
        if (!next || startTime < next.time.split(' - ')[0]) {
          next = { ...classItem, status: 'upcoming' };
        }
      } else if (currentTime > endTime) {
        completed.push({ ...classItem, status: 'completed' });
      }
    }

    setCurrentClass(current);
    setNextClass(next);
    setCompletedClasses(completed);
  }

  const formatTimeDisplay = (time) => {
    const hours = time.hours.toString().padStart(2, '0');
    const minutes = time.minutes.toString().padStart(2, '0');
    return `${hours}:${minutes} ${time.period}`;
  };

  const handleTimeChange = (isStart, field, value) => {
    const updateTime = isStart ? setStartTime : setEndTime;
    const currentTime = isStart ? startTime : endTime;

    let newTime = { ...currentTime };

    switch (field) {
      case 'hours':
        if (value === 'increment') {
          newTime.hours = (currentTime.hours + 1) % 12 || 12;
        } else {
          newTime.hours = (currentTime.hours - 1 + 12) % 12 || 12;
        }
        break;
      case 'minutes':
        if (value === 'increment') {
          newTime.minutes = (currentTime.minutes + 15) % 60;
        } else {
          newTime.minutes = (currentTime.minutes - 15 + 60) % 60;
        }
        break;
      case 'period':
        newTime.period = value;
        // If changing start time period, automatically update end time period to match
        if (isStart) {
          setEndTime(prev => ({
            ...prev,
            period: value,
            // If switching to AM and end time would be before start time,
            // increment end time by 1 hour to ensure valid range
            hours: value === 'AM' && prev.hours <= newTime.hours ? 
              ((prev.hours + 1) % 12) || 12 : prev.hours
          }));
        }
        break;
    }

    updateTime(newTime);
  };

  const validateTimeRange = (start, end) => {
    const startHours = start.hours + (start.period === 'PM' ? 12 : 0);
    const endHours = end.hours + (end.period === 'PM' ? 12 : 0);
    const startMinutes = start.minutes;
    const endMinutes = end.minutes;

    if (startHours === endHours) {
      return endMinutes > startMinutes;
    }
    return endHours > startHours;
  };

  const handleEditClass = (classToEdit, day) => {
    setIsEditing(true);
    setSelectedClassDay(day);
    // Parse the time string to set start and end times
    const [startStr, endStr] = classToEdit.time.split(' - ');
    const [startTimeStr, startPeriod] = startStr.split(' ');
    const [endTimeStr, endPeriod] = endStr.split(' ');
    const [startHour, startMinute] = startTimeStr.split(':');
    const [endHour, endMinute] = endTimeStr.split(':');

    setStartTime({
      hours: parseInt(startHour),
      minutes: parseInt(startMinute),
      period: startPeriod
    });

    setEndTime({
      hours: parseInt(endHour),
      minutes: parseInt(endMinute),
      period: endPeriod
    });

    setNewClass({
      ...classToEdit,
      day: day
    });
    setShowAddModal(true);
  };

  // Load timetable data when component mounts
  useEffect(() => {
    loadTimetableData();
  }, []);

  // Load timetable data from AsyncStorage
  const loadTimetableData = async () => {
    try {
      const savedData = await AsyncStorage.getItem(TIMETABLE_STORAGE_KEY);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        // Merge saved data with default schedule to maintain assigned subjects
        const mergedSchedule = {
          Monday: [...schedule.Monday, ...parsedData.Monday],
          Tuesday: [...schedule.Tuesday, ...parsedData.Tuesday],
          Wednesday: [...schedule.Wednesday, ...parsedData.Wednesday],
          Thursday: [...schedule.Thursday, ...parsedData.Thursday],
          Friday: [...schedule.Friday, ...parsedData.Friday]
        };
        setSchedule(mergedSchedule);
      }
    } catch (error) {
      console.error('Error loading timetable data:', error);
      Alert.alert('Error', 'Failed to load timetable data');
    }
  };

  // Save timetable data to AsyncStorage
  const saveTimetableData = async (newSchedule) => {
    try {
      await AsyncStorage.setItem(TIMETABLE_STORAGE_KEY, JSON.stringify(newSchedule));
    } catch (error) {
      console.error('Error saving timetable data:', error);
      Alert.alert('Error', 'Failed to save timetable data');
      return false;
    }
    return true;
  };

  const handleAddClass = async () => {
    // Validate required fields
    if (!newClass.subject || !newClass.room || !newClass.professor) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    // Validate time selection
    if (!validateTimeRange(startTime, endTime)) {
      Alert.alert('Invalid Time', 'End time must be after start time');
      return;
    }

    // Create time string
    const timeString = `${formatTimeDisplay(startTime)} - ${formatTimeDisplay(endTime)}`;

    // Add new class to schedule
    const newClassData = {
      id: Date.now(), // Use timestamp as temporary id
      ...newClass,
      time: timeString
    };

    let updatedSchedule;
    if (isEditing) {
      // Update existing class
      updatedSchedule = {
        ...schedule,
        [selectedClassDay]: schedule[selectedClassDay].map(cls =>
          cls.id === newClass.id ? { ...newClass, time: timeString } : cls
        )
      };
    } else {
      // Add new class
      updatedSchedule = {
        ...schedule,
        [newClass.day]: [...schedule[newClass.day], newClassData]
      };
    }

    // Save to AsyncStorage
    const success = await saveTimetableData(updatedSchedule);
    if (!success) {
      Alert.alert('Error', 'Failed to save timetable data');
      return;
    }

    setSchedule(updatedSchedule);

    // Show success message
    Alert.alert('Success', `Class ${isEditing ? 'updated' : 'added'} successfully`, [
      { text: 'OK', onPress: () => {
        // Reset form and editing state
        setIsEditing(false);
        setSelectedClassDay(null);
        setNewClass({
          subject: '',
          time: '',
          room: '',
          professor: '',
          day: selectedDay,
          type: 'Lecture'
        });
        setStartTime({ hours: 8, minutes: 0, period: 'AM' });
        setEndTime({ hours: 9, minutes: 0, period: 'AM' });
        // Close modal
        setShowAddModal(false);
      }}
    ]);
  };

  const handleDeleteClass = async (classId, day) => {
    Alert.alert(
      'Delete Class',
      'Are you sure you want to delete this class?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updatedSchedule = {
              ...schedule,
              [day]: schedule[day].filter(cls => cls.id !== classId)
            };

            // Save to AsyncStorage
            const success = await saveTimetableData(updatedSchedule);
            if (!success) {
              Alert.alert('Error', 'Failed to delete class');
              return;
            }

            setSchedule(updatedSchedule);
            Alert.alert('Success', 'Class deleted successfully');
          },
        },
      ]
    );
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const updateClassStatus = (now) => {
    const todayClasses = schedule[selectedDay] || [];
    const currentTime = now.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit', 
      minute: '2-digit'
    });

    // Find current class and upcoming classes
    let current = null;
    const upcoming = todayClasses.filter(class_ => {
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
      
      if (currentTime >= classStartTime && currentTime <= classEndTime) {
        current = class_;
        return false;
      }
      return classStartTime.localeCompare(currentTime) > 0;
    }).sort((a, b) => {
      const [aStart] = a.time.split(' - ');
      const [bStart] = b.time.split(' - ');
      return aStart.localeCompare(bStart);
    });

    setCurrentClass(current);
    setUpcomingClasses(upcoming);
  };

  const renderClassCard = (class_, index) => {
    const status = getClassStatus(class_);
    return (
      <View 
        key={`schedule-${selectedDay}-${class_.id}-${index}`}
        style={[styles.classCard, status === 'ongoing' && styles.activeClassCard]}
      >
        <View style={styles.classInfo}>
          <View style={styles.subjectContainer}>
            <Text style={styles.className}>{class_.subject}</Text>
            {class_.type === 'Laboratory' && (
              <View style={styles.labTag}>
                <Text style={styles.labTagText}>LAB</Text>
              </View>
            )}
          </View>
          <View style={styles.timeContainer}>
            <Ionicons 
              name={status === 'ongoing' ? "time" : "time-outline"} 
              size={16} 
              color={status === 'ongoing' ? "#059669" : "#3B82F6"} 
            />
            <Text style={[styles.classTime, status === 'ongoing' && styles.activeClassTime]}>
              {class_.time}
            </Text>
            <View style={[
              styles.statusBadge,
              status === 'ongoing' ? styles.ongoingBadge : 
              status === 'upcoming' ? styles.upcomingBadge : styles.endedBadge
            ]}>
              <Text style={[
                styles.statusText,
                status === 'ongoing' ? styles.ongoingText :
                status === 'upcoming' ? styles.upcomingText : styles.endedText
              ]}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Text>
            </View>
          </View>
          <Text style={styles.classDetails}>{class_.room}</Text>
          <Text style={styles.professorName}>{class_.professor}</Text>
        </View>
        <View style={styles.classActions}>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => handleEditClass(class_, selectedDay)}
          >
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={() => handleDeleteClass(class_.id, selectedDay)}
          >
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <View style={styles.dateHeader}>
          <Text style={styles.currentDate}>
            {currentDateTime.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </Text>
        </View>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Time Table</Text>
        </View>

        <View style={styles.currentClassContainer}>
          {currentClass ? (
            <View style={[styles.statusCard, styles.ongoingClass]}>
              <View style={[styles.statusBadge, styles.ongoingBadge]}>
                <Text style={[styles.statusBadgeText, styles.ongoingText]}>ONGOING</Text>
              </View>
              <Text style={styles.className}>{currentClass.subject}</Text>
              <Text style={styles.classDetails}>
                {currentClass.time} • {currentClass.room}
              </Text>
              <Text style={styles.professorName}>{currentClass.professor}</Text>
            </View>
          ) : (
            <View style={styles.statusCard}>
              <Text style={styles.statusLabel}>No Current Class</Text>
              <Text style={styles.noClassText}>Free Time</Text>
            </View>
          )}

          {upcomingClasses.length > 0 && (
            <View style={[styles.statusCard, styles.nextClass]}>
              <View style={[styles.statusBadge, styles.upcomingBadge]}>
                <Text style={[styles.statusBadgeText, styles.upcomingText]}>UPCOMING</Text>
              </View>
              <Text style={styles.className}>{upcomingClasses[0].subject}</Text>
              <Text style={styles.classDetails}>
                {upcomingClasses[0].time} • {upcomingClasses[0].room}
              </Text>
              <Text style={styles.professorName}>{upcomingClasses[0].professor}</Text>
            </View>
          )}
        </View>

        <View style={styles.daysContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {days.map((day, index) => (
              <TouchableOpacity
                key={`day-nav-${day}-${index}`}
                style={[
                  styles.dayButton,
                  selectedDay === day && styles.selectedDay
                ]}
                onPress={() => setSelectedDay(day)}
              >
                <Text style={[
                  styles.dayText,
                  selectedDay === day && styles.selectedDayText
                ]}>
                  {day}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <ScrollView style={styles.scheduleContainer}>
          {schedule[selectedDay]?.map((classItem, index) => renderClassCard(classItem, index))}
        </ScrollView>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>

        <Modal
          visible={showAddModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowAddModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{isEditing ? 'Edit Class' : 'Add New Class'}</Text>
              
              <Text style={styles.inputLabel}>Subject Code</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter subject code"
                value={newClass.subject}
                onChangeText={(text) => setNewClass({ ...newClass, subject: text })}
              />

              <Text style={styles.inputLabel}>Time</Text>
              <TouchableOpacity
                style={styles.timeIconButton}
                onPress={() => setShowTimePicker(true)}
              >
                <Text style={styles.timeDisplay}>
                  {newClass.time || `${formatTimeDisplay(startTime)} - ${formatTimeDisplay(endTime)}`}
                </Text>
              </TouchableOpacity>

              {showTimePicker && (
                <View style={styles.timePickerContainer}>
                  <View style={styles.timePickerSection}>
                    <Text style={styles.timeLabel}>Start Time</Text>
                    <View style={styles.timeControls}>
                      <View style={styles.timeUnit}>
                        <TouchableOpacity onPress={() => handleTimeChange(true, 'hours', 'increment')}>
                          <Text style={styles.timeArrow}>▲</Text>
                        </TouchableOpacity>
                        <Text style={styles.timeValue}>{startTime.hours.toString().padStart(2, '0')}</Text>
                        <TouchableOpacity onPress={() => handleTimeChange(true, 'hours', 'decrement')}>
                          <Text style={styles.timeArrow}>▼</Text>
                        </TouchableOpacity>
                      </View>
                      <Text style={styles.timeSeparator}>:</Text>
                      <View style={styles.timeUnit}>
                        <TouchableOpacity onPress={() => handleTimeChange(true, 'minutes', 'increment')}>
                          <Text style={styles.timeArrow}>▲</Text>
                        </TouchableOpacity>
                        <Text style={styles.timeValue}>{startTime.minutes.toString().padStart(2, '0')}</Text>
                        <TouchableOpacity onPress={() => handleTimeChange(true, 'minutes', 'decrement')}>
                          <Text style={styles.timeArrow}>▼</Text>
                        </TouchableOpacity>
                      </View>
                      <View style={styles.periodSelector}>
                        <TouchableOpacity 
                          style={[styles.periodButton, startTime.period === 'AM' ? styles.periodButtonActive : null]}
                          onPress={() => handleTimeChange(true, 'period', 'AM')}
                        >
                          <Text style={[styles.periodButtonText, startTime.period === 'AM' ? styles.periodButtonTextActive : null]}>AM</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={[styles.periodButton, startTime.period === 'PM' ? styles.periodButtonActive : null]}
                          onPress={() => handleTimeChange(true, 'period', 'PM')}
                        >
                          <Text style={[styles.periodButtonText, startTime.period === 'PM' ? styles.periodButtonTextActive : null]}>PM</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>

                  <View style={styles.timePickerSection}>
                    <Text style={styles.timeLabel}>End Time</Text>
                    <View style={styles.timeControls}>
                      <View style={styles.timeUnit}>
                        <TouchableOpacity onPress={() => handleTimeChange(false, 'hours', 'increment')}>
                          <Text style={styles.timeArrow}>▲</Text>
                        </TouchableOpacity>
                        <Text style={styles.timeValue}>{endTime.hours.toString().padStart(2, '0')}</Text>
                        <TouchableOpacity onPress={() => handleTimeChange(false, 'hours', 'decrement')}>
                          <Text style={styles.timeArrow}>▼</Text>
                        </TouchableOpacity>
                      </View>
                      <Text style={styles.timeSeparator}>:</Text>
                      <View style={styles.timeUnit}>
                        <TouchableOpacity onPress={() => handleTimeChange(false, 'minutes', 'increment')}>
                          <Text style={styles.timeArrow}>▲</Text>
                        </TouchableOpacity>
                        <Text style={styles.timeValue}>{endTime.minutes.toString().padStart(2, '0')}</Text>
                        <TouchableOpacity onPress={() => handleTimeChange(false, 'minutes', 'decrement')}>
                          <Text style={styles.timeArrow}>▼</Text>
                        </TouchableOpacity>
                      </View>
                      <View style={styles.periodSelector}>
                        <TouchableOpacity 
                          style={[styles.periodButton, endTime.period === 'AM' ? styles.periodButtonActive : null]}
                          onPress={() => handleTimeChange(false, 'period', 'AM')}
                        >
                          <Text style={[styles.periodButtonText, endTime.period === 'AM' ? styles.periodButtonTextActive : null]}>AM</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={[styles.periodButton, endTime.period === 'PM' ? styles.periodButtonActive : null]}
                          onPress={() => handleTimeChange(false, 'period', 'PM')}
                        >
                          <Text style={[styles.periodButtonText, endTime.period === 'PM' ? styles.periodButtonTextActive : null]}>PM</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>

                  <View style={styles.timeActionButtons}>
                    <TouchableOpacity
                      style={[styles.timeButton, styles.cancelTimeButton]}
                      onPress={() => {
                        setShowTimePicker(false);
                      }}
                    >
                      <Text style={[styles.timeButtonText, styles.cancelTimeText]}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.timeButton, styles.submitTimeButton]}
                      onPress={() => {
                        if (!validateTimeRange(startTime, endTime)) {
                          Alert.alert('Invalid Time', 'End time must be after start time');
                          return;
                        }
                        setNewClass(prev => ({
                          ...prev,
                          time: `${formatTimeDisplay(startTime)} - ${formatTimeDisplay(endTime)}`
                        }));
                        setShowTimePicker(false);
                      }}
                    >
                      <Text style={[styles.timeButtonText, styles.submitTimeText]}>Submit</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              <Text style={styles.inputLabel}>Room</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter room number"
                value={newClass.room}
                onChangeText={(text) => setNewClass({ ...newClass, room: text })}
              />

              <Text style={styles.inputLabel}>Professor</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter professor name"
                value={newClass.professor}
                onChangeText={(text) => setNewClass({ ...newClass, professor: text })}
              />

              <Text style={styles.inputLabel}>Day</Text>
              <View style={styles.dayPickerContainer}>
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day, index) => (
                  <TouchableOpacity
                    key={`picker-day-${day}-${index}`}
                    style={[
                      styles.dayPickerButton,
                      newClass.day === day && styles.dayPickerButtonSelected,
                    ]}
                    onPress={() => setNewClass({ ...newClass, day })}
                  >
                    <Text
                      style={[
                        styles.dayPickerText,
                        newClass.day === day && styles.dayPickerTextSelected,
                      ]}
                    >
                      {day.slice(0, 3)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Type</Text>
              <View style={styles.dayPickerContainer}>
                {['Lecture', 'Laboratory'].map((type, index) => (
                  <TouchableOpacity
                    key={`type-${type}-${index}`}
                    style={[
                      styles.dayPickerButton,
                      newClass.type === type && styles.dayPickerButtonSelected,
                    ]}
                    onPress={() => setNewClass({ ...newClass, type })}
                  >
                    <Text
                      style={[
                        styles.dayPickerText,
                        newClass.type === type && styles.dayPickerTextSelected,
                      ]}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setShowAddModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.addModalButton]}
                  onPress={handleAddClass}
                >
                  <Text style={styles.addModalButtonText}>Add Class</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

      </View>

      {/* Bottom Navigation */}
      <BottomNavigation navigation={navigation} activeTab="TimeTable" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  timeIconButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  timeDisplay: {
    fontSize: 16,
    color: '#374151',
  },
  timePickerContainer: {
    marginTop: 8,
  },
  timePickerSection: {
    marginBottom: 16,
  },
  timeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  timeControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 8,
  },
  timeUnit: {
    alignItems: 'center',
    marginHorizontal: 4,
  },
  timeValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginVertical: 4,
  },
  timeArrow: {
    fontSize: 16,
    color: '#6B7280',
    marginVertical: 2,
  },
  timeSeparator: {
    fontSize: 20,
    fontWeight: '600',
    color: '#6B7280',
    marginHorizontal: 4,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 4,
    marginLeft: 8,
  },
  periodButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 48,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: '#3B82F6',
  },
  periodButtonText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  periodButtonTextActive: {
    color: '#FFFFFF',
  },
  timeActionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12,
  },
  timeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelTimeButton: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  submitTimeButton: {
    backgroundColor: '#3B82F6',
  },
  timeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  cancelTimeText: {
    color: '#6B7280',
  },
  submitTimeText: {
    color: '#FFFFFF',
  },
  dateHeader: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  currentDate: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  upcomingBadge: {
    backgroundColor: '#EFF6FF',
  },
  upcomingText: {
    color: '#3B82F6',
  },
  activeClassCard: {
    borderColor: '#059669',
    borderWidth: 1,
  },
  activeClassTime: {
    color: '#059669',
    fontWeight: '600',
  },
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  content: {
    flex: 1,
  },
  timePickerButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 15,
  },
  timePickerText: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
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
  currentClassContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  statusCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  ongoingClass: {
    borderLeftWidth: 4,
    borderLeftColor: '#059669',
  },
  nextClass: {
    backgroundColor: '#F8FAFC',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginBottom: 8,
  },
  ongoingBadge: {
    backgroundColor: '#DCFCE7',
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  ongoingText: {
    color: '#059669',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  className: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  classDetails: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  professorName: {
    fontSize: 14,
    color: '#4B5563',
  },
  noClassText: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  daysContainer: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  dayButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  selectedDay: {
    backgroundColor: '#3B82F6',
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
  },
  selectedDayText: {
    color: '#fff',
  },
  scheduleContainer: {
    flex: 1,
    padding: 16,
  },
  classCard: {
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
  classInfo: {
    flex: 1,
  },
  subjectContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  labTag: {
    backgroundColor: '#6B4EAE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  labTagText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  classTime: {
    fontSize: 14,
    color: '#3B82F6',
    marginBottom: 4,
  },
  classActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editButton: {
    padding: 8,
    backgroundColor: '#EBF5FF',
    borderRadius: 6,
  },
  editButtonText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
  },
  addButton: {
    position: 'absolute',
    right: 16,
    bottom: 16,
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
  addModalButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  dayPickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 8,
  },
  dayPickerButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    minWidth: 60,
    alignItems: 'center',
  },
  dayPickerButtonSelected: {
    backgroundColor: '#3B82F6',
  },
  dayPickerText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
  },
  dayPickerTextSelected: {
    color: '#FFFFFF',
  },
  deleteButton: {
    padding: 8,
    backgroundColor: '#FEE2E2',
    borderRadius: 6,
  },
  deleteButtonText: {
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '600',
  },
  endedBadge: {
    backgroundColor: '#F3F4F6',
  },
  endedText: {
    color: '#6B7280',
  },
});

export default TimeTableScreen;
