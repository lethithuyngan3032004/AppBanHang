import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProductItem = ({ selectedCategory, searchQuery }) => {
  const navigation = useNavigation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const token = await AsyncStorage.getItem('jwt-token');
      if (!token) {
        throw new Error('Token không tồn tại! Vui lòng đăng nhập lại.');
      }

      let url = 'http://localhost:8080/api/public/products';

      if (selectedCategory) {
        url = `http://localhost:8080/api/public/categories/${selectedCategory}/products`;
      } else if (searchQuery) {
        url = `http://localhost:8080/api/public/products/keyword/${searchQuery}`;
      }

      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        params: {
          pageNumber: 0,
          pageSize: 10,
        },
      });
      setProducts(response.data.content || []);
    } catch (error) {
      console.error('Lỗi khi lấy sản phẩm:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, searchQuery]);

  const addToCart = async (product) => {
    try {
      const token = await AsyncStorage.getItem('jwt-token');
      const email = await AsyncStorage.getItem('email');
      const cartId = await AsyncStorage.getItem('userId');

      if (!token || !email || !cartId) {
        Alert.alert('Lỗi', 'Thông tin người dùng không đầy đủ. Vui lòng đăng nhập lại.');
        return;
      }

      const checkResponse = await axios.get(
        `http://localhost:8080/api/public/users/${encodeURIComponent(email)}/carts/${cartId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const existingProduct = checkResponse.data.products.find(item => item.productId === product.productId);
      const availableQuantity = checkResponse.data.products.find(item => item.productId === product.productId)?.availableQuantity;

      if (existingProduct) {
        const newQuantity = existingProduct.quantity + 1;

        if (newQuantity > availableQuantity) {
          Alert.alert('Lỗi', `Số lượng tối đa còn lại là ${availableQuantity}.`);
          return;
        }

        await axios.put(
          `http://localhost:8080/api/public/carts/${cartId}/products/${product.productId}/quantity/${newQuantity}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
        Alert.alert('Cập nhật', 'Số lượng sản phẩm đã được cập nhật trong giỏ hàng.');
      } else {
        if (1 > availableQuantity) {
          Alert.alert('Lỗi', `Số lượng tối đa còn lại là ${availableQuantity}.`);
          return;
        }

        await axios.post(
          `http://localhost:8080/api/public/carts/${cartId}/products/${product.productId}/quantity/1`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
        Alert.alert('Thành công', 'Sản phẩm đã được thêm vào giỏ hàng.');
      }

      Toast.show({
        type: 'success',
        text1: 'Thành công',
        text2: `${product.productName} đã được thêm vào giỏ hàng.`,
      });
    } catch (error) {
      console.error('Lỗi khi thêm sản phẩm vào giỏ hàng:', error);
      Alert.alert('Lỗi', 'Không thể thêm sản phẩm vào giỏ hàng. Vui lòng thử lại sau.');
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <View style={styles.columnWrapper}>
      {products.map((item) => (
        <View key={item.productId} style={styles.productContainer}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Details', { productId: item.productId })}
            style={styles.productItem}
          >
            <Image source={{ uri: `http://localhost:8080/api/public/products/image/${item.image}` }} style={styles.productImage} />
            <Text style={styles.productName}>{item.productName}</Text>
            <Text style={styles.productPrice}>{item.price.toFixed(3)} đ</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.addButton} onPress={() => addToCart(item)}>
            <Image source={require('../../../../assets/images/add1.png')} />
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
};

export default ProductItem;

const styles = StyleSheet.create({
  popular: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#454545',
    marginVertical: 20,
    width: '90%',
  },
  productContainer: {
    position: 'relative',
    margin: 5,
  },
  productItem: {
    backgroundColor: '#fdfbfb',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 3,
    width: 155,
    height: 230,
  },
  productImage: {
    width: '90%',
    height: 100,
    borderRadius: 10,
  },
  productName: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  productPrice: {
    marginTop: 5,
    fontSize: 12,
    color: '#FE724C',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  columnWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  addButton: {
    position: 'absolute',
    bottom: -25,
    right: -5,
    padding: 5,
    elevation: 5,
  },
});
