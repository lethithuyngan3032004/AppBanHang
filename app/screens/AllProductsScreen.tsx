import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, ActivityIndicator, Alert, ScrollView } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

const AllProductsScreen = ({ navigation }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('productId');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedFilter, setSelectedFilter] = useState('Mới nhất');

  const fetchAllProducts = async () => {
    try {
      const token = await AsyncStorage.getItem('jwt-token');
      if (!token) {
        throw new Error('Token không tồn tại! Vui lòng đăng nhập lại.');
      }

      const response = await axios.get('http://localhost:8080/api/public/products', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        params: {
          pageNumber: 0,
          pageSize: 20,
          sortBy,
          sortOrder,
        },
      });

      let fetchedProducts = response.data.content || [];
      if (selectedFilter === 'Khuyến mãi') {
        // Lọc sản phẩm có giá khuyến mãi thấp hơn giá gốc
        fetchedProducts = fetchedProducts.filter(product => product.specialPrice < product.price);
      }

      setProducts(fetchedProducts);
    } catch (error) {
      console.error('Lỗi khi lấy tất cả sản phẩm:', error);
      Alert.alert('Lỗi', 'Không thể lấy danh sách sản phẩm. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllProducts();
  }, [sortBy, sortOrder, selectedFilter]);

  const handleFilterPress = (filterType) => {
    setSelectedFilter(filterType);
    if (filterType === 'Khuyến mãi') {
      setSortBy('specialPrice');
      setSortOrder('desc');
    } else if (filterType === 'Mới nhất') {
      setSortBy('productId');
      setSortOrder('desc');
    } else if (filterType === 'Giá tăng') {
      setSortBy('price');
      setSortOrder('asc');
    } else if (filterType === 'Giá giảm') {
      setSortBy('price');
      setSortOrder('desc');
    }
  };

  const addToCart = async (product) => {
    // Logic thêm vào giỏ hàng
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Back Button */}
      <View style={styles.backContainer}> 
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Image source={require('../../assets/images/back.png')} style={styles.backImage} />
        </TouchableOpacity>
      </View>

      {/* Filter Options */}
      <View style={styles.filterContainer}>
        {['Khuyến mãi', 'Mới nhất', 'Giá tăng', 'Giá giảm'].map((filterType) => (
          <TouchableOpacity
            key={filterType}
            style={[
              styles.filterButton,
              selectedFilter === filterType && styles.selectedFilterButton,
            ]}
            onPress={() => handleFilterPress(filterType)}
          >
            <Text style={[
              styles.filterText,
              selectedFilter === filterType && styles.selectedFilterText,
            ]}>
              {filterType === 'Giá tăng' ? 'Giá ↑' : filterType === 'Giá giảm' ? 'Giá ↓' : filterType}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Product List */}
      {products.map((item) => (
        <View key={item.productId} style={styles.productContainer}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Details', { productId: item.productId })}
            style={styles.productItem}
          >
            <Image source={{ uri: `http://localhost:8080/api/public/products/image/${item.image}` }} style={styles.productImage} />
            <Text style={styles.productName}>{item.productName}</Text>
            {/* Hiển thị giá và giá khuyến mãi nếu có */}
            {item.specialPrice < item.price ? (
              <View style={styles.priceContainer}>
                <Text style={styles.originalPrice}>{item.price.toFixed(3)} đ</Text>
                <Text style={styles.discountPrice}>{item.specialPrice.toFixed(3)} đ</Text>
              </View>
            ) : (
              <Text style={styles.productPrice}>{item.price.toFixed(3)} đ</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.addButton} onPress={() => addToCart(item)}>
            <Image source={require('../../assets/images/add1.png')} />
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
};

export default AllProductsScreen;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
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
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    marginTop: 60,
    paddingVertical: 10,
    width: '100%',
  },
  filterButton: {
    flex: 1,
    marginHorizontal: 2,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FE724C',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  selectedFilterButton: {
    backgroundColor: '#FE724C',
  },
  filterText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FE724C',
  },
  selectedFilterText: {
    color: '#fff',
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
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  originalPrice: {
    fontSize: 12,
    color: '#888',
    textDecorationLine: 'line-through',
    marginRight: 5,
  },
  discountPrice: {
    fontSize: 12,
    color: '#FE724C',
    fontWeight: 'bold',
  },
  addButton: {
    position: 'absolute',
    bottom: -25,
    right: -5,
    padding: 5,
    elevation: 5,
  },
});
