import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  Alert,
} from 'react-native';
import React, { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SignUpScreen = ({ navigation }: { navigation: any }) => {
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [numPhone, setNumPhone] = useState<string>('');
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // Hàm xử lý đăng ký
  const handleSignUp = async () => {
    if (!firstName || !lastName || !email || !password || !numPhone) {
      setErrorMessage('Vui lòng điền đầy đủ thông tin!');
      return;
    }
  
    if (!/^[A-Za-z]+$/.test(firstName)) {
      setErrorMessage('First Name must not contain numbers or special characters');
      return;
    }
  
    if (!/^[A-Za-z]+$/.test(lastName)) {
      setErrorMessage('Last Name must not contain numbers or special characters');
      return;
    }
  
    if (lastName.length < 5) {
      setErrorMessage('Họ phải có ít nhất 5 ký tự!');
      return;
    }
  
    setLoading(true);
    setErrorMessage('');
  
    try {
      const response = await fetch('http://localhost:8080/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 0,
          firstName: firstName,
          lastName: lastName,
          mobileNumber: numPhone,
          email: email,
          password: password,
          roles: [
            {
              roleId: 102,
              roleName: "USER"
            }
          ],
          address: {
            addressId: 0,
            street: "123 Main St",
            buildingName: "Building A",
            city: "City Name",
            state: "State",
            country: "Country",
            pincode: "123456"
          }
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.log("Error data:", errorData); // In ra lỗi để debug
        throw new Error(errorData.message || 'Đã xảy ra lỗi khi đăng ký!');
      }
  
      const data = await response.json();
      const token = data['jwt-token'];
  
      if (!token) {
        throw new Error('Token không tồn tại! Vui lòng kiểm tra API trả về.');
      }
  
      await AsyncStorage.setItem('token', token);
      Alert.alert('Success', 'Đăng ký thành công!');
      navigation.navigate('SignIn');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Có lỗi xảy ra khi đăng ký.');
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <View style={styles.container}>
      <Image
        style={styles.backgroundImage}
        source={require('../../assets/images/background.png')}
      />
      <View style={styles.header}>
        <Text style={styles.txth1}>Đăng ký</Text>
      </View>

      <View style={styles.body}>
        <View style={styles.row}>
          <View style={styles.halfWidth}>
            <Text style={styles.label}>Tên</Text>
            <TextInput
              style={[styles.input, focusedInput === 'firstName' && { borderColor: '#FE724C' }]}
              placeholder="Nhập tên"
              placeholderTextColor="#666"
              onFocus={() => setFocusedInput('firstName')}
              onBlur={() => setFocusedInput(null)}
              value={firstName}
              onChangeText={setFirstName}
            />
          </View>

          <View style={styles.halfWidth}>
            <Text style={styles.label}>Họ</Text>
            <TextInput
              style={[styles.input, focusedInput === 'lastName' && { borderColor: '#FE724C' }]}
              placeholder="Nhập họ"
              placeholderTextColor="#666"
              onFocus={() => setFocusedInput('lastName')}
              onBlur={() => setFocusedInput(null)}
              value={lastName}
              onChangeText={setLastName}
            />
          </View>
        </View>

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={[styles.input, focusedInput === 'email' && { borderColor: '#FE724C' }]}
          placeholder="Nhập email của bạn"
          placeholderTextColor="#666"
          onFocus={() => setFocusedInput('email')}
          onBlur={() => setFocusedInput(null)}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />

        <Text style={styles.label}>Số điện thoại</Text>
        <TextInput
          style={[styles.input, focusedInput === 'numPhone' && { borderColor: '#FE724C' }]}
          placeholder="Nhập số điện thoại của bạn"
          placeholderTextColor="#666"
          onFocus={() => setFocusedInput('numPhone')}
          onBlur={() => setFocusedInput(null)}
          value={numPhone}
          onChangeText={setNumPhone}
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>Mật khẩu</Text>
        <TextInput
          style={[styles.input, focusedInput === 'password' && { borderColor: '#FE724C' }]}
          placeholder="Nhập mật khẩu của bạn"
          placeholderTextColor="#666"
          secureTextEntry
          onFocus={() => setFocusedInput('password')}
          onBlur={() => setFocusedInput(null)}
          value={password}
          onChangeText={setPassword}
        />

        {errorMessage ? <Text style={styles.errorMessage}>{errorMessage}</Text> : null}

        <TouchableOpacity style={styles.btnSignIn} onPress={handleSignUp} disabled={loading}>
          <Text style={styles.txtSignIn}>{loading ? 'Đang đăng ký...' : 'ĐĂNG KÝ'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('SignIn')}
          style={styles.signUpLink}
        >
          <Text style={styles.signUpText}>Đã có tài khoản?</Text>
          <Text style={styles.loginText}> Đăng nhập</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SignUpScreen;

// Style definitions
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  halfWidth: {
    width: '48%',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
    marginBottom: 5,
    marginLeft: 10,
    color: '#9796A1',
  },
  input: {
    width: '100%',
    height: 65,
    borderColor: '#D0D2D1',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 20,
    fontSize: 18,
    backgroundColor: '#fdfbfb',
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
    marginTop: 40,
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
  errorMessage: {
    color: '#FF0000',
    marginTop: 10,
  },
});
