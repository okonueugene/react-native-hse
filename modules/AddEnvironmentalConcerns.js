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
import * as ImagePicker from "expo-image-picker";
import ApiManager from "../api/ApiManager";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import { FlatList } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import MenuScreen from "../components/MenuScreen";
import config from "../config/config";
import KeyboardAvoidingWrapper from "../components/KeyboardAvoidingWrapper";
import QuickAccess from "../components/QuickAcessFooter";


const AddCheckListModal = ({ isVisible, onClose }) => {
  const [comments, setComments] = useState("");
  const [correctiveAction, setCorrectiveAction] = useState({});
  const [projectManager, setProjectManager] = useState("");
  const [auditor, setAuditor] = useState("");
  const [status, setStatus] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [checklist, setChecklist] = useState({
    policy_displayed: '',
    policy_up_to_date: '',
    policy_signed_by_ceo: '',
    environmental_factors: '',
    environmental_emergency_procedures: '',
    environmental_issues: '',
    environmental_control_measures: '',
    operatives_briefed: '',
    sub_contractors_conforming: '',
    site_cabins_clean: '',
    adequate_parking_facilities: '',
    fences_hoardings: '',
    existing_contamination_onsite: '',
    transfer_notes_in_place: '',
    adequate_segregation_measures: '',
    electrical_power_for_light_and_heat: '',
    water_usage_minimized: '',
    plant_shut_down: '',
    consents_in_place_for_discharge_of_water: '',
    drains_identified: '',
    silt_prevented_from_discharging: '',
    fuel_tanks_within_bund: '',
    drip_trays_in_place: '',
    emergency_measures_in_place: '',
    chemicals_stored_safely: '',
    plant_in_good_condition: '',
    plant_and_materials_kept_away: '',
    wheel_washes_suitably_constructed: '',
    alternative_arrangements_for_unused_materials: '',
    materials_acquired_from_sustainable_source: '',
    arrangements_to_reuse_recycle_existing_site_material: '',
    dust_suppression_adequate: '',
    noise_and_vibration_within_reasonable_limits: '',
    activities_smokeless: '',
    inessential_burning_onsite: '',
    deliveries_arranged_to_minimize_disruption_to_neighbors: '',
    arrangements_to_keep_neighbors_informed: '',
    site_lights_positioned_away_from_neighbors: '',
    site_cabins_screened_from_neighbors: '',
    adequate_protection_in_place_for_existing_planted_areas: '',
    measures_in_place_to_protect_initial_life: ''
  });

  const updateChecklistItem = (key, value) => {
    setChecklist({ ...checklist, [key]: value });
  };

  //Function to handle adding an action item
  const addAction = () => {
    const newActionNumber = Object.keys(correctiveAction).length + 1;
    setCorrectiveAction({
      ...correctiveAction,
      [newActionNumber]: ""
    });
  };

  //Function to handle removing an action item
  const removeAction = (actionNumber) => {
    const newCorrectiveAction = { ...correctiveAction };
    delete newCorrectiveAction[actionNumber];
    setCorrectiveAction(newCorrectiveAction);
  };

  //Function to handle updating an action item
  const updateAction = (actionNumber, value) => {
    setCorrectiveAction({
      ...correctiveAction,
      [actionNumber]: value
    });
  };


  const handleFormData = () => {
    const formData = new FormData();

    formData.append("checklist", JSON.stringify(checklist));
    formData.append("comments", comments);
    formData.append("corrective_action", JSON.stringify(correctiveAction));
    formData.append("project_manager", projectManager);
    formData.append("auditor", auditor);
    formData.append("status", status);


    onsubmit(formData);

  };

  const onsubmit = async (formData) => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");

      const response = await fetch(`${config.apiBaseUrl}/add-environmental-checklist`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        },
        body: formData
      });

      if (response.status === 200) {
        alert("Checklist added successfully");
        onClose();
      } else {
        alert("An error occurred. Please try again");
      }
    } catch (error) {
      console.error(error);
      console.log(error.response)
    }
    finally {
      setLoading(false);
    }
  }



  return (
    <Modal visible={isVisible} animationType="slide">
      <KeyboardAvoidingWrapper>
        <ScrollView style={{ paddingHorizontal: 10 }}>
          <View style={{ flex: 1, paddingVertical: 24 }}>
            <Text style={{ fontWeight: "bold", marginBottom: 16 }}>
              Enviromental Policy Checklist
            </Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              {/* Replace with an icon component if desired */}
              <Text>X</Text>
            </TouchableOpacity>
            {/* Environmental Policy Section */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontWeight: "bold", marginBottom: 10 }}>
                Environmental Policy
              </Text>
              <Text style={{ marginBottom: 10 }}>
                Is the Enviromental Policy displayed on Site?
              </Text>
              <Picker
                selectedValue={checklist.policy_displayed}
                onValueChange={(itemValue) => updateChecklistItem('policy_displayed', itemValue)}
              >
                <Picker.Item label="Select" value="" />
                <Picker.Item label="Yes" value="1" />
                <Picker.Item label="No" value="0" />
              </Picker>
              <Text style={{ marginBottom: 10 }}>
                Is the Enviromental Policy upto date?
              </Text>
              <Picker
                selectedValue={checklist.policy_up_to_date}
                onValueChange={(itemValue) => updateChecklistItem('policy_up_to_date', itemValue)}
              >
                <Picker.Item label="Select" value="" />
                <Picker.Item label="Yes" value="1" />
                <Picker.Item label="No" value="0" />
              </Picker>
              <Text style={{ marginBottom: 10 }}>
                Is the Enviromental Policy signed by the CEO?
              </Text>
              <Picker
                selectedValue={checklist.policy_signed_by_ceo}
                onValueChange={(itemValue) => updateChecklistItem('policy_signed_by_ceo', itemValue)}
              >
                <Picker.Item label="Select" value="" />
                <Picker.Item label="Yes" value="1" />
                <Picker.Item label="No" value="0" />
              </Picker>
              <Text style={{ marginBottom: 10 }}>
                Are Environmental factors included in Risk Assessments?
              </Text>
              <Picker
                selectedValue={checklist.environmental_factors}
                onValueChange={(itemValue) => updateChecklistItem('environmental_factors', itemValue)}
              >
                <Picker.Item label="Select" value="" />
                <Picker.Item label="Yes" value="1" />
                <Picker.Item label="No" value="0" />
              </Picker>
              <Text style={{ marginBottom: 10 }}>
                Are Environmental emergency procedures adequately addressed and
                displayed?
              </Text>
              <Picker
                selectedValue={checklist.environmental_emergency_procedures}
                onValueChange={(itemValue) => updateChecklistItem('environmental_emergency_procedures', itemValue)}
              >
                <Picker.Item label="Select" value="" />
                <Picker.Item label="Yes" value="1" />
                <Picker.Item label="No" value="0" />
              </Picker>
              <Text style={{ marginBottom: 10 }}>
                Are Environmental control measures described in method statements?
              </Text>
              <Picker
                selectedValue={checklist.environmental_control_measures}
                onValueChange={(itemValue) => updateChecklistItem('environmental_control_measures', itemValue)}
              >
                <Picker.Item label="Select" value="" />
                <Picker.Item label="Yes" value="1" />
                <Picker.Item label="No" value="0" />
              </Picker>
              <Text style={{ marginBottom: 10 }}>
                Are all operatives briefed and aware of good Environmental
                practices?
              </Text>
              <Picker
                selectedValue={checklist.operatives_briefed}
                onValueChange={(itemValue) => updateChecklistItem('operatives_briefed', itemValue)}
              >
                <Picker.Item label="Select" value="" />
                <Picker.Item label="Yes" value="1" />
                <Picker.Item label="No" value="0" />
              </Picker>
              <Text style={{ marginBottom: 10 }}>
                Are sub-contractors conforming to the company's Environmental
                Policy?
              </Text>
              <Picker
                selectedValue={checklist.sub_contractors_conforming}
                onValueChange={(itemValue) => updateChecklistItem('sub_contractors_conforming', itemValue)}
              >
                <Picker.Item label="Select" value="" />
                <Picker.Item label="Yes" value="1" />
                <Picker.Item label="No" value="0" />
              </Picker>
            </View>
            {/* Site Establishment Section */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontWeight: "bold", marginBottom: 10 }}>
                Site Establishment
              </Text>
              {/* Select inputs */}
              <Text style={{ marginBottom: 10 }}>
                Are site cabins clean and in good condition?
              </Text>
              <Picker
                selectedValue={checklist.site_cabins_clean}
                onValueChange={(itemValue) => updateChecklistItem('site_cabins_clean', itemValue)}
              >
                <Picker.Item label="Select" value="" />
                <Picker.Item label="Yes" value="1" />
                <Picker.Item label="No" value="0" />
              </Picker>
              <Text style={{ marginBottom: 10 }}>
                Are there adequate parking facilities off/onsite?
              </Text>
              <Picker
                selectedValue={checklist.adequate_parking_facilities}
                onValueChange={(itemValue) => updateChecklistItem('adequate_parking_facilities', itemValue)}
              >
                <Picker.Item label="Select" value="" />
                <Picker.Item label="Yes" value="1" />
                <Picker.Item label="No" value="0" />
              </Picker>
              <Text style={{ marginBottom: 10 }}>
                Are fences, hoardings, and gates in good condition?
              </Text>
              <Picker
                selectedValue={checklist.fences_hoardings}
                onValueChange={(itemValue) => updateChecklistItem('fences_hoardings', itemValue)}
              >
                <Picker.Item label="Select" value="" />
                <Picker.Item label="Yes" value="1" />
                <Picker.Item label="No" value="0" />
              </Picker>
            </View>
            {/* Waste Management Section */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontWeight: "bold", marginBottom: 10 }}>
                Waste Management
              </Text>
              {/* Select inputs */}
              <Text style={{ marginBottom: 10 }}>
                Is there any existing contamination onsite? Is it being dealt with
                adequately?
              </Text>
              <Picker
                selectedValue={checklist.existing_contamination_onsite}
                onValueChange={(itemValue) => updateChecklistItem('existing_contamination_onsite', itemValue)}
              >
                <Picker.Item label="Select" value="" />
                <Picker.Item label="Yes" value="1" />
                <Picker.Item label="No" value="0" />
              </Picker>
              <Text style={{ marginBottom: 10 }}>
                Are transfer notes (consignment notes for special waste) in place?
              </Text>
              <Picker
                selectedValue={checklist.transfer_notes_in_place}
                onValueChange={(itemValue) => updateChecklistItem('transfer_notes_in_place', itemValue)}
              >
                <Picker.Item label="Select" value="" />
                <Picker.Item label="Yes" value="1" />
                <Picker.Item label="No" value="0" />
              </Picker>
              <Text style={{ marginBottom: 10 }}>
                Are adequate segregation measures in place?
              </Text>
              <Picker
                selectedValue={checklist.adequate_segregation_measures}
                onValueChange={(itemValue) => updateChecklistItem('adequate_segregation_measures', itemValue)}
              >
                <Picker.Item label="Select" value="" />
                <Picker.Item label="Yes" value="1" />
                <Picker.Item label="No" value="0" />
              </Picker>
            </View>
            {/* Energy Management Section */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontWeight: "bold", marginBottom: 10 }}>
                Energy Management
              </Text>
              {/* Select inputs */}
              <Text style={{ marginBottom: 10 }}>
                Is electrical power for light and heat kept at a minimum period?
              </Text>
              <Picker
                selectedValue={checklist.electrical_power_for_light_and_heat}
                onValueChange={(itemValue) => updateChecklistItem('electrical_power_for_light_and_heat', itemValue)}
              >
                <Picker.Item label="Select" value="" />
                <Picker.Item label="Yes" value="1" />
                <Picker.Item label="No" value="0" />
              </Picker>
              <Text style={{ marginBottom: 10 }}>
                Is water usage minimized? (e.g. low flush toilets, waterless
                urinals, etc.)
              </Text>
              <Picker
                selectedValue={checklist.water_usage_minimized}
                onValueChange={(itemValue) => updateChecklistItem('water_usage_minimized', itemValue)}
              >
                <Picker.Item label="Select" value="" />
                <Picker.Item label="Yes" value="1" />
                <Picker.Item label="No" value="0" />
              </Picker>
              <Text style={{ marginBottom: 10 }}>
                Is plant shut down when not in use?
              </Text>
              <Picker
                selectedValue={checklist.plant_shut_down}
                onValueChange={(itemValue) => updateChecklistItem('plant_shut_down', itemValue)}
              >
                <Picker.Item label="Select" value="" />
                <Picker.Item label="Yes" value="1" />
                <Picker.Item label="No" value="0" />
              </Picker>
            </View>
            {/* Water Protection Section */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontWeight: "bold", marginBottom: 10 }}>
                Water Protection
              </Text>
              {/* Select inputs */}
              <Text style={{ marginBottom: 10 }}>
                Are consents in place for the discharge of water?
              </Text>
              <Picker
                selectedValue={checklist.consents_in_place_for_discharge_of_water}
                onValueChange={(itemValue) => updateChecklistItem('consents_in_place_for_discharge_of_water', itemValue)}
              >
                <Picker.Item label="Select" value="" />
                <Picker.Item label="Yes" value="1" />
                <Picker.Item label="No" value="0" />
              </Picker>
              <Text style={{ marginBottom: 10 }}>
                Are drains identified (surface and sewer)?
              </Text>
              <Picker
                selectedValue={checklist.drains_identified}
                onValueChange={(itemValue) => updateChecklistItem('drains_identified', itemValue)}
              >
                <Picker.Item label="Select" value="" />
                <Picker.Item label="Yes" value="1" />
                <Picker.Item label="No" value="0" />
              </Picker>
              <Text style={{ marginBottom: 10 }}>
                Is silt being prevented from discharging to watercourses?
              </Text>
              <Picker
                selectedValue={checklist.silt_prevented_from_discharging}
                onValueChange={(itemValue) => updateChecklistItem('silt_prevented_from_discharging', itemValue)}
              >
                <Picker.Item label="Select" value="" />
                <Picker.Item label="Yes" value="1" />
                <Picker.Item label="No" value="0" />
              </Picker>
              <Text style={{ marginBottom: 10 }}>
                Are fuel tanks, bowsers, and drums within a bund to EA guidelines?
              </Text>
              <Picker
                selectedValue={checklist.fuel_tanks_within_bund}
                onValueChange={(itemValue) => updateChecklistItem('fuel_tanks_within_bund', itemValue)}
              >
                <Picker.Item label="Select" value="" />
                <Picker.Item label="Yes" value="1" />
                <Picker.Item label="No" value="0" />
              </Picker>
              <Text style={{ marginBottom: 10 }}>
                Are drip trays in place for plant and fuelling points?
              </Text>
              <Picker
                selectedValue={checklist.drip_trays_in_place}
                onValueChange={(itemValue) => updateChecklistItem('drip_trays_in_place', itemValue)}
              >
                <Picker.Item label="Select" value="" />
                <Picker.Item label="Yes" value="1" />
                <Picker.Item label="No" value="0" />
              </Picker>
              <Text style={{ marginBottom: 10 }}>
                Are emergency measures in place (spill kits)?
              </Text>
              <Picker
                selectedValue={checklist.emergency_measures_in_place}
                onValueChange={(itemValue) => updateChecklistItem('emergency_measures_in_place', itemValue)}
              >
                <Picker.Item label="Select" value="" />
                <Picker.Item label="Yes" value="1" />
                <Picker.Item label="No" value="0" />
              </Picker>
              <Text style={{ marginBottom: 10 }}>
                Are all chemicals stored safely and marked?
              </Text>
              <Picker
                selectedValue={checklist.chemicals_stored_safely}
                onValueChange={(itemValue) => updateChecklistItem('chemicals_stored_safely', itemValue)}
              >
                <Picker.Item label="Select" value="" />
                <Picker.Item label="Yes" value="1" />
                <Picker.Item label="No" value="0" />
              </Picker>
              <Text style={{ marginBottom: 10 }}>
                Is plant in good condition and without any leaks?
              </Text>
              <Picker
                selectedValue={checklist.plant_in_good_condition}
                onValueChange={(itemValue) => updateChecklistItem('plant_in_good_condition', itemValue)}
              >
                <Picker.Item label="Select" value="" />
                <Picker.Item label="Yes" value="1" />
                <Picker.Item label="No" value="0" />
              </Picker>
              <Text style={{ marginBottom: 10 }}>
                Are plant and materials reasonably kept away from drains and
                watercourses?
              </Text>
              <Picker
                selectedValue={checklist.plant_and_materials_kept_away}
                onValueChange={(itemValue) => updateChecklistItem('plant_and_materials_kept_away', itemValue)}
              >
                <Picker.Item label="Select" value="" />
                <Picker.Item label="Yes" value="1" />
                <Picker.Item label="No" value="0" />
              </Picker>
              <Text style={{ marginBottom: 10 }}>
                Are wheel washes suitably constructed and contained?
              </Text>
              <Picker
                selectedValue={checklist.wheel_washes_suitably_constructed}
                onValueChange={(itemValue) => updateChecklistItem('wheel_washes_suitably_constructed', itemValue)}
              >
                <Picker.Item label="Select" value="" />
                <Picker.Item label="Yes" value="1" />
                <Picker.Item label="No" value="0" />
              </Picker>
            </View>
            {/* Material Management Section */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontWeight: "bold", marginBottom: 10 }}>
                Material Management
              </Text>
              {/* Select inputs */}
              <Text style={{ marginBottom: 10 }}>
                Are there alternative arrangements for unused materials other than
                disposal?
              </Text>
              <Picker
                selectedValue={checklist.alternative_arrangements_for_unused_materials}
                onValueChange={(itemValue) => updateChecklistItem('alternative_arrangements_for_unused_materials', itemValue)}
              >
                <Picker.Item label="Select" value="" />
                <Picker.Item label="Yes" value="1" />
                <Picker.Item label="No" value="0" />
              </Picker>
              <Text style={{ marginBottom: 10 }}>
                Are materials such as hardwoods acquired from a sustainable
                source?
              </Text>
              <Picker
                selectedValue={checklist.materials_acquired_from_sustainable_source}
                onValueChange={(itemValue) => updateChecklistItem('materials_acquired_from_sustainable_source', itemValue)}
              >
                <Picker.Item label="Select" value="" />
                <Picker.Item label="Yes" value="1" />
                <Picker.Item label="No" value="0" />
              </Picker>
              <Text style={{ marginBottom: 10 }}>
                Are there arrangements to reuse/recycle existing site material?
              </Text>
              <Picker
                selectedValue={checklist.arrangements_to_reuse_recycle_existing_site_material}
                onValueChange={(itemValue) => updateChecklistItem('arrangements_to_reuse_recycle_existing_site_material', itemValue)}
              >
                <Picker.Item label="Select" value="" />
                <Picker.Item label="Yes" value="1" />
                <Picker.Item label="No" value="0" />
              </Picker>
            </View>

            {/* Nuisance Section */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontWeight: "bold", marginBottom: 10 }}>
                Nuisance
              </Text>
              {/* Select inputs */}
              <Text style={{ marginBottom: 10 }}>
                Is dust suppression adequate?
              </Text>
              <Picker
                selectedValue={checklist.dust_suppression_adequate}
                onValueChange={(itemValue) => updateChecklistItem('dust_suppression_adequate', itemValue)}
              >
                <Picker.Item label="Select" value="" />
                <Picker.Item label="Yes" value="1" />
                <Picker.Item label="No" value="0" />
              </Picker>
              <Text style={{ marginBottom: 10 }}>
                Are noise and vibration within reasonable limits?
              </Text>
              <Picker
                selectedValue={checklist.noise_and_vibration_within_reasonable_limits}
                onValueChange={(itemValue) => updateChecklistItem('noise_and_vibration_within_reasonable_limits', itemValue)}
              >
                <Picker.Item label="Select" value="" />
                <Picker.Item label="Yes" value="1" />
                <Picker.Item label="No" value="0" />
              </Picker>
              <Text style={{ marginBottom: 10 }}>Are activities smokeless?</Text>
              <Picker
                selectedValue={checklist.activities_smokeless}
                onValueChange={(itemValue) => updateChecklistItem('activities_smokeless', itemValue)}
              >
                <Picker.Item label="Select" value="" />
                <Picker.Item label="Yes" value="1" />
                <Picker.Item label="No" value="0" />
              </Picker>
              <Text style={{ marginBottom: 10 }}>
                Is there any inessential burning on-site?
              </Text>
              <Picker
                selectedValue={checklist.inessential_burning_onsite}
                onValueChange={(itemValue) => updateChecklistItem('inessential_burning_onsite', itemValue)}
              >
                <Picker.Item label="Select" value="" />
                <Picker.Item label="Yes" value="1" />
                <Picker.Item label="No" value="0" />
              </Picker>
              <Text style={{ marginBottom: 10 }}>
                Are deliveries arranged to minimize disruption to neighbors?
              </Text>
              <Picker
                selectedValue={checklist.deliveries_arranged_to_minimize_disruption_to_neighbors}
                onValueChange={(itemValue) => updateChecklistItem('deliveries_arranged_to_minimize_disruption_to_neighbors', itemValue)}
              >
                <Picker.Item label="Select" value="" />
                <Picker.Item label="Yes" value="1" />
                <Picker.Item label="No" value="0" />
              </Picker>
              <Text style={{ marginBottom: 10 }}>
                Are there arrangements to keep neighbors informed and liaison
                procedures?
              </Text>
              <Picker
                selectedValue={checklist.arrangements_to_keep_neighbors_informed}
                onValueChange={(itemValue) => updateChecklistItem('arrangements_to_keep_neighbors_informed', itemValue)}
              >
                <Picker.Item label="Select" value="" />
                <Picker.Item label="Yes" value="1" />
                <Picker.Item label="No" value="0" />
              </Picker>
              <Text style={{ marginBottom: 10 }}>
                Are site lights positioned away from neighbors?
              </Text>
              <Picker
                selectedValue={checklist.site_lights_positioned_away_from_neighbors}
                onValueChange={(itemValue) => updateChecklistItem('site_lights_positioned_away_from_neighbors', itemValue)}
              >
                <Picker.Item label="Select" value="" />
                <Picker.Item label="Yes" value="1" />
                <Picker.Item label="No" value="0" />
              </Picker>
              <Text style={{ marginBottom: 10 }}>
                Are site cabins screened from neighbors as appropriate?
              </Text>
              <Picker
                selectedValue={checklist.site_cabins_screened_from_neighbors}
                onValueChange={(itemValue) => updateChecklistItem('site_cabins_screened_from_neighbors', itemValue)}
              >
                <Picker.Item label="Select" value="" />
                <Picker.Item label="Yes" value="1" />
                <Picker.Item label="No" value="0" />
              </Picker>
            </View>
            {/* Flora & Fauna Section */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontWeight: "bold", marginBottom: 10 }}>
                Flora & Fauna
              </Text>
              {/* Select inputs */}
              <Text style={{ marginBottom: 10 }}>
                Is adequate protection in place for existing planted areas?
              </Text>
              <Picker
                selectedValue={checklist.adequate_protection_in_place_for_existing_planted_areas}
                onValueChange={(itemValue) => updateChecklistItem('adequate_protection_in_place_for_existing_planted_areas', itemValue)}
              >
                <Picker.Item label="Select" value="" />
                <Picker.Item label="Yes" value="1" />
                <Picker.Item label="No" value="0" />
              </Picker>
              <Text style={{ marginBottom: 10 }}>
                Are measures in place to protect initial life adequate?
              </Text>
              <Picker
                selectedValue={checklist.measures_in_place_to_protect_initial_life}
                onValueChange={(itemValue) => updateChecklistItem('measures_in_place_to_protect_initial_life', itemValue)}
              >
                <Picker.Item label="Select" value="" />
                <Picker.Item label="Yes" value="1" />
                <Picker.Item label="No" value="0" />
              </Picker>
            </View>
            {/* Completion and Sign-Off Section */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontWeight: "bold", marginBottom: 10 }}>
                Completion and Sign-Off
              </Text>
              {/* Select inputs */}
              <Text style={{ marginBottom: 10 }}>Further Comments:</Text>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: "#ccc",
                  padding: 10,
                  marginBottom: 10
                }}
                multiline
                numberOfLines={4}
                onChangeText={setComments}
              />
              <Text style={{ marginBottom: 10 }}>Corrective Action</Text>
              {Object.entries(correctiveAction).map(([actionNumber, actionValue]) => (
                <View
                  key={actionNumber}
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 10
                  }}
                >
                  <TextInput
                    style={{
                      flex: 1,
                      borderWidth: 1,
                      borderColor: "#ccc",
                      borderRadius: 4,
                      padding: 8
                    }}
                    placeholder="Enter Action"
                    value={actionValue}
                    onChangeText={(text) => updateAction(actionNumber, text)}
                  />
                  <TouchableOpacity
                    style={{
                      backgroundColor: "red",
                      padding: 8,
                      borderRadius: 4
                    }}
                    onPress={() => removeAction(actionNumber)}
                  >
                    <Ionicons name="trash" size={24} color="red" />
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity
                style={{
                  backgroundColor: "green",
                  padding: 8,
                  borderRadius: 4,
                  marginBottom: 10
                }}
                onPress={addAction}
              >
                <Ionicons name="add" size={24} color="white" />
              </TouchableOpacity>
              <Text style={{ marginBottom: 10 }}>Project/Site Manager:</Text>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: "#ccc",
                  padding: 10,
                  marginBottom: 10
                }}
                onChangeText={setProjectManager}
              />
              <Text style={{ marginBottom: 10 }}>Auditor:</Text>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: "#ccc",
                  padding: 10,
                  marginBottom: 10
                }}
                onChangeText={setAuditor}
              />
              <Text style={{ marginBottom: 10 }}>Status:</Text>
              <Picker
                selectedValue={status}
                onValueChange={(itemValue) => setStatus(itemValue)}
              >
                <Picker.Item label="Select Status" value="" />
                <Picker.Item label="Open" value="open" />
                <Picker.Item label="Closed" value="closed" />
              </Picker>
            </View>
            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.closeModal} onPress={onClose}>
                <Text>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submit} onPress={handleFormData}>
                <Text>Add Concern</Text>
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
        </ScrollView>
      </KeyboardAvoidingWrapper>
    </Modal>
  );
};

