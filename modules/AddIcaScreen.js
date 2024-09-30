import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  DrawerLayoutAndroid,
  StyleSheet,
  Button,
  ActivityIndicator,
  Image,
  Alert
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { launchCamera, launchImageLibrary } from "react-native-image-picker";
import ApiManager from "../api/ApiManager";
import AsyncStorage from "@react-native-async-storage/async-storage";
import RNFS from "react-native-fs";
import { FlatList } from "react-native-gesture-handler";
import Icon from "react-native-vector-icons/Ionicons";
import MenuScreen from "../components/MenuScreen";
import config from "../config/config";
import KeyboardAvoidingWrapper from "../components/KeyboardAvoidingWrapper";
import QuickAccess from "../components/QuickAcessFooter";
import axios from "axios";


let images = [];

const UploadImageModal = ({ visible, onClose, onRemoveImage }) => {
  const imgDir = `${RNFS.DocumentDirectoryPath}/images`;

  const ensureDirExists = async () => {
    try {
      await RNFS.mkdir(imgDir);
    } catch (error) {
      console.error("Error creating images directory:", error);
    }
  };

  const [selectedImages, setSelectedImages] = useState([]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    ensureDirExists();
  }, []);

  const selectImage = async useLibrary => {
    const options = {
      mediaType: "photo",

      selectionLimit: 0,

      quality: 1
    };

    let result;

    if (useLibrary) {
      result = await launchImageLibrary(options, response => {
        if (response.didCancel) {
          console.log("User cancelled image picker");
        } else if (response.error) {
          console.log("ImagePicker Error: ", response.error);
        } else {
          const source = response.assets.map(img => img.uri);

          setSelectedImages([...selectedImages, ...source]);

          images = [...images, ...source];
        }
      });
    } else {
      result = await launchCamera(options, response => {
        if (response.didCancel) {
          console.log("User cancelled image picker");
        } else if (response.error) {
          console.log("ImagePicker Error: ", response.error);
        } else {
          const source = response.assets.map(img => img.uri);

          setSelectedImages([...selectedImages, ...source]);

          images = [...images, ...source];
        }
      });
    }
  };

  const handleRemoveImage = index => {
    onRemoveImage(selectedImages[index]);

    const newImages = selectedImages.filter((img, i) => i !== index);

    setSelectedImages(newImages);

    images = images.filter((img, i) => i !== index);
  };

  const closeModal = () => {
    onClose();
    setSelectedImages([]);
  };

  const renderItem = ({ item, index }) => {
    const filename = item.split("/").pop();
    console.log(item);

    return (
      <View
        style={{
          flexDirection: "row",
          margin: 1,
          alignItems: "center",
          gap: 5
        }}
      >
        <Image source={{ uri: item }} style={styles.images} />
        <Text style={{ flex: 1 }}>{filename}</Text>

        <Icon.Button
          name="trash"
          onPress={() => handleRemoveImage(index)}
        />
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.modalContainer}>
        <Button title="Gallery" onPress={() => selectImage(true)} />
        <Button title="Camera" onPress={() => selectImage(false)} />
      </View>
      <Text style={styles.header}>Selected Images</Text>
      <FlatList data={selectedImages} renderItem={renderItem} />
      <Button title="Close" onPress={closeModal} />
      {loading && (
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
      )}
    </Modal>
  );
};

