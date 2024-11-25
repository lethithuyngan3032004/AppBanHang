import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import LottieView from 'lottie-react-native'; // Import LottieView

const CheckoutScreen = ({ navigation }: { navigation: any }) => {
  return (
    <View style={styles.container}>
      <LottieView
        source={require('../../assets/success.json')} // Đường dẫn tới success.json
        autoPlay
        loop={true} // Đặt thuộc tính loop thành true để lặp lại không dừng
        style={styles.lottieAnimation}
      />
      <Text style={styles.headerText}>Checkout Success!</Text>
      <Text style={styles.infoText}>Your order has been placed successfully!</Text>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Cart')}>
        <Text style={styles.buttonText}>BACK TO CART</Text>
      </TouchableOpacity>
    </View>
  );
};

export default CheckoutScreen;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lottieAnimation: {
    width: 150,
    height: 150,
    marginBottom: 30,
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  infoText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#FE724C',
    padding: 15,
    borderRadius: 5,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
