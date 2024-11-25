import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, Image, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MyOrderScreen = () => {
  const navigation = useNavigation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [emailId, setEmailId] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const email = await AsyncStorage.getItem('email');
        if (email) {
          setEmailId(email);
          fetchOrders(email);
        } else {
          Alert.alert("Error", "Email not found. Please log in.");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  const fetchOrders = async (email) => {
    try {
      const token = await AsyncStorage.getItem('jwt-token');
      if (!token) {
        Alert.alert('Error', 'Token not found. Please log in again.');
        return;
      }

      const encodedEmail = encodeURIComponent(email);
      const response = await fetch(`http://localhost:8080/api/public/users/${encodedEmail}/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        
        // Sắp xếp danh sách orders theo orderDate giảm dần
        const sortedOrders = result.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
        
        setOrders(sortedOrders);
      } else {
        Alert.alert("Error", "Unable to fetch order data.");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    try {
      const token = await AsyncStorage.getItem('jwt-token');
      if (!token || !emailId) {
        Alert.alert('Error', 'Token or email not found. Please log in again.');
        return;
      }
  
      const response = await fetch(`http://localhost:8080/api/admin/users/${emailId}/orders/${orderId}/orderStatus/Đã%20hủy`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
  
      if (response.ok) {
        Alert.alert('Order Canceled', `Order #${orderId} has been canceled.`);
        fetchOrders(emailId); // Refresh the orders list after updating
      } else {
        Alert.alert("Error", "Unable to cancel the order.");
      }
    } catch (error) {
      console.error("Error canceling order:", error);
    }
  };

  const handleViewDetails = (orderId) => {
    if (orderId && emailId) {
      navigation.navigate('OrderDetails', { orderId, emailId });
    } else {
      Alert.alert('Error', 'Order ID or Email ID is missing.');
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.orderItem}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderDate}>{item.orderDate}</Text>
        <View
          style={[
            styles.statusContainer,
            item.orderStatus === "Đã hủy" ? styles.cancelledStatus : styles.activeStatus,
          ]}
        >
          <Text
            style={[
              styles.orderStatusText,
              item.orderStatus === "Đã hủy" ? styles.cancelledText : styles.activeText,
            ]}
          >
            {item.orderStatus === "Đã hủy" ? "Đã hủy" : "Đang xử lý"}
          </Text>
        </View>
      </View>
      <FlatList
        data={item.orderItems}
        keyExtractor={(orderItem) => orderItem.orderItemId.toString()}
        renderItem={({ item: orderItem }) => (
          <View style={styles.productItem}>
            <Image
              source={{ uri: `http://localhost:8080/api/public/products/image/${orderItem.product.image}` }}
              style={styles.productImage}
            />
            <Text style={styles.productName}>{orderItem.product.productName}</Text>
            <Text style={styles.productPrice}>{orderItem.orderedProductPrice.toFixed(3)} đ</Text>
          </View>
        )}
      />
      <Text style={styles.totalPrice}>Tổng tiền: {item.totalAmount.toFixed(3)} đ</Text>
      {item.orderStatus !== "Đã hủy" && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.cancelButton} onPress={() => handleCancelOrder(item.orderId)}>
            <Text style={styles.cancelButtonText}>Hủy đơn</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.detailsButton} onPress={() => handleViewDetails(item.orderId)}>
            <Text style={styles.buttonText}>Chi tiết</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FE724C" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Nút Back */}
      <View style={styles.backContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Image source={require('../../assets/images/back.png')} style={styles.backImage} />
        </TouchableOpacity>
      </View>

      <Text style={styles.headerText}>Đơn hàng</Text>
      <FlatList
        data={orders}
        keyExtractor={(order) => order.orderId.toString()}
        renderItem={renderItem}
      />
    </View>
  );
};

export default MyOrderScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  backContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    padding: 10,
    zIndex: 1,
  },
  backButton: {
    width: 60,
    height: 60,
  },
  backImage: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#FE724C',
    marginBottom: 20,
    marginTop: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderItem: {
    marginBottom: 20,
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  orderDate: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusContainer: {
    borderRadius: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  activeText: {
    color: '#4CAF50',
    fontWeight: 'bold',

  },
  cancelledText: {
    color: '#f9310d',
    fontWeight: 'bold',

  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  productImage: {
    width: 50,
    height: 50,
    borderRadius: 5,
    marginRight: 10,
  },
  productName: {
    flex: 1,
    fontSize: 16,
  },
  productPrice: {
    fontSize: 16,
    color: '#FE724C',
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  cancelButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#FF6347',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 5,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#FF6347',
    fontWeight: 'bold',
    
  },
  detailsButton: {
    backgroundColor: '#FF6347',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginLeft: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
