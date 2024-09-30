import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity
} from "react-native";
import { useNavigation } from "@react-navigation/native";

const MenuItem = ({ title, onPress, isActive }) => {
  return (
    <TouchableOpacity
      style={[styles.menuItem, isActive && styles.activeMenuItem]}
      onPress={onPress}
    >
      <Text
        style={[styles.menuItemText, isActive && styles.activeMenuItemText]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const SubMenuItem = ({ title, onPress }) => {
  return (
    <TouchableOpacity style={styles.subMenuItem} onPress={onPress}>
      <Text style={styles.subMenuItemText}>{title}</Text>
    </TouchableOpacity>
  );
};

const VerticalNav = () => {
  const navigation = useNavigation();
  const [activeMenuItem, setActiveMenuItem] = useState(null);
  const [showSubmenu, setShowSubmenu] = useState({
    SORs: false,
    IncidentManager: false,
    ImmediateCorrectiveAction: false,
    EnvironmentalConcerns: false
  });

  const handleMenuItemPress = (routeName) => {
    setActiveMenuItem(routeName);
    navigation.navigate(routeName);
  };

  const handleSubmenuPress = (submenu) => {
    setShowSubmenu({ ...showSubmenu, [submenu]: !showSubmenu[submenu] });
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.menu}>
        {/* Brand */}
        <View style={styles.brand}>
          <Image
            source={require("../images/OptiSafe_Logo.png")}
            style={styles.brandLogo}
            resizeMode="center"
          />
        </View>
        {/* Menu Items */}
        <ScrollView style={styles.menuItems}>
          <MenuItem
            title="Dashboard"
            onPress={() => handleMenuItemPress("Dashboard")}
            isActive={activeMenuItem === "Dashboard"}
          />
          <MenuItem
            title="Contractor Supervisor"
            onPress={() => handleMenuItemPress("Supervisor")}
            isActive={activeMenuItem === "Supervisor"}
          />
          <MenuItem
            title="Personnel Detail"
            onPress={() => handleMenuItemPress("Personnel")}
            isActive={activeMenuItem === "Personnel"}
          />
          <MenuItem
            title="First Responders"
            onPress={() => handleMenuItemPress("First Responder")}
            isActive={activeMenuItem === "First Responder"}
          />
          <MenuItem
            title="SOR's"
            onPress={() => handleSubmenuPress("SORs")}
            isActive={showSubmenu.SORs}
          />
          {showSubmenu.SORs && (
            <View style={styles.submenu}>
              <SubMenuItem
                title="Add Record"
                onPress={() => handleMenuItemPress("Add Record")}
              />
              <SubMenuItem
                title="Open SOR's"
                onPress={() => handleMenuItemPress("Open Sors")}
              />
              <SubMenuItem
                title="Reported Hazards"
                onPress={() => handleMenuItemPress("Reported Hazards")}
              />
              <SubMenuItem
                title="Suggested Improvements"
                onPress={() => handleMenuItemPress("Suggested Improvements")}
              />
              <SubMenuItem
                title="Good Practises"
                onPress={() => handleMenuItemPress("Good Practises")}
              />
              <SubMenuItem
                title="Bad Practices"
                onPress={() => handleMenuItemPress("Bad Practises")}
              />
            </View>
          )}
          <MenuItem
            title="Incident Manager"
            onPress={() => handleSubmenuPress("IncidentManager")}
            isActive={showSubmenu.IncidentManager}
          />
          {showSubmenu.IncidentManager && (
            <View style={styles.submenu}>
              <SubMenuItem
                title="Add Incident"
                onPress={() => handleMenuItemPress("Add Incident")}
              />
              <SubMenuItem
                title="Open Incidents"
                onPress={() => handleMenuItemPress("Open Incidents")}
              />
              <SubMenuItem
                title="Near Misses"
                onPress={() => handleMenuItemPress("Near Miss")}
              />
              <SubMenuItem
                title="First Aid Cases"
                onPress={() => handleMenuItemPress("First Aid Case")}
              />
              <SubMenuItem
                title="Medical Treatment Cases"
                onPress={() => handleMenuItemPress("Medical Treatment Case")}
              />
              <SubMenuItem
                title="Lost Time Accidents"
                onPress={() => handleMenuItemPress("Lost Time Accident")}
              />
              <SubMenuItem
                title="SIF"
                onPress={() => handleMenuItemPress("SIF")}
              />
            </View>
          )}
          <MenuItem
            title="Immediate Corrective Action"
            onPress={() => handleSubmenuPress("ImmediateCorrectiveAction")}
            isActive={showSubmenu.ImmediateCorrectiveAction}
          />
          {showSubmenu.ImmediateCorrectiveAction && (
            <View style={styles.submenu}>
              <SubMenuItem
                title="Add ICAs"
                onPress={() => handleMenuItemPress("Add Ica")}
              />
              <SubMenuItem
                title="View ICAs"
                onPress={() => handleMenuItemPress("View Ica")}
              />
            </View>
          )}
          <MenuItem
            title="Permits Applicable"
            onPress={() => handleMenuItemPress("Permits Applicable")}
            isActive={activeMenuItem === "Permits Applicable"}
          />
          <MenuItem
            title="Tasks"
            onPress={() => handleMenuItemPress("Tasks")}
            isActive={activeMenuItem === "Tasks"}
          />
          <MenuItem
            title="Environmental Concerns"
            onPress={() => handleSubmenuPress("EnvironmentalConcerns")}
            isActive={showSubmenu.EnvironmentalConcerns}
          />
          {showSubmenu.EnvironmentalConcerns && (
            <View style={styles.submenu}>
              <SubMenuItem
                title="Add Environmental Concern"
                onPress={() => handleMenuItemPress("Add Environment Concern")}
              />
              <SubMenuItem
                title="View Environmental Concerns"
                onPress={() => handleMenuItemPress("Environmental Concerns")}
              />
            </View>
          )}
        </ScrollView>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  menu: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 10
  },
  brand: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-evenly",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc"
  },
  brandText: {
    fontSize: 17,
    fontWeight: "bold",
    marginLeft: -70,
    color: "#007bff"
  },
  brandLogo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginLeft: -70
  },
  menuItems: {
    marginTop: 2
  },
  menuItem: {
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    fontSize: 16
  },
  activeMenuItem: {
    backgroundColor: "#ddd"
  },
  menuItemText: {
    fontSize: 16,
    color: "#333"
  },
  activeMenuItemText: {
    fontWeight: "bold",
    color: "#007bff"
  },
  submenu: {
    marginLeft: 20
  },
  subMenuItem: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc"
  },
  subMenuItemText: {
    fontSize: 15,
    color: "#333"
  }
});

export default VerticalNav;
