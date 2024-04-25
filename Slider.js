import React, { useState, useRef } from 'react';
import { View, PanResponder, Animated, StyleSheet, TouchableOpacity, Text } from 'react-native';

const Slider = ({ minValue = 0, maxValue = 100, initialValue = 50, onValueChange, backgroundColor = "blue", textColor = "white" }) => {
    const [sliderValue, setSliderValue] = useState(initialValue);
    const containerWidth = useRef(0);
    const pan = useRef(new Animated.Value(0)).current;

    const updateValueFromTap = (gesture) => {
        const newValue = (gesture.nativeEvent.locationX / containerWidth.current) * (maxValue - minValue);
        setSliderValue(newValue);
        onValueChange && onValueChange(newValue);
        Animated.spring(pan, { toValue: gesture.nativeEvent.locationX, useNativeDriver: false }).start();
    };

    const handlePanResponderMove = Animated.event([null, { dx: pan }], {
        useNativeDriver: false,
        listener: (_, gestureState) => {
            const newValue = (gestureState.moveX / containerWidth.current) * (maxValue - minValue);

            if (newValue < minValue) {
                setSliderValue(minValue);
            } else if (newValue > maxValue) {
                setSliderValue(maxValue);
            } else {
                setSliderValue(newValue);
            } 

            onValueChange && onValueChange(newValue);
        },
    });

    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (_, gesture) => {
            pan.setOffset(pan._value);
            pan.setValue(0);
        },
        onPanResponderMove: handlePanResponderMove,
        onPanResponderRelease: () => {
            pan.flattenOffset();
        },
    });

    const handleContainerLayout = (event) => {
        containerWidth.current = event.nativeEvent.layout.width;
    };

    // Determine text color based on position relative to track fill
    // const textColor = sliderValue < (maxValue - minValue) / 2 ? 'white' : 'black';

    return (
        <View style={styles.container} onLayout={handleContainerLayout}>
            <TouchableOpacity
                style={styles.track}
                onPress={(event) => {
                    updateValueFromTap(event);
                }}
                activeOpacity={1}
            >
                <View
                    style={{
                        ...styles.trackFill,
                        width: `${((sliderValue - minValue) / (maxValue - minValue)) * 100}%`,
                        backgroundColor: backgroundColor,
                    }}
                />
                <Text style={[styles.valueText, { color: textColor }]}>
                    {Math.round(sliderValue)}
                </Text>
            </TouchableOpacity>
            <Animated.View
                style={[
                    // styles.slider,
                    {
                        transform: [{ translateX: pan }],
                    },
                ]}
                {...panResponder.panHandlers}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 50,
        overflow: 'hidden',
    },
    track: {
        position: 'relative',
        backgroundColor: '#ccc',
        height: 30,
        flex: 1,
        borderRadius: 5,
    },
    trackFill: {
        position: 'absolute',
        height: '100%',
        backgroundColor: 'blue',
        borderRadius: 5,
    },
    slider: {
        position: 'absolute',
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: 'white',
        borderWidth: 2,
        borderColor: 'blue',
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
        elevation: 2,
    },
    valueText: {
        position: 'absolute',
        textAlign: 'center',
        textAlignVertical: 'center',
        lineHeight: 30,
        marginLeft: 10,
        fontSize: 16,
        fontWeight: 'bold',
        color: "white",
        zIndex: 1, // Ensure text appears above the track fill
    },
});

export default Slider;