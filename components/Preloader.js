import React, { useRef, useEffect } from "react";
import { View, Image, Animated } from "react-native";

const BlinkingImage = () => {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const blinkAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 1000, // Half of the total duration
          useNativeDriver: true
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 1000, // Half of the total duration
          useNativeDriver: true
        })
      ])
    );

    blinkAnimation.start();

    return () => {
      blinkAnimation.stop();
    };
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Animated.Image
        source={require("../images/OptiSafe_Logo.png")}
        style={{ width: 100, height: 100, opacity }}
        resizeMode="contain"
      />
    </View>
  );
};

export default BlinkingImage;