const AddFreeFormModal = ({ isVisible, onClose }) => {
  const [type, setType] = useState("");
  const [comment, setComment] = useState("");
  const [correctiveAction, setCorrectiveAction] = useState({});
  const [status, setStatus] = useState("");
  const [projectManager, setProjectManager] = useState("");
  const [auditor, setAuditor] = useState("");
  const [isLoading, setLoading] = useState(false);

  //Function to handle adding an action item
  const addAction = () => {
    const newActionNumber = Object.keys(correctiveAction).length + 1;
    setCorrectiveAction({
      ...correctiveAction,
      [newActionNumber]: ""
    });
  };

  //Function to handle removing an action item
  const removeAction = (actionNumber) => {
    const newCorrectiveAction = { ...correctiveAction };
    delete newCorrectiveAction[actionNumber];
    setCorrectiveAction(newCorrectiveAction);
  };

  //Function to handle updating an action item
  const updateAction = (actionNumber, value) => {
    setCorrectiveAction({
      ...correctiveAction,
      [actionNumber]: value
    });
  };


  const handleFormData = () => {
    const formData = new FormData();

    formData.append("type", type);
    formData.append("comment", comment);
    formData.append("corrective_action", JSON.stringify(correctiveAction));
    formData.append("project_manager", projectManager);
    formData.append("auditor", auditor);
    formData.append("status", status);

    onsubmit(formData);
  }

  const onsubmit = async (formData) => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");

      const response = await fetch(`${config.apiBaseUrl}/add-environmental-form`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        },
        body: formData
      });

      if (response.status === 200) {
        alert("Free Form added successfully");
        onClose();
      } else {
        alert("An error occurred. Please try again");
      }
    } catch (error) {
      console.error(error);
    }
    finally {
      setLoading(false);
    }
  }


  return (
    <Modal
      visible={isVisible}
      animationType="slide">
      <KeyboardAvoidingWrapper>
        <ScrollView style={{ paddingHorizontal: 10 }}>
          <View style={{ flex: 1, paddingVertical: 24 }}>
            <Text style={{ fontWeight: "bold", marginBottom: 16 }}>
              Add Free Form
            </Text>
            <Text style={{ marginBottom: 10 }}>Type</Text>
            <Picker
              selectedValue={type}
              onValueChange={(itemValue) => setType(itemValue)}
            >
              <Picker.Item label="Select" value="" />
              <Picker.Item label="Waste Management" value="Waste Management" />
              <Picker.Item label="Water Protection" value="Water Protection" />
              <Picker.Item label="Air Management" value="Air Management" />
              <Picker.Item label="Noise Management" value="Noise Management" />
              <Picker.Item label="Soil Management" value="Soil Management" />
              <Picker.Item
                label="Biodiversity Management"
                value="Biodiversity Management"
              />
              <Picker.Item label="Energy Management" value="Energy Management" />
              <Picker.Item
                label="Chemical Management"
                value="Chemical Management"
              />
              <Picker.Item label="Other" value="Other" />
            </Picker>
            <Text style={{ marginBottom: 10 }}>Comment</Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: "#ccc",
                padding: 10,
                marginBottom: 10
              }}
              multiline
              numberOfLines={4}
              value={comment}
              onChangeText={setComment}
            />
            <Text style={{ marginBottom: 10 }}>Corrective Action</Text>
            {Object.entries(correctiveAction).map(([actionNumber, actionValue]) => (
              <View
                key={actionNumber}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 10
                }}
              >
                <TextInput
                  style={{
                    flex: 1,
                    borderWidth: 1,
                    borderColor: "#ccc",
                    borderRadius: 4,

                    padding: 8
                  }}
                  placeholder="Enter Action"
                  value={actionValue}
                  onChangeText={(text) => updateAction(actionNumber, text)}
                />
                <TouchableOpacity
                  style={{
                    backgroundColor: "red",
                    padding: 8,
                    borderRadius: 4
                  }}
                  onPress={() => removeAction(actionNumber)}
                >
                  <Ionicons name="trash" size={24} color="red" />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity
              style={{
                backgroundColor: "green",
                padding: 8,
                borderRadius: 4,
                marginBottom: 10
              }}
              onPress={addAction}
            >
              <Ionicons name="add" size={24} color="white" />
            </TouchableOpacity>
            <Text style={{ marginBottom: 10 }}>Status</Text>
            <Picker
              selectedValue={status}
              onValueChange={(itemValue) => setStatus(itemValue)}
            >
              <Picker.Item label="Select Status" value="" />
              <Picker.Item label="Open" value="Open" />
              <Picker.Item label="Closed" value="Closed" />
            </Picker>
            <Text style={{ marginBottom: 10 }}>Project Manager</Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: "#ccc",
                padding: 10,
                marginBottom: 10
              }}
              value={projectManager}
              onChangeText={setProjectManager}
            />
            <Text style={{ marginBottom: 10 }}>Auditor</Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: "#ccc",
                padding: 10,
                marginBottom: 10
              }}
              value={auditor}
              onChangeText={setAuditor}
            /><View style={styles.modalFooter}>
              <TouchableOpacity style={styles.closeModal} onPress={onClose}>
                <Text>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submit} onPress={handleFormData}>
                <Text>Add Concern</Text>
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
        </ScrollView>
      </KeyboardAvoidingWrapper>
    </Modal>
  );
};

