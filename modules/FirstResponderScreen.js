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

const AddFirstResponderModal = ({
  isVisible,
  onClose,
  retrieveFirstResponders
}) => {
  if (!isVisible) {
    return null;
  }

  const [type, setType] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setLoading] = useState(false);

  //Handle the form submission
  const handleFormData = async () => {
    if (!type || !name) {
      alert("Please fill in all fields");
      return;
    }

    //prepare the data
    const formData = {
        name,
        type
    };

    onsubmit(formData);
  };

  const onsubmit = async (formData) => {
    setLoading(true);
    try {
      // Fetch token from async storage
      const token = await AsyncStorage.getItem("token");

      // Fetch firtsResponders
      const response = await ApiManager.post("/first-responders", formData, {
        headers: {
            Authorization: `Bearer ${token}`
        }
        });

      // Handle the response
        if (response.status === 200) {
            alert("First Responder added successfully");
            setLoading(false);
            // Refresh the first responders
            retrieveFirstResponders();
            onClose();
        }
        else {
            console.log(error.response ? error.response.data : error.message);
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
              <Text style={styles.modalTitle}>Add First Responder</Text>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                {/* Replace with an icon component if desired */}
                <Text>X</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <Text style={styles.label}>Name:</Text>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: "#ccc",
                  borderRadius: 4,
                  padding: 8,
                  marginBottom: 15
                }}
                value={name}
                onChangeText={setName}
              />
              <Text style={styles.label}>Type:</Text>
              <Picker
                selectedValue={type}
                onValueChange={(itemValue, itemIndex) => setType(itemValue)}
                style={{
                  borderWidth: 1,
                  borderColor: "#ccc",
                  borderRadius: 4,
                  padding: 8,
                  marginBottom: 15
                }}
              >
                <Picker.Item label="Select Type" value="" />
                <Picker.Item label="Fire Marshal" value="fire_marshal" />
                <Picker.Item label="First Aider" value="first_aider" />
              </Picker>
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
                onPress={handleFormData}
              >
                <Text>Add First Responder</Text>
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

const FirstResponderViewModal = ({
  firstResponder,
  isVisible,
  onClose,
  convertText
}) => {
  if (!firstResponder || !isVisible) {
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
              <Text style={styles.modalTitle}>View First Responder</Text>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                {/* Replace with an icon component if desired */}
                <Text>X</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <Text style={styles.label}>Name:</Text>
              <TextInput
                style={styles.textInput}
                value={firstResponder.name}
                editable={false}
              />
              <Text style={styles.label}>Type:</Text>
              <TextInput
                style={styles.textInput}
                value={convertText(firstResponder.type)}
                editable={false}
              />
              <Text style={styles.label}>Date:</Text>
              <TextInput
                style={styles.textInput}
                value={firstResponder.date}
                editable={false}
              />
              <Text style={styles.label}>Added By:</Text>
              <TextInput
                style={styles.textInput}
                value={firstResponder.user.name}
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

const FirstResponderScreen = () => {
  const [firstResponders, setFirstResponders] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const drawerRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [selectedFirstResponder, setSelectedFirstResponder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [
    isFirstResponderViewModalVisible,
    setIsFirstResponderViewModalVisible
  ] = useState(false);
  const [isAddFirstResponderModalVisible, setIsAddFirstResponderModalVisible] =
    useState(false);

  const handleOutsideTouch = () => {
    closeDrawer(); // Close the drawer when touched outside
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    drawerRef.current.closeDrawer();
  };

  const navigation = useNavigation();

  const convertText = (text) => {
    // Replace underscores with spaces and capitalize each word
    return text
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const deleteFirstResponder = async (id) => {
    setLoading(true);
    try {
      // Fetch token from async storage
      const token = await AsyncStorage.getItem("token");

      // Fetch firtsResponders
      const response = await ApiManager.delete(
        `/first-responders/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Handle the response
      if (response.status === 200) {
        alert("First Responder deleted successfully");
        setLoading(false);
        // Refresh the first responders
        retrieveFirstResponders();
      } else {
        console.error(response.data);
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const retrieveFirstResponders = async () => {
    setLoading(true);
    try {
      // Fetch token from async storage
      const token = await AsyncStorage.getItem("token");

      // Fetch firtsResponders
      const response = await ApiManager.get("/first-responders", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log(response.status);
      // Handle the response
      if (response.status === 200) {
        setFirstResponders(response.data.data.data);
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
    retrieveFirstResponders();
  }, []);

  const navigationView = () => <MenuScreen closeDrawer={closeDrawer} />;

  const totalPages = Math.ceil(firstResponders.length / itemsPerPage);

  const handleNextPage = () => {
    setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    setCurrentPage(currentPage - 1);
  };

  // handle view First Responder
  const handleViewFirstResponder = (firstResponder) => {
    setSelectedFirstResponder(firstResponder);
    setIsFirstResponderViewModalVisible(true);
  };

  // handle add First Responder
  const handleAddFirstResponder = () => {
    setIsAddFirstResponderModalVisible(true);
  };

  const renderFirstResponders = () => {
    return firstResponders
      .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
      .map((firstResponder) => (
        <View
          key={firstResponder.id}
          style={{
            flexDirection: "row",
            borderBottomWidth: 1,
            borderBottomColor: "#ccc",
            paddingVertical: 8
          }}
        >
          <Text style={[styles.column, { flex: 2, marginRight: 16 }]}>
            {firstResponder.name}
          </Text>
          <Text style={[styles.column, { flex: 1, marginRight: 16 }]}>
            {convertText(firstResponder.type)}
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
            onPress={() => handleViewFirstResponder(firstResponder)}
          >
            <Ionicons name="eye" size={16} color="blue" />
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
            onPress={() => deleteFirstResponder(firstResponder.id)}
          >
            <Ionicons name="trash" size={16} color="red" />
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
          <Text style={styles.title}>First Responders</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddFirstResponder}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={{ flex: 1, padding: 10 }}>
            {/* Render the preloader if loading */}
            {loading && (
              <View style={styles.preloaderContainer}>
                <Preloader />
              </View>
            )}
            {/* Render First Responders if not loading */}
            {!loading && (
              <>
                <View
                  style={{
                    flexDirection: "row",
                    borderBottomWidth: 1,
                    borderBottomColor: "#ccc"
                  }}
                >
                  <Text style={[styles.heading, styles.column]}>Name</Text>
                  <Text style={[styles.heading, styles.column]}>Type</Text>
                  <Text style={[styles.heading, styles.column]}>Date</Text>
                  <Text style={[styles.heading, styles.column]}>Action</Text>
                </View>
                {/* Render First Responders here */}
                {renderFirstResponders()}
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
                {/* Add First Responder Modal */}
                <AddFirstResponderModal
                  isVisible={isAddFirstResponderModalVisible}
                  onClose={() => setIsAddFirstResponderModalVisible(false)}
                  retrieveFirstResponders={retrieveFirstResponders}
                />
                {/* View First Responder Modal */}
                <FirstResponderViewModal
                  firstResponder={selectedFirstResponder}
                  isVisible={isFirstResponderViewModalVisible}
                  convertText={convertText}
                  onClose={() => setIsFirstResponderViewModalVisible(false)}
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

export default FirstResponderScreen;
