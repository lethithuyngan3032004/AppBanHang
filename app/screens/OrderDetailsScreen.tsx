import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, Image, ActivityIndicator, Alert, ScrollView, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OrderDetailsScreen = ({ route, navigation }) => {
  const { orderId, emailId } = route.params || {};
  const [orderDetails, setOrderDetails] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId || !emailId) {
      Alert.alert('Lỗi', 'Mã đơn hàng hoặc Email không tồn tại.');
      navigation.goBack();
      return;
    }

    const fetchOrderAndUserDetails = async () => {
      try {
        const token = await AsyncStorage.getItem('jwt-token');
        const userId = await AsyncStorage.getItem('userId');

        if (!token || !userId) {
          Alert.alert('Lỗi', 'Không tìm thấy Token hoặc Mã người dùng. Vui lòng đăng nhập lại.');
          return;
        }

        const encodedEmail = encodeURIComponent(emailId);
        const responseOrder = await fetch(`http://localhost:8080/api/public/users/${encodedEmail}/orders/${orderId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const responseUser = await fetch(`http://localhost:8080/api/public/users/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (responseOrder.ok && responseUser.ok) {
          const orderResult = await responseOrder.json();
          const userResult = await responseUser.json();
          setOrderDetails(orderResult);
          setUserDetails(userResult);
        } else {
          Alert.alert("Lỗi", "Không thể lấy thông tin đơn hàng hoặc thông tin người dùng.");
        }
      } catch (error) {
        console.error("Lỗi khi lấy thông tin:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderAndUserDetails();
  }, [orderId, emailId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FE724C" />
      </View>
    );
  }

  if (!orderDetails || !userDetails) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorMessage}>Không tìm thấy thông tin đơn hàng.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Image source={require('../../assets/images/back.png')} style={styles.backImage} />
        </TouchableOpacity>
        <Text style={styles.headerText}>Chi tiết đơn hàng</Text>
      </View>
  
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Thông tin khách hàng</Text>
        <Text style={styles.infoText}>Tên: {userDetails.firstName} {userDetails.lastName}</Text>
        <Text style={styles.infoText}>Email: {userDetails.email}</Text>
        <Text style={styles.infoText}>Số điện thoại: {userDetails.mobileNumber}</Text>
        <Text style={styles.infoText}>Địa chỉ: {userDetails.address.street}, {userDetails.address.state}, {userDetails.address.country}</Text>
      </View>
  
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Sản phẩm</Text>
        <FlatList
          data={orderDetails.orderItems}
          keyExtractor={(item) => item.orderItemId.toString()}
          renderItem={({ item }) => (
            <View style={styles.productContainer}>
              <Image source={{ uri: `http://localhost:8080/api/public/products/image/${item.product.image}` }} style={styles.productImage} />
              <View style={styles.productDetails}>
                <Text style={styles.productName}>{item.product.productName}</Text>
                <Text style={styles.productCategory}>Danh mục: {item.product.category.categoryName}</Text>
                <Text style={styles.productInfo}>Số lượng: {item.quantity}</Text>
                <Text style={styles.productInfo}>Giá: {item.orderedProductPrice.toFixed(2)} đ</Text>
              </View>
            </View>
          )}
        />
      </View>
  
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Thông tin thanh toán</Text>
        <Text style={styles.infoText}>Phương thức thanh toán: {orderDetails.payment.paymentMethod}</Text>
        <Text style={styles.totalAmountText}>Tổng tiền: {orderDetails.totalAmount.toFixed(3)} đ</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    elevation: 3,
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 10,
    top: 15,
  },
  backImage: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FE724C',
    marginTop: 20,
  },
  sectionContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginHorizontal: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  infoText: { fontSize: 16, marginBottom: 5, color: '#555' },
  totalAmountText: { fontSize: 16, fontWeight: 'bold', color: '#FE724C', marginTop: 10 },
  errorMessage: { fontSize: 16, color: '#f00', textAlign: 'center', marginTop: 20 },
  productContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ECECEC',
  },
  productImage: { width: 60, height: 60, borderRadius: 8, marginRight: 10 },
  productDetails: { flex: 1 },
  productName: { fontSize: 16, fontWeight: '600', color: '#333' },
  productCategory: { fontSize: 14, color: '#999', marginVertical: 2 },
  productInfo: { fontSize: 14, color: '#FE724C' },
});

export default OrderDetailsScreen;
