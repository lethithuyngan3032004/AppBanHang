import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, Image, TouchableOpacity } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const Favorite = ({ navigation }) => {
  const [items, setItems] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [removedMessage, setRemovedMessage] = useState('');
  const BASE_URL = 'http://localhost:8080';

  const fetchDiscountedProducts = async () => {
    try {
      const token = await AsyncStorage.getItem('jwt-token');
      if (!token) {
        console.error('Token không tồn tại!');
        setErrorMessage('Token không tồn tại! Vui lòng đăng nhập lại.');
        return;
      }

      const response = await axios.get(`${BASE_URL}/api/public/products`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const discountedProducts = response.data.content.filter(
        (product) => product.discount === 1
      );
      setItems(discountedProducts);
    } catch (error) {
      console.error('Lỗi khi lấy sản phẩm có discount = 1:', error);
      setErrorMessage('Lỗi khi lấy sản phẩm yêu thích.');
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchDiscountedProducts();
    }, [])
  );

  const handleFavoriteToggle = async (id) => {
    try {
      const token = await AsyncStorage.getItem('jwt-token');
      if (!token) {
        console.error('Token không tồn tại! Vui lòng đăng nhập lại.');
        setErrorMessage('Token không tồn tại! Vui lòng đăng nhập lại.');
        return;
      }

      const product = items.find((item) => item.productId === id);
      if (!product) {
        console.error('Không tìm thấy sản phẩm.');
        return;
      }

      const updatedProduct = {
        ...product,
        discount: 0,
      };

      const response = await axios.put(`${BASE_URL}/api/admin/products/${id}`, updatedProduct, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        const updatedItems = items.filter((item) => item.productId !== id);
        setItems(updatedItems);

        setRemovedMessage('Đã hủy yêu thích sản phẩm');

        setTimeout(() => {
          setRemovedMessage('');
        }, 3000);
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.error('Lỗi xác thực! Token không hợp lệ hoặc đã hết hạn.');
        setErrorMessage('Lỗi xác thực! Vui lòng đăng nhập lại.');
      } else {
        console.error('Lỗi khi cập nhật sản phẩm:', error);
        setErrorMessage('Có lỗi xảy ra khi cập nhật sản phẩm.');
      }
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate('Details', { productId: item.productId })}
    >
      <Image
        source={{ uri: `${BASE_URL}/api/public/products/image/${item.image}` }}
        style={styles.image}
      />
      <View style={styles.details}>
        <Text style={styles.name}>{item.productName}</Text>
        
        {item.specialPrice < item.price ? (
          <View style={styles.priceContainer}>
            <Text style={styles.originalPrice}>{item.price.toFixed(3)} đ</Text>
            <Text style={styles.discountPrice}>{item.specialPrice.toFixed(3)} đ</Text>
          </View>
        ) : (
          <Text style={styles.price}>{item.price.toFixed(3)} đ</Text>
        )}
      </View>
      <TouchableOpacity
        style={styles.favorite}
        onPress={() => handleFavoriteToggle(item.productId)}
      >
        <AntDesign name="heart" size={24} color="#FE724C" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {removedMessage ? (
        <View style={styles.messageContainer}>
          <Text style={styles.messageText}>{removedMessage}</Text>
        </View>
      ) : null}

      <Text style={styles.headerText}>Sản phẩm yêu thích</Text>
      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
      <FlatList
        data={items}
        keyExtractor={(item) => item.productId.toString()}
        renderItem={renderItem}
      />
    </View>
  );
};

export default Favorite;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 15,
    paddingTop: 20,
  },
  messageContainer: {
    backgroundColor: '#e2e3e5',
    padding: 10,
    marginBottom: 15,
    alignItems: 'center',
    borderRadius: 10,
  },
  messageText: {
    color: '#495057',
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerText: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
    color: '#343a40',
  },
  errorText: {
    color: '#dc3545',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 15,
  },
  details: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
  },
  priceContainer: {
    flexDirection: 'column',
  },
  originalPrice: {
    fontSize: 14,
    color: '#6c757d',
    textDecorationLine: 'line-through',
    marginTop: 4,
  },
  discountPrice: {
    fontSize: 16,
    color: '#FE724C',
    fontWeight: 'bold',
    marginTop: 2,
  },
  price: {
    fontSize: 16,
    color: '#6c757d',
    marginTop: 4,
  },
  favorite: {
    padding: 8,
  },
});