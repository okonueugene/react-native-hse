import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  DrawerLayoutAndroid,
  StyleSheet,
  Button
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MenuScreen from "../components/MenuScreen";
import ApiManager from "../api/ApiManager";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Preloader from "../components/Preloader";
import { useNavigation } from "@react-navigation/native";


const ViewConcernModal = ({ concern, onClose, visible }) => {
  if (!visible || !concern) {
    return null;
  }

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <ScrollView style={styles.modalScrollView}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>View Concern</Text>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                {/* Replace with an icon component if desired */}
                <Text>X</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <Text style={styles.label}>Added By:</Text>
              <TextInput
                style={styles.textInput}
                value={concern.user.name}
                editable={false}
              />
              <Text style={styles.label}>Concern Type:</Text>
              <TextInput
                style={styles.textInput}
                value={concern.type}
                editable={false}
              />
              <Text style={styles.label}>Comment:</Text>
              <TextInput
                style={styles.textInput}
                value={concern.comments}
                editable={false}
                multiline={true}
              />
              <Text style={styles.label}>Corrective Actions:</Text>
              {Object.keys(concern.corrective_actions || {}).map((key, index) => (
                <TextInput
                  key={index}
                  style={styles.textInput}
                  value={concern.corrective_actions[key]}
                  editable={false}
                  multiline={true}
                />
              ))}
              <Text style={styles.label}>Status:</Text>
              <TextInput
                style={styles.textInput}
                value={concern.status}
                editable={false}
              />
              <Text style={styles.label}>Auditor:</Text>
              <TextInput
                style={styles.textInput}
                value={concern.auditor}
                editable={false}
              />
              <Text style={styles.label}>Project Manager:</Text>
              <TextInput
                style={styles.textInput}
                value={concern.project_manager}
                editable={false}
              />
            </View>
            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Text>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </Modal>
  );
};




