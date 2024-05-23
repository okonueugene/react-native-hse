import React, { useState, useRef, useEffect , useContext} from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    ScrollView,
    StyleSheet,
    DrawerLayoutAndroid
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MenuScreen from "../components/MenuScreen";
import DashboardScreen from "./DashboardScreen";
import AddIcaScreen from "./AddIcaScreen";
import AddIncidentScreen from "./AddIncidentScreen";
import AddRecordScreen from "./AddRecordScreen";
import BadPractisesScreen from "./BadPractisesScreen";
import EnvironmentalConcernsScreen from "./EnvironmentalConcernsScreen";
import FirstAidCaseScreen from "./FirstAidCaseScreen";
import GoodPractisesScreen from "./GoodPractisesScreen";
import LostTimeAccidentScreen from "./LostTimeAccidentsScreen";
import MedicalTreatmentCaseScreen from "./MedicalTreatedCaseScreen";
import NearMissScreen from "./NearMissScreen";
import OpenIncidentsScreen from "./OpenIncidentsScreen";
import OpenSorsScreen from "./OpenSorsScreen";
import PermitsApplicableScreen from "./PermitsApplicableScreen";
import PersonnelScreen from "./PersonnelScreen";
import ReportedHazardsScreen from "./ReportedHazardsScreen";
import SIFScreen from "./SIFScreen";
import SuggestedImprovementsScreen from "./SuggestedImprovementsScreen";
import SupervisorScreen from "./SupervisorScreen";
import TasksScreen from "./TasksScreen";
import ViewIcaScreen from "./ViewIcaScreen";
import FirstResponderScreen from "./FirstResponderScreen";
import AddEnvironmentalConcerns from "./AddEnvironmentalConcerns";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ApiManager from "../api/ApiManager";
import Preloader from "../components/Preloader";
import KeyboardAvoidingWrapper from "../components/KeyboardAvoidingWrapper";
import { MainContext } from "../storage/MainContext";

const Stack = createStackNavigator();

