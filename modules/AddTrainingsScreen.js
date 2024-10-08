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
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import ApiManager from '../api/ApiManager';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';
import {FlatList} from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/Ionicons';
import MenuScreen from '../components/MenuScreen';
import config from '../config/config';
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
    setSelectedImages(selectedImages.filter((img, i) => i !== index));
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

const AddTrainingsScreen = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const drawerRef = useRef(null);
  const [topic, setTopic] = useState('');
  const [attendees, setAttendees] = useState('');
  const [comments, setComments] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoading, setLoading] = useState(false);

  const handleOpenModal = () => {
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };
  const handleRemoveImage = async uri => {
    await FileSystem.deleteAsync(uri);
    //update images array
    images = images.filter(img => img !== uri);
  };

  // Handle form submission

  const handleSubmit = () => {
    if (!topic || !attendees || !comments) {
      Alert.alert('Error', 'Please fill all fields.');
      return;
    }
    setLoading(true);

    const formData = new FormData();
    console.log('formData before', formData);

    formData.append('topic', topic);
    formData.append('attendees', attendees);
    formData.append('comments', comments);

    //loop through the images and add them to the images array
    for (let i = 0; i < images.length; i++) {
      const image = {
        uri: images[i],
        name: Date.now() + i + '.' + images[i].split('.').pop(),
        type: `image/${images[i].split('.').pop()}`,
      };
      formData.append('images[]', image);
    }
    console.log('formData after', formData);
    onSubmit(formData);
  };

  //onSubmit function
  const onSubmit = async formData => {
    try {
      //retrieve token from local storage
      const token = await AsyncStorage.getItem('token');
      console.log('retrieve token', token);
      //retrieve user id from local storage

      //create Training record
      const response = await fetch(`${config.webapp_url}/api/trainings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      console.log('submitting form data', formData);

      console.log('response', response);

      if (response.status !== 200) {
        setLoading(false);
        throw new Error('Failed to create Training record.');
      } else {
        setAttendees('');
        setComments('');
        setTopic('');

        //loop through the images array and reset it
        for (let i = 0; i < images.length; i++) {
          //pop each image from the images array
          images.pop();
        }

        console.log('images array after reset', images);
        setLoading(false);
        Alert.alert('Success', 'Training record created successfully.');
      }
    } catch (error) {
      console.error('Error creating Training record', error);
      console.log('error', error.message);
      setLoading(false);
      Alert.alert('Error', 'Failed to create Training record.');
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
            <Text style={styles.title}>Add Training</Text>
            <View style={{borderWidth: 1, borderColor: '#ccc', padding: 16}}>
              <View style={{marginBottom: 16}}>
                <Text style={styles.label}>Topic</Text>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: '#ccc',
                    borderRadius: 4,
                    padding: 8,
                    color: 'black',
                  }}
                  placeholder="Enter Topic"
                  placeholderTextColor={'#ccc'}
                  value={topic}
                  onChangeText={text => setTopic(text)}
                />
              </View>
              <View style={{marginBottom: 16}}>
                <Text style={styles.label}>Attendees</Text>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: '#ccc',
                    borderRadius: 4,
                    padding: 8,
                    color: 'black',
                  }}
                  placeholder="Enter Attendees"
                  placeholderTextColor={'#ccc'}
                  value={attendees}
                  onChangeText={text => setAttendees(text)}
                />
              </View>
              <View style={{marginBottom: 16}}>
                <Text style={styles.label}>Comments</Text>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: '#ccc',
                    borderRadius: 4,
                    padding: 8,
                    color: 'black',
                    textAlignVertical: 'top',
                  }}
                  placeholder="Enter Comments"
                  placeholderTextColor={'#ccc'}
                  height={100}
                  value={comments}
                  onChangeText={text => setComments(text)}
                />
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
              <TouchableOpacity
                style={{
                  backgroundColor: 'green',
                  padding: 10,
                  borderRadius: 4,
                  alignItems: 'center',
                }}
                onPress={handleSubmit}>
                <Text style={{color: 'white'}}>Submit</Text>
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
    textAlign: 'center',
    marginVertical: 10,
    color: '#007bff',
    fontWeight: 'bold',
  },
  heading: {
    fontWeight: 'bold',
    padding: 10,
    textAlign: 'center',
  },
  menu: {
    position: 'absolute',
    top: 10,
    left: 10,
  },
  modalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginVertical: 20,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
  },
  images: {
    width: 90,
    height: 90,
    marginVertical: 10,
    alignSelf: 'center',
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
  picker: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
    color: 'black',
  },
};

export default AddTrainingsScreen;
