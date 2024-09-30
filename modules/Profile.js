import React, {useState, useEffect} from 'react';
import {View, Text, Image, StyleSheet, SafeAreaView} from 'react-native';
import QuickAccess from '../components/QuickAcessFooter';
import ApiManager from '../api/ApiManager';
import Preloader from '../components/Preloader';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Profile = () => {
  const [user, setUser] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUser();
  }, []);

  // Fetch user data and activities
  const fetchUser = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await  ApiManager.get('/profile', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.data) {
        throw new Error('No data returned');
      }
      
      console.log(response.data);
      setUser(response.data.user);
      setActivities(response.data.activities);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setError(error);
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Card 1: Profile Picture and Details */}
        <View style={styles.card}>
          <View style={styles.propicArea}>
            <Image
              source={require('../images/Opticom_Logo.png')}
              style={styles.propic}
            />
          </View>
          <Text style={styles.name}>
            {user.name ? user.name : 'Not available'}
          </Text>
          <Text style={styles.membership}>
            Email: {user.email ? user.email : 'Not available'}
          </Text>
          <Text style={styles.membership}>
            Status: {user.is_active ? 'Active' : 'Inactive'}
          </Text>
          <Text style={styles.membership}>
            Phone: {user.contact ? user.contact : 'Not available'}
          </Text>
        </View>

        {/* Card 2: Activities Table */}
        <View style={styles.card}>
          <Text style={styles.activitiesTitle}>Recent Activities</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderText}>Activity</Text>
              <Text style={styles.tableHeaderText}>Date</Text>
            </View>
            {activities.map((activity, index) => (
              <View style={styles.tableRow} key={index}>
                <Text style={styles.tableData}>{activity.description}</Text>
                <Text style={styles.tableData}>
                  {new Date(activity.created_at).toLocaleDateString('en-US')}
                </Text>
              </View>
            ))}
          </View>
        </View>
        <View style={styles.footer}>
          <QuickAccess />
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  safeArea: {
    flex: 1,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginVertical: 10,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  propicArea: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    alignSelf: 'center',
    borderColor: '#ccc',
  },
  propic: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 10,
    color: '#000',
    textAlign: 'center',
  },
  membership: {
    marginTop: 5,
    color: '#000',
    fontSize: 16,
    textAlign: 'center',
  },
  activitiesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#000',
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingBottom: 5,
    alignItems: 'flex-start',
  },
  tableHeaderText: {
    fontWeight: 'bold',
    color: '#000',
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tableData: {
    color: '#000',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
});

export default Profile;
