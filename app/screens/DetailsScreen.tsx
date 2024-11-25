import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Detail = ({ route, navigation }) => {
  const { productId } = route.params;
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteMessage, setFavoriteMessage] = useState(null);

  // Lấy thông tin sản phẩm
  const fetchProduct = async () => {
    try {
      const token = await AsyncStorage.getItem('jwt-token');
      if (!token) {
        Alert.alert('Lỗi', 'Token không tồn tại. Vui lòng đăng nhập lại.');
        return;
      }

      const response = await axios.get(`http://localhost:8080/api/public/products/${productId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      setProduct(response.data);
      setIsFavorite(response.data.discount === 1);
    } catch (error) {
      console.error('Error fetching product details:', error);
      setError('Không thể tải thông tin sản phẩm. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  // Thêm vào giỏ hàng
  const addToCart = async () => {
    try {
      const token = await AsyncStorage.getItem('jwt-token');
      const email = await AsyncStorage.getItem('email');
      const cartId = await AsyncStorage.getItem('userId');
  
      if (!token || !email || !cartId) {
        Alert.alert('Lỗi', 'Thông tin người dùng không đầy đủ. Vui lòng đăng nhập lại.');
        return;
      }
  
      // Kiểm tra xem sản phẩm đã tồn tại trong giỏ hàng chưa
      const checkResponse = await axios.get(
        `http://localhost:8080/api/public/users/${encodeURIComponent(email)}/carts/${cartId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
  
      const existingProduct = checkResponse.data.products.find(item => item.productId === productId);
      const availableQuantity = checkResponse.data.products.find(item => item.productId === productId)?.availableQuantity;
  
      if (existingProduct) {
        // Cộng dồn số lượng nếu sản phẩm đã tồn tại
        const newQuantity = existingProduct.quantity + quantity;
  
        // Kiểm tra số lượng tồn kho trước khi cập nhật
        if (newQuantity > availableQuantity) {
          Alert.alert('Lỗi', `Số lượng tối đa còn lại là ${availableQuantity}.`);
          return;
        }
  
        await axios.put(
          `http://localhost:8080/api/public/carts/${cartId}/products/${productId}/quantity/${newQuantity}`,
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
        // Nếu sản phẩm chưa tồn tại trong giỏ hàng, thêm mới
        if (quantity > availableQuantity) {
          Alert.alert('Lỗi', `Số lượng tối đa còn lại là ${availableQuantity}.`);
          return;
        }
  
        await axios.post(
          `http://localhost:8080/api/public/carts/${cartId}/products/${productId}/quantity/${quantity}`,
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
  
      navigation.navigate('Cart');
    } catch (error) {
      console.error('Lỗi khi thêm sản phẩm vào giỏ hàng:', error.response?.data || error.message);
      if (error.response?.data?.message) {
        Alert.alert('Lỗi', error.response.data.message);
      } else {
        Alert.alert('Lỗi', 'Không thể thêm sản phẩm vào giỏ hàng. Vui lòng thử lại sau.');
      }
    }
  };

  // Chuyển đổi trạng thái yêu thích
  const toggleFavorite = async () => {
    try {
      const token = await AsyncStorage.getItem('jwt-token');
      if (!token) {
        Alert.alert('Lỗi', 'Token không tồn tại. Vui lòng đăng nhập lại.');
        return;
      }

      const updatedProduct = {
        ...product,
        discount: isFavorite ? 0 : 1,
      };

      const response = await axios.put(`http://localhost:8080/api/admin/products/${productId}`, updatedProduct, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        setIsFavorite(!isFavorite);
        setFavoriteMessage(isFavorite ? 'Đã bỏ yêu thích sản phẩm' : 'Đã yêu thích sản phẩm');
      }
    } catch (error) {
      console.error('Error updating favorite status:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật trạng thái yêu thích. Vui lòng thử lại sau.');
    }
  };

  const handleFavoriteMessagePress = () => {
    setFavoriteMessage(null);
    navigation.navigate('Favorite');
  };

  const increaseQuantity = () => setQuantity(prev => prev + 1);
  const decreaseQuantity = () => quantity > 1 && setQuantity(prev => prev - 1);

  if (loading) {
    return <ActivityIndicator size="large" color="#FE724C" style={styles.loading} />;
  }

  if (error) {
    return <Text style={styles.errorText}>{error}</Text>;
  }

  if (!product) {
    return <Text>Product not found.</Text>;
  }

  return (
    <View style={styles.container}>
      {favoriteMessage && (
        <TouchableOpacity style={styles.favoriteMessageContainer} onPress={handleFavoriteMessagePress}>
          <Text style={styles.favoriteMessageText}>{favoriteMessage}</Text>
        </TouchableOpacity>
      )}

      <View style={styles.backContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Image source={require('../../assets/images/back.png')} style={styles.backImage} />
        </TouchableOpacity>
      </View>

      <Image 
        source={{ uri: `http://localhost:8080/api/public/products/image/${product.image}` }} 
        style={styles.productImage} 
      />

      <View style={styles.productInfoContainer}>
        <View style={styles.productHeader}>
          <Text style={styles.productName}>{product.productName}</Text>
          <TouchableOpacity onPress={toggleFavorite}>
            <Icon name={isFavorite ? 'heart' : 'heart-o'} size={30} color={isFavorite ? '#FE724C' : '#888'} />
          </TouchableOpacity>
        </View>

       
      </View>

      <View style={styles.priceQuantityWrapper}>
        <View style={styles.priceContainer}>
          {product.specialPrice < product.price ? (
            <>
              <Text style={styles.originalPrice}>{product.price.toFixed(3)}đ</Text>
              <Text style={styles.discountPrice}>{product.specialPrice.toFixed(3)}đ</Text>
            </>
          ) : (
            <Text style={styles.productPrice}>{product.price.toFixed(3)}đ</Text>
          )}
        </View>

        <View style={styles.quantityContainer}>
          <TouchableOpacity style={styles.quantityButton} onPress={decreaseQuantity}>
            <Text style={styles.quantityButtonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.quantityText}>{quantity}</Text>
          <TouchableOpacity style={styles.quantityButton} onPress={increaseQuantity}>
            <Text style={styles.quantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.productDetails}>
        {product.description}
      </Text>

      <View style={styles.addCartContainer}>
        <TouchableOpacity style={styles.addCartButton} onPress={addToCart}>
          <Text style={styles.addCartButtonText}>Thêm vào giỏ hàng</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Detail;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    justifyContent: 'space-between',
  },
  favoriteMessageContainer: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    marginBottom: 15,
    alignItems: 'center',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  favoriteMessageText: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
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
  productImage: {
    width: '100%',
    height: 300,
    borderRadius: 10,
    marginBottom: 20,
  },
  productInfoContainer: {
    marginBottom: 10,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'left',
  },
  productDetails: {
    fontSize: 16,
    color: '#555',
    textAlign: 'left',
    marginTop: 20,
  },
  ratingContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginBottom: 10,
  },
  ratingText: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingValue: {
    fontSize: 16,
    color: '#141414',
    fontWeight: 'bold',
    marginRight: 5,
  },
  starImage: {
    width: 24,
    height: 24,
    marginTop: 10,
  },
  priceQuantityWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  originalPrice: {
    fontSize: 18,
    color: '#888',
    textDecorationLine: 'line-through',
    marginBottom: 5,
  },
  discountPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FE724C',
  },
  productPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FE724C',
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
    width: 45,
    height: 45,
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
  addCartContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  addCartButton: {
    backgroundColor: '#FE724C',
    paddingVertical: 15,
    paddingHorizontal: 90,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  addCartButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
});