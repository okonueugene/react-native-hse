import React, { useState, useRef, useEffect, useContext } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  DrawerLayoutAndroid,
  Dimensions,
  Image
} from "react-native";
import MenuScreen from "../components/MenuScreen";
import ApiManager from "../api/ApiManager";
import { PieChart } from 'react-native-gifted-charts';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import Preloader from "../components/Preloader";
import { MainContext } from "../storage/MainContext";
import { Ionicons } from "@expo/vector-icons";
import QuickAccess from "../components/QuickAcessFooter";

const DashboardScreen = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const drawerRef = useRef(null);
  const navigation = useNavigation();
  const { state, dispatch } = useContext(MainContext);
  const [loading, setLoading] = useState(false);
  const [pieChartData, setPieChartData] = useState([]);
  const { dashboardStats } = state;

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  useEffect(() => {
    if (dashboardStats) {
      setPieChartData([
        {
          value: dashboardStats.environmental_concerns || 0,
          color: "#ff6384",
          text: 'Environmental',
          legendFontColor: "#7F7F7F",
          legendFontSize: 15,
          name: "Environmental",
        },
        {
          value: dashboardStats.icas || 0,
          color: "#36a2eb",
          text: 'ICAs',
          legendFontColor: "#7F7F7F",
          legendFontSize: 15,
          name: "ICAs",
        },
        {
          value: dashboardStats.incidents || 0,
          color: "#cc65fe",
          text: 'Incidents',
          legendFontColor: "#7F7F7F",
          legendFontSize: 15,
          name: "Incidents",
        },
        {
          value: dashboardStats.permits || 0,
          color: "#ffce56",
          text: 'Permits',
          legendFontColor: "#7F7F7F",
          legendFontSize: 15,
          name: "Permits",
        },
        {
          value: dashboardStats.personnels || 0,
          color: "#4bc0c0",
          text: 'Personnel',
          legendFontColor: "#7F7F7F",
          legendFontSize: 15,
          name: "Personnel",
        },
        {
          value: dashboardStats.sors || 0,
          color: "#ff9f40",
          text: 'SORS',
          legendFontColor: "#7F7F7F",
          legendFontSize: 15,
          name: "SORS",
        },
        {
          value: dashboardStats.tasks || 0,
          color: "#c9cbcf",
          text: 'Tasks',
          legendFontColor: "#7F7F7F",
          legendFontSize: 15,
          name: "Tasks",
        },
      ]);
    }
  }, [dashboardStats]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      const user = await AsyncStorage.getItem("user");
      console.log(token,user);

      const response = await ApiManager.get("/dashboard-stats", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.status === 200) {
        console.log(response.data);
        dispatch({ type: "SET_DASHBOARD_STATS", payload: response.data });
      } else {
        console.log("Error fetching dashboard stats");
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        alert("You are not authorized to view this page. Try logging in again.");
        await AsyncStorage.removeItem("token");
        await AsyncStorage.removeItem("user");
        navigation.navigate("Login");
      }
    } finally {
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
  const navigateToPage = route => {
    navigation.navigate(route);
    closeDrawer();
  };

  const navigationView = () => <MenuScreen closeDrawer={closeDrawer} />;

  const screenWidth = Dimensions.get("window").width;

  return (
    <View style={{ flex: 1 }}>
      <DrawerLayoutAndroid
        ref={drawerRef}
        drawerWidth={200}
        drawerPosition="left"
        renderNavigationView={navigationView}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          onTouchStart={handleOutsideTouch} // Handle touch outside drawer
          onScrollBeginDrag={handleOutsideTouch} // Handle scroll outside drawer
        >
          {loading && (
            <View style={styles.preloaderContainer}>
              <Preloader />
            </View>
          )}
          {!loading && dashboardStats && (
            <View style={styles.content}>
              {/* First Row */}
              <View style={styles.card}>
                <View style={styles.cardContentLeft}>
                  <Text style={styles.cardTitle}>Welcome Admin 🎉</Text>
                  <Text style={styles.cardSubtitle}>Site: Test</Text>
                  <Text style={styles.cardDateTime}>
                    {new Date().toLocaleString()}
                  </Text>
                  <TouchableOpacity
                    style={styles.btnPrimary}
                    onPress={() => navigateToPage("Profile")}
                  >
                    <Text style={styles.btnText}>View Profile</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.cardContentRight}>
                  <Image
                    source={require("../assets/img/avatars/1.png")}
                    style={styles.cardImage}
                    resizeMode="contain"
                  />
                </View>
              </View>
              {/* Second Row - Assigned Personnel */}
              <View style={styles.row}>
                <View style={styles.card}>
                  <View style={styles.cardContentLeft}>
                    <Text style={styles.cardTitle}>Assigned Personnel</Text>
                    <View style={styles.tableRow}>
                      <Text style={styles.tableKey}>
                        <Text style={styles.boldText}>Personnel Present: </Text>
                        {dashboardStats.personnels || "N/A"}
                      </Text>
                    </View>
                    <View style={styles.tableRow}>
                      <Text style={styles.tableKey}>
                        <Text style={styles.boldText}>Fire Marshal: </Text>
                        {dashboardStats.fire_marshal || "N/A"}
                      </Text>
                    </View>
                    <View style={styles.tableRow}>
                      <Text style={styles.tableKey}>
                        <Text style={styles.boldText}>First Aider: </Text>
                        {dashboardStats.first_aider || "N/A"}
                      </Text>
                    </View>
                    <View style={styles.tableRow}>
                      <Text style={styles.tableKey}>
                        <Text style={styles.boldText}>Supervisor: </Text>
                        {dashboardStats.supervisor || "N/A"}
                      </Text>
                    </View>
                    <View style={styles.tableRow}>
                      <Text style={styles.tableKey}>
                        <Text style={styles.boldText}>Safety Supervisor: </Text>
                        {dashboardStats.safetySupervisor || "N/A"}
                      </Text>
                    </View>
                    <View style={styles.tableRow}>
                      <Text style={styles.tableKey}>
                        <Text style={styles.boldText}>Executives: </Text>
                        {dashboardStats.executives || "N/A"}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
              {/* Third Row - Site Data Visualization */}
              <View style={styles.row}>
                <View style={styles.card}>
                  <View style={styles.chartContainer}>
                    <Text style={styles.cardTitle}>Site Data Visualization</Text>
                    <PieChart
                      isThreeD
                      data={pieChartData}
                      width={screenWidth * 0.8}
                      height={220}
                      accessor="value"
                      backgroundColor="transparent"
                      paddingLeft="15"
                    />
                    <View style={styles.legend}>
                      {pieChartData.map((entry, index) => (
                        <View key={index} style={styles.legendItem}>
                          <View style={[styles.legendColor, { backgroundColor: entry.color }]} />
                          <Text style={styles.legendText}>{entry.name}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              </View>
            </View>
          )}
     {/* Footer */}
     <View >
            <QuickAccess />
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
  footer: {
    backgroundColor: "#fff",
    padding: 10,
    marginTop: 10,
    alignItems: "center",
  },
  footerText: {
    color: "#666",
    textAlign: "center"
  },
  preloaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: "100%"
  },
  link: {
    flex: 1,
    backgroundColor: "transparent"
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    marginBottom: 10,
    flex: 1
  },
  cardContentLeft: {
    flex: 0.7,
    padding: 10
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12
  },
  cardSubtitle: {
    fontSize: 16,
    marginBottom: 10
  },
  cardDateTime: {
    fontSize: 14,
    color: "#666",
    marginBottom: 15
  },
  btnPrimary: {
    width: "70%",
    backgroundColor: "#007bff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5
  },
  btnText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold"
  },
  cardContentRight: {
    flex: 0.3,
    justifyContent: "center",
    alignItems: "center"
  },
  cardImage: {
    width: 100,
    height: 100
  },
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    width: "100%"
  },
  tableKey: {
    fontSize: 16,
    color: "#666"
  },
  boldText: {
    fontWeight: "bold",
    color: "#333",
  },
  chartContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  legend: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 10,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 5,
  },
  legendColor: {
    width: 15,
    height: 15,
    borderRadius: 7.5,
    marginRight: 5,
  },
  legendText: {
    fontSize: 12,
    color: "#333",
  },
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

export default DashboardScreen;
