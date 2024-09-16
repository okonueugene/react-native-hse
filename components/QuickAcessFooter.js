import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get('window');


const QuickAccess = () => {
    const navigation = useNavigation(); 
      //handle navigation to pages
      const navigateToPage = route => {
        navigation.navigate(route);
      };

  return (
    <View style={styles.quickAccess}>
    <TouchableOpacity style={styles.quickAccessButton} onPress={() => navigateToPage("Dashboard")}>
      <Ionicons name="home" size={24} color="#fff" />
      <Text style={styles.quickAccessText}>Home</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.quickAccessButton} onPress={() => navigateToPage("Dashboard")}>
      <Ionicons name="apps" size={24} color="#fff" />
      <Text style={styles.quickAccessText}>Quick Access</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.quickAccessButton} onPress={() => navigateToPage("Dashboard")}>
      <Ionicons name="person" size={24} color="#fff" />
      <Text style={styles.quickAccessText}>Profile</Text>
    </TouchableOpacity>
  </View>  );
};

const styles = StyleSheet.create({
    quickAccess: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 10,
        backgroundColor: '#007bff',
        height: 60,
      },
      quickAccessButton: {
        flex: 1,
        alignItems: 'center',
        padding: 8,
        backgroundColor: '#007bff',
        borderRadius: 5,
        marginHorizontal: 5,
        justifyContent: 'center', // Aligns icon and text vertically
      },
      quickAccessText: {
        color: '#fff',
        fontSize: 10,
        marginTop: 5, // Space between icon and text
      },
});

export default QuickAccess;