const EnvironmentalConcernsScreen = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const drawerRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [concerns, setConcerns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedConcern, setSelectedConcern] = useState(null);
  const [isViewConcernModalOpen, setIsViewConcernModalOpen] = useState(false);

  const navigation = useNavigation();


  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
    if (!isDrawerOpen) {
      drawerRef.current.openDrawer();
    } else {
      drawerRef.current.closeDrawer();
    }
  };

  const handleOutsideTouch = () => {
    closeDrawer(); // Close the drawer when touched outside
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    drawerRef.current.closeDrawer();
  };

  const fetchConcerns = async () => {
    setLoading(true);
    try {
      // Retrieve token from local storage
      const token = await AsyncStorage.getItem("token");

      // Fetch tasks for the current page
      const response = await ApiManager.get("/environmental-policy", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Handle the response
      if (response.status === 200) {
        // Set the open SORs
        setConcerns(response.data);
        // Set loading to false
        setLoading(false);
      } else {
        // Handle error
        console.error(response.data);
      }
    } catch (error) {
      setLoading(false);
      if (error.response.status === 401) {

        alert("You are not authorized to view this page try logging in again");

        //remove token from async storage

        await AsyncStorage.removeItem("token");

        await AsyncStorage.removeItem("user");

        //redirect to dashboard page

        navigation.navigate("Dashboard");

      }

    }
  }

  useEffect(() => {
    fetchConcerns();
  }, []);

  const navigationView = () => <MenuScreen closeDrawer={closeDrawer} />;

  const totalPages = Math.ceil(concerns.length / itemsPerPage);

  const handleNextPage = () => {
    setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    setCurrentPage(currentPage - 1);
  };

  //handle view concern
  const handleViewConcern = (concern) => {
    setSelectedConcern(concern);
    setIsViewConcernModalOpen(true);
  };

  const renderConcerns = () => {
    return concerns && concerns.length > 0 ? (
      concerns
        .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
        .map((concern) => (
          <View
            key={concern.id}
            style={{
              flexDirection: "row",
              borderBottomWidth: 1,
              borderBottomColor: "#ccc",
              paddingVertical: 8
            }}
          >
            <Text style={[styles.column, { flex: 2, marginRight: 16 }]}>
              {concern.type}
            </Text>
            <Text style={[styles.column, { flex: 2, marginRight: 16 }]}>
              {concern.user.name}
            </Text>
            <TouchableOpacity
              style={{
                backgroundColor: "#007bff",
                padding: 4,
                borderRadius: 5,
                marginRight: 16,
                justifyContent: "center",
                alignItems: "center",
                height: 30
              }}
              onPress={() => handleViewConcern(concern)}
            >
              <Text style={{ color: "#fff" }}>View</Text>
            </TouchableOpacity>
          </View>
        ))
    ) : (
      <Text style={{ textAlign: "center", padding: 10 }}>
        No Concerns found
      </Text>
    );
  };

  return (
    <DrawerLayoutAndroid
      ref={drawerRef}
      drawerWidth={200}
      drawerPosition="left"
      renderNavigationView={navigationView}
    >
      <View style={{ flex: 1 }}>
        {/* Wrap the content in a ScrollView */}
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          onTouchStart={handleOutsideTouch} // Handle touch outside drawer
          onScrollBeginDrag={handleOutsideTouch} // Handle scroll outside drawer
        >
          {/* <TouchableOpacity style={styles.menu} onPress={toggleDrawer}>
            <Ionicons name="menu" size={24} color="black" />
          </TouchableOpacity> */}
          {/* Header */}
          <Text style={styles.title}>Enviromental Concerns</Text>
          <View style={{ flex: 1, padding: 10 }}>
            {/* Render the preloader if loading */}
            {loading && (
              <View style={styles.preloaderContainer}>
                <Preloader />
              </View>
            )}
            {!loading && (
              <>
                <View
                  style={{
                    flexDirection: "row",
                    borderBottomWidth: 1,
                    borderBottomColor: "#ccc"
                  }}
                >
                  <Text style={[styles.heading, styles.column]}>Concern Type</Text>
                  <Text style={[styles.heading, styles.column]}>Added By</Text>
                  <Text style={[styles.heading, styles.column]}>Action</Text>
                </View>
                {/* Render concerns here */}
                {renderConcerns()}
                {/* Pagination controls */}
                <View
                  style={{ flexDirection: "row", justifyContent: "center" }}
                >
                  <TouchableOpacity
                    style={styles.paginationButton}
                    onPress={handlePrevPage}
                    disabled={currentPage === 1}
                  >
                    <Text>Previous</Text>
                  </TouchableOpacity>
                  <Text style={styles.pageIndicator}>
                    Page {currentPage} of {totalPages}
                  </Text>
                  <TouchableOpacity
                    style={styles.paginationButton}
                    onPress={handleNextPage}
                    disabled={currentPage === totalPages}
                  >
                    <Text>Next</Text>
                  </TouchableOpacity>
                </View>
                {/* View Concern Modal */}
                <ViewConcernModal
                  visible={isViewConcernModalOpen}
                  concern={selectedConcern}
                  onClose={() => setIsViewConcernModalOpen(false)}
                />
              </>
            )}
          </View>
          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              © 2024 OptiSafe Ltd. All rights reserved.
            </Text>
          </View>
        </ScrollView>
      </View>
    </DrawerLayoutAndroid>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10
  },
  menu: {
    position: "absolute",
    top: 10,
    left: 10
  },
  addButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#007bff",
    padding: 5,
    borderRadius: 5
  },
  title: {
    fontSize: 24,
    textAlign: "center",
    marginVertical: 10
  },
  heading: {
    fontWeight: "bold",
    padding: 10,
    textAlign: "center"
  },
  column: {
    flex: 1,
    padding: 10
  },
  text: {
    textAlign: "center"
  },
  paginationButton: {
    padding: 8,
    marginHorizontal: 5,
    backgroundColor: "#007bff",
    borderRadius: 5
  },
  pageIndicator: {
    padding: 8,
    marginHorizontal: 5,
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
  crollView: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)"
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    width: "100%",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "100%"
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold"
  },
  closeButton: {
    padding: 5,
    borderRadius: 5,
    backgroundColor: "#f41313"
  },
  modalBody: {
    marginBottom: 15
  },
  label: {
    fontSize: 16,
    marginBottom: 5
  },
  textInput: {
    padding: 10,
    backgroundColor: "#eee",
    color: "#000",
    borderRadius: 5,
    marginBottom: 15
  },
  mediaContainer: {
    marginBottom: 15
  },
  mediaLabel: {
    fontSize: 16,
    marginBottom: 5
  },
  mediaImage: {
    //calculate the width of the image based on the screen width
    width: "100%",
    height: 200,
    marginBottom: 5
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "flex-end"
  }
});

export default EnvironmentalConcernsScreen;

