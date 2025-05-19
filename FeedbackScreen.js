import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const FeedbackScreen = () => {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [category, setCategory] = useState('general'); // general, feature

  const handleSubmit = () => {
    if (rating === 0) {
      Alert.alert('Error', 'Please select a rating before submitting');
      return;
    }

    if (!feedback.trim()) {
      Alert.alert('Error', 'Please provide some feedback');
      return;
    }

    // Submit feedback
    console.log('Feedback submitted:', { rating, category, feedback });
    Alert.alert(
      'Thank You!', 
      'Your feedback helps us improve our app.',
      [{ text: 'OK', onPress: () => {
        // Reset form
        setRating(0);
        setFeedback('');
        setCategory('general');
      }}]
    );
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity 
          key={i}
          onPress={() => setRating(i)}
          style={styles.starContainer}
        >
          <Ionicons 
            name={i <= rating ? 'star' : 'star-outline'} 
            size={40} 
            color={i <= rating ? '#FFD700' : '#D1D5DB'}
          />
        </TouchableOpacity>
      );
    }
    return stars;
  };

  const renderRatingText = () => {
    switch(rating) {
      case 1: return 'Poor';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Very Good';
      case 5: return 'Excellent';
      default: return 'Select your rating';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Rate Your Experience</Text>
        <Text style={styles.subHeaderText}>Tell us what you think about our app</Text>
      </View>

      <View style={styles.ratingContainer}>
        <View style={styles.starsContainer}>
          {renderStars()}
        </View>
        <Text style={styles.ratingText}>{renderRatingText()}</Text>
      </View>

      <View style={styles.categoryContainer}>
        <TouchableOpacity 
          style={[styles.categoryButton, category === 'general' && styles.categoryButtonActive]}
          onPress={() => setCategory('general')}
        >
          <Ionicons name="chatbox-outline" size={24} color={category === 'general' ? '#3B82F6' : '#6B7280'} />
          <Text style={[styles.categoryText, category === 'general' && styles.categoryTextActive]}>General</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.categoryButton, category === 'feature' && styles.categoryButtonActive]}
          onPress={() => setCategory('feature')}
        >
          <Ionicons name="bulb-outline" size={24} color={category === 'feature' ? '#3B82F6' : '#6B7280'} />
          <Text style={[styles.categoryText, category === 'feature' && styles.categoryTextActive]}>Feature Request</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.feedbackContainer}>
        <Text style={styles.feedbackLabel}>Your Feedback</Text>
        <TextInput
          style={styles.feedbackInput}
          placeholder="Tell us what you think..."
          multiline
          numberOfLines={6}
          value={feedback}
          onChangeText={setFeedback}
          textAlignVertical="top"
        />
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Submit Feedback</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  subHeaderText: {
    fontSize: 16,
    color: '#6B7280',
  },
  ratingContainer: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    marginTop: 16,
    alignItems: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  starContainer: {
    padding: 4,
  },
  ratingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  categoryContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginTop: 1,
    justifyContent: 'space-between',
  },
  categoryButton: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    backgroundColor: '#F3F4F6',
  },
  categoryButtonActive: {
    backgroundColor: '#EBF5FF',
  },
  categoryText: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  categoryTextActive: {
    color: '#3B82F6',
  },
  feedbackContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginTop: 16,
  },
  feedbackLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  feedbackInput: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
    height: 120,
    fontSize: 16,
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FeedbackScreen;
