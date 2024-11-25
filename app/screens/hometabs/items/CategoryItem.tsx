import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CategoryItem = ({ setSelectedCategory }) => {
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);

  const fetchCategories = async () => {
    try {
      const token = await AsyncStorage.getItem('jwt-token');
      if (!token) {
        throw new Error('Không có token, vui lòng đăng nhập lại!');
      }

      const response = await axios.get('http://localhost:8080/api/public/categories', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      setCategories(response.data.content);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const getCategoryImage = (categoryName) => {
    switch (categoryName) {
      case 'Pizza':
        return require('../../../../assets/images/pizza.png');
      case 'Burger':
        return require('../../../../assets/images/burger.png');
      case 'Sandwich':
        return require('../../../../assets/images/sandwich.png');
      case 'HotDog':
        return require('../../../../assets/images/hotdog.png');
      case 'Donut':
        return require('../../../../assets/images/donut.png');
      default:
        return null;
    }
  };

  return (
    <View style={styles.categoryContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryList}>
        <TouchableOpacity
          style={[styles.categoryItem, activeCategory === null && styles.activeCategory]}
          onPress={() => {
            setActiveCategory(null);
            setSelectedCategory(null); // Xóa selectedCategory để hiển thị tất cả sản phẩm
          }}
        >
          <Text style={styles.categoryText}>All</Text>
        </TouchableOpacity>

        {categories.map((category) => (
          <TouchableOpacity
            key={category.categoryId}
            style={[styles.categoryItem, activeCategory === category.categoryId && styles.activeCategory]}
            onPress={() => {
              setActiveCategory(category.categoryId);
              setSelectedCategory(category.categoryId); // Cập nhật selectedCategory khi chọn danh mục
            }}
          >
            {getCategoryImage(category.categoryName) && (
              <Image source={getCategoryImage(category.categoryName)} style={styles.categoryImage} />
            )}
            <Text style={styles.categoryText}>{category.categoryName}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default CategoryItem;

const styles = StyleSheet.create({
  categoryContainer: {
    flexDirection: 'row',
    width: '100%',
  },
  categoryList: {
    paddingHorizontal: 10,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: 15,
    padding: 10,
    borderColor: '#FE724C',
    borderWidth: 1,
    borderRadius: 50,
    width: 60,
    height: 100,
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  activeCategory: {
    backgroundColor: '#FE724C',
  },
  categoryText: {
    marginTop: 5,
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#454545',
  },
  categoryImage: {
    width: 50,
    height: 50,
    borderRadius: 10,
    marginBottom: 5,
  },
});
