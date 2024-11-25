import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import Swiper from 'react-native-swiper';
import ProductItem from './items/ProductItem';
import CategoryItem from './items/CategoryItem';
import Toast from 'react-native-toast-message';

const Feed = ({ navigation }) => {
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const banners = [
    require('../../../assets/images/banner1.webp'),
    require('../../../assets/images/banner2.webp'),
    require('../../../assets/images/banner3.jpg'),
  ];

  // Hàm xử lý khi chọn một danh mục
  const handleSelectCategory = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image source={require('../../../assets/images/header1.png')} style={{ width: 80, height: 80 }} />
        <View style={styles.headerCenter}>
          <Image source={require('../../../assets/images/header2.png')} style={{ marginTop: -20 }} />
          <Text style={styles.cityText}>Thành phố Hồ Chí Minh</Text>
        </View>
        <Image source={require('../../../assets/images/header3.png')} style={{ width: 70, height: 70 }} />
      </View>

      {/* Banner Carousel */}
      <View style={styles.bannerContainer}>
        <Swiper autoplay={true} autoplayTimeout={3} showsPagination={true} dotColor="#d3d3d3" activeDotColor="#FE724C">
          {banners.map((banner, index) => (
            <Image key={index} source={banner} style={styles.bannerImage} />
          ))}
        </Swiper>
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Image source={require('../../../assets/images/search.png')} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, focusedInput === 'search' && { borderColor: '#FE724C' }]}
          placeholder="Tìm kiếm món ăn hoặc nhà hàng"
          placeholderTextColor="#8e8b8b"
          onFocus={() => setFocusedInput('search')}
          onBlur={() => setFocusedInput(null)}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Categories List */}
      <View style={styles.popularItemsHeader}>
        <Text style={styles.popular}>Danh mục nổi bật</Text>
      </View>
      <CategoryItem setSelectedCategory={handleSelectCategory} /> {/* Truyền hàm xử lý danh mục */}

      <View style={styles.popularItemsHeader}>
        <Text style={styles.popular}>Món ăn phổ biến</Text>
        <TouchableOpacity onPress={() => navigation.navigate('AllProducts')}>
          <Image source={require('../../../assets/images/viewall.png')} />
        </TouchableOpacity>      
      </View>

      {/* Products List */}
      <ProductItem selectedCategory={selectedCategory} searchQuery={searchQuery} /> {/* Truyền selectedCategory và searchQuery */}

      {/* Toast component to display notifications */}
      <Toast />
    </ScrollView>
  );
};

export default Feed;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flexGrow: 1,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '95%',
    marginTop: 20,
  },
  headerCenter: {
    alignItems: 'center',
  },
  cityText: {
    marginTop: 5,
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FE724C',
    textAlign: 'center',
  },
  bannerContainer: {
    width: '90%',
    height: 200,
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 20,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '90%',
    height: 50,
    borderColor: '#D0D2D1',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    backgroundColor: '#fdfbfb',
    marginVertical: 20,
  },
  searchIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  popular: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#454545',
  },
  popularItemsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '90%',
    marginVertical: 20,
  },
});
