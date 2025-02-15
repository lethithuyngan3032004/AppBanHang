import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, Alert, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';

const CartScreen = ({ navigation }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [emailId, setEmailId] = useState(null);
  const [cartId, setCartId] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const email = await AsyncStorage.getItem('email');
        const cart = await AsyncStorage.getItem('userId');
        if (email && cart) {
          setEmailId(email);
          setCartId(parseInt(cart, 10));
        } else {
          Alert.alert("Lỗi", "Không tìm thấy email hoặc ID giỏ hàng. Vui lòng đăng nhập.");
        }
      } catch (error) {
        console.error("Lỗi khi lấy thông tin người dùng:", error);
      }
    };

    fetchUserData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const fetchCartItems = async () => {
        if (!emailId || !cartId) return;

        try {
          const token = await AsyncStorage.getItem('jwt-token');
          if (!token) {
            Alert.alert('Lỗi', 'Token không tồn tại. Vui lòng đăng nhập lại.');
            return;
          }

          const encodedEmail = encodeURIComponent(emailId);
          const response = await fetch(`http://localhost:8080/api/public/users/${encodedEmail}/carts/${cartId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const result = await response.json();
            setCartItems(result.products || []);
          } else {
            Alert.alert("Lỗi", "Không thể tải thông tin giỏ hàng.");
          }
        } catch (error) {
          console.error("Lỗi khi lấy mục giỏ hàng:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchCartItems();
    }, [emailId, cartId])
  );

  const calculateSubtotal = () => cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  const calculateDeliveryFee = () => 30; 
  const calculateTotalPrice = () => calculateSubtotal()  + calculateDeliveryFee();
  
  const removeItem = async (index) => {
    try {
      const token = await AsyncStorage.getItem('jwt-token');
      if (!token) {
        Alert.alert('Lỗi', 'Token không tồn tại. Vui lòng đăng nhập lại.');
        return;
      }

      const productId = cartItems[index].productId;
      const response = await fetch(`http://localhost:8080/api/public/carts/${cartId}/product/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const updatedCartItems = cartItems.filter((_, i) => i !== index);
        setCartItems(updatedCartItems);
        Alert.alert("Thông báo", "Xóa sản phẩm thành công.");
      } else {
        Alert.alert("Lỗi", "Không thể xóa sản phẩm khỏi giỏ hàng.");
      }
    } catch (error) {
      console.error("Lỗi khi xóa sản phẩm:", error);
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi xóa sản phẩm.");
    }
  };

  const increaseQuantity = async (index) => {
    const newCartItems = [...cartItems];
    newCartItems[index].quantity += 1;
  
    try {
      const token = await AsyncStorage.getItem('jwt-token'); // Lấy token từ AsyncStorage
      if (!token) {
        Alert.alert('Lỗi', 'Token không tồn tại. Vui lòng đăng nhập lại.');
        return;
      }
  
      await fetch(`http://localhost:8080/api/public/carts/${cartId}/products/${newCartItems[index].productId}/quantity/${newCartItems[index].quantity}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      setCartItems(newCartItems);
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };
  
  const decreaseQuantity = async (index) => {
    const newCartItems = [...cartItems];
    if (newCartItems[index].quantity > 1) {
      newCartItems[index].quantity -= 1;
  
      try {
        const token = await AsyncStorage.getItem('jwt-token'); // Lấy token từ AsyncStorage
        if (!token) {
          Alert.alert('Lỗi', 'Token không tồn tại. Vui lòng đăng nhập lại.');
          return;
        }
  
        await fetch(`http://localhost:8080/api/public/carts/${cartId}/products/${newCartItems[index].productId}/quantity/${newCartItems[index].quantity}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        setCartItems(newCartItems);
      } catch (error) {
        console.error("Error updating quantity:", error);
      }
    }
  };
  

  const renderRightActions = (index) => (
    <TouchableOpacity
      onPress={() => removeItem(index)}
      style={styles.removeButton}
    >
      <MaterialCommunityIcons name="delete" size={30} color="white" />
    </TouchableOpacity>
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
      <Text style={styles.headerText}>Giỏ hàng</Text>
      
      {cartItems.length > 0 ? (
        <ScrollView>
          {cartItems.map((item, index) => (
            <Swipeable
              key={index}
              renderRightActions={() => renderRightActions(index)}
            >
              <View style={styles.cartItem}>
                <Image
                  source={{ uri: `http://localhost:8080/api/public/products/image/${item.image}` }}
                  style={styles.productImage}
                />
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{item.productName}</Text>
                  <Text numberOfLines={2} style={styles.productDescription}>
                    {item.description.split(" ").slice(0, 12).join(" ")}
                    {item.description.split(" ").length > 12 ? "..." : ""}
                  </Text>                
                  <View style={styles.priceAndQuantity}>
                    <Text style={styles.productPrice}>{item.price.toFixed(3)} đ</Text>
                    <View style={styles.quantityContainer}>
                      <TouchableOpacity style={styles.quantityButton} onPress={() => decreaseQuantity(index)}>
                        <Text style={styles.quantityButtonText}>-</Text>
                      </TouchableOpacity>
                      <Text style={styles.quantityText}>{item.quantity}</Text>
                      <TouchableOpacity style={styles.quantityButton} onPress={() => increaseQuantity(index)}>
                        <Text style={styles.quantityButtonText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
              {index < cartItems.length - 1 && <View style={styles.divider} />}
            </Swipeable>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyCartContainer}>
          <Image source={require('../../../assets/images/nocart.webp')} style={styles.emptyCartImage} />
        </View>
      )}

      {cartItems.length > 0 && (
        <View style={styles.summaryContainer}>
          <View style={styles.row}>
            <Text style={styles.label}>Tổng tiền hàng</Text>
            <Text style={styles.value}>{calculateSubtotal().toFixed(3)} đ</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Tổng tiền phí vận chuyển</Text>
            <Text style={styles.value}>{calculateDeliveryFee().toFixed(3)} đ</Text>
          </View>
          <View style={styles.totalContainer}>
            <Text style={styles.totalText}>Tổng thanh toán: {calculateTotalPrice().toFixed(3)} đ</Text>
            <TouchableOpacity style={styles.checkoutButton} onPress={() => navigation.navigate('CheckInfo')}>
              <Text style={styles.checkoutButtonText}>Đặt hàng</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

export default CartScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  summaryContainer: {
    paddingVertical: 20,
    borderTopWidth: 1,
    borderColor: '#ddd',
    marginTop: 20,
    backgroundColor: '#f4f4f4',
    borderRadius: 10,
    paddingHorizontal: 15,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    color: '#333',
  },
  value: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalContainer: {
    paddingTop: 20,
    alignItems: 'center',
  },
  totalText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#FE724C',
  },
  checkoutButton: {
    backgroundColor: '#FE724C',
    paddingVertical: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 15,
    marginVertical: 10,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 15,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  productDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  priceAndQuantity: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  productPrice: {
    fontSize: 16,
    color: '#FE724C',
    fontWeight: 'bold',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    backgroundColor: '#fff',
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#FE724C',
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    color: '#FE724C',
    fontSize: 25,
    fontWeight: 'bold',
  },
  quantityText: {
    fontSize: 18,
    marginHorizontal: 10,
    textAlign: 'center',
  },
  removeButton: {
    backgroundColor: "red",
    justifyContent: "center",
    alignItems: "center",
    width: 70,
    height: "100%",
    borderRadius: 10,
    marginLeft: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
  },
  emptyCartContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyCartImage: {
    width: "100%",
    height: 300,
    marginBottom: 20,
  },
  emptyCartText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },
});