import React, {useState, useRef, useEffect} from 'react';
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
  Alert,
} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import {FlatList} from 'react-native-gesture-handler';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import ApiManager from '../api/ApiManager';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';
import Icon from 'react-native-vector-icons/Ionicons';
import config from '../config/config';
import MenuScreen from '../components/MenuScreen';
import KeyboardAvoidingWrapper from '../components/KeyboardAvoidingWrapper';
import QuickAccess from '../components/QuickAcessFooter';

let images = [];

const UploadImageModal = ({visible, onClose, onRemoveImage}) => {
  const imgDir = `${RNFS.DocumentDirectoryPath}/images`;

  const ensureDirExists = async () => {
    try {
      await RNFS.mkdir(imgDir);
    } catch (error) {
      console.error('Error creating images directory:', error);
    }
  };

  const [selectedImages, setSelectedImages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    ensureDirExists();
  }, []);

  const selectImage = async useLibrary => {
    const options = {
      mediaType: 'photo',

      selectionLimit: 0,

      quality: 1,
    };

    let result;

    if (useLibrary) {
      result = await launchImageLibrary(options, response => {
        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else if (response.error) {
          console.log('ImagePicker Error: ', response.error);
        } else {
          const source = response.assets.map(img => img.uri);

          setSelectedImages([...selectedImages, ...source]);

          images = [...images, ...source];
        }
      });
    } else {
      result = await launchCamera(options, response => {
        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else if (response.error) {
          console.log('ImagePicker Error: ', response.error);
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

    const newImages = selectedImages.filter((_, i) => i !== index);

    setSelectedImages(newImages);

    images = images.filter((_, i) => i !== index);
  };

  const closeModal = () => {
    onClose();
    setSelectedImages([]);
  };

  const renderItem = ({item, index}) => {
    const filename = item.split('/').pop();

    return (
      <View
        style={{
          flexDirection: 'row',
          margin: 1,
          alignItems: 'center',
          gap: 5,
        }}>
        <Image source={{uri: item}} style={styles.images} />
        <Text style={{flex: 1}}>{filename}</Text>

        <Icon.Button name="trash" onPress={() => handleRemoveImage(index)} />
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
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(0,0,0,0.4)',
            },
          ]}>
          <ActivityIndicator animating size="large" color="#fff" />
        </View>
      )}
    </Modal>
  );
};

