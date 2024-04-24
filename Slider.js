import React, { useState, useRef } from 'react';
import { View, PanResponder, Animated, StyleSheet, TouchableOpacity } from 'react-native';

const Slider = ({ minValue = 0, maxValue = 100, initialValue = 50, onValueChange }) => {
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
            setSliderValue(newValue);
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
                    }}
                />
            </TouchableOpacity>
            <Animated.View
                // style={[
                //     styles.slider,
                //     {
                //         transform: [{ translateX: pan }],
                //     },
                // ]}
                {...panResponder.panHandlers}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    track: {
        backgroundColor: '#ccc',
        height: 20,
        flex: 1,
        borderRadius: 10,
    },
    trackFill: {
        height: '100%',
        backgroundColor: 'blue',
        borderRadius: 10
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
});

export default Slider;
