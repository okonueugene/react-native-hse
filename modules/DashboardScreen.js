import React, { useState, useRef, useEffect, useContext } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  DrawerLayoutAndroid
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MenuScreen from "../components/MenuScreen";
import ApiManager from "../api/ApiManager";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import Preloader from "../components/Preloader";
import { MainContext } from "../storage/MainContext";


const DashboardScreen = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const drawerRef = useRef(null);
  const navigation = useNavigation();
  const { state, dispatch } = useContext(MainContext);
  const [loading, setLoading] = useState(false);
  const { dashboardStats } = state;

  useEffect(() => {

    fetchDashboardStats();

  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      // Fetch api token
      const token = await AsyncStorage.getItem("token");
      console.log(token);

      // Fetch dashboard stats
      const response = await ApiManager.get("/dashboard-stats", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // setDashboardStats(response.data);

      if (response.status === 200) {
        console.log(response.data);
        dispatch({ type: "SET_DASHBOARD_STATS", payload: response.data });
      } else {
        console.log("Error fetching dashboard stats");
      }
    } catch (error) {
      if (error.response.status === 401) {
        alert("You are not authorized to view this page try logging in again");
        //remove token from async storage
        await AsyncStorage.removeItem("token");
        await AsyncStorage.removeItem("user");
        //redirect to dashboard page
        navigation.navigate("Login");
      }
    }
    finally {
      setLoading(false);
    }
  };


  const handleOutsideTouch = () => {
    closeDrawer(); // Close the drawer when touched outside
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    drawerRef.current.closeDrawer();
  };

  //handle navigation to pages
  const navigateToPage = (route) => {
    navigation.navigate(route);
    closeDrawer();
  };

  const navigationView = () => <MenuScreen closeDrawer={closeDrawer} />;



  return (

    <View style={{ flex: 1 }}>
      <DrawerLayoutAndroid
        ref={drawerRef}
        drawerWidth={200}
        drawerPosition="left"
        renderNavigationView={navigationView}
      >
        {/* Wrap the content in a ScrollView */}
        <ScrollView
          contentContainerStyle={styles.container}
          onTouchStart={handleOutsideTouch} // Handle touch outside drawer
          onScrollBeginDrag={handleOutsideTouch} // Handle scroll outside drawer
        >
          {/* Content */}
          {/* Render the preloader if loading */}
          {loading && (
            <View style={styles.preloaderContainer}>
              <Preloader />
            </View>
          )}
          {/* Render the dashboard content */}
          {!loading && dashboardStats && (
            <View style={styles.content}>
              {/* First Row */}
              <View style={styles.row}>
                <View style={styles.card}>
                <TouchableOpacity style={styles.link} onPress={() => navigateToPage("Dashboard")}>
                  <Text style={styles.cardHeader}>Site Name</Text>
                  <View style={styles.cardBody}>
                    <Text style={styles.cardContent}>Test</Text>
                  </View>
                  <Text style={styles.cardFooter}></Text>
                  </TouchableOpacity>
                </View>
                {/* Add other cards here */}
                <View style={styles.card}>
                  <TouchableOpacity style={styles.link} onPress={() => navigateToPage("Supervisor")}>
                  <Text style={styles.cardHeader}>Supervisor’s Detail</Text>
                  <View style={styles.cardBody}>
                    <Text style={styles.cardContent}>{dashboardStats?.supervisor}</Text>
                  </View>
                  <Text style={styles.cardFooter}></Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.card}>
                  <TouchableOpacity style={styles.link} onPress={() => navigateToPage("First Responder")}>
                  <Text style={styles.cardHeader}>Fire Marshal’s Detail</Text>
                  <View style={styles.cardBody}>
                    <Text style={styles.cardContent}>{dashboardStats?.fire_marshal}</Text>
                  </View>
                  <Text style={styles.cardFooter}></Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.card}>
                  <TouchableOpacity style={styles.link} onPress={() => navigateToPage("First Responder")}>
                  <Text style={styles.cardHeader}>First Aider’s Detail</Text>
                  <View style={styles.cardBody}>
                    <Text style={styles.cardContent}>{dashboardStats?.first_aider}</Text>
                  </View>
                  <Text style={styles.cardFooter}></Text>
                  </TouchableOpacity>
                </View>
              </View>
              {/* Second Row */}
              <View style={styles.row}>
                <View style={styles.card}>
                  <TouchableOpacity style={styles.link} onPress={() => navigateToPage("Personnel")}>
                  <Text style={styles.cardHeader}>
                    Live Number Of People On Site
                  </Text>
                  <View style={styles.cardBody}>
                    <Text style={styles.cardContent}>{dashboardStats?.personells}</Text>
                  </View>
                  <Text style={styles.cardFooter}></Text>
                  </TouchableOpacity>
                </View>
                {/* Add other cards here */}
                <View style={styles.card}>
                  <TouchableOpacity style={styles.link} onPress={() => navigateToPage("Tasks")}>
                  <Text style={styles.cardHeader}>Tasks Of The Day</Text>
                  <View style={styles.cardBody}>
                    <Text style={styles.cardContent}>{dashboardStats?.tasks}</Text>
                  </View>
                  <Text style={styles.cardFooter}></Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.card}>
                  <TouchableOpacity style={styles.link} onPress={() => navigateToPage("Open Incidents")}>
                  <Text style={styles.cardHeader}>Incidents Recorded</Text>
                  <View style={styles.cardBody}>
                    <Text style={styles.cardContent}>{dashboardStats?.incidents}</Text>
                  </View>
                  <Text style={styles.cardFooter}></Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.card}>
                  <TouchableOpacity style={styles.link} onPress={() => navigateToPage("View Ica")}>
                  <Text style={styles.cardHeader}>Immediate Corrective Actions</Text>
                  <View style={styles.cardBody}>
                    <Text style={styles.cardContent}>{dashboardStats?.icas}</Text>
                  </View>
                  <Text style={styles.cardFooter}></Text>
                  </TouchableOpacity>
                </View>
              </View>
              {/* Third Row */}
              <View style={styles.row}>
                <View style={styles.card}>
                  <TouchableOpacity style={styles.link} onPress={() => navigateToPage("Open Sors")}>
                  <Text style={styles.cardHeader}>Safety Observation Record</Text>
                  <View style={styles.cardBody}>
                    <Text style={styles.cardContent}>{dashboardStats?.sors}</Text>
                  </View>
                  <Text style={styles.cardFooter}></Text>
                  </TouchableOpacity>
                </View>
                {/* Add other cards here */}
                <View style={styles.card}>
                  <TouchableOpacity style={styles.link} onPress={() => navigateToPage("Environmental Concerns")}>
                  <Text style={styles.cardHeader}>Environmental Concerns</Text>
                  <View style={styles.cardBody}>
                    <Text style={styles.cardContent}>{dashboardStats?.environmental_concerns}</Text>
                  </View>
                  <Text style={styles.cardFooter}></Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.card}>
                  <TouchableOpacity style={styles.link} onPress={() => navigateToPage("Permits Applicable")}>
                  <Text style={styles.cardHeader}>Permits Applicable</Text>
                  <View style={styles.cardBody}>
                    <Text style={styles.cardContent}>{dashboardStats?.permits}</Text>
                  </View>
                  <Text style={styles.cardFooter}></Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              © 2024 OptiSafe Ltd. All rights reserved.
            </Text>
          </View>
        </ScrollView>
      </DrawerLayoutAndroid>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1
  },
  menu: {
    padding: 10,
    backgroundColor: "#fff",
    position: "absolute",
    zIndex: 1,
    marginBottom: 10
  },
  content: {
    paddingHorizontal: 10,
    paddingTop: 10,
    marginTop: 40
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20
  },
  card: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 5,
    marginBottom: 15
  },
  cardHeader: {
    fontSize: 13,
    fontWeight: "bold",
    marginBottom: 5,
    textAlign: "center"
  },
  cardBody: {
    marginBottom: 10
  },
  cardContent: {
    fontSize: 14,
    textAlign: "center"
  },
  cardFooter: {
    fontSize: 14,
    color: "#666"
  },
  footer: {
    backgroundColor: "#fff",
    padding: 10,
    marginTop: 10,
    alignItems: "center"
  },
  footerText: {
    color: "#666",
    textAlign: "center"
  },
  preloaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  link: {
   flex: 1,
   backgroundColor:"transparent"
  }
});

export default DashboardScreen;
