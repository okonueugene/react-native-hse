import React, { useState, useRef } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import {
    TouchableOpacity,
    DrawerLayoutAndroid
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import LoginScreen from "../modules/Login";
import MenuScreen from "../components/MenuScreen";
import DashboardScreen from "../modules/DashboardScreen";
import AddIcaScreen from "../modules/AddIcaScreen";
import AddIncidentScreen from "../modules/AddIncidentScreen";
import AddRecordScreen from "../modules/AddRecordScreen";
import BadPractisesScreen from "../modules/BadPractisesScreen";
import EnvironmentalConcernsScreen from "../modules/EnvironmentalConcernsScreen";
import FirstAidCaseScreen from "../modules/FirstAidCaseScreen";
import GoodPractisesScreen from "../modules/GoodPractisesScreen";
import LostTimeAccidentScreen from "../modules/LostTimeAccidentsScreen";
import MedicalTreatmentCaseScreen from "../modules/MedicalTreatedCaseScreen";
import NearMissScreen from "../modules/NearMissScreen";
import OpenIncidentsScreen from "../modules/OpenIncidentsScreen";
import OpenSorsScreen from "../modules/OpenSorsScreen";
import PermitsApplicableScreen from "../modules/PermitsApplicableScreen";
import PersonnelScreen from "../modules/PersonnelScreen";
import ReportedHazardsScreen from "../modules/ReportedHazardsScreen";
import SIFScreen from "../modules/SIFScreen";
import SuggestedImprovementsScreen from "../modules/SuggestedImprovementsScreen";
import SupervisorScreen from "../modules/SupervisorScreen";
import TasksScreen from "../modules/TasksScreen";
import ViewIcaScreen from "../modules/ViewIcaScreen";
import FirstResponderScreen from "../modules/FirstResponderScreen";
import AddEnvironmentalConcerns from "../modules/AddEnvironmentalConcerns";

const Stack = createStackNavigator();


const AppStack = () => {
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

    return (
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
                <Stack.Screen name="Login" component={LoginScreen} />
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
    );
};

export default AppStack;
