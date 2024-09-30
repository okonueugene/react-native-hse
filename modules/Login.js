import React, {useState, useContext} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ApiManager from '../api/ApiManager';
import Preloader from '../components/Preloader';
import KeyboardAvoidingWrapper from '../components/KeyboardAvoidingWrapper';
import {MainContext} from '../storage/MainContext';

const LoginScreen = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const {dispatch} = useContext(MainContext);

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      setSuccessMessage('');

      // Make API request to login
      const response = await ApiManager.post('/login', {
        email,
        password,
      });

      if (response.status === 200) {
        // Save user data to async storage
        await AsyncStorage.setItem('token', response.data.token);
        await AsyncStorage.setItem('user', JSON.stringify(response.data.user));

        // Dispatch user data to context
        dispatch({type: 'LOGIN', payload: response.data});

        // Show success message
        setSuccessMessage('Login successful');

        // Fetch dashboard stats and navigate
        await fetchDashboardStatsAndNavigate(response.data.token);
      } else {
        setErrorMessage('Invalid credentials');
      }
    } catch (error) {
      setErrorMessage('Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch dashboard stats and navigate to Dashboard
  const fetchDashboardStatsAndNavigate = async token => {
    try {
      const response = await ApiManager.get('/dashboard-stats', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        // Store the dashboard stats in context or state
        dispatch({type: 'SET_DASHBOARD_STATS', payload: response.data});

        // Navigate to the Dashboard screen
        navigation.navigate('Dashboard');
      } else {
        console.log('Error fetching dashboard stats');
      }
    } catch (error) {
      console.error('Error fetching dashboard stats', error);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.preloaderContainer}>
        <Preloader />
      </View>
    );
  }

  return (
    <KeyboardAvoidingWrapper>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../images/OptiSafe_Logo.png')}
            style={styles.logo}
            resizeMode="center"
          />
        </View>

        {/* Welcome message */}
        <Text style={styles.welcomeText}>Welcome to HSE! 👋</Text>

        {/* Email input */}
        <TextInput
          style={styles.input}
          placeholder="Enter your Email or Username"
          placeholderTextColor={'#ccc'}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoFocus={false}
        />

        {/* Password input */}
        <View style={styles.passwordInputContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Password"
            placeholderTextColor={'#ccc'}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoFocus={false}
          />
          <TouchableOpacity
            onPress={handleTogglePassword}
            style={styles.eyeIcon}>
            {/* Render eye icon based on showPassword state */}
            <Icon
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={24}
              color="black"
            />
          </TouchableOpacity>
        </View>

        {/* Sign in button */}
        <TouchableOpacity onPress={handleLogin} style={styles.signInButton}>
          <Text style={styles.signInButtonText}>Sign in</Text>
        </TouchableOpacity>

        {/* Error and success messages */}
        {errorMessage ? (
          <Text style={styles.errorMessage}>{errorMessage}</Text>
        ) : null}
        {successMessage ? (
          <Text style={styles.successMessage}>{successMessage}</Text>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 170,
    height: 170,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 40,
    textAlign: 'center',
    color: '#007bff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    fontSize: 16,
    color: 'black',
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 20,
  },
  passwordInput: {
    flex: 1,
    padding: 10,
    fontSize: 16,
    color: 'black',
  },
  eyeIcon: {
    width: 20,
    height: 20,
    marginRight: 11,
  },

  signInButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  signInButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorMessage: {
    color: 'red',
    textAlign: 'center',
    marginTop: 10,
  },

  successMessage: {
    color: 'green',
    textAlign: 'center',
    marginTop: 10,
  },
  preloaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LoginScreen;