const AddIncidentScreen = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const drawerRef = useRef(null);
  const [incidentDescription, setIncidentDescription] = useState('');
  const [investigationStatus, setInvestigationStatus] = useState(null);
  const [incidentStatus, setIncidentStatus] = useState(null);
  const [incidentTypes, setIncidentTypes] = useState([]);
  const [incidentType, setIncidentType] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoading, setLoading] = useState(false);

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

  const capitalize = string => {
    const words = string.split('_');
    const capitalizedWords = words.map(
      word => word.charAt(0).toUpperCase() + word.slice(1),
    );
    return capitalizedWords.join(' ');
  };

  const fetchIncidentTypes = async () => {
    try {
      // Retrieve token from local storage
      const token = await AsyncStorage.getItem('token');

      // Fetch incident types
      const {data} = await ApiManager.get('/incident-types', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('Incident types:', data.data);

      const types = data.data.reduce((acc, type) => {
        acc[type.id] = capitalize(type.incident_type);
        return acc;
      }, {});

      setIncidentTypes(types);
    } catch (error) {
      console.error('Error fetching incident types:', error.response);
    }
  };

  useEffect(() => {
    fetchIncidentTypes();
  }, []);

  const handleOpenModal = () => {
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };
  const handleRemoveImage = async uri => {
    try {
      await RNFS.unlink(uri);
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  // Handle form submission

  const handleSubmit = () => {
    console.log('submitting form data');
    if (!incidentDescription || !investigationStatus || !incidentStatus) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    //fetch user from local storage
    setLoading(true);

    const formData = new FormData();
    console.log('formData before', formData);

    formData.append('incident_description', incidentDescription);
    formData.append('investigation_status', investigationStatus);
    formData.append('incident_status', incidentStatus);
    formData.append('incident_type_id', incidentType);

    //loop through the images and add them to the images array
    for (let i = 0; i < images.length; i++) {
      const image = {
        uri: images[i],
        name: Date.now() + i + '.' + images[i].split('.').pop(),
        type: `image/${images[i].split('.').pop()}`, // Ensure correct content type
      };
      formData.append('images[]', image); // Use key with square brackets
    }

    console.log('formData  after', formData);
    onSubmit(formData);
  };

  //onSubmit function
  const onSubmit = async formData => {
    console.log('submitting form data', formData);
    try {
      //retrieve token from local storage
      const token = await AsyncStorage.getItem('token');
      console.log('retrieve token', token);
      //fetch user from local storage
      const user = await AsyncStorage.getItem('user');
      //get user id
      const userId = JSON.parse(user).id;
      //add user id to form data
      formData.append('user_id', userId);
      //create incident
      const response = await fetch(`${config.webapp_url}/api/incident`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });
      console.log('submitting form data', formData);

      console.log('response', response);

      if (response.status !== 200) {
        setLoading(false);
        throw new Error('Failed to create SOR record.');
      } else {
        setIncidentDescription('');
        setInvestigationStatus('open');
        setIncidentStatus('no');
        setIncidentType('');

        //loop through the images and delete them from the images array
        for (let i = 0; i < images.length; i++) {
          images.pop();
          //update images array
          images = [];
        }

        setLoading(false);
        Alert.alert('Success', 'Incident record created successfully.');
      }
    } catch (error) {
      console.error('Error creating SOR record:', error.response);
      setLoading(false);
      Alert.alert('Error', 'Failed to create SOR record.');
    }
  };

  return (
    <DrawerLayoutAndroid
      ref={drawerRef}
      drawerWidth={200}
      drawerPosition="left"
      renderNavigationView={navigationView}>
      <View style={{flex: 1}}>
        <ScrollView
          contentContainerStyle={{flexGrow: 1}}
          onTouchStart={handleOutsideTouch}
          onScrollBeginDrag={handleOutsideTouch}>
          {/* <TouchableOpacity style={styles.menu} onPress={toggleDrawer}>
            <Icon name="menu" size={24} color="black" />
          </TouchableOpacity> */}
          <View style={{flex: 1, paddingHorizontal: 16, paddingVertical: 24}}>
            <Text style={styles.title}>Incident Records</Text>

            <View style={{borderWidth: 1, borderColor: '#ccc', padding: 16}}>
              <Text style={styles.heading}>Add An Incident</Text>
              <View style={{borderWidth: 1, borderColor: '#ccc', padding: 16}}>
                <View style={{marginBottom: 16}}>
                  <Text style={styles.label}>Incident Description</Text>
                  <TextInput
                    style={{
                      borderWidth: 1,
                      borderColor: '#ccc',
                      borderRadius: 4,
                      padding: 8,
                      color: "black",
                      textAlignVertical: "top"  
                    }}
                    multiline
                    placeholder="Enter incident description"
                    placeholderTextColor={'#ccc'}
                    height={100}
                    
                    value={incidentDescription}
                    onChangeText={text => setIncidentDescription(text)}
                  />
                </View>
                <View style={{marginBottom: 16}}>
                  <Text style={styles.label}>Investigation Status</Text>
                  <Picker
                    selectedValue={investigationStatus}
                    onValueChange={itemValue =>
                      setInvestigationStatus(itemValue)
                    }
                    style={{
                      borderWidth: 1,
                      borderColor: '#ccc',
                      borderRadius: 4,
                      padding: 8,
                      color: '#000',
                    }}>
                      <Picker.Item label="Tap to select" value="" />
                    <Picker.Item label="Open" value="open" />
                    <Picker.Item label="Closed" value="closed" />
                  </Picker>
                </View>
                <View style={{marginBottom: 16}}>
                  <Text style={styles.label}>Incident Status</Text>
                  <Picker
                    selectedValue={incidentStatus}
                    onValueChange={itemValue => setIncidentStatus(itemValue)}
                    style={{
                      borderWidth: 1,
                      borderColor: '#ccc',
                      borderRadius: 4,
                      padding: 8,
                      color: '#000',
                    }}>
                      <Picker.Item label="Tap to select" value="" />
                    <Picker.Item label="Yes" value="yes" />
                    <Picker.Item label="No" value="no" />
                  </Picker>
                </View>
                <TouchableOpacity
                  style={{
                    backgroundColor: 'blue',
                    padding: 10,
                    borderRadius: 4,
                    alignItems: 'center',
                    marginBottom: 16,
                  }}
                  onPress={handleOpenModal}>
                  <Text style={{color: 'white'}}>Select Images</Text>
                </TouchableOpacity>
                <FlatList
                  data={images}
                  renderItem={({item}) => (
                    <Image source={{uri: item}} style={styles.images} />
                  )}
                  keyExtractor={item => item}
                  horizontal
                />
                <View style={{marginBottom: 16}}>
                  <Text style={styles.label}>Incident Type</Text>
                  <Picker
                    selectedValue={incidentType}
                    onValueChange={itemValue => setIncidentType(itemValue)}
                    style={{
                      borderWidth: 1,
                      borderColor: '#ccc',
                      borderRadius: 4,
                      padding: 8,
                      color: '#000',
                    }}>
                    <Picker.Item label="Tap to Select Incident Type" value="" />
                    {Object.entries(incidentTypes).map(([id, type]) => (
                      <Picker.Item key={id} label={type} value={id} />
                    ))}
                  </Picker>
                </View>
                <TouchableOpacity
                  style={{
                    backgroundColor: '#007bff',
                    padding: 8,
                    borderRadius: 4,
                    alignItems: "center"
                  }}
                  onPress={handleSubmit}>
                  <Text style={{color: '#fff'}}>Submit</Text>
                </TouchableOpacity>
              </View>
              {isLoading ? (
                <View
                  style={[
                    StyleSheet.absoluteFill,
                    {
                      justifyContent: 'center',
                      alignItems: 'center',
                      backgroundColor: 'rgba(0,0,0,0.4)',
                    },
                  ]}>
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
  title: {
    fontSize: 21,
    textAlign: 'center',
    marginVertical: 10,
    color: '#007bff',
    fontWeight: 'bold',
  },
  heading: {
    padding: 10,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007bff',
  },
  menu: {
    position: 'absolute',
    top: 10,
    left: 10,
  },
  images: {
    width: 100,
    height: 100,
    margin: 5,
  },
  modalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cardFooter: {
    fontSize: 14,
    color: '#666',
  },
  footer: {
    backgroundColor: '#fff',
    padding: 10,
    marginTop: 10,
    alignItems: 'center',
  },
  footerText: {
    color: '#666',
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default AddIncidentScreen;
