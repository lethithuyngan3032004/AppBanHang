import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CheckInfoScreen = () => {
  const [recipientName, setRecipientName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [orderItems, setOrderItems] = useState([]);
  const [paymentMethod] = useState('credit_card'); // Đặt mặc định là "credit_card"
  const [email, setEmail] = useState('');
  const [cartId, setCartId] = useState(null);
  const [token, setToken] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        const jwtToken = await AsyncStorage.getItem('jwt-token');

        if (userId && jwtToken) {
          setToken(jwtToken);
          await fetchUserData(userId, jwtToken);
        } else {
          Alert.alert("Lỗi", "Không tìm thấy thông tin đăng nhập. Vui lòng đăng nhập lại.");
          navigation.navigate('SignIn');
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const fetchUserData = async (userId, token) => {
    try {
      const response = await fetch(`http://localhost:8080/api/public/users/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        // Lấy thông tin người dùng và cập nhật vào state
        setRecipientName(`${data.firstName} ${data.lastName}`);
        setPhoneNumber(data.mobileNumber);
        setEmail(data.email);
        setAddress(`${data.address.street}, ${data.address.state}, ${data.address.country}`);
        setCartId(data.cart.cartId);
        setOrderItems(data.cart.products || []);
      } else {
        throw new Error('Failed to fetch user data');
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      Alert.alert("Lỗi", "Không thể lấy thông tin người dùng.");
    }
  };

  const calculateTotalAmount = () => {
    return orderItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const handlePlaceOrder = async () => {
    if (!recipientName || !phoneNumber || !address) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin.');
      return;
    }

    try {
      if (!token || !email || !cartId) {
        Alert.alert('Lỗi', 'Không tìm thấy thông tin cần thiết. Vui lòng đăng nhập lại.');
        return;
      }

      const orderData = {
        email,
        orderItems: orderItems.map(item => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          price: item.price,
          discount: item.discount || 0,
        })),
        orderDate: new Date().toISOString().split('T')[0],
        payment: {
          paymentId: 0,
          paymentMethod: paymentMethod,
        },
        totalAmount: calculateTotalAmount(),
        orderStatus: "Đang xử lí",  // Đặt trạng thái là "Đang xử lí"
        recipientName,
        phoneNumber,
        address,
        notes,
      };

      const response = await fetch(`http://localhost:8080/api/public/users/${encodeURIComponent(email)}/carts/${cartId}/payments/${paymentMethod}/order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        Alert.alert('Thành công', 'Đặt hàng thành công!');
        navigation.navigate('Checkout');
      } else {
        throw new Error('Đặt hàng thất bại');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Nút Back */}
      <View style={styles.backContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Image source={require('../../assets/images/back.png')} style={styles.backImage} />
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>Thông tin đặt hàng</Text>

      <Text style={styles.label}>Tên người nhận</Text>
      <TextInput
        style={styles.input}
        placeholder="Tên người nhận"
        value={recipientName}
        onChangeText={setRecipientName}
      />

      <Text style={styles.label}>Số điện thoại</Text>
      <TextInput
        style={styles.input}
        placeholder="Số điện thoại"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        keyboardType="phone-pad"
      />

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        editable={false} // Không cho chỉnh sửa email
      />

      <Text style={styles.label}>Địa chỉ giao hàng</Text>
      <TextInput
        style={styles.input}
        placeholder="Địa chỉ giao hàng"
        value={address}
        onChangeText={setAddress}
      />

      <Text style={styles.label}>Ghi chú</Text>
      <TextInput
        style={styles.input}
        placeholder="Ghi chú"
        value={notes}
        onChangeText={setNotes}
        multiline
      />

      <TouchableOpacity style={styles.placeOrderButton} onPress={handlePlaceOrder}>
        <Text style={styles.placeOrderButtonText}>Đặt hàng</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default CheckInfoScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  backContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 10,
  },
  backButton: {
    width: 100,
    height: 100,
  },
  backImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    marginTop: 80, // Để tránh bị che bởi nút back
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  placeOrderButton: {
    backgroundColor: '#FE724C',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  placeOrderButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
