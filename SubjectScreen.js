import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Modal,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  FlatList,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import BottomNavigation from '../components/BottomNavigation';

const SubjectsScreen = ({ navigation }) => {
  // State declarations
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedDays, setSelectedDays] = useState([]);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [startTime, setStartTime] = useState({
    hours: 7,
    minutes: 0,
    period: 'AM'
  });
  const [endTime, setEndTime] = useState({
    hours: 8,
    minutes: 30,
    period: 'AM'
  });
  const [newSubject, setNewSubject] = useState({
    code: '',
    name: '',
    professor: '',
    type: 'Lecture',
    room: '',
    schedule: { days: [], time: '' }
  });

  // Available rooms for selection
  const availableRooms = [
    'Room 101', 'Room 202', 'Room 303', 'Room 404', 'Room 505',
    'Lab 1', 'Room 305'
  ];

  // Constants
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const subjectTypes = ['Lecture', 'Laboratory'];

  const [subjects, setSubjects] = useState([
    {
      id: '1',
      code: 'ENG10',
      name: 'English',
      professor: 'Dr. Smith',
      type: 'Lecture',
      room: 'Room 101',
      schedule: {
        days: ['Monday', 'Wednesday'],
        time: '8:00 - 9:30 AM'
      }
    },
    {
      id: '2',
      code: 'MATH115',
      name: 'Mathematics',
      professor: 'Prof. Johnson',
      type: 'Lecture',
      room: 'Room 202',
      schedule: {
        days: ['Monday', 'Wednesday'],
        time: '10:00 - 11:30 AM'
      }
    },
    {
      id: '3',
      code: 'HIST10',
      name: 'History',
      professor: 'Dr. Thompson',
      type: 'Lecture',
      room: 'Room 303',
      schedule: {
        days: ['Monday', 'Friday'],
        time: '1:00 - 2:30 PM'
      }
    },
    {
      id: '4',
      code: 'PROG1',
      name: 'Programming 1',
      professor: 'Prof. Wilson',
      type: 'Laboratory',
      room: 'Lab 1',
      schedule: {
        days: ['Tuesday', 'Thursday'],
        time: '9:00 - 10:30 AM'
      }
    },
    {
      id: '5',
      code: 'STS11',
      name: 'Science Technology Society',
      professor: 'Prof. Brown',
      type: 'Lecture',
      room: 'Room 404',
      schedule: {
        days: ['Tuesday', 'Thursday'],
        time: '11:00 - 12:30 PM'
      }
    },
    {
      id: '6',
      code: 'HIST11',
      name: 'Advanced History',
      professor: 'Dr. Anderson',
      type: 'Lecture',
      room: 'Room 305',
      schedule: {
        days: ['Tuesday', 'Thursday'],
        time: '2:00 - 3:30 PM'
      }
    },
    {
      id: '7',
      code: 'LIT10',
      name: 'Literature',
      professor: 'Dr. Miller',
      type: 'Lecture',
      room: 'Room 505',
      schedule: {
        days: ['Wednesday', 'Friday'],
        time: ['Wednesday: 1:00 - 2:30 PM', 'Friday: 10:00 - 11:30 AM']
      }
    }
  ]);



  const formatTimeDisplay = (time) => {
    const hours12 = time.period === 'AM' ? 
      (time.hours === 0 ? 12 : time.hours) : 
      (time.hours === 12 ? 12 : time.hours % 12);
    return `${hours12.toString().padStart(2, '0')}:${time.minutes.toString().padStart(2, '0')} ${time.period}`;
  };

  const validateTimeRange = (start, end) => {
    const startHours = start.period === 'PM' && start.hours !== 12 ? start.hours + 12 : start.hours;
    const endHours = end.period === 'PM' && end.hours !== 12 ? end.hours + 12 : end.hours;
    const startMinutes = startHours * 60 + start.minutes;
    const endMinutes = endHours * 60 + end.minutes;
    return endMinutes > startMinutes;
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

    // Update the subject's time immediately after state update
    setTimeout(() => {
      setNewSubject(prev => ({
        ...prev,
        schedule: {
          ...prev.schedule,
          time: `${formatTimeDisplay(startTime)} - ${formatTimeDisplay(endTime)}`
        }
      }));
    }, 0);
  };

  const toggleDay = (day) => {
    setSelectedDays(prev => {
      const newDays = prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day];
      
      setNewSubject(current => ({
        ...current,
        schedule: {
          ...current.schedule,
          days: newDays
        }
      }));
      
      return newDays;
    });
  };

  const handleSubmit = () => {
    if (!newSubject.code || !newSubject.name || !newSubject.professor || 
        !newSubject.type || !newSubject.room || selectedDays.length === 0) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // Validate time selection
    if (!validateTimeRange(startTime, endTime)) {
      Alert.alert('Invalid Time', 'End time must be after start time');
      return;
    }

    // Validate time format
    if (startTime.minutes % 15 !== 0 || endTime.minutes % 15 !== 0) {
      Alert.alert('Invalid Time', 'Time must be in 15-minute intervals');
      return;
    }

    // All validations passed, add the subject
    const newSubjectData = {
      id: (subjects.length + 1).toString(),
      ...newSubject,
      schedule: {
        days: selectedDays,
        time: `${formatTimeDisplay(startTime)} - ${formatTimeDisplay(endTime)}`
      }
    };

    // Add new subject and update both lists
    const updatedSubjects = [...subjects, newSubjectData];
    setSubjects(updatedSubjects);
    setFilteredSubjects(updatedSubjects);

    // Show success message
    Alert.alert('Success', 'Subject added successfully', [
      { text: 'OK', onPress: () => setShowAddModal(false) }
    ]);

    // Reset form
    setNewSubject({
      code: '',
      name: '',
      professor: '',
      type: 'Lecture',
      room: '',
      schedule: {
        days: [],
        time: ''
      }
    });
    setSelectedDays([]);
    setStartTime({ hours: 8, minutes: 0, period: 'AM' });
    setEndTime({ hours: 9, minutes: 30, period: 'AM' });
  };

  // Filter subjects based on search query
  useEffect(() => {
    const filtered = subjects.filter(subject => 
      subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subject.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subject.professor.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredSubjects(filtered);
  }, [searchQuery, subjects]);

  // Initialize filtered subjects
  useEffect(() => {
    setFilteredSubjects(subjects);
  }, []);

  const renderSubjectCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.subjectCard}
      onPress={() => handleSubjectPress(item)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.codeTypeContainer}>
          <Text style={styles.subjectCode}>{item.code}</Text>
          <View style={[
            styles.typeTag,
            item.type === 'Laboratory' && styles.labTypeTag
          ]}>
            <Ionicons 
              name={item.type === 'Laboratory' ? 'flask' : 'school'} 
              size={12} 
              color={item.type === 'Laboratory' ? '#9333EA' : '#3B82F6'} 
              style={styles.typeIcon}
            />
            <Text style={[
              styles.typeText,
              item.type === 'Laboratory' && styles.labTypeText
            ]}>{item.type}</Text>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.moreButton}
          onPress={() => handleSubjectPress(item)}
        >
          <Ionicons name="ellipsis-horizontal" size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <Text style={styles.subjectName}>{item.name}</Text>
      <Text style={styles.professorName}>{item.professor}</Text>

      <View style={styles.cardFooter}>
        <View style={styles.infoRow}>
          <Ionicons name="business" size={14} color="#6B7280" style={styles.infoIcon} />
          <Text style={styles.infoText}>{item.room}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="time" size={14} color="#6B7280" style={styles.infoIcon} />
          <Text style={styles.infoText}>
            {item.schedule.days.join(', ')} at {item.schedule.time}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );



  const handleSubjectPress = (subject) => {
    setSelectedSubject(subject);
    setShowOptionsModal(true);
  };

  const handleViewSubject = () => {
    setShowOptionsModal(false);
    // Navigate to subject details
    navigation.navigate('SubjectDetails', { subject: selectedSubject });
  };

  const handleEditSubject = () => {
    setShowOptionsModal(false);
    setNewSubject(selectedSubject);
    setShowAddModal(true);
  };

  const handleDeleteSubject = () => {
    setShowOptionsModal(false);
    Alert.alert(
      'Delete Subject',
      `Are you sure you want to delete ${selectedSubject.code}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setSubjects(subjects.filter(s => s.id !== selectedSubject.id));
          },
        },
      ],
    );
  };

  const renderAddSubjectModal = () => {
    return (
    <Modal
      visible={showAddModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowAddModal(false)}
    >
      <TouchableWithoutFeedback onPress={() => setShowAddModal(false)}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View style={styles.addModal}>
              <Text style={styles.modalTitle}>Add New Subject</Text>
              <ScrollView style={styles.formContainer}>
                <View style={styles.formContent}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Subject Code</Text>
                  <TextInput
                    style={styles.input}
                    value={newSubject.code}
                    onChangeText={text => setNewSubject(prev => ({ ...prev, code: text }))}
                    placeholder="e.g., ENG10"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Subject Name</Text>
                  <TextInput
                    style={styles.input}
                    value={newSubject.name}
                    onChangeText={text => setNewSubject(prev => ({ ...prev, name: text }))}
                    placeholder="e.g., English"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Professor</Text>
                  <TextInput
                    style={styles.input}
                    value={newSubject.professor}
                    onChangeText={text => setNewSubject(prev => ({ ...prev, professor: text }))}
                    placeholder="e.g., Dr. Smith"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Type</Text>
                  <View style={styles.typeContainer}>
                    {subjectTypes.map(type => (
                      <TouchableOpacity
                        key={type}
                        style={[
                          styles.typeButton,
                          newSubject.type === type && styles.typeButtonActive
                        ]}
                        onPress={() => setNewSubject(prev => ({ ...prev, type }))}
                      >
                        <Ionicons 
                          name={type === 'Lecture' ? 'school' : 'flask'} 
                          size={20} 
                          color={newSubject.type === type ? '#3B82F6' : '#6B7280'} 
                        />
                        <Text style={[
                          styles.typeText,
                          newSubject.type === type && styles.typeTextActive
                        ]}>
                          {type}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Room</Text>
                  <View style={styles.roomInputContainer}>
                    <Ionicons name="business" size={20} color="#6B7280" style={styles.roomInputIcon} />
                    <TextInput
                      style={styles.roomInput}
                      value={newSubject.room}
                      onChangeText={(text) => setNewSubject(prev => ({ ...prev, room: text }))}
                      placeholder="Enter room number or name (e.g., Room 101, Lab 2)"
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                  <View style={styles.roomSuggestions}>
                    <Text style={styles.suggestionsLabel}>Quick Select:</Text>
                    <ScrollView 
                      horizontal 
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.roomList}
                    >
                      {availableRooms.map(room => (
                        <TouchableOpacity
                          key={room}
                          style={[
                            styles.roomSuggestionButton,
                            newSubject.room === room && styles.roomSuggestionActive
                          ]}
                          onPress={() => setNewSubject(prev => ({ ...prev, room }))}
                        >
                          <Text style={[
                            styles.roomSuggestionText,
                            newSubject.room === room && styles.roomSuggestionTextActive
                          ]}>
                            {room}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Schedule</Text>
                  <View style={styles.daysContainer}>
                    {daysOfWeek.map(day => (
                      <TouchableOpacity
                        key={day}
                        style={[
                          styles.dayButton,
                          selectedDays.includes(day) && styles.dayButtonActive
                        ]}
                        onPress={() => toggleDay(day)}
                      >
                        <Text style={[
                          styles.dayText,
                          selectedDays.includes(day) && styles.dayTextActive
                        ]}>
                          {day.slice(0, 3)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Time</Text>
                  <View style={styles.timePickerContainer}>
                    <TouchableOpacity 
                      style={styles.timeIconButton}
                      onPress={() => setShowTimePicker(!showTimePicker)}
                    >
                      <Ionicons name="time" size={24} color="#3B82F6" style={styles.timeIcon} />
                      <Text style={styles.selectedTimeText}>
                        {`${formatTimeDisplay(startTime)} - ${formatTimeDisplay(endTime)}`}
                      </Text>
                    </TouchableOpacity>
                    {showTimePicker && (
                    <View style={styles.digitalTimePickerWrapper}>
                      {/* Start Time */}
                      <View style={styles.timePickerSection}>
                        <Text style={styles.timePickerLabel}>Start Time</Text>
                        <View style={styles.digitalClock}>
                          <View style={styles.timeUnit}>
                            <TouchableOpacity 
                              style={styles.timeButton}
                              onPress={() => handleTimeChange(true, 'hours', 'increment')}
                            >
                              <Ionicons name="chevron-up" size={24} color="#3B82F6" />
                            </TouchableOpacity>
                            <Text style={styles.timeDisplay}>
                              {startTime.hours.toString().padStart(2, '0')}
                            </Text>
                            <TouchableOpacity 
                              style={styles.timeButton}
                              onPress={() => handleTimeChange(true, 'hours', 'decrement')}
                            >
                              <Ionicons name="chevron-down" size={24} color="#3B82F6" />
                            </TouchableOpacity>
                          </View>
                          
                          <Text style={styles.timeSeparator}>:</Text>
                          
                          <View style={styles.timeUnit}>
                            <TouchableOpacity 
                              style={styles.timeButton}
                              onPress={() => handleTimeChange(true, 'minutes', 'increment')}
                            >
                              <Ionicons name="chevron-up" size={24} color="#3B82F6" />
                            </TouchableOpacity>
                            <Text style={styles.timeDisplay}>
                              {startTime.minutes.toString().padStart(2, '0')}
                            </Text>
                            <TouchableOpacity 
                              style={styles.timeButton}
                              onPress={() => handleTimeChange(true, 'minutes', 'decrement')}
                            >
                              <Ionicons name="chevron-down" size={24} color="#3B82F6" />
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

                      {/* End Time */}
                      <View style={styles.timePickerSection}>
                        <Text style={styles.timePickerLabel}>End Time</Text>
                        <View style={styles.digitalClock}>
                          <View style={styles.timeUnit}>
                            <TouchableOpacity 
                              style={styles.timeButton}
                              onPress={() => handleTimeChange(false, 'hours', 'increment')}
                            >
                              <Ionicons name="chevron-up" size={24} color="#3B82F6" />
                            </TouchableOpacity>
                            <Text style={styles.timeDisplay}>
                              {endTime.hours.toString().padStart(2, '0')}
                            </Text>
                            <TouchableOpacity 
                              style={styles.timeButton}
                              onPress={() => handleTimeChange(false, 'hours', 'decrement')}
                            >
                              <Ionicons name="chevron-down" size={24} color="#3B82F6" />
                            </TouchableOpacity>
                          </View>
                          
                          <Text style={styles.timeSeparator}>:</Text>
                          
                          <View style={styles.timeUnit}>
                            <TouchableOpacity 
                              style={styles.timeButton}
                              onPress={() => handleTimeChange(false, 'minutes', 'increment')}
                            >
                              <Ionicons name="chevron-up" size={24} color="#3B82F6" />
                            </TouchableOpacity>
                            <Text style={styles.timeDisplay}>
                              {endTime.minutes.toString().padStart(2, '0')}
                            </Text>
                            <TouchableOpacity 
                              style={styles.timeButton}
                              onPress={() => handleTimeChange(false, 'minutes', 'decrement')}
                            >
                              <Ionicons name="chevron-down" size={24} color="#3B82F6" />
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
                    </View>
                    )}
                  </View>
                  {showTimePicker && (
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
                          // Validate time range when confirming
                          if (!validateTimeRange(startTime, endTime)) {
                            Alert.alert('Invalid Time', 'End time must be after start time');
                            return;
                          }
                          // Update the subject's schedule time
                          setNewSubject(prev => ({
                            ...prev,
                            schedule: {
                              ...prev.schedule,
                              time: `${formatTimeDisplay(startTime)} - ${formatTimeDisplay(endTime)}`
                            }
                          }));
                          setShowTimePicker(false);
                          Alert.alert('Success', 'Time schedule updated successfully');
                        }}
                      >
                        <Text style={[styles.timeButtonText, styles.submitTimeText]}>Submit</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            </ScrollView>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowAddModal(false);
                  setSelectedDays([]);
                  setNewSubject({
                    code: '',
                    name: '',
                    professor: '',
                    type: 'Lecture',
                    schedule: { days: [], time: '' }
                  });
                }}
              >
                <Text style={[styles.modalButtonText, styles.cancelButtonText]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.addButton]}
                onPress={handleSubmit}
              >
                <Text style={[styles.modalButtonText, styles.addButtonText]}>Add Subject</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </View>
    </TouchableWithoutFeedback>
  </Modal>
  );
};

  // Filter subjects based on search query
  useEffect(() => {
    const filtered = subjects.filter(subject => 
      subject.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subject.professor.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredSubjects(filtered);
  }, [searchQuery, subjects]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Subjects</Text>
          <TouchableOpacity onPress={() => setShowAddModal(true)}>
            <Ionicons name="add-circle" size={24} color="#3B82F6" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search subjects..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Subject List */}
        <FlatList
          data={filteredSubjects}
          renderItem={renderSubjectCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.subjectList}
          showsVerticalScrollIndicator={false}
        />

        {/* Add Subject Modal */}
        {renderAddSubjectModal()}

        {/* Subject Options Modal */}
        <Modal
          visible={showOptionsModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowOptionsModal(false)}
        >
          <TouchableWithoutFeedback onPress={() => setShowOptionsModal(false)}>
            <View style={styles.modalOverlay}>
              <View style={styles.detailsModal}>
                <View style={styles.detailsHeader}>
                  <View style={styles.subjectBadge}>
                    <Text style={styles.badgeCode}>{selectedSubject?.code}</Text>
                  </View>
                  <Text style={styles.detailsTitle}>{selectedSubject?.name}</Text>
                </View>

                <ScrollView style={styles.detailsContent}>
                  <View style={styles.detailsSection}>
                    <View style={styles.detailRow}>
                      <Ionicons name="person" size={20} color="#6B7280" />
                      <Text style={styles.detailLabel}>Professor:</Text>
                      <Text style={styles.detailValue}>{selectedSubject?.professor}</Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Ionicons name="time" size={20} color="#6B7280" />
                      <Text style={styles.detailLabel}>Schedule:</Text>
                      <Text style={styles.detailValue}>
                        {selectedSubject?.schedule.days.join(', ')} at {selectedSubject?.schedule.time}
                      </Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Ionicons name="school" size={20} color="#6B7280" />
                      <Text style={styles.detailLabel}>Type:</Text>
                      <Text style={styles.detailValue}>{selectedSubject?.type}</Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Ionicons name="library" size={20} color="#6B7280" />
                      <Text style={styles.detailLabel}>Credits:</Text>
                      <Text style={styles.detailValue}>3</Text>
                    </View>
                  </View>

                  <View style={styles.actionButtons}>
                    <TouchableOpacity 
                      style={[styles.actionButton, styles.editButton]}
                      onPress={handleEditSubject}
                    >
                      <Ionicons name="create" size={20} color="#6B4EAE" />
                      <Text style={[styles.actionButtonText, { color: '#6B4EAE' }]}>Edit</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={[styles.actionButton, styles.deleteButton]}
                      onPress={handleDeleteSubject}
                    >
                      <Ionicons name="trash" size={20} color="#EF4444" />
                      <Text style={[styles.actionButtonText, { color: '#EF4444' }]}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>

                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => setShowOptionsModal(false)}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </View>

      {/* Bottom Navigation */}
      <BottomNavigation navigation={navigation} activeTab="Subjects" />
    </SafeAreaView>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginTop: 8,
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#1F2937',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  subjectCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  codeTypeContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  subjectCode: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  typeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF5FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  labTypeTag: {
    backgroundColor: '#F3E8FF',
  },
  typeIcon: {
    marginRight: 8,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#3B82F6',
  },
  labTypeText: {
    color: '#9333EA',
  },
  moreButton: {
    padding: 4,
    marginLeft: 8,
  },
  subjectName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 4,
  },
  professorName: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
    gap: 6,
  },
  detailsModal: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '90%',
    maxHeight: '80%',
    padding: 20,
  },
  detailsHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  subjectBadge: {
    backgroundColor: '#EBF5FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 8,
  },
  badgeCode: {
    color: '#3B82F6',
    fontWeight: 'bold',
    fontSize: 18,
  },
  detailsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
  },
  detailsContent: {
    marginBottom: 20,
  },
  detailsSection: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 16,
    color: '#6B7280',
    marginLeft: 8,
    width: 80,
  },
  detailValue: {
    flex: 1,
  },
  timePickerContainer: {
    marginTop: 8,
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
  timeIconButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF5FF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  selectedTimeText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '500',
  },
  digitalTimePickerWrapper: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  timePickerSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  timePickerLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
    fontWeight: '500',
  },
  digitalClock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  timeUnit: {
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 4,
  },
  timeButton: {
    padding: 4,
  },
  timeDisplay: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
    paddingVertical: 4,
    minWidth: 48,
    textAlign: 'center',
  },
  timeSeparator: {
    fontSize: 24,
    fontWeight: 'bold',
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
  detailValue: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  editButton: {
    backgroundColor: '#F3F0FF',
  },
  deleteButton: {
    backgroundColor: '#FEE2E2',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    marginTop: 16,
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 12,
  },
  closeButtonText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 16,
  },
  addModal: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '90%',
    maxHeight: '80%',
    padding: 20,
  },
  formContainer: {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  typeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 8,
  },
  typeButtonActive: {
    backgroundColor: '#EBF5FF',
    borderColor: '#3B82F6',
  },
  typeText: {
    fontSize: 16,
    color: '#6B7280',
  },
  typeTextActive: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  dayButtonActive: {
    backgroundColor: '#EBF5FF',
    borderColor: '#3B82F6',
  },
  dayText: {
    fontSize: 14,
    color: '#6B7280',
  },
  dayTextActive: {
    color: '#3B82F6',
    fontWeight: '500',
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 8,
  },
  timeButtonText: {
    fontSize: 16,
    color: '#6B7280',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  saveButton: {
    backgroundColor: '#3B82F6',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },
  saveButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  roomInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 8,
  },
  roomInputIcon: {
    marginRight: 8,
  },
  roomInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    paddingVertical: 4,
  },
  roomSuggestions: {
    marginTop: 12,
  },
  suggestionsLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  roomList: {
    paddingVertical: 4,
  },
  roomSuggestionButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  roomSuggestionActive: {
    backgroundColor: '#EBF5FF',
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  roomSuggestionText: {
    fontSize: 14,
    color: '#6B7280',
  },
  roomSuggestionTextActive: {
    color: '#3B82F6',
    fontWeight: '500',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoIcon: {
    marginRight: 6,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
  },
});

export default SubjectsScreen;
