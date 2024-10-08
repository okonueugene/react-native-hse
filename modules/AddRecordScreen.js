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
import QuickAccess from "../components/QuickAcessFooter";

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

  const selectImage = async (useLibrary) => {
    const options = {
      mediaType: 'photo',
      selectionLimit: 0,
      quality: 1
    };

    let result;

    if (useLibrary) {
      result = await launchImageLibrary(options, (response) => {
        if (response.didCancel) { 
          console.log("User cancelled image picker"); 
        } else if (response.error) {
          console.log("ImagePicker Error: ", response.error);
        } else {
          const source = response.assets.map((img) => img.uri);
          setSelectedImages([...selectedImages, ...source]);
          images = [...images, ...source];
        }
      });
    } else {
      result = await launchCamera(options, (response) => {
        if (response.didCancel) {
          console.log("User cancelled image picker");
        } else if (response.error) {
          console.log("ImagePicker Error: ", response.error);
        } else {
          const source = response.assets.map((img) => img.uri);
          setSelectedImages([...selectedImages, ...source]);
          images = [...images, ...source];
        }
      });
    }
  };
  
  const handleRemoveImage = (index) => {
    onRemoveImage(selectedImages[index]);
    setSelectedImages(selectedImages.filter((img, i) => i !== index));
  };
  const closeModal = () => {
    onClose();
    setSelectedImages([]);
  };

  const renderItem = ({ item, index }) => {
    const filename = item.split("/").pop();

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

const AddRecordScreen = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const drawerRef = useRef(null);
  const [observation, setObservation] = useState("");
  const [status, setStatus] = useState("0");
  const [stepsTaken, setStepsTaken] = useState({});
  const [actionOwner, setActionOwner] = useState("");
  const [sorTypes, setSorTypes] = useState([]);
  const [selectedType, setSelectedType] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoading, setLoading] = useState(false);

  // Function to handle adding a step
  const addStep = () => {
    const newStepNumber = Object.keys(stepsTaken).length + 1;
    setStepsTaken({
      ...stepsTaken,
      [newStepNumber]: "" 
    });
  };

  // Function to handle updating a step
  const updateStep = (stepNumber, value) => {
    setStepsTaken({
      ...stepsTaken,
      [stepNumber]: value 
    });
  };

  // Function to handle removing a step
  const removeStep = (stepNumber) => {
    const newSteps = { ...stepsTaken };
    delete newSteps[stepNumber]; 
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

  useEffect(() => {
    const fetchSorTypes = async () => {
      try {
        //retrieve token from local storage
        const token = await AsyncStorage.getItem("token");

        //fetch SOR types
        const { data } = await ApiManager.get("/sor-types", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setSorTypes(data.data);
      } catch (error) {
        console.error("Error fetching SOR types:", error);
      }
    };

    fetchSorTypes();
  }, []);

  const handleOpenModal = () => {
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };
  const handleRemoveImage = async (uri) => {
    await FileSystem.deleteAsync(uri);
    //update images array
    images = images.filter((img) => img !== uri);
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
    formData.append("type_id", selectedType);

    //loop through the images and add them to the images array
    for (let i = 0; i < images.length; i++) {
      const image = {
        uri: images[i],
        name: Date.now() + i + "." + images[i].split(".").pop(),
        type: `image/${images[i].split(".").pop()}`
      };
      formData.append("images[]", image); 
    }
    console.log("steps taken", stepsTaken);
    console.log("formData after", formData);
    onSubmit(formData);
  };

  //onSubmit function
  const onSubmit = async (formData) => {
    try {
      //retrieve token from local storage
      const token = await AsyncStorage.getItem("token");
      console.log("retrieve token", token);
      //retrieve user id from local storage
      const user = await AsyncStorage.getItem("user");
      const userId = JSON.parse(user).id;
      //add user id to form data
      formData.append("assignor_id", userId);

      //create SOR record and upload images
      const response = await fetch('https://test.tokenlessreport.optitech.co.ke/api/sor', {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`
        },
        body: formData
      });
      

      console.log("submitting form data", formData);

      console.log("response", response);

      if (response.status !== 200) {
        setLoading(false);
        throw new Error("Failed to create SOR record.");
      } else {
        setObservation("");
        setStatus("0");
        setStepsTaken({});
        setActionOwner("");
        setSelectedType("");

        //loop through the images array and reset it
        for (let i = 0; i < images.length; i++) {
          //pop each image from the images array
          images.pop();
        }
        
        console.log("SOR record created:", formData);
        setLoading(false);
        Alert.alert("Success", "SOR record created successfully.");
      }
    } catch (error) {
      console.error("Error creating SOR record:", error);
      console.log("error", error.message);
      setLoading(false);
      Alert.alert("Error", "Failed to create SOR record.");
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
    closeDrawer();
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
            <Text style={styles.title}>Add Safety Observation Record</Text>
            <View style={{ borderWidth: 1, borderColor: "#ccc", padding: 16 }}>
              <View style={{ marginBottom: 16 }}>
                <Text style={styles.label}>Observation</Text>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: "#ccc",
                    borderRadius: 4,
                    padding: 8,
                    color: "black",
                    textAlignVertical: "top"         
                  }}
                  placeholder="Enter Observation"
                  placeholderTextColor={"#ccc"}
                  height={100}
                  value={observation}
                  onChangeText={(text) => setObservation(text)}
                />
              </View>
              <View style={{ marginBottom: 16 }}>
                <Text style={styles.label}>Status</Text>
                <Picker
                  selectedValue={status}
                  onValueChange={(itemValue) => setStatus(itemValue)}
                  style={styles.picker}
                  itemStyle={styles.pickerItem}
                >
                  <Picker.Item label="Select Status" value="" />
                  <Picker.Item label="Open" value="0" />
                  <Picker.Item label="Closed" value="1" />
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
                        color: "black"
                      }}
                      placeholder="Enter Step"
                      placeholderTextColor={"#ccc"}
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
                    color: "black"
                  }}
                  placeholder="Enter Action Owner"
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
              <View style={{ marginBottom: 16 }}>
                <Text style={styles.label}>Record Type</Text>
                <Picker
                  selectedValue={selectedType}
                  onValueChange={(itemValue) => setSelectedType(itemValue)}
                  style={{
                    borderWidth: 1,
                    borderColor: "#ccc",
                    borderRadius: 4,
                    padding: 8,
                    color: "black"
                  }}
                >
                  <Picker.Item label="Select Record Type" value="" />
                  {Object.entries(sorTypes).map(([id, type]) => (
                    <Picker.Item key={id} label={type} value={id} />
                  ))}
                </Picker>
              </View>
              <TouchableOpacity
                style={{
                  backgroundColor: "green",
                  padding: 10,
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
    fontWeight: "bold",
    padding: 10,
    textAlign: "center"
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

export default AddRecordScreen;
