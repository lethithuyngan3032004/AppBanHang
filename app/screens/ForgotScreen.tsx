import { StyleSheet, Text, TextInput, TouchableOpacity, View, Image, Alert } from 'react-native';
import React, { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';


const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handlePasswordReset = async () => {
    try {
      const encodedEmail = encodeURIComponent(email); // Mã hóa email để sử dụng trong URL
      const response = await fetch(`http://localhost:8080/api/public/users/email/${encodedEmail}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (response.ok) {
        setSuccessMessage('Password reset link has been sent to your email.');
        setTimeout(() => setSuccessMessage(null), 5000);
      } 
    } catch (error) {
      console.error('Error during password reset:', error);
    }
  };
    

  return (
    <View style={styles.container}>
      <Image 
        style={styles.backgroundImage}
        source={require('../../assets/images/background.png')} 
      />
      <View style={styles.header}>
        <Text style={styles.txth1}>Reset Password</Text>
        <Text style={styles.subtitle}>
          Please enter your email address to receive a password reset.
        </Text>
      </View>

      {successMessage && (
        <View style={styles.successMessageContainer}>
          <Text style={styles.successMessageText}>{successMessage}</Text>
        </View>
      )}

      <View style={styles.body}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={[
            styles.input,
            focusedInput === 'email' && { borderColor: '#FE724C' },
          ]}
          placeholder="Enter your email"
          placeholderTextColor="#666"
          onFocus={() => setFocusedInput('email')}
          onBlur={() => setFocusedInput(null)}
          value={email}
          onChangeText={setEmail}
        />

        <TouchableOpacity style={styles.btnReset} onPress={handlePasswordReset}>
          <Text style={styles.txtReset}>SEND NEW PASSWORD</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backToLoginLink}
        >
          <Text style={styles.backToLoginText}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default ForgotPasswordScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
    alignItems: 'center',
  },
  header: {
    marginBottom: 50,
    marginTop: 90,
    alignItems: 'center',
  },
  txth1: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  successMessageContainer: {
    backgroundColor: '#DFFFD9',
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  successMessageText: {
    color: '#3C763D',
    fontSize: 16,
    fontWeight: 'bold',
  },
  body: {
    width: '80%',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
    marginBottom: 5,
    marginLeft: 10,
    color: "#9796A1"
  },
  input: {
    width: '100%',
    height: 60,
    borderColor: '#D0D2D1',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 20,
    fontSize: 18,
    backgroundColor: '#fdfbfb',
  },
  btnReset: {
    width: 248,
    height: 60,
    backgroundColor: '#FE724C',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 28.5,
    marginTop: 20,
  },
  txtReset: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#fff',
  },
  backToLoginLink: {
    marginTop: 20,
  },
  backToLoginText: {
    fontSize: 16,
    color: '#FE724C',
    fontWeight: 'bold',
  },
  backgroundImage: {
    width: '100%',
    position: 'absolute',
  },
});
