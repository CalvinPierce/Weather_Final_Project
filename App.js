import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Image, ActivityIndicator, SafeAreaView, ScrollView, Alert, RefreshControl } from 'react-native';
import * as Location from 'expo-location';
import { textDecorationColor } from 'react-native/Libraries/Components/View/ReactNativeStyleAttributes';

const App = () => {
  const KEY = '3ff44f18e57daa08090e013fda247b2c'
  const [forecast, setForecast] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadForecast = async () => {
    setRefreshing(true);

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission to access location was denied');
    }

    let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });

    const response = await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${location.coords.latitude}&lon=${location.coords.longitude}&exclude=minutely&units=metric&appid=${KEY}`);
    const data = await response.json();

    if (!response.ok) {
      Alert.alert(`Error retrieving weather data: ${data.message}`);
    } else {
      setForecast(data);
    }

    setRefreshing(false);
  }

  useEffect(() => {
    if (!forecast) {
      loadForecast();
    }
  })

  if (!forecast) {
    return <SafeAreaView style={styles.loading}>
      <ActivityIndicator size="large" />
    </SafeAreaView>;
  }

  let days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <SafeAreaView style={styles.container}>
      
      <Text style={styles.header}>Local Weather Forecasts</Text>

      <ScrollView
        refreshControl={
          <RefreshControl
            onRefresh={() => { loadForecast() }}
            refreshing={refreshing}
          />}
      >
        {forecast.daily.slice(0, 7).map(d => { //Only want the next 7 days
          const weather = d.weather[0];
          let date = new Date(d.dt * 1000)
          let dayname = days[date.getDay()];
          return <View style={styles.day} key={d.dt}>
            <Image
              style={styles.icon}
              source={{
                uri: `http://openweathermap.org/img/wn/${weather.icon}@4x.png`,
              }}
            />
            <View style={styles.dayDetails}>
              <Text style={{fontSize: 18}}>{dayname} {date.toLocaleDateString()}</Text>
              <Text style={styles.dayText}>{weather.description}</Text>
            </View>
            <Text style={styles.dayTemp}>{Math.round(d.temp.max)}??C</Text>
          </View>
        })}
      </ScrollView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ecebbd',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  header: {
    padding: 20,
    fontSize: 25,
    color: '#008000',
    textDecorationLine: 'underline',
    fontFamily: 'sans-serif-condensed',
    textTransform: 'uppercase'
  },
  loading: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  day: {
    flexDirection: 'row',
    borderBottomColor: "red",
    borderBottomWidth: StyleSheet.hairlineWidth
  },
  dayDetails: {
    justifyContent: 'center',
  },
  dayText: {
    fontSize: 18,
    fontWeight: 'bold',
    alignItems: 'flex-end',
    textAlign: 'center'
  },
  dayTemp: {
    marginLeft: 18,
    fontSize: 20,
    alignSelf: 'center',  
  },
  icon: {
    width: 100,
    height: 100,
  }
});

export default App;


