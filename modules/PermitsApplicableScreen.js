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
import { Ionicons } from "@expo/vector-icons";
import MenuScreen from "../components/MenuScreen";
import ApiManager from "../api/ApiManager";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Preloader from "../components/Preloader";
import config from "../config/config";
import { Picker } from "@react-native-picker/picker";
import { useNavigation } from "@react-navigation/native";
import QuickAccess from "../components/QuickAcessFooter";


const AddPermitModal = ({ isVisible, onClose }) => {
  if (!isVisible) {
    return null;
  }

  const [type, setType] = useState("");
  const [areaOwner, setAreaOwner] = useState("");
  const [authorizedPerson, setAuthorizedPerson] = useState("");
  const [competentPerson, setCompetentPerson] = useState("");
  const [isLoading, setLoading] = useState(false);



  //Handle the form submission
  const handleFormData = async () => {
    if (!type || !areaOwner || !authorizedPerson || !competentPerson) {
      alert("Please fill in all fields");
      return;
    }

    //prepare the data
    const formData = new FormData();

    formData.append("type", type);
    formData.append("area_owner", areaOwner);
    formData.append("authorized_person", authorizedPerson);
    formData.append("competent_person", competentPerson);

    onsubmit(formData);
  };

  const onsubmit = async (formData) => {
    setLoading(true);
    try {
      // Fetch token from async storage
      const token = await AsyncStorage.getItem("token");

      // Fetch permits
      const response = await fetch(`${config.apiBaseUrl}/permits`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      // Handle the response
      if (response.status === 200) {
        console.log(response.data);
        alert("Permit added successfully");
        setType("");
        setAreaOwner("");
        setAuthorizedPerson("");
        setCompetentPerson("");
        setLoading(false);
        onClose();
        // Refresh the permits
        retrievePermits();
      } else {
        console.error(response.data);
        setLoading(false);
      }

    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

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
              <Text style={styles.modalTitle}>Add Permit</Text>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                {/* Replace with an icon component if desired */}
                <Text>X</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <Text style={styles.label}>Permit Type:</Text>
              <Picker
                selectedValue={type}
                style={styles.textInput}
                onValueChange={(itemValue) => setType(itemValue)}
              >
                <Picker.Item label="Select Permit Type" value="" />
                <Picker.Item label="General Work" value="General Work" />
                <Picker.Item label="Hot Work" value="Hot Work" />
                <Picker.Item label="Confined Space Entry" value="Confined Space Entry" />
                <Picker.Item label="Cold Work" value="Cold Work" />
                <Picker.Item label="Live Electrical Work" value="Live Electrical Work" />
                <Picker.Item label="Work at Height" value="Work at Height" />
                <Picker.Item label="Excavation/Demolition Work" value="Excavation/Demolition Work" />
              </Picker>
              <Text style={styles.label}>Area Owner:</Text>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: "#ccc",
                  borderRadius: 4,
                  padding: 8,
                  marginBottom: 15
                }} value={areaOwner}
                onChangeText={setAreaOwner}
              />
              <Text style={styles.label}>Authorized Person:</Text>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: "#ccc",
                  borderRadius: 4,
                  padding: 8,
                  marginBottom: 15
                }}
                value={authorizedPerson}
                onChangeText={setAuthorizedPerson}
              />
              <Text style={styles.label}>Competent Person:</Text>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: "#ccc",
                  borderRadius: 4,
                  padding: 8,
                  marginBottom: 15
                }}
                value={competentPerson}
                onChangeText={setCompetentPerson}
              />
            </View>
            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Text>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ marginLeft: 10, padding: 5, borderRadius: 5, backgroundColor: "#007bff" }} onPress={handleFormData}>
                <Text>Add Permit</Text>
              </TouchableOpacity>
            </View>
            {isLoading ? (
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

const PermitViewModal = ({ permit, isVisible, onClose }) => {
  if (!permit || !isVisible) {
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
              <Text style={styles.modalTitle}>View Permit</Text>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                {/* Replace with an icon component if desired */}
                <Text>X</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <Text style={styles.label}>Added By:</Text>
              <TextInput
                style={styles.textInput}
                value={permit.user.name}
                editable={false}
              />
              <Text style={styles.label}>Permit Type:</Text>
              <TextInput
                style={styles.textInput}
                value={permit.type}
                editable={false}
              />
              <Text style={styles.label}>Date:</Text>
              <TextInput
                style={styles.textInput}
                value={permit.date}
                editable={false}
              />
              <Text style={styles.label}>Area Owner:</Text>
              <TextInput
                style={styles.textInput}
                value={permit.area_owner}
                editable={false}
              />
              <Text style={styles.label}>Authorized Person:</Text>
              <TextInput
                style={styles.textInput}
                value={permit.authorized_person}
                editable={false}
              />
              <Text style={styles.label}>Competent Person:</Text>
              <TextInput
                style={styles.textInput}
                value={permit.competent_person}
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



const PermitsApplicableScreen = () => {
  const [permits, setPermits] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const drawerRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [selectedPermit, setSelectedPermit] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);



  const handleOutsideTouch = () => {
    closeDrawer(); // Close the drawer when touched outside
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    drawerRef.current.closeDrawer();
  };

  const navigation = useNavigation();

  const deletePermit = async (permitId) => {
    setLoading(true);
    try {
      // Fetch token from async storage
      const token = await AsyncStorage.getItem("token");

      // Fetch permits
      const response = await ApiManager.delete(`/permits/${permitId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Handle the response
      if (response.status === 200) {
        alert("Permit deleted successfully");
        setLoading(false);
        // Refresh the permits
        retrievePermits();
      } else {
        console.error(response.data);
        setLoading(false);
      }

    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };


  const retrievePermits = async () => {
    setLoading(true);
    try {
      // Fetch token from async storage
      const token = await AsyncStorage.getItem("token");

      // Fetch permits
      const response = await ApiManager.get("/permits", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log(response.status);
      // Handle the response
      if (response.status === 200) {
        setPermits(response.data.data);
        setLoading(false);

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
  };

  useEffect(() => {
    retrievePermits();
  }, []);



  const navigationView = () => <MenuScreen closeDrawer={closeDrawer} />;


  const totalPages = Math.ceil(permits.length / itemsPerPage);

  const handleNextPage = () => {
    setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    setCurrentPage(currentPage - 1);
  };

  // handle view Permit
  const handleViewPermit = (permit) => {
    setSelectedPermit(permit);
    setIsViewModalVisible(true);
  };

  // handle add Permit
  const handleAddPermit = () => {
    setIsAddModalVisible(true);
  };

  const renderPermits = () => {
    return permits
      .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
      .map((permit) => (
        <View
          key={permit.id}
          style={{
            flexDirection: "row",
            borderBottomWidth: 1,
            borderBottomColor: "#ccc",
            paddingVertical: 8
          }}
        >
          <Text style={[styles.column, { flex: 2, marginRight: 16 }]}>
            {permit.type}
          </Text>
          <Text style={[styles.column, { flex: 1, marginRight: 16 }]}>
            {permit.area_owner}
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
            onPress={() => handleViewPermit(permit)}
          >
            <Ionicons name="eye" size={14} color="#2a19e8" />
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
            onPress={() => deletePermit(permit.id)}
          >
            <Ionicons name="trash" size={14} color="#f41313" />
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
            <Ionicons name="menu" size={24} color="black" />
          </TouchableOpacity> */}
          {/* Header */}
          <Text style={styles.title}>Permits Applicable</Text>
          <TouchableOpacity style={styles.addButton} onPress={handleAddPermit}>
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={{ flex: 1, padding: 10 }}>
            {/* Render the preloader if loading */}
            {loading && (
              <View style={styles.preloaderContainer}>
                <Preloader />
              </View>
            )}
            {/* Render Permits if not loading */}
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
                    Permit Type
                  </Text>
                  <Text style={[styles.heading, styles.column]}>Area Owner</Text>
                  <Text style={[styles.heading, styles.column]}>Action</Text>
                </View>
                {/* Render Permits here */}
                {renderPermits()}
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
                {/* Add Permit Modal */}
                <AddPermitModal
                  isVisible={isAddModalVisible}
                  onClose={() => setIsAddModalVisible(false)}
                />
                {/* View Permit Modal */}
                <PermitViewModal
                  permit={selectedPermit}
                  isVisible={isViewModalVisible}
                  onClose={() => setIsViewModalVisible(false)}
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

export default PermitsApplicableScreen;