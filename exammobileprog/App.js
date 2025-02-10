import React, { useEffect, useState } from "react";
import { View, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { WebView } from "react-native-webview";
import {
  Provider as PaperProvider,
  Card,
  Paragraph,
  Avatar,
  Searchbar,
  Button,
} from "react-native-paper";

const API_URL = "https://jsonplaceholder.typicode.com/users";

const getDummyImageUrl = (id) => `https://picsum.photos/seed/${id}/77`;

const HomeScreen = ({ navigation }) => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(API_URL);
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    const query = searchQuery.toLowerCase();
    return (
      user.id.toString().includes(searchQuery) ||
      user.name.toLowerCase().includes(query) ||
      user.username.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)
    );
  });

  const renderUser = ({ item }) => {
    const { id, name, username, email, address } = item;
    return (
      <Card style={styles.card}>
        <Card.Title
          title={name}
          subtitle={`Username: ${username}`}
          left={() => (
            <Avatar.Image size={50} source={{ uri: getDummyImageUrl(id) }} />
          )}
        />
        <Card.Content>
          <Paragraph>ID: {id}</Paragraph>
          <Paragraph>Email: {email}</Paragraph>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("Map", {
                lat: parseFloat(address.geo.lat),
                lng: parseFloat(address.geo.lng),
                name: name,
              })
            }
          >
            <Paragraph style={styles.address}>
              {address.street}, {address.city}, {address.zipcode}
            </Paragraph>
          </TouchableOpacity>
        </Card.Content>
        <Card.Actions>
          <Button
            onPress={() =>
              navigation.navigate("Map", {
                lat: parseFloat(address.geo.lat),
                lng: parseFloat(address.geo.lng),
                name: name,
              })
            }
          >
            View Map
          </Button>
        </Card.Actions>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search by id, name, username or email"
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />
      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderUser}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const MapScreen = ({ route }) => {
  const { lat, lng, name } = route.params;

  const mapHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
        <style>
          html, body { height: 100%; margin: 0; padding: 0; }
          #map { height: 100vh; width: 100vw; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          var map = L.map('map').setView([${lat}, ${lng}], 2);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
          L.marker([${lat}, ${lng}]).addTo(map)
            .bindPopup("${name}")
            .openPopup();
        </script>
      </body>
    </html>
  `;

  return (
    <WebView
      originWhitelist={["*"]}
      source={{ html: mapHtml }}
      style={{ flex: 1 }}
    />
  );
};

const Stack = createStackNavigator();

export default function App() {
  return (
    <PaperProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Users" component={HomeScreen} />
          <Stack.Screen name="Map" component={MapScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchbar: {
    margin: 10,
  },
  listContent: {
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  card: {
    marginBottom: 10,
  },
  address: {
    color: "blue",
    textDecorationLine: "underline",
    marginTop: 5,
  },
});
