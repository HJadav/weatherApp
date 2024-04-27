
import Geolocation from '@react-native-community/geolocation';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { FlatList, Image, ImageBackground, PermissionsAndroid, Platform, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { callAPI, fetchForecast, fetchLocation } from '../api/Api';
import images from '../assets/img/index';
import CustomProgressBar from '../components/CustomProgressBar';
import { GOOGLE_PLACES_API_KEY, formattedCurrentDate, formattedNextDate, formattedNextDay, formattedPastDate } from '../utils/utils';
const Weather = () => {
    const [searchInput, setSearchInput] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [weatherData, setWeatherData] = useState('');
    const [currentWeather, setCurrentWeather] = useState('');
    const [loading, setLoading] = useState(false);


    useEffect(() => {
        if (Platform.OS === 'android') {
            PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            ).then((result) => {
                if (result === 'granted') {
                    getLocation();
                }
            });
        } else {
            getLocation();
        }
    }, []);

    const getLocation = () => {
        Geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                getApiData(latitude, longitude)
            },
            (error) => {
                console.log('Error getting location:', error);
            },
            { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 },
        );
    };

    const getApiData = (latitude, longitude)=>{
        const currentDate = formattedCurrentDate();
        const currentNextDay = formattedNextDay();
        const pastDate = formattedPastDate();
        const nextDate = formattedNextDate();
        const previousWeatherURL = `https://api.weatherbit.io/v2.0/history/agweather?lat=${latitude}&lon=${longitude}&start_date=${pastDate}&end_date=${currentDate}&tp=daily&key=e090d8b9106349168aa9c6814e661944`;
        const nextWeatherURL = `https://api.weatherbit.io/v2.0/history/agweather?lat=${latitude}&lon=${longitude}&start_date=${currentNextDay}&end_date=${nextDate}&tp=daily&key=e090d8b9106349168aa9c6814e661944`;
        const currentWeatherURL = `https://api.weatherbit.io/v2.0/current?lat=${latitude}&lon=${longitude}&key=e090d8b9106349168aa9c6814e661944`;
        setLoading(true)
        Promise.all([
            callAPI(previousWeatherURL),
            callAPI(nextWeatherURL),
            callAPI(currentWeatherURL)
        ]).then(([previousWeatherURL,nextWeatherURL, currentWeatherData]) => {
            const weatherData = previousWeatherURL.concat(nextWeatherURL)
            setWeatherData(weatherData);
            setCurrentWeather(currentWeatherData);
            setLoading(false)
        }).catch(error => {
            setLoading(false)
            console.log('Error getting weather data:', error);
        });
    }
    useEffect(() => {
        if (searchInput.length > 2) {
            handleSearch(searchInput);
        } else {
            setSearchResults([]);
        }

    }, [searchInput]);


    const handleSearch = async (value) => {
        try {
            const response = await fetch(`https://maps.googleapis.com/maps/api/place/textsearch/json?key=${GOOGLE_PLACES_API_KEY}&query=${value}`);
            const data = await response.json();
    
            setSearchResults(data.results)
        } catch (error) {
            console.error('Error searching:', error);
        }
    };



    const handleLocationSelect = (location) => {
        setLoading(true);
        const {lat,lng} = location?.geometry?.location     
        getApiData(lat,lng)
        setSearchInput('');
        setSearchResults([]);
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" hidden={true} />
            <ImageBackground source={images.WeatherBG} blurRadius={70} style={styles.backgroundImage}>

                <View style={styles.searchContainer}>
                    <TextInput
                        placeholder="Search City"
                        value={searchInput}
                        onChangeText={setSearchInput}
                        style={styles.input}
                    />
                    <Image source={images.SearchIcon} style={styles.searchIcon} />
                    {searchResults?.length > 0 && (
                        <View style={styles.resultsContainer}>
                            <FlatList
                                data={searchResults}
                                renderItem={({ item, index }) => (
                                    <TouchableOpacity onPress={() => handleLocationSelect(item)}>
                                        <Text style={[styles.locationItem, { borderBottomWidth: index !== searchResults.length - 1 ? 1 : 0 }]}>
                                            {item.formatted_address}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                                keyExtractor={(item, index) => index.toString()}
                                style={styles.flatList}
                            />
                        </View>
                    )}
                </View>

                {currentWeather && (
                    <View style={styles.weatherContainer}>
                        <Text style={styles.weatherText}>
                            {currentWeather[0]?.city_name}, {currentWeather[0]?.country_code}
                        </Text>
                        <Image source={images.Cloudy} style={styles.weatherImage} />
                        <Text style={styles.temperatureText}>{currentWeather[0]?.app_temp}°</Text>
                        {/* <Text style={styles.descriptionText}>{weatherData?.current?.condition?.text}</Text> */}
                    </View>
                )}
                {weatherData && <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 15, marginTop: 20, position: 'absolute', bottom: 50 }}
                    data={weatherData}
                    renderItem={({ item, index }) => {
                        let date = new Date(item?.timestamp_local);
                        let dayName = date.toLocaleDateString('en-US', { weekday: 'short', day: '2-digit' }).split(',')[0];
                        return (
                            <View style={styles.weatherDayContainer}>
                                <Image source={images.Cloudy} style={styles.weatherDayIcon} />
                                <Text style={styles.weatherDayName}>{dayName}</Text>
                                <Text style={styles.weatherDayTemp}>{item?.soilt_0_10cm}°</Text>
                            </View>
                        );
                    }}
                />}
            </ImageBackground>
            <CustomProgressBar visible={loading}/>

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    backgroundImage: {
        flex: 1,
        width: '100%',
    },
    searchContainer: {
        marginHorizontal: 20,
        marginTop: 80,
        flexDirection: 'row',
        alignItems: 'center',
        height:55,
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        borderRadius: 20,
    },
    input: {
        fontSize: 24,
        fontWeight: '700',
        color: 'black',
        flex: 1,
        paddingStart: 15,
    },
    searchIcon: {
        position: 'absolute',
        right: 15,
        height: 25,
        width: 25,
    },
    errorText: {
        fontSize: 20,
        fontWeight: '600',
        color: 'white',
        textAlign: 'center',
        marginTop: 20,
    },
    locationItem: {
        fontSize: 20,
        color: 'gray',
        fontWeight: '500',
        borderBottomColor: 'black',
        paddingVertical: 5,
        paddingHorizontal: 10,
    },
    resultsContainer: {
        backgroundColor: 'white',
        width: '100%',
        borderRadius: 20,
        marginVertical: 15,
        maxHeight: 200,
        position: 'absolute',
        top: 50,
        zIndex: 21,
    },
    flatList: {
        maxHeight: 160,
        zIndex: 20,
    },
    weatherContainer: {
        marginTop: 150,
        alignItems: 'center',
    },
    weatherText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
        marginBottom: 10,
    },
    weatherImage: {
        height: 150,
        width: 150,
        resizeMode: 'contain',
    },
    temperatureText: {
        fontSize: 36,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
    },
    descriptionText: {
        fontSize: 24,
        fontWeight: '600',
        color: 'white',
        textAlign: 'center',
        marginTop: 10,
    },
    weatherDayContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 15,
        height: 120,
        width: 80,
        marginEnd: 20,
    },
    weatherDayIcon: {
        height: 50,
        width: 50,
        resizeMode: 'contain',
    },
    weatherDayName: {
        color: 'white',
        fontWeight: '600',
        textAlign: 'center',
        marginTop: 10,
    },
    weatherDayTemp: {
        color: 'white',
        fontWeight: '600',
        textAlign: 'center',
    },
});

export default Weather;

