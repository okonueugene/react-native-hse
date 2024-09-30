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
  ActivityIndicator
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import MenuScreen from "../components/MenuScreen";
import ApiManager from "../api/ApiManager";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Preloader from "../components/Preloader";
import config from "../config/config";
import { Picker } from "@react-native-picker/picker";
import { useNavigation } from "@react-navigation/native";
import QuickAccess from "../components/QuickAcessFooter";


const SupervisorDetailModal = ({ supervisor, isVisible, onClose }) => {
  if (!isVisible) {
    return null;
  }


  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <ScrollView style={styles.modalScrollView}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>View Supervisor</Text>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                {/* Replace with an icon component if desired */}
                <Text>X</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <Text style={styles.label}> Name</Text>
              <TextInput
                style={styles.textInput}
                value={supervisor.name}
                editable={false}
              />
              <Text style={styles.label}>Designation</Text>
              <TextInput
                style={styles.textInput}
                value={supervisor.designation}
                editable={false}
              />
              <Text style={styles.label}>Date Added</Text>
              <TextInput
                style={styles.textInput}
                value={supervisor.date}
                editable={false}
              />
              <Text style={styles.label}>Added By</Text>
              <TextInput
                style={styles.textInput}
                value={supervisor.user.name}
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

const AddSupervisorModal = ({ isVisible, onClose, retrieveSupervisors }) => {
  if (!isVisible) {
    return null;
  }

  const [name, setName] = useState("");
  const [designation, setDesignation] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleFormData = async () => {
    if (name === "" || designation === "") {
      alert("Please fill all fields");
      return;
    }

  // Prepare data as JSON object
  const formData = {
    name,
    designation
  };
    console.log(formData);

    onsubmit(formData);

  };

  const onsubmit = async (formData) => {
    setIsLoading(true);
    try {
      // Fetch token from async storage
      const token = await AsyncStorage.getItem("token");

      // Make a POST request to add supervisor
      const response = await ApiManager.post("/supervisor", formData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.status === 200) {
        alert("Supervisor added successfully");
        retrieveSupervisors();
        onClose();
      }
    }
    catch (error) {
      console.log(error.response.message);
      alert("Error adding supervisor");
    }
    finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal visible={isVisible} animationType="slide">
      <View style={{ flex: 1 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            padding: 10
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: "bold" }}>Add Supervisor</Text>
          <TouchableOpacity onPress={onClose}>
            <Text>Close</Text>
          </TouchableOpacity>
        </View>
        <View style={{ paddingHorizontal: 10 }}>
          <View style={{ marginBottom: 10 }}>
            <Text>Name</Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: "#ccc",
                borderRadius: 5,
                padding: 5,
                color: "#000"
              }}
              value={name}
              onChangeText={(text) => setName(text)}
            />
          </View>
          <View>
            <Text>Designation</Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: "#ccc",
                borderRadius: 5,
                padding: 5,
                color: "#000"
              }}
              value={designation}
              onChangeText={(text) => setDesignation(text)}
            />
          </View>
          <TouchableOpacity
            style={{
              backgroundColor: "blue",
              padding: 10,
              borderRadius: 5,
              alignItems: "center",
              marginTop: 10
            }}
            onPress={handleFormData}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={{ color: "white" }}>Add Supervisor</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

};

