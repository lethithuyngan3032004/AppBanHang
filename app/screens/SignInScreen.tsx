import { StyleSheet, Text, TextInput, TouchableOpacity, View, Image } from 'react-native';
import React, { useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const LoginScreen = ({ navigation }) => {
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Reset email và password mỗi khi màn hình đăng nhập được focus lại
  useFocusEffect(
    React.useCallback(() => {
      setEmail('');
      setPassword('');
      setEmailError(null);
      setPasswordError(null);
      setGeneralError(null);
    }, [])
  );

  const fetchUserId = async (token) => {
    try {
      const response = await fetch(`http://localhost:8080/api/public/users/email/${email}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        throw new Error('Failed to retrieve user ID');
      }
  
      const data = await response.json();
      return data.userId;
    } catch (error) {
      console.error('Error fetching user ID:', error);
      throw error;
    }
  };
  
  const handleLogin = async () => {
    setEmailError(null);
    setPasswordError(null);
    setGeneralError(null);
  
    // Kiểm tra lỗi cục bộ
    if (!email) {
      setEmailError('Email không được để trống');
    }
    if (!password) {
      setPasswordError('Mật khẩu không được để trống');
    }
    if (!email || !password) {
      return;
    }
  
    try {
      const response = await fetch('http://localhost:8080/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });
  
      if (!response.ok) {
        if (response.status === 401) {
          setGeneralError('Bạn đã nhập sai email hoặc mật khẩu');
        } else {
          setGeneralError('Bạn đã nhập sai email hoặc mật khẩu');
        }
        return;
      }
  
      const data = await response.json();
  
      if (data['jwt-token']) {
        await AsyncStorage.setItem('jwt-token', data['jwt-token']);
  
        // Lấy userId từ email
        const userId = await fetchUserId(data['jwt-token']);
        if (userId !== undefined) {
          await AsyncStorage.setItem('userId', userId.toString());
          await AsyncStorage.setItem('email', email);
          navigation.navigate('Home');
        } else {
          setGeneralError('Không thể lấy user ID.');
        }
      } else {
        setGeneralError('Bạn đã nhập sai email hoặc mật khẩu');
      }
    } catch (error) {
      console.error('Error during login:', error);
      setGeneralError('Bạn đã nhập sai email hoặc mật khẩu');
    }
  };

  return (
    <View style={styles.container}>
      <Image 
        style={styles.backgroundImage}
        source={require('../../assets/images/background.png')} 
      />
      
      <View style={styles.header}>
        <Text style={styles.txth1}>Đăng Nhập</Text>
      </View>

      <View style={styles.body}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={[
            styles.input,
            focusedInput === 'email' && { borderColor: '#FE724C' },
          ]}
          placeholder="Email"
          placeholderTextColor="#666"
          value={email}
          onChangeText={setEmail}
          onFocus={() => setFocusedInput('email')}
          onBlur={() => setFocusedInput(null)}
        />
        {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

        <Text style={styles.label}>Mật khẩu</Text>
        <TextInput
          style={[
            styles.input,
            focusedInput === 'password' && { borderColor: '#FE724C' },
          ]}
          placeholder="Mật khẩu"
          placeholderTextColor="#666"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          onFocus={() => setFocusedInput('password')}
          onBlur={() => setFocusedInput(null)}
        />
        {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

        {generalError ? <Text style={styles.errorText}>{generalError}</Text> : null}
        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
          <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnSignIn} onPress={handleLogin}>
          <Text style={styles.txtSignIn}>ĐĂNG NHẬP</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('SignUp')}
          style={styles.signUpLink}
        >
          <Text style={styles.signUpText}>Chưa có tài khoản?</Text>
          <Text style={styles.loginText}> Đăng ký</Text>
        </TouchableOpacity>

        {/* Thêm dòng chữ "Đăng nhập bằng" */}
        <Text style={styles.orText}>hoặc đăng nhập bằng</Text>

        {/* Thêm các biểu tượng đăng nhập với Google, Facebook và Twitter */}
        <View style={styles.socialLoginContainer}>
          <TouchableOpacity style={styles.googleButton}>
            <Image source={require('../../assets/images/gg.png')} style={styles.socialIcon} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.facebookButton}>
            <FontAwesome name="facebook-f" size={24} color="#ffffff" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.twitterButton}>
            <FontAwesome name="twitter" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
    alignItems: 'center',
  },
  header: {
    marginBottom: 59,
    marginTop: 90,
  },
  txth1: {
    fontSize: 40,
    fontWeight: 'bold',
    textAlign: 'right',
    color: '#000000',
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
    color: "#9796A1",
  },
  input: {
    width: '100%',
    height: 65,
    borderColor: '#D0D2D1',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 10,
    fontSize: 18,
    backgroundColor: '#fdfbfb',
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    alignSelf: 'flex-start',
    marginBottom: 10,
    marginLeft: 10,
  },
  forgotPasswordText: {
    color: '#FE724C',
    fontSize: 16,
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  btnSignIn: {
    width: 248,
    height: 60,
    backgroundColor: '#FE724C',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 28.5,
    marginBottom: 20,
  },
  txtSignIn: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  signUpLink: {
    flexDirection: 'row',
    marginTop: 20,
    marginBottom: 30,
  },
  signUpText: {
    fontSize: 16,
    color: '#5B5B5E',
    fontWeight: 'bold',
  },
  loginText: {
    fontSize: 16,
    color: '#FE724C',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  backgroundImage: {
    width: '100%',
    position: 'absolute',
  },
  orText: {
    fontSize: 16,
    color: '#666',
    marginVertical: 20,
  },
  socialLoginContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    paddingHorizontal: '5%',
  },
  googleButton: {
    backgroundColor: '#f5f5f5',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  facebookButton: {
    backgroundColor: '#4267B2',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  twitterButton: {
    backgroundColor: '#1DA1F2',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialIcon: {
    width: 24,
    height: 24,
  },
});