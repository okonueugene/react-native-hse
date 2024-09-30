import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Button,
  Dimensions,
  Image,
  StyleSheet,
  DrawerLayoutAndroid,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MenuScreen from '../components/MenuScreen';
import ApiManager from '../api/ApiManager';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Preloader from '../components/Preloader';
import {useNavigation} from '@react-navigation/native';
import config from '../config/config';
import QuickAccess from '../components/QuickAcessFooter';

const ViewTaskModal = ({task, onClose, visible}) => {
  if (!visible || !task) {
    return null; // If modal is not visible or task data is not provided, don't render anything
  }

  const cleanMediaUrl = url => {
    return url.replace(
      /^http:\/\/localhost\/storage\//,
      config.media_url + '/storage/',
    );
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}>
      <ScrollView style={styles.modalScrollView}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>View Task</Text>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                {/* Replace with an icon component if desired */}
                <Text>X</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <Text style={styles.label}>Title</Text>
              <TextInput
                style={styles.textInput}
                value={task.title}
                editable={false}
                multiline={true}
              />
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={styles.textInput}
                value={task.description}
                editable={false}
                multiline={true}
              />
              <Text style={styles.label}>Comments</Text>
              <TextInput
                style={styles.textInput}
                value={task.comments}
                editable={false}
                multiline={true}
              />
              <Text style={styles.label}>Start Date</Text>
              <TextInput
                style={styles.textInput}
                value={task.from}
                editable={false}
              />
              <Text style={styles.label}>End Date</Text>
              <TextInput
                style={styles.textInput}
                value={task.to}
                editable={false}
              />
              <Text style={styles.label}>Status</Text>
              <TextInput
                style={styles.textInput}
                value={task.status}
                editable={false}
              />
              {/* Render media */}
              {task.media?.length > 0 && (
                <View style={styles.mediaContainer}>
                  <Text style={styles.mediaLabel}>Media:</Text>
                  {task.media.map((item, index) => (
                    <View key={index} style={styles.mediaItem}>
                      <Image
                        source={{uri: cleanMediaUrl(item.original_url)}}
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
          </View>
        </View>
      </ScrollView>
    </Modal>
  );
};

const TasksScreen = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [tasks, setTasks] = useState([]); // State to store tasks
  const [isLoading, setIsLoading] = useState(true); // State to track loading state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const drawerRef = useRef(null);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [selectedBadPractice, setSelectedBadPractice] = useState(null);

  const navigation = useNavigation();

  const handleOutsideTouch = () => {
    closeDrawer(); // Close the drawer when touched outside
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    drawerRef.current.closeDrawer();
  };

  useEffect(() => {
    // Fetch tasks when component mounts
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      // Retrieve token from local storage
      const token = await AsyncStorage.getItem('token');

      // Fetch tasks for the current page
      const response = await ApiManager.get(`/tasks`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Handle the response
      if (response.status === 200) {
        // Set the tasks
        setTasks(response.data.data);
        // Set loading to false
        setIsLoading(false);
      } else {
        // Handle error
        console.error(response.data);
      }
    } catch (error) {
      setIsLoading(false);
      console.error(error);

      // Handle error

      if (error.response.status === 401) {
        alert('You are not authorized to view this page try logging in again');
        // Redirect to dashboard
        navigation.navigate('Dashboard');
      }
    }
  };

  const navigationView = () => <MenuScreen closeDrawer={closeDrawer} />;

  const totalPages = Math.ceil(tasks.length / itemsPerPage);

  const handleNextPage = () => {
    setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    setCurrentPage(currentPage - 1);
  };

  const handleViewTask = task => {
    setSelectedBadPractice(task);
    setIsViewModalVisible(true);
  };

  const renderTasks = () => {
    return tasks
      .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
      .map(task => (
        <View
          key={task.id}
          style={{
            flexDirection: 'row',
            borderBottomWidth: 1,
            borderBottomColor: '#ccc',
            paddingVertical: 8,
          }}>
          <Text style={[styles.column, {flex: 2, marginRight: 16}]}>
            {task.description}
          </Text>
          <TouchableOpacity
            style={{
              backgroundColor: 'transparent',
              padding: 4,
              borderRadius: 5,
              marginRight: 16,
              justifyContent: 'center',
              alignItems: 'center',
              height: 30,
            }}
            onPress={() => {
              handleViewTask(task);
            }}>
            <Icon name="eye" size={16} color="#2a19e8" />
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              backgroundColor: 'transparent',
              padding: 4,
              borderRadius: 5,
              justifyContent: 'center',
              alignItems: 'center',
              height: 30,
            }}>
            <Icon name="create" size={16} color="#e89519" />
          </TouchableOpacity>
        </View>
      ));
  };
  return (
    <DrawerLayoutAndroid
      ref={drawerRef}
      drawerWidth={200}
      drawerPosition="left"
      renderNavigationView={navigationView}>
      <View style={{flex: 1}}>
        {/* Wrap the content in a ScrollView */}
        <ScrollView
          contentContainerStyle={{flexGrow: 1}}
          onTouchStart={handleOutsideTouch} // Handle touch outside drawer
          onScrollBeginDrag={handleOutsideTouch} // Handle scroll outside drawer
        >
          {/* <TouchableOpacity style={styles.menu} onPress={toggleDrawer}>
            <Icon name="menu" size={24} color="black" />
          </TouchableOpacity> */}
          {/* Header */}
          <Text style={styles.title}>Tasks</Text>
          <View style={{flex: 1, padding: 10}}>
            {/* Render the preloader if loading */}
            {isLoading && (
              <View style={styles.preloaderContainer}>
                <Preloader />
              </View>
            )}
            {!isLoading && (
              <>
                <View
                  style={{
                    flexDirection: 'row',
                    borderBottomWidth: 1,
                    borderBottomColor: '#ccc',
                  }}>
                  <Text style={[styles.heading, styles.column]}>
                    Observation
                  </Text>
                  <Text style={[styles.heading, styles.column]}>Action</Text>
                </View>
                {renderTasks()}
                {/* Pagination controls */}
                <View style={{flexDirection: 'row', justifyContent: 'center'}}>
                  <TouchableOpacity
                    style={styles.paginationButton}
                    onPress={handlePrevPage}
                    disabled={currentPage === 1}>
                    <Text>Previous</Text>
                  </TouchableOpacity>
                  <Text style={styles.pageIndicator}>
                    Page {currentPage} of {totalPages}
                  </Text>
                  <TouchableOpacity
                    style={styles.paginationButton}
                    onPress={handleNextPage}
                    disabled={currentPage === totalPages}>
                    <Text>Next</Text>
                  </TouchableOpacity>
                </View>
                <ViewTaskModal
                  task={selectedBadPractice}
                  onClose={() => setIsViewModalVisible(false)}
                  visible={isViewModalVisible}
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
    padding: 10,
  },
  menu: {
    position: 'absolute',
    top: 10,
    left: 10,
  },
  addButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#007bff',
    padding: 5,
    borderRadius: 5,
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginVertical: 10,
    color: '#007bff',
    fontWeight: 'bold',
  },
  heading: {
    fontWeight: 'bold',
    padding: 10,
    textAlign: 'center',
    backgroundColor: '#f0f0f0',
    color: '#333',
    borderBottomWidth: 1,
  },
  column: {
    flex: 1,
    padding: 10,
    color: '#333',
  },
  text: {
    textAlign: 'center',
  },
  paginationButton: {
    padding: 8,
    marginHorizontal: 5,
    backgroundColor: '#007bff',
    borderRadius: 5,
    marginTop: 10,
  },
  pageIndicator: {
    padding: 8,
    marginHorizontal: 5,
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
  preloaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '100%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
    borderRadius: 5,
    backgroundColor: '#f41313',
  },
  modalBody: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  textInput: {
    padding: 10,
    backgroundColor: '#eee',
    color: '#000',
    borderRadius: 5,
    marginBottom: 15,
  },
  mediaContainer: {
    marginBottom: 15,
  },
  mediaLabel: {
    fontSize: 16,
    marginBottom: 5,
  },
  mediaImage: {
    //calculate the width of the image based on the screen width
    width: '100%',
    height: 200,
    marginBottom: 5,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
});

export default TasksScreen;