const SupervisorScreen = () => {
  const [supervisors, setSupervisors] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAddSupervisorModalVisible, setIsAddSupervisorModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [selectedSupervisor, setSelectedSupervisor] = useState(null);
  const [isSupervisorDetailModalVisible, setIsSupervisorDetailModalVisible] = useState(false);

  const drawerRef = useRef(null);

  const navigation = useNavigation();

  useEffect(() => {
    retrieveSupervisors();
  }, []);

  const retrieveSupervisors = async () => {
    setIsLoading(true);
    try {
      // Fetch token from async storage
      const token = await AsyncStorage.getItem("token");
  
      // Make a GET request to fetch supervisors
      const response = await ApiManager.get("/supervisor", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
  
      if (response.status === 200) {
        // Extract the data array from the response
        const supervisorsData = response.data.data.data;
        
        // Ensure supervisorsData is an array
        if (Array.isArray(supervisorsData)) {
          setSupervisors(supervisorsData);
        } else {
          console.error("Unexpected data format", supervisorsData);
          setSupervisors([]);
        }
      }
    } catch (error) {
      console.log(error);
      if (error.response && error.response.status === 401) {
        alert("You are not authorized to view this page try logging in again");
  
        // Remove token from async storage
        await AsyncStorage.removeItem("token");
        await AsyncStorage.removeItem("user");
  
        // Redirect to dashboard page
        navigation.navigate("Dashboard");
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  

const deleteSupervisor = async (id) => {
  try {
    // Fetch token from async storage
    const token = await AsyncStorage.getItem("token");

    // url = "/delete-supervisor/{id}";

    // Make a DELETE request to delete supervisor
    const response = await ApiManager.delete(`/supervisor/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (response.status === 200) {
      alert("Supervisor deleted successfully");
      retrieveSupervisors();
    }

  } catch (error) {
    console.log(error);
    if (error.response && error.response.status === 401) {
      alert("You are not authorized to view this page try logging in again");
    }
  }
};



  const handleOutsideTouch = () => {

    closeDrawer();
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    drawerRef.current.closeDrawer();
  };

  const navigationView = () => <MenuScreen closeDrawer={closeDrawer} />;



  const totalPages = Math.ceil(supervisors.length / itemsPerPage);

  const handleNextPage = () => {
    setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    setCurrentPage(currentPage - 1);
  };

  const handleSupervisorDetail = (supervisor) => {
    setSelectedSupervisor(supervisor);
    setIsSupervisorDetailModalVisible(true);
  }

  const toggleAddSupervisorModal = () => {
    setIsAddSupervisorModalVisible(!isAddSupervisorModalVisible);
  }

  const renderSupervisors = () => {
    return Array.isArray(supervisors) && supervisors
      .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
      .map((supervisor) => (
        <View
          key={supervisor.id}
          style={{
            flexDirection: "row",
            borderBottomWidth: 1,
            borderBottomColor: "#ccc",
            paddingVertical: 8
          }}
        >
          <Text style={[styles.column, { flex: 2, marginRight: 16 }]}>
            {supervisor.name}
          </Text>
          <Text style={[styles.column, { flex: 1, marginRight: 16 }]}>
            {supervisor.designation}
          </Text>
  
          <TouchableOpacity
            style={{
              backgroundColor: "transparent",
              padding: 4,
              borderRadius: 5,
              marginRight: 16,
              justifyContent: "center",
              alignItems: "center",
              height: 30
            }}
            onPress={() => handleSupervisorDetail(supervisor)}
          >
            <Icon name="eye" size={12} color="blue" />
  
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              backgroundColor: "transparent",
              padding: 4,
              borderRadius: 5,
              justifyContent: "center",
              alignItems: "center",
              height: 30
            }}
            onPress={() => deleteSupervisor(supervisor.id)}
          >
            <Icon name="trash" size={12} color="red" />
          </TouchableOpacity>
        </View>
      ));
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
            <Icon name="menu" size={24} color="black" />
          </TouchableOpacity> */}
          {/* Header */}
          <Text style={styles.title}>Contractor Supervisor</Text>
          <TouchableOpacity style={styles.addButton} onPress={toggleAddSupervisorModal}>
            <Icon name="add" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={{ flex: 1, padding: 10 }}>
            {/* Render the preloader if loading */}
            {isLoading && (
              <View style={styles.preloaderContainer}>
                <Preloader />
              </View>
            )}
            {/* Render the content if not loading */}
            {!isLoading && (
              <>
                <View
                  style={{
                    flexDirection: "row",
                    borderBottomWidth: 1,
                    borderBottomColor: "#ccc"
                  }}
                >
                  <Text style={[styles.heading, styles.column]}>
                    Name
                  </Text>
                  <Text style={[styles.heading, styles.column]}>Designation</Text>
                  <Text style={[styles.heading, styles.column]}>Action</Text>
                </View>
                {/* Render Supervisors here */}
                {renderSupervisors()}
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
                {/* Add supervisor Modal */}
                <AddSupervisorModal
                  isVisible={isAddSupervisorModalVisible}
                  onClose={() => setIsAddSupervisorModalVisible(false)}
                  retrieveSupervisors={retrieveSupervisors}
                />
                {/* View supervisor Modal */}
                <SupervisorDetailModal
                  supervisor={selectedSupervisor}
                  isVisible={isSupervisorDetailModalVisible}
                  onClose={() => setIsSupervisorDetailModalVisible(false)}
                />
              </>
            )}
          </View>
          {/* Footer */}
          <View >
            <QuickAccess />
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
    fontSize: 20,
    textAlign: "center",
    marginVertical: 10,
    color: "#007bff",
    fontWeight: "bold"
  },
  heading: {
    fontWeight: "bold",
    padding: 10,
    textAlign: "center",
    backgroundColor: "#f0f0f0",
    color: "#333",
    borderBottomWidth: 1,
  },
  column: {
    flex: 1,
    padding: 10,
    color: "#333"
  },
  text: {
    textAlign: "center",
    padding: 10,
    borderBottomWidth: 1,   
  },
  paginationButton: {
    padding: 8,
    marginHorizontal: 5,
    backgroundColor: "#007bff",
    borderRadius: 5,
    marginTop: 10
  },
  pageIndicator: {
    padding: 8,
    marginHorizontal: 5,
    textAlign: "center"
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
  modalScrollView: {
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
    fontWeight: "bold",
    color: "#333"
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
    marginBottom: 5,
    color: "#333"
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
    marginBottom: 5,
    color: "#333"
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

export default SupervisorScreen;