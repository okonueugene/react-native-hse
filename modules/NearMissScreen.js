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
import { Ionicons } from "@expo/vector-icons";
import MenuScreen from "../components/MenuScreen";
import ApiManager from "../api/ApiManager";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Preloader from "../components/Preloader";
import config from "../config/config";
import QuickAccess from "../components/QuickAcessFooter";

const ViewNearMissModal = ({ nearmiss, onClose, visible }) => {
  if (!visible || !nearmiss) {
    return null;
  }

  const cleanMediaUrl = (url) => {
    return url.replace(
      /^http:\/\/localhost\/storage\//,
      config.media_url + "/storage/"
    );
  };

  function formatIncidentType(incidentType) {
    // Replace underscores with spaces
    let formattedType = incidentType.replace(/_/g, " ");

    // Capitalize the first letter of each word
    formattedType = formattedType.replace(/\b\w/g, function (char) {
      return char.toUpperCase();
    });

    return formattedType;
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
              <Text style={styles.modalTitle}>View Near Miss</Text>
              <TouchableOpacity>
                <Ionicons.Button name="close-circle" size={20} onPress={onClose} />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <Text style={styles.label}>Incident Description</Text>
              <TextInput
                style={styles.textInput}
                value={nearmiss.incident_description}
                editable={false}
                multiline={true}
              />
              <Text style={styles.label}>Investigation Status</Text>
              <TextInput
                style={styles.textInput}
                value={
                  nearmiss.investigation_status == "open" ? "Open" : "Closed"
                }
                editable={false}
              />
              <Text style={styles.label}>Incident Date</Text>
              <TextInput
                style={styles.textInput}
                value={nearmiss.incident_date}
                editable={false}
              />
              <Text style={styles.label}>Incident Type</Text>
              <TextInput
                style={styles.textInput}
                value={formatIncidentType(nearmiss.incident_type.incident_type)}
                editable={false}
              />
              <Text style={styles.label}>Incident Report</Text>
              <TextInput
                style={styles.textInput}
                value={nearmiss.incident_status == "yes" ? "Done" : "Not Done"}
                editable={false}
              />
              <Text style={styles.label}>Reported By</Text>
              <TextInput
                style={styles.textInput}
                value={nearmiss.user.name}
                editable={false}
              />
              {nearmiss.media && nearmiss.media.length > 0 && (
                <View style={styles.mediaContainer}>
                  <Text style={styles.mediaLabel}>Media:</Text>
                  {nearmiss.media.map((item, index) => (
                    <View key={index} style={styles.mediaItem}>
                      <Image
                        source={{ uri: cleanMediaUrl(item.original_url) }}
                        style={styles.mediaImage}
                        resizeMode="contain"
                      />
                      <Text style={styles.mediaText}>{item.file_name}</Text>
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

const NearMissScreen = () => {
  const [nearMisses, setNearMisses] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const drawerRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [loading, setLoading] = useState(false);
  const [isViewNearMissModalOpen, setIsViewNearMissModalOpen] = useState(null);
  const [selectedNearMiss, setSelectedNearMiss] = useState(null);

  const deleteNearMiss = async (id) => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");

      const response = await ApiManager.delete(`/incidents/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }

      });

      if (response.status === 200) {
        alert("Near Miss deleted successfully");
        getNearMisses();
      } else {
        alert("Error deleting near miss");
      }
    } catch (error) {
      console.log(error);
      alert("Error deleting near miss");
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

  const getNearMisses = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      const response = await ApiManager.get("/incidents?type=1", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.status === 200) {
        setNearMisses(response.data.data);
        setLoading(false);
      } else {
        console.log("Error");
        setLoading(false);
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    getNearMisses();
  }, []);

  const navigationView = () => <MenuScreen closeDrawer={closeDrawer} />;

  const totalPages = Math.ceil(nearMisses.length / itemsPerPage);

  const handleNextPage = () => {
    setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    setCurrentPage(currentPage - 1);
  };

  const handleViewNearMiss = (nearmiss) => {
    setSelectedNearMiss(nearmiss);
    setIsViewNearMissModalOpen(true);
  };

  const renderNearMisses = () => {
    return nearMisses && nearMisses.length > 0 ? (
      nearMisses
        .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
        .map((nearMiss) => (
          <View
            key={nearMiss.id}
            style={{
              flexDirection: "row",
              borderBottomWidth: 1,
              borderBottomColor: "#ccc",
              paddingVertical: 8
            }}
          >
            <Text style={[styles.column, { flex: 2, marginRight: 16 }]}>
              {nearMiss.incident_description}
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
              onPress={() => handleViewNearMiss(nearMiss)}
            >
              <Ionicons name="eye" size={14} color="blue" />
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
              onPress={() => deleteNearMiss(nearMiss.id)}
            >
              <Ionicons name="trash" size={14} color="red" />
            </TouchableOpacity>
          </View>
        ))
    ) : (
      <Text style={{ textAlign: "center", padding: 10 }}>
        No nearmisss found
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
          <Text style={styles.title}>Near Misses</Text>
          <View style={{ flex: 1, padding: 10 }}>
            {/* Render the preloader if loading */}
            {loading && (
              <View style={styles.preloaderContainer}>
                <Preloader />
              </View>
            )}
            {/* Render SORs if not loading */}
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
                    Incident Description
                  </Text>
                  <Text style={[styles.heading, styles.column]}>Actions</Text>
                </View>
                {renderNearMisses()}
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
                <ViewNearMissModal
                  nearmiss={selectedNearMiss}
                  onClose={() => setIsViewNearMissModalOpen(false)}
                  visible={isViewNearMissModalOpen}
                />
              </>
            )}
          </View>
          {/* Footer */}
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

export default NearMissScreen;
