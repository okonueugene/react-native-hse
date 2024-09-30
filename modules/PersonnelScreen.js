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

const PersonnelDetailModal = ({ visible, onClose, personnel }) => {
  if (!personnel || !visible) {
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
              <Text style={styles.modalTitle}>View Personnel</Text>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                {/* Replace with an icon component if desired */}
                <Text>X</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <Text style={styles.label}>Designation</Text>
              <TextInput
                style={styles.textInput}
                value={personnel.designation}
                editable={false}
              />
              <Text style={styles.label}>Number of Personnel</Text>
              <TextInput
                style={styles.textInput}
                value={personnel.number}
                editable={false}
              />
              <Text style={styles.label}>Date</Text>
              <TextInput
                style={styles.textInput}
                value={personnel.date}
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

const AddPersonnelModal = ({ visible, onClose, fetchPersonnelData }) => {
  if (!visible) {
    return null;
  }

  const [designation, setDesignation] = useState("");
  const [number, setNumber] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddPersonnel = async () => {
    if (!designation || !number) {
      alert("Please fill all fields");
      return;
    }

    //prepare data
    const formData = {
      designation,
      number
    };

    onSubmit(formData);
  };

  const onSubmit = async (formData) => {
    setLoading(true);
    try {
      // Fetch token from async storage
      const token = await AsyncStorage.getItem("token");

      // Post data to the server
      const response = await ApiManager.post("/personell", formData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.status === 200) {
        alert("Personnel added successfully");
        // Fetch personnel data
        fetchPersonnelData();
        // Close the modal
        onClose();
      } else {
        alert("Error adding personnel");
      }
    } catch (error) {
      console.log(error.response ? error.response.data : error.message);
      alert("Error adding personnel");
    } finally {
      setLoading(false);
    }
  };

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
              <Text style={styles.modalTitle}>Add Personnel</Text>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                {/* Replace with an icon component if desired */}
                <Text>X</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <Text style={styles.label}>Designation</Text>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: "#ccc",
                  borderRadius: 4,
                  padding: 8,
                  marginBottom: 15,
                  color: "#000"
                }}
                value={designation}
                onChangeText={setDesignation}
              />
              <Text style={styles.label}>Number of Personnel</Text>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: "#ccc",
                  borderRadius: 4,
                  padding: 8,
                  marginBottom: 15,
                  color: "#000"
                }}
                value={number}
                onChangeText={setNumber}
              />
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Text>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  marginLeft: 10,
                  padding: 5,
                  borderRadius: 5,
                  backgroundColor: "#007bff"
                }}
                onPress={handleAddPersonnel}
              >
                <Text>Add Personnel</Text>
              </TouchableOpacity>
            </View>
            {loading ? (
              <View
                style={[
                  StyleSheet.absoluteFill,
                  {
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "rgba(0,0,0,0.4)"
                  }
                ]}
              >
                <ActivityIndicator animating size="large" color="#fff" />
              </View>
            ) : null}
          </View>
        </View>
      </ScrollView>
    </Modal>
  );
};

const PersonnelScreen = () => {
  const [personnelData, setPersonnelData] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const drawerRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [selectedPersonell, setSelectedPersonell] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPersonnelDetailModal, setShowPersonnelDetailModal] =
    useState(false);
  const [showAddPersonnelModal, setShowAddPersonnelModal] = useState(false);

  const navigation = useNavigation();

  useEffect(() => {
    fetchPersonnelData();
  }, []);

  const deletePersonnel = async (id) => {
    try {
      const token = await AsyncStorage.getItem("token");

      const response = await ApiManager.delete(`/personell/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.status === 200) {
        alert("Personnel deleted successfully");
        fetchPersonnelData();
      } else {
        alert("Error deleting personnel");
      }
    } catch (error) {
      console.log(error);
      alert("Error deleting personnel");
    }
  };

  const handleOutsideTouch = () => {
    closeDrawer(); // Close the drawer when touched outside
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    drawerRef.current.closeDrawer();
  };

  const fetchPersonnelData = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");

      const response = await ApiManager.get("/personell", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.status === 200) {
        setPersonnelData(response.data.data.data);
        console.log(response.data.data);
      } else {
        alert("Error fetching personnel data");
      }
    } catch (error) {
      console.log(error);
      if (error.response.status === 401) {
        alert("You are not authorized to view this page try logging in again");
        //remove token from async storage
        await AsyncStorage.removeItem("token");
        await AsyncStorage.removeItem("user");
        //redirect to dashboard page
        navigation.navigate("Dashboard");
      } else {
        alert("Error fetching personnel data");
      }
    } finally {
      setLoading(false);
    }
  };

  const navigationView = () => <MenuScreen closeDrawer={closeDrawer} />;

  const totalPages = Math.ceil(personnelData.length / itemsPerPage);

  const handleNextPage = () => {
    setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    setCurrentPage(currentPage - 1);
  };

  const handleAddPersonnel = () => {
    setShowAddPersonnelModal(true);
  };

  const handleViewPersonnel = (personnel) => {
    setSelectedPersonell(personnel);
    setShowPersonnelDetailModal(true);
  };

  const renderPersonnel = () => {
    return personnelData
      .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
      .map((personnel) => (
        <View
          key={personnel.id}
          style={{
            flexDirection: "row",
            borderBottomWidth: 1,
            borderBottomColor: "#ccc",
            paddingVertical: 8
          }}
        >
          <Text style={[styles.column, { flex: 2, marginRight: 16 }]}>
            {personnel.designation}
          </Text>
          <Text style={[styles.column, { flex: 1, marginRight: 16 }]}>
            {personnel.number}
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
            onPress={() => handleViewPersonnel(personnel)}
          >
            <Icon name="eye" size={16} color="blue" />
          </TouchableOpacity>
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
            onPress={() => deletePersonnel(personnel.id)}
          >
            <Icon name="trash" size={16} color="red" />
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
          <Text style={styles.title}>Personnel List</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddPersonnel}
          >
            <Icon name="add" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={{ flex: 1, padding: 10 }}>
            {/* Render the preloader if loading */}
            {loading && (
              <View style={styles.preloaderContainer}>
                <Preloader />
              </View>
            )}
            {/* Render Personnel */}
            {!loading && (
              <>
                <View
                  style={{
                    flexDirection: "row",
                    borderBottomWidth: 1,
                    borderBottomColor: "#ccc"
                  }}
                >
                  <Text style={[styles.heading, styles.column]}>
                    Designation
                  </Text>
                  <Text style={[styles.heading, styles.column]}>Number</Text>
                  <Text style={[styles.heading, styles.column]}>Actions</Text>
                </View>
                {renderPersonnel()}
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
                {/* Add Personnel Modal */}
                <AddPersonnelModal
                  visible={showAddPersonnelModal}
                  onClose={() => setShowAddPersonnelModal(false)}
                  fetchPersonnelData={fetchPersonnelData}
                />
                {/* Personnel Detail Modal */}
                <PersonnelDetailModal
                  visible={showPersonnelDetailModal}
                  onClose={() => setShowPersonnelDetailModal(false)}
                  personnel={selectedPersonell}
                />
              </>
            )}
          </View>
          {/* Footer */}
          <View>
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
    textAlign: "center"
  },
  column: {
    flex: 1,
    padding: 10,
    color: "#333"
  },
  text: {
    textAlign: "center"
  },
  paginationButton: {
    padding: 8,
    marginHorizontal: 5,
    backgroundColor: "#007bff",
    borderRadius: 5,
    marginTop: 10,
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
    width: "100%"
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

export default PersonnelScreen;