const LandingPage = () => {

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const drawerRef = useRef(null);

    const toggleDrawer = () => {
        setIsDrawerOpen(!isDrawerOpen);
        if (!isDrawerOpen) {
            drawerRef.current.openDrawer();
        } else {
            drawerRef.current.closeDrawer();
        }
    };



    const closeDrawer = () => {
        setIsDrawerOpen(false);
        drawerRef.current.closeDrawer();
    };


    const navigationView = () => <MenuScreen closeDrawer={closeDrawer} />;
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Function to check if user is logged in
    const checkLogin = async () => {
        try {
            const token = await AsyncStorage.getItem("token");
            if (token) {
                setIsAuthenticated(true);
            } else {
                setIsAuthenticated(false);
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        checkLogin();
    }, []);

    return (
        <NavigationContainer>
            {isAuthenticated ? (
                <DrawerLayoutAndroid
                    ref={drawerRef}
                    drawerWidth={200}
                    drawerPosition="left"
                    renderNavigationView={navigationView}
                >
                    <Stack.Navigator
                        initialRouteName="Dashboard"
                        screenOptions={{
                            headerStyle: {
                                backgroundColor: "#fbf7fc"
                            },
                            headerTintColor: "#fff",
                            headerTitleAlign: "center",
                            headerTitle: "Quality Health And Safety",
                            headerTitleStyle: {
                                fontWeight: "bold",
                                fontSize: 20,
                                color: "#007bff"
                            },
                            headerLeft: (props) => (
                                <TouchableOpacity onPress={toggleDrawer}>
                                    <Ionicons
                                        name="menu"
                                        size={30}
                                        color="#007bff"
                                        style={{ marginLeft: 10 }}
                                    />
                                </TouchableOpacity>
                            )
                        }}
                    >

                        <Stack.Screen name="Dashboard" component={DashboardScreen} />
                        <Stack.Screen name="Supervisor" component={SupervisorScreen} />
                        <Stack.Screen name="Personnel" component={PersonnelScreen} />
                        <Stack.Screen name="First Responder" component={FirstResponderScreen} />
                        <Stack.Screen name="Tasks" component={TasksScreen} />
                        <Stack.Screen name="Open Incidents" component={OpenIncidentsScreen} />
                        <Stack.Screen name="Open Sors" component={OpenSorsScreen} />
                        <Stack.Screen
                            name="Reported Hazards"
                            component={ReportedHazardsScreen}
                        />
                        <Stack.Screen name="Near Miss" component={NearMissScreen} />
                        <Stack.Screen
                            name="Lost Time Accident"
                            component={LostTimeAccidentScreen}
                        />
                        <Stack.Screen
                            name="Medical Treatment Case"
                            component={MedicalTreatmentCaseScreen}
                        />
                        <Stack.Screen name="First Aid Case" component={FirstAidCaseScreen} />
                        <Stack.Screen name="SIF" component={SIFScreen} />
                        <Stack.Screen
                            name="Environmental Concerns"
                            component={EnvironmentalConcernsScreen}
                        />
                        <Stack.Screen name="Bad Practises" component={BadPractisesScreen} />
                        <Stack.Screen name="Good Practises" component={GoodPractisesScreen} />
                        <Stack.Screen
                            name="Suggested Improvements"
                            component={SuggestedImprovementsScreen}
                        />
                        <Stack.Screen
                            name="Permits Applicable"
                            component={PermitsApplicableScreen}
                        />
                        <Stack.Screen name="Add Incident" component={AddIncidentScreen} />
                        <Stack.Screen name="Add Record" component={AddRecordScreen} />
                        <Stack.Screen name="Add Ica" component={AddIcaScreen} />
                        <Stack.Screen name="View Ica" component={ViewIcaScreen} />
                        <Stack.Screen
                            name="Add Environment Concern"
                            component={AddEnvironmentalConcerns}
                        />

                    </Stack.Navigator>
                </DrawerLayoutAndroid>
            ) : (
                <DrawerLayoutAndroid
                    ref={drawerRef}
                    drawerWidth={200}
                    drawerPosition="left"
                    renderNavigationView={navigationView}
                >
                    <Stack.Navigator
                        initialRouteName="Login"
                        screenOptions={{
                            headerStyle: {
                                backgroundColor: "#fbf7fc"

                            },
                            headerTintColor: "#fff",
                            headerTitleAlign: "center",
                            headerTitle: "Quality Health And Safety",
                            headerTitleStyle: {
                                fontWeight: "bold",
                                fontSize: 20,
                                color: "#007bff"
                            },

                        }}
                    >
                        <Stack.Screen name="Login" component={LoginScreen} />
                        {/* <Stack.Screen name="Dashboard" component={DashboardScreen} 
                        screenOptions={{
                            headerStyle: {
                                backgroundColor: "#fbf7fc"
                            },
                            headerTintColor: "#fff",
                            headerTitleAlign: "center",
                            headerTitle: "Quality Health And Safety",
                            headerTitleStyle: {
                                fontWeight: "bold",
                                fontSize: 20,
                                color: "#007bff"
                            },
                            headerLeft: (props) => (
                                <TouchableOpacity onPress={toggleDrawer}>
                                    <Ionicons
                                        name="menu"
                                        size={30}
                                        color="#007bff"
                                        style={{ marginLeft: 10 }}
                                    />
                                </TouchableOpacity>
                            )
                        }}/>
                        <Stack.Screen name="Supervisor" component={SupervisorScreen} />
                        <Stack.Screen name="Personnel" component={PersonnelScreen} />
                        <Stack.Screen name="Tasks" component={TasksScreen} />
                        <Stack.Screen name="Open Incidents" component={OpenIncidentsScreen} />
                        <Stack.Screen name="Open Sors" component={OpenSorsScreen} />
                        <Stack.Screen
                            name="Reported Hazards"
                            component={ReportedHazardsScreen}
                        />
                        <Stack.Screen name="Near Miss" component={NearMissScreen} />
                        <Stack.Screen
                            name="Lost Time Accident"
                            component={LostTimeAccidentScreen}
                        />
                        <Stack.Screen
                            name="Medical Treatment Case"
                            component={MedicalTreatmentCaseScreen}
                        />
                        <Stack.Screen name="First Aid Case" component={FirstAidCaseScreen} />
                        <Stack.Screen name="SIF" component={SIFScreen} />
                        <Stack.Screen
                            name="Environmental Concerns"
                            component={EnvironmentalConcernsScreen}
                        />
                        <Stack.Screen name="Bad Practises" component={BadPractisesScreen} />
                        <Stack.Screen name="Good Practises" component={GoodPractisesScreen} />
                        <Stack.Screen
                            name="Suggested Improvements"
                            component={SuggestedImprovementsScreen}
                        />
                        <Stack.Screen
                            name="Permits Applicable"
                            component={PermitsApplicableScreen}
                        />
                        <Stack.Screen name="Add Incident" component={AddIncidentScreen} />
                        <Stack.Screen name="Add Record" component={AddRecordScreen} />
                        <Stack.Screen name="Add Ica" component={AddIcaScreen} />
                        <Stack.Screen name="View Ica" component={ViewIcaScreen} />
                        <Stack.Screen
                            name="Add Environment Concern"
                            component={AddEnvironmentalConcerns}
                        /> */}
                    </Stack.Navigator>
                </DrawerLayoutAndroid>

            )}
        </NavigationContainer>
    );
}

export default LandingPage;

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { dispatch } = useContext(MainContext);


    const handleTogglePassword = () => {
        setShowPassword(!showPassword);
    };

    const handleLogin = async () => {
        try {
            setIsLoading(true);

            const response = await ApiManager.post("/login", {
                email,
                password
            });
            if (response.status === 200) {
                // Save token to AsyncStorage
                await AsyncStorage.setItem("token", response.data.token);
                // Save user to AsyncStorage
                await AsyncStorage.setItem("user", JSON.stringify(response.data.user));

                //dispatch
                dispatch({ type: 'LOGIN', payload: { user: response.data.user, token: response.data.token } });

                //clear inputs
                setEmail("");
                setPassword("");

                setIsLoading(false); // Set loading state to false after successful login

                setErrorMessage("");
                setSuccessMessage("");
  
            }
        } catch (error) {
            setIsLoading(false); // Set loading state to false after login request completes

            // console.error(error);
            if (error.response.status === 401) {
                // Display error message
                setErrorMessage("Invalid email or password");
                setSuccessMessage(""); // Clear any previous success message
            } else if (error.response.status === 422) {
                // Display error message
                setErrorMessage(error.response.data.message);
                setSuccessMessage(""); // Clear any previous success message
            } else {
                // Display error message
                setErrorMessage("An error occurred. Please try again later.");
                setSuccessMessage(""); // Clear any previous success message
            }
        }
    };

    return (
        <KeyboardAvoidingWrapper>
            <ScrollView contentContainerStyle={styles.container}>
                {isLoading ? ( // Render preloader if isLoading is true
                    <View style={[styles.blinkingImageContainer, StyleSheet.absoluteFill]}>
                        <Preloader />
                    </View>
                ) : (
                    <>
                        {/* Logo */}
                        <View style={styles.logoContainer}>
                            <Image
                                source={require("../images/OptiSafe Logo -01.png")}
                                style={styles.logo}
                                resizeMode="center"
                            />
                        </View>

                        {/* Welcome message */}
                        <Text style={styles.welcomeText}>Welcome to HSE! 👋</Text>

                        {/* Email input */}
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your Email or Username"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            autoFocus
                        />

                        {/* Password input */}
                        <View style={styles.passwordInputContainer}>
                            <TextInput
                                style={styles.passwordInput}
                                placeholder="Password"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                            />
                            <TouchableOpacity
                                onPress={handleTogglePassword}
                                style={styles.eyeIcon}
                            >
                                {/* Render eye icon based on showPassword state */}
                                <Ionicons
                                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                                    size={24}
                                    color="black"
                                />
                            </TouchableOpacity>
                        </View>

                        {/* Remember me checkbox */}
                        <View style={styles.rememberMeContainer}>
                            <TouchableOpacity onPress={() => { }} style={styles.checkbox}>
                                <View style={styles.checkboxInner} />
                            </TouchableOpacity>
                            <Text style={styles.rememberMeText}>Remember Me</Text>
                        </View>

                        {/* Sign in button */}
                        <TouchableOpacity onPress={handleLogin} style={styles.signInButton}>
                            <Text style={styles.signInButtonText}>Sign in</Text>
                        </TouchableOpacity>

                        {/* Error and success messages */}
                        {errorMessage ? (
                            <Text style={styles.errorMessage}>{errorMessage}</Text>
                        ) : null}
                        {successMessage ? (
                            <Text style={styles.successMessage}>{successMessage}</Text>
                        ) : null}
                    </>
                )}
            </ScrollView>
        </KeyboardAvoidingWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: "#fff",
        padding: 20
    },
    logoContainer: {
        alignItems: "center",
        marginBottom: 30
    },
    logo: {
        width: 170,
        height: 170
    },
    welcomeText: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 40,
        textAlign: "center"
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        padding: 10,
        marginBottom: 20
    },
    passwordInputContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        marginBottom: 20
    },
    passwordInput: {
        flex: 1,
        padding: 10
    },
    eyeIcon: {
        width: 20,
        height: 20,
        marginRight: 11
    },
    rememberMeContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: "#ccc",
        marginRight: 10
    },
    checkboxInner: {
        flex: 1,
        backgroundColor: "#007bff",
        borderRadius: 4
    },
    rememberMeText: {
        fontSize: 16
    },
    signInButton: {
        backgroundColor: "#007bff",
        padding: 15,
        borderRadius: 5,
        alignItems: "center"
    },
    signInButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold"
    },
    errorMessage: {
        color: "red",
        textAlign: "center",
        marginTop: 10
    },

    successMessage: {
        color: "green",
        textAlign: "center",
        marginTop: 10
    },
    blinkingImageContainer: {
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff"
    }
});