const AddIcaScreen = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const drawerRef = useRef(null);
  const [observation, setObservation] = useState("");
  const [status, setStatus] = useState(null);
  const [stepsTaken, setStepsTaken] = useState({});
  const [actionOwner, setActionOwner] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoading, setLoading] = useState(false);

  // Function to handle adding a step
  const addStep = () => {
    const newStepNumber = Object.keys(stepsTaken).length + 1;
    setStepsTaken({
      ...stepsTaken,
      [newStepNumber]: "" // Add a new step with an empty string value
    });
  };

  // Function to handle updating a step
  const updateStep = (stepNumber, value) => {
    setStepsTaken({
      ...stepsTaken,
      [stepNumber]: value // Update the step with the given stepNumber
    });
  };

  // Function to handle removing a step
  const removeStep = (stepNumber) => {
    const newSteps = { ...stepsTaken };
    delete newSteps[stepNumber]; // Remove the step with the given stepNumber
    setStepsTaken(newSteps);
  };

  // Function to update JSON representation of steps
  const updateStepsJson = () => {
    const stepsJson = [];
    for (const stepNumber in stepsTaken) {
      stepsJson.push(stepsTaken[stepNumber]);
    }
    setStepsTaken(stepsJson);
  };

  const handleOpenModal = () => {
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };
  const handleRemoveImage = async (uri) => {
    try {
      await RNFS.unlink(uri);
    } catch (error) {
      console.error("Error deleting image:", error);
    }
  };


  // Handle form submission

  const handleSubmit = () => {
    if (!observation || !status || !stepsTaken || !actionOwner) {
      Alert.alert("Error", "Please fill all fields.");
      return;
    }
    setLoading(true);

    const formData = new FormData();
    console.log("formData before", formData);

    formData.append("observation", observation);
    formData.append("status", status);
    formData.append("steps_taken", JSON.stringify(stepsTaken));
    formData.append("action_owner", actionOwner);

    //loop through the images and add them to the images array
    for (let i = 0; i < images.length; i++) {
      const image = {
        uri: images[i],
        name: Date.now() + i + "." + images[i].split(".").pop(),
        type: `image/${images[i].split(".").pop()}` // Ensure correct content type
      };
      formData.append("images[]", image); // Use key with square brackets
    }

    console.log("formData  after", formData);
    onSubmit(formData);
  };

  //onSubmit function
  const onSubmit = async (formData) => {
    try {
      //retrieve token from local storage
      const token = await AsyncStorage.getItem("token");
      console.log("retrieve token", token);

      //create ICA record and upload images
      const response = await fetch(`${config.webapp_url}/api/ica`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      console.log("submitting form data", formData);

      if (response.status !== 200) {
        console.log("Failed to create ICA record" + response.data);
        setLoading(false);
        // throw new Error("Failed to create ICA record.");
      } else {
        setObservation("");
        setStatus("");
        setStepsTaken({});
        setActionOwner("");

        //loop through the images and delete them from the images array
        for (let i = 0; i < images.length; i++) {
images.pop()          //update images array
          images = [];
        }

        console.log("ICA record created:", formData);
        setLoading(false);
        Alert.alert("Success", "ICA record created successfully.");
      }
    } catch (error) {
      console.error("Error creating ICA record:", error);
      setLoading(false);
      Alert.alert("Error", "Failed to create ICA record.");
    }
  };

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

  const navigationView = () => <MenuScreen closeDrawer={closeDrawer} />;

  return (
      <DrawerLayoutAndroid
        ref={drawerRef}
        drawerWidth={200}
        drawerPosition="left"
        renderNavigationView={navigationView}
      >
        <View style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            onTouchStart={handleOutsideTouch}
            onScrollBeginDrag={handleOutsideTouch}
          >
            {/* <TouchableOpacity style={styles.menu} onPress={toggleDrawer}>
            <Icon name="menu" size={24} color="black" />
          </TouchableOpacity> */}
            <View style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 24 }}>
              <Text style={styles.title}>Add ICA Record</Text>
              <View style={{ borderWidth: 1, borderColor: "#ccc", padding: 16 }}>
                <View style={{ marginBottom: 16 }}>
                  <Text style={styles.label}>Observation</Text>
                  <TextInput
                    style={{
                      borderWidth: 1,
                      borderColor: "#ccc",
                      borderRadius: 4,
                      padding: 8,
                      color: "#000",
                      textAlignVertical: "top"
                    }}
                    multiline
                    height={100}
                    placeholder="Describe the observation"
                    placeholderTextColor={"#ccc"}
                    value={observation}
                    onChangeText={(text) => setObservation(text)}
                  />
                </View>
                <View style={{ marginBottom: 16 }}>
                  <Text style={styles.label}>Status</Text>
                  <Picker
                    selectedValue={status}
                    onValueChange={(itemValue) => setStatus(itemValue)}
                    style={{
                      borderWidth: 1,
                      borderColor: "#ccc",
                      borderRadius: 4,
                      padding: 8,
                      color: "#000"
                    }}
                  >
                    <Picker.Item label="Tap to select status" value={null} />
                    <Picker.Item label="Open" value="open" />
                    <Picker.Item label="Closed" value="closed" />
                  </Picker>
                </View>
                <View style={{ marginBottom: 16 }}>
                  <Text style={styles.label}>Steps Taken</Text>
                  {/* Render text inputs for each step */}
                  {Object.entries(stepsTaken).map(([stepNumber, value]) => (
                    <View
                      key={stepNumber}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginBottom: 8
                      }}
                    >
                      <TextInput
                        style={{
                          flex: 1,
                          borderWidth: 1,
                          borderColor: "#ccc",
                          borderRadius: 4,
                          padding: 8,
                          color: "#000"
                        }}
                        placeholder="Enter Step"
                        value={value}
                        onChangeText={(text) => updateStep(stepNumber, text)}
                      />
                      <TouchableOpacity
                        onPress={() => removeStep(stepNumber)}
                        style={{ marginLeft: 8 }}
                      >
                        <Icon name="trash" size={24} color="red" />
                      </TouchableOpacity>
                    </View>
                  ))}
                  <Button title="Add Step" onPress={addStep} />
                </View>
                <View style={{ marginBottom: 16 }}>
                  <Text style={styles.label}>Action Owner</Text>
                  <TextInput
                    style={{
                      borderWidth: 1,
                      borderColor: "#ccc",
                      borderRadius: 4,
                      padding: 8,
                      color: "#000"
                    }}
                    placeholder="Enter the action owner"
                    placeholderTextColor={"#ccc"}
                    value={actionOwner}
                    onChangeText={(text) => setActionOwner(text)}
                  />
                </View>
                <TouchableOpacity
                  style={{
                    backgroundColor: "blue",
                    padding: 10,
                    borderRadius: 4,
                    alignItems: "center",
                    marginBottom: 16
                  }}
                  onPress={handleOpenModal}
                >
                  <Text style={{ color: "white" }}>Select Images</Text>
                </TouchableOpacity>
                <FlatList
                  data={images}
                  renderItem={({ item }) => (
                    <Image source={{ uri: item }} style={styles.images} />
                  )}
                  keyExtractor={(item) => item}
                  horizontal
                />
                <TouchableOpacity
                  style={{
                    backgroundColor: "blue",
                    padding: 8,
                    borderRadius: 4,
                    alignItems: "center"
                  }}
                  onPress={handleSubmit}
                >
                  <Text style={{ color: "white" }}>Submit</Text>
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
              <UploadImageModal
                visible={modalVisible}
                onClose={handleCloseModal}
                onRemoveImage={handleRemoveImage}
                submit={onSubmit}
              />
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

const styles = {
  title: {
    fontSize: 21,
    textAlign: "center",
    marginVertical: 10,
    color: "#007bff",
    fontWeight: "bold"
  },
  heading: {
    padding: 10,
    textAlign: "center",
    fontSize: 18
  },
  menu: {
    position: "absolute",
    top: 10,
    left: 10
  },
  modalContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginVertical: 20
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 10
  },
  images: {
    width: 90,
    height: 90,
    marginVertical: 10,
    alignSelf: "center"
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
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: "#333",
    fontWeight: "bold",
    textAlign: "center"
  }
};

export default AddIcaScreen;