const AddEnvironmentalConcerns = () => {
  const [isFreeFormModalVisible, setIsFreeFormModalVisible] = useState(false);
  const [isCheckListModalVisible, setIsCheckListModalVisible] = useState(false);

  // Open the free form modal
  const toggleFreeFormModal = () => {
    setIsFreeFormModalVisible(!isFreeFormModalVisible);
  };

  // Open the checklist modal
  const toggleCheckListModal = () => {
    setIsCheckListModalVisible(!isCheckListModalVisible);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.body}>
          <TouchableOpacity
            style={styles.freeFormButton}
            onPress={toggleFreeFormModal}
          >
            <Text style={{ color: "white" }}>Add Free Form</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.policyButton}
            onPress={toggleCheckListModal}
          >
            <Text style={{ color: "white" }}>Add Policy Checklist</Text>
          </TouchableOpacity>
        </View>
                       {/* Footer */}
                       <View>
          <QuickAccess />

          </View>
      </ScrollView>

      {/* Free Form Modal */}
      <AddFreeFormModal
        isVisible={isFreeFormModalVisible}
        onClose={toggleFreeFormModal}
      />

      {/* Checklist Modal */}
      <AddCheckListModal
        isVisible={isCheckListModalVisible}
        onClose={toggleCheckListModal}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20
  },
  scrollViewContent: {
    flexGrow: 1
  },
  body: {
    flexGrow: 1,
    justifyContent: "space-evenly",
    alignItems: "center",
    flexDirection: "row"
  },
  freeFormButton: {
    padding: 10,
    backgroundColor: "blue",
    borderRadius: 5
  },
  policyButton: {
    padding: 10,
    backgroundColor: "blue",
    borderRadius: 5
  },
  modalContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20
  },
  input: {
    borderWidth: 1,
    borderColor: "gray",
    marginBottom: 10,
    padding: 10,
    width: "100%",
    borderRadius: 5
  },
  addButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    padding: 10,
    backgroundColor: "blue",
    borderRadius: 5
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
  }
  ,
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#007bff",
    padding: 5,
    borderRadius: 5
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20
  },
  closeModal: {
    padding: 10,
    backgroundColor: "red",
    borderRadius: 5
  },
  submit: {
    padding: 10,
    backgroundColor: "blue",
    borderRadius: 5
  }
});

export default AddEnvironmentalConcerns;
