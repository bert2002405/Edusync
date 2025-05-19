import React from 'react';
import Constants from 'expo-constants';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppRegistry } from 'react-native';
import LoadFonts from './app/components/LoadFonts';
import { TaskProvider } from './app/context/TaskContext';
import { EducationProvider } from './app/context/EducationContext';
import { SubjectProvider } from './app/context/SubjectContext';

// Import screens
import GetStartedScreen from './app/screens/GetStartedScreen';
import LoginScreen from './app/screens/LoginScreen';
import SignUpScreen from './app/screens/SignUpScreen';
import DashboardScreen from './app/screens/DashboardScreen';
import TimeTableScreen from './app/screens/TimeTableScreen';
import SubjectsScreen from './app/screens/SubjectsScreen';
import TaskScreen from './app/screens/TaskScreen';
import CalendarScreen from './app/screens/CalendarScreen';
import CompletedScreen from './app/screens/CompletedScreen';
import SettingsScreen from './app/screens/SettingsScreen';
import NotificationsScreen from './app/screens/NotificationsScreen';
import FeedbackScreen from './app/screens/FeedbackScreen';
import SubjectScreen from './app/screens/SubjectScreen';
import ProfileScreen from './app/screens/ProfileScreen';

const Stack = createNativeStackNavigator();

function App() {
  return (
    <LoadFonts>
      <SafeAreaProvider>
        <EducationProvider>
          <TaskProvider>
            <SubjectProvider>
              <NavigationContainer>
        <Stack.Navigator
          initialRouteName="GetStarted"
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="GetStarted" component={GetStartedScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
          <Stack.Screen name="Dashboard" component={DashboardScreen} />
          <Stack.Screen name="TimeTable" component={TimeTableScreen} />
          <Stack.Screen name="Subjects" component={SubjectsScreen} />
          <Stack.Screen name="Tasks" component={TaskScreen} />
          <Stack.Screen name="Calendar" component={CalendarScreen} />
          <Stack.Screen name="Completed" component={CompletedScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} />
          <Stack.Screen name="Feedback" component={FeedbackScreen} />
          <Stack.Screen 
            name="Subject" 
            component={SubjectScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen 
            name="Profile" 
            component={ProfileScreen}
            options={{
              headerShown: false,
            }}
          />
        </Stack.Navigator>
              </NavigationContainer>
            </SubjectProvider>
          </TaskProvider>
        </EducationProvider>
      </SafeAreaProvider>
    </LoadFonts>
  );
}

AppRegistry.registerComponent('main', () => App);

export default App;
