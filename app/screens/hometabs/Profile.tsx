import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Image, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Modal, Alert } from 'react-native';
import { MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Profile = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editable, setEditable] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState({ password: '', newPassword: '', confirmPassword: '' });
  const [successMessage, setSuccessMessage] = useState('');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        const token = await AsyncStorage.getItem('jwt-token');
  
        if (userId && token) {
          const response = await fetch(`http://localhost:8080/api/public/users/${userId}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            setUser(data);
          } else {
            navigation.navigate('SignIn');
          }
        }
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu người dùng:', error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchUserData();
  }, []);
  
const handleSave = async () => {
    try {
      const token = await AsyncStorage.getItem('jwt-token');
      const response = await fetch(`http://localhost:8080/api/public/users/${user.userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(user),
      });

      if (response.ok) {
        Alert.alert('Thông báo', 'Thông tin đã được cập nhật thành công');
        setEditable(false);
      } else {
        Alert.alert('Thông báo', 'Cập nhật thất bại');
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật thông tin người dùng:', error);
      Alert.alert('Lỗi', 'Đã xảy ra lỗi khi cập nhật thông tin.');
    }
  };

  const handlePasswordChange = async () => {
    let hasError = false;
    let newError = { password: '', newPassword: '', confirmPassword: '' };

    if (newPassword.length < 6) {
      newError.newPassword = 'Mật khẩu phải có ít nhất 6 ký tự';
      hasError = true;
    }

    if (newPassword !== confirmPassword) {
      newError.confirmPassword = 'Mật khẩu xác nhận không khớp';
      hasError = true;
    }

    setError(newError);

    if (hasError) return;

    try {
      const token = await AsyncStorage.getItem('jwt-token');
      const response = await fetch(`http://localhost:8080/api/public/users/${user.userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ...user, password: newPassword }),
      });

      if (response.ok) {
        setSuccessMessage('Mật khẩu đã được thay đổi thành công');
        setPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setShowPasswordChange(false);

        setTimeout(() => setSuccessMessage(''), 3000);  // Ẩn thông báo sau 5 giây
      } else {
        setError({ ...error, confirmPassword: 'Thay đổi mật khẩu thất bại' });
      }
    } catch (error) {
      console.error('Lỗi khi thay đổi mật khẩu:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();
      navigation.navigate('SignIn');
    } catch (error) {
      console.error('Lỗi trong quá trình đăng xuất:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {successMessage ? (
        <Text style={styles.successMessage}>{successMessage}</Text>
      ) : null}

      <View style={styles.header1}>
        <TouchableOpacity>
          <Image
            source={{
              uri: user?.photo 
                ? `http://localhost:8080/api/image/users/${user.photo}` 
                : '../../../assets/images/user.jpg'
            }}
            style={styles.profileImage}
          />
        </TouchableOpacity>
        <Text style={styles.profileName}>{user?.firstName} {user?.lastName}</Text>
      </View>

      <View style={styles.settingsContainer}>
        <View style={styles.titleContainer}>
          <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>
          <TouchableOpacity onPress={() => setEditable(!editable)}>
            <MaterialCommunityIcons name="pencil-outline" size={20} color="#FE724C" />
          </TouchableOpacity>
        </View>

        <View style={styles.setting}>
          <MaterialCommunityIcons name="phone-in-talk-outline" size={20} color="#000" />
          <TextInput
            style={styles.settingText}
            value={user?.mobileNumber}
            editable={editable}
            onChangeText={(text) => setUser({ ...user, mobileNumber: text })}
          />
        </View>
        <View style={styles.setting}>
          <MaterialCommunityIcons name="email-outline" size={20} color="#000" />
          <TextInput
            style={styles.settingText}
            value={user?.email}
            editable={editable}
            onChangeText={(text) => setUser({ ...user, email: text })}
          />
        </View>

        <View style={styles.setting}>
          <MaterialCommunityIcons name="home-outline" size={20} color="#000" />
          <TextInput
            style={styles.settingText}
            placeholder="Tên đường và số nhà"
            value={user?.address?.street || ''}
            editable={editable}
            onChangeText={(text) => setUser({ ...user, address: { ...user.address, street: text } })}
          />
        </View>
        <View style={styles.setting}>
          <MaterialCommunityIcons name="map-marker-outline" size={20} color="#000" />
          <TextInput
            style={styles.settingText}
            placeholder="Tỉnh và quốc gia"
            value={`${user?.address?.state || ''}, ${user?.address?.country || ''}`}
            editable={editable}
            onChangeText={(text) => {
              const [state, country] = text.split(',').map(part => part.trim());
              setUser({
                ...user,
                address: { ...user.address, state: state || '', country: country || '' }
              });
            }}
          />
        </View>

        {editable && (
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Lưu thay đổi</Text>
          </TouchableOpacity>
        )}
   <TouchableOpacity style={styles.orderButton} onPress={() => navigation.navigate('Myorder')}>
          <Text style={styles.orderButtonText}>Xem đơn hàng</Text>
        </TouchableOpacity>
      
        <TouchableOpacity style={styles.changePasswordToggle} onPress={() => setShowPasswordChange(true)}>
          <Text style={styles.sectionTitle}>Thay đổi mật khẩu</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={showPasswordChange} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Thay đổi mật khẩu</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Mật khẩu hiện tại"
              secureTextEntry
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setError({ ...error, password: '' });
              }}
            />
            {error.password ? <Text style={styles.errorText}>{error.password}</Text> : null}

            <TextInput
              style={styles.modalInput}
              placeholder="Mật khẩu mới"
              secureTextEntry
              value={newPassword}
              onChangeText={(text) => {
                setNewPassword(text);
                setError({ ...error, newPassword: '' });
              }}
            />
            {error.newPassword ? <Text style={styles.errorText}>{error.newPassword}</Text> : null}

            <TextInput
              style={styles.modalInput}
              placeholder="Nhập lại mật khẩu mới"
              secureTextEntry
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                setError({ ...error, confirmPassword: '' });
              }}
            />
            {error.confirmPassword ? <Text style={styles.errorText}>{error.confirmPassword}</Text> : null}

            <TouchableOpacity style={styles.changePasswordButton} onPress={handlePasswordChange}>
              <Text style={styles.changePasswordButtonText}>Đổi mật khẩu</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeModalButton} onPress={() => setShowPasswordChange(false)}>
              <Text style={styles.closeModalText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showLogoutConfirm} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Bạn có chắc chắn muốn đăng xuất?</Text>
            <TouchableOpacity style={styles.changePasswordButton} onPress={handleLogout}>
              <Text style={styles.changePasswordButtonText}>Đăng xuất</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeModalButton} onPress={() => setShowLogoutConfirm(false)}>
              <Text style={styles.closeModalText}>Hủy</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      <TouchableOpacity style={styles.logoutButton} onPress={() => setShowLogoutConfirm(true)}>
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  successMessage: {
    backgroundColor: '#4CAF50',
    color: 'white',
    fontSize: 16,
    padding: 10,
    textAlign: 'center',
    borderRadius: 5,
    marginBottom: 10,
  },
  header1: {
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#FE724C',
    borderRadius: 10,
    padding: 20,
    width: '100%',
    elevation: 2,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#fff',
    marginBottom: 10,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  settingsContainer: {
    marginBottom: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FE724C',
  },
  setting: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  settingText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  changePasswordToggle: {
    marginTop: 20,
    alignItems: 'flex-start',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalInput: {
    width: '100%',
    height: 50,
    borderColor: '#D0D2D1',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 5,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  changePasswordButton: {
    backgroundColor: '#FE724C',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
    width: '100%',
  },
  changePasswordButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  closeModalButton: {
    marginTop: 10,
    padding: 10,
    alignItems: 'center',
    width: '100%',
  },
  closeModalText: {
    color: '#FE724C',
    fontSize: 16,
  },
  logoutButton: {
    backgroundColor: '#FE724C',
    padding: 10,
    borderRadius: 10,
    width: '90%',
    alignItems: 'center',
    alignSelf: 'center',
    position: 'absolute',
    bottom: 10,
  },
  logoutText: {
    fontSize: 16,
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderButton: {
    backgroundColor: '#FE724C',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  orderButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});
