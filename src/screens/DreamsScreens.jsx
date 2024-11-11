import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert, StatusBar, ActivityIndicator, RefreshControl } from 'react-native';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, push, onValue, remove, update } from 'firebase/database';
import { AntDesign } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';

const firebaseConfig = {
  apiKey: "AIzaSyBWNQn4Ly6l9gf9uI9w9hkP3dn99NYglig",
  authDomain: "bamboo-reason-410015.firebaseapp.com",
  databaseURL: "https://bamboo-reason-410015-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "bamboo-reason-410015",
  storageBucket: "bamboo-reason-410015.appspot.com",
  messagingSenderId: "1029644196564",
  appId: "1:1029644196564:web:d990a84c0e2f18cee4f941"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const DreamsScreens = () => {
  const [dream, setDream] = useState('');
  const [dreams, setDreams] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
      fetchDreams();
  }, []);

  const fetchDreams = () => {
      setLoading(true);
      const dreamsRef = ref(database, 'dreams');
      try {
          onValue(dreamsRef, (snapshot) => {
              const data = snapshot.val();
              if (data) {
                  const dreamsArray = Object.keys(data).map(key => ({ id: key, ...data[key] }));
                  setDreams(dreamsArray.reverse()); // Reverse to show the latest dream at the top
              } else {
                  setDreams([]);
              }
              setLoading(false);
          });
      } catch (error) {
          setLoading(false);
          Alert.alert('Error', 'Failed to load dreams. Please try again later.');
      }
  };

  const addDream = () => {
      if (dream.trim()) {
          const dreamsRef = ref(database, 'dreams');
          const currentTime = new Date().toISOString();
          push(dreamsRef, { text: dream, achieved: false, time: currentTime });
          setDream('');
      }
  };

  const markAchieved = (id, achieved) => {
      const dreamRef = ref(database, `dreams/${id}`);
      update(dreamRef, { achieved: !achieved });
  };

  const deleteDream = (id) => {
      Alert.alert(
          'Delete Dream',
          'Are you sure you want to delete this dream?',
          [
              { text: 'Cancel', style: 'cancel' },
              { text: 'OK', onPress: () => {
                      const dreamRef = ref(database, `dreams/${id}`);
                      remove(dreamRef);
                  }},
          ]
      );
  };

  const filteredDreams = dreams.filter((item, index) => {
      const searchLower = search.toLowerCase();
      const dreamText = item.text ? item.text.toLowerCase() : '';
      const dreamNumber = (index + 1).toString();
      return dreamText.includes(searchLower) || dreamNumber.includes(searchLower);
  });

  const renderItem = ({ item, index }) => (
      <TouchableOpacity
          style={[styles.dreamItem, item.achieved && styles.achievedDreamItem]}
          onLongPress={() => deleteDream(item.id)}
      >
          <View>
              <Text style={styles.dreamText}>{item.text} - {index + 1}</Text>
              <Text style={styles.timeText}>Added on: {new Date(item.time).toLocaleDateString()}</Text>
          </View>
          <View style={styles.iconContainer}>
              <TouchableOpacity onPress={() => markAchieved(item.id, item.achieved)}>
                  <AntDesign name="checkcircle" size={24} color={item.achieved ? "green" : "gray"} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteDream(item.id)} style={{ paddingLeft: 20 }}>
                  <FontAwesome name="trash" size={24} color="red" />
              </TouchableOpacity>
          </View>
      </TouchableOpacity>
  );

  const onRefresh = () => {
      setRefreshing(true);
      fetchDreams();
      setRefreshing(false);
  };

  return (
      <View style={styles.container}>
          <StatusBar barStyle="light-content" backgroundColor="#121212" />
          <Text style={styles.header}>Our Dreams 🫂🫂🫂</Text>
          <TextInput
              style={styles.input}
              placeholder="Write your dream... 🥹🫂"
              value={dream}
              onChangeText={setDream}
              textAlign="left"
          />
          <TouchableOpacity style={styles.button} onPress={addDream}>
              <Text style={styles.buttonText}>Add Dream</Text>
          </TouchableOpacity>
          <TextInput
              style={styles.searchInput}
              placeholder="Search your dreams..."
              value={search}
              onChangeText={setSearch}
              textAlign="left"
          />
          {loading ? (
              <ActivityIndicator size="large" color="#007BFF" />
          ) : (
              <FlatList
                  data={filteredDreams}
                  keyExtractor={item => item.id}
                  renderItem={renderItem}
                  refreshControl={
                      <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                  }
              />
          )}
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
      flex: 1,
      backgroundColor: '#121212',
      padding: 20,
       marginTop:24
  },
  header: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#FFF',
      marginBottom: 20,
  },
  input: {
      height: 40,
      borderColor: '#555',
      borderWidth: 1,
      marginBottom: 20,
      paddingHorizontal: 10,
      color: '#FFF',
      backgroundColor: '#333',
      borderRadius: 5,
  },
  button: {
      backgroundColor: '#007BFF',
      paddingVertical: 10,
      paddingHorizontal: 15,
      borderRadius: 5,
      marginBottom: 20,
  },
  buttonText: {
      color: '#FFF',
      textAlign: 'center',
  },
  searchInput: {
      height: 40,
      borderColor: '#555',
      borderWidth: 1,
      marginBottom: 20,
      paddingHorizontal: 10,
      color: '#FFF',
      backgroundColor: '#333',
      borderRadius: 5,
  },
  dreamItem: {
      backgroundColor: '#1E1E1E',
      padding: 15,
      borderBottomWidth: 1,
      borderColor: '#333',
      marginBottom: 10,
      borderRadius: 5,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
  },
  achievedDreamItem: {
      backgroundColor: '#265A33',
  },
  dreamText: {
      fontSize: 16,
      color: '#FFF',
      textAlign: 'left',
  },
  timeText: {
      fontSize: 12,
      color: '#888',
      textAlign: 'left',
  },
  iconContainer: {
      flexDirection: 'row',
      alignItems: 'center',
  },
});
export default DreamsScreens