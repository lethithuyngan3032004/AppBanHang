import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image } from 'react-native';
import React, { useState } from 'react';

const RestaurantItem = () => {
  const [activeRestaurant, setActiveRestaurant] = useState<number | null>(null);

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.restaurantList}>
      {restaurants.map((restaurant, index) => (
        <TouchableOpacity
          key={index}
          style={[styles.restaurantItem, activeRestaurant === index && styles.activeRestaurant]}
          onPressIn={() => setActiveRestaurant(index)}
          onPressOut={() => setActiveRestaurant(null)}
        >
          <Image source={restaurant.image} style={styles.restaurantImage} />
          
          {/* Hiển thị tên nhà hàng và số sao */}
          <View style={styles.restaurantInfo}>
            <View style={styles.restaurantRow}>
              <Text style={styles.restaurantText}>{restaurant.name}</Text>
              <View style={styles.ratingContainer}>
                <Text style={styles.restaurantStars}>{restaurant.rating}</Text>
                <Text style={styles.restaurantRating}>★</Text>
              </View>
            </View>
            <Image source={require('../../../../assets/images/freedelivery.png')} style={styles.freeDeliveryImage} />
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const restaurants = [
  { name: 'Pizza Place', rating: 3, image: require('../../../../assets/images/restaurant.png') },
  { name: 'Burger Joint', rating: 4, image: require('../../../../assets/images/restaurant.png') },
  { name: 'Sushi Bar', rating: 4.5, image: require('../../../../assets/images/restaurant.png') },
  { name: 'Salad House', rating: 4.9, image: require('../../../../assets/images/restaurant.png') },
];

export default RestaurantItem;

const styles = StyleSheet.create({
  restaurantList: {
    width: '100%',
    paddingHorizontal: 20,
  },
  restaurantItem: {
    alignItems: 'center',
    marginRight: 15,
  },
  activeRestaurant: {
    borderColor: '#FE724C',
    borderWidth: 2,
  },
  restaurantImage: {
    width: 250,
    height: 150,
    borderRadius: 10,
  },
  restaurantInfo: {
    alignItems: 'flex-start',
    marginTop: 5,
    width: '100%',
  },
  restaurantRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  restaurantText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#454545',
    marginLeft: 10,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  restaurantStars: {
    fontSize: 14,
    color: '#000',
  },
  restaurantRating: {
    fontSize: 16,
    color: '#FFD700',
    marginRight: 30,
  },
  freeDeliveryImage: {
    marginTop: 5,
    alignSelf: 'flex-start',
  },
});
