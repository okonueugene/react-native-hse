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
  Image
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import MenuScreen from "../components/MenuScreen";
import ApiManager from "../api/ApiManager";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Preloader from "../components/Preloader";
import config from "../config/config";
import QuickAccess from "../components/QuickAcessFooter";

const ViewImprovementModal = ({ improvement, visible, onClose }) => {
  if (!visible || !improvement) {
    return null;
  }

  const cleanMediaUrl = (url) => {
    return url.replace(
      /^http:\/\/localhost\/storage\//,
      config.media_url + "/storage/"
    );
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
              <Text style={styles.modalTitle}>View Improvement</Text>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                {/* Replace with an icon component if desired */}
                <Text>X</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <Text style={styles.label}>Observation:</Text>
              <TextInput
                style={styles.textInput}
                value={
                  improvement.observation || "No observation data available"
                }
                editable={false}
                multiline={true}
              />
              <Text style={styles.label}>Steps Taken:</Text>
              {Object.keys(improvement.steps_taken).map((key, index) => (
                <TextInput
                  key={index}
                  style={styles.textInput}
                  value={improvement.steps_taken[key]}
                  editable={false}
                  multiline={true}
                />
              ))}
              <Text style={styles.label}>Date:</Text>
              <TextInput
                style={styles.textInput}
                value={improvement.date || "No date data available"}
                editable={false}
              />
              <Text style={styles.label}>Status:</Text>
              <TextInput
                style={styles.textInput}
                value={
                  improvement.status === 0
                    ? "Open"
                    : "Closed" || "No status data available"
                }
                editable={false}
              />
              {improvement.media?.length > 0 && (
                <View style={styles.mediaContainer}>
                  <Text style={styles.mediaLabel}>Media:</Text>
                  {improvement.media.map((item, index) => (
                    <View key={index} style={styles.mediaItem}>
                      <Image
                        source={{ uri: cleanMediaUrl(item.original_url) }}
                        style={styles.mediaImage}
                        resizeMode="contain"
                      />
                      <Text style={styles.mediaText}>
                        Media {item.file_name}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
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

const SuggestedImprovementsScreen = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const drawerRef = useRef(null);
  const [improvements, setImprovements] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [loading, setLoading] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [selectedImprovement, setSelectedImprovement] = useState(null);

  const handleViewImprovement = (improvement) => {
    setSelectedImprovement(improvement);
    setIsViewModalVisible(true);
  };

  useEffect(() => {
    fetchImprovements();
  }, []);

  const deleteImprovement = async (id) => {
    setLoading(true);
    try {
      // Retrieve token from local storage
      const token = await AsyncStorage.getItem("token");

      // Send a delete request to the API
      const response = await ApiManager.delete(`/sors/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }

      });

      // Handle the response
      if (response.status === 200) {
        // Fetch improvements again
        fetchImprovements();
      } else {
        // Handle error
        console.error(response.data);
      }
    } catch (error) {
      console.error(error);
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

  const fetchImprovements = async () => {
    try {
      setLoading(true);
      // Retrieve token from local storage
      const token = await AsyncStorage.getItem("token");
      // Fetch improvements from the API
      const response = await ApiManager.get("/sors?sors_type=4", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Handle the response
      if (response.status === 200) {
        setImprovements(response.data.data);
        setLoading(false);
      } else {
        // Handle error
        console.error(response.data);
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const navigationView = () => <MenuScreen closeDrawer={closeDrawer} />;

  const totalPages = Math.ceil(improvements.length / itemsPerPage);

  const handleNextPage = () => {
    setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    setCurrentPage(currentPage - 1);
  };

  const renderImprovements = () => {
    return improvements
      .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
      .map((improvement) => (
        <View
          key={improvement.id}
          style={{
            flexDirection: "row",
            borderBottomWidth: 1,
            borderBottomColor: "#ccc",
            paddingVertical: 8
          }}
        >
          <Text style={[styles.column, { flex: 2, marginRight: 16 }]}>
            {improvement.observation}
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
            onPress={() => {
              // Handle view improvement
              handleViewImprovement(improvement);
            }}
          >
            <Icon name="eye" size={14} color="blue" />
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
            onPress={() => {
              // Handle delete improvement
              deleteImprovement(improvement.id);
            }}
          >
            <Icon name="trash" size={14} color="red" />
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
          <Text style={styles.title}>Suggested Improvements</Text>
          <View style={{ flex: 1, padding: 10 }}>
            {/* Render the preloader if loading */}
            {loading && (
              <View style={styles.preloaderContainer}>
                <Preloader />
              </View>
            )}
            {/* Render improvements if not loading */}
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
                    Observation
                  </Text>
                  <Text style={[styles.heading, styles.column]}>Action</Text>
                </View>
                {renderImprovements()}
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
                <ViewImprovementModal
                  improvement={selectedImprovement}
                  visible={isViewModalVisible}
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
    fontSize: 24,
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
    textAlign: "center"
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
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)"
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width:"100%"
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

export default SuggestedImprovementsScreen;
