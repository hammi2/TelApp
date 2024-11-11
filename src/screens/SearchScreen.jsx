import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, FlatList, ActivityIndicator, Image, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { getDatabase, ref, get, remove, update } from 'firebase/database';
import { AntDesign, FontAwesome } from '@expo/vector-icons';

const SearchScreen = () => {
  const { colors, dark } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setResults([]);
      return;
    }

    setLoading(true);
    const database = getDatabase();
    const postsRef = ref(database, 'posts');
    const dreamsRef = ref(database, 'dreams');

    const fetchResults = async () => {
      try {
        const postsSnapshot = await get(postsRef);
        const dreamsSnapshot = await get(dreamsRef);

        const postsData = postsSnapshot.exists() ? Object.values(postsSnapshot.val()).map(post => ({ ...post, type: 'post' })) : [];
        const dreamsData = dreamsSnapshot.exists() ? Object.values(dreamsSnapshot.val()).map(dream => ({ ...dream, type: 'dream' })) : [];

        const filteredPosts = postsData.filter(post => post.text && post.text.toLowerCase().includes(searchQuery.toLowerCase()));
        const filteredDreams = dreamsData.filter(dream => dream.text && dream.text.toLowerCase().includes(searchQuery.toLowerCase()));

        setResults([...filteredPosts, ...filteredDreams]);
      } catch (error) {
        console.error("Error fetching data: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [searchQuery]);

  const deleteItem = (id, type) => {
    Alert.alert(
      'Delete Item',
      'Are you sure you want to delete this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'OK', onPress: () => {
            const itemRef = ref(getDatabase(), `${type}/${id}`);
            remove(itemRef);
          }},
      ]
    );
  };

  const toggleAchieved = (id, achieved) => {
    const itemRef = ref(getDatabase(), `dreams/${id}`);
    update(itemRef, { achieved: !achieved });
  };

  const renderItem = ({ item }) => {
    if (item.type === 'post') {
      return (
        <View style={[styles.postContainer, { backgroundColor: colors.card }]}>
          {item.imageUri && <Image source={{ uri: item.imageUri }} style={styles.postImage} />}
          <View style={styles.textContainer}>
            <Text style={[styles.itemText, { color: colors.text }]}>{item.text}</Text>
            {item.time && <Text style={[styles.timeText, { color: colors.secondary }]}>{new Date(item.time).toLocaleDateString()}</Text>}
            {item.name && <Text style={[styles.nameText, { color: colors.primary }]}>{item.name}</Text>}
          </View>
          <View style={styles.iconContainer}>
            <TouchableOpacity onPress={() => deleteItem(item.id, 'posts')}>
            <FontAwesome name="trash" size={24} color="red" />
            </TouchableOpacity>
          </View>
        </View>
      );
    } else if (item.type === 'dream') {
      return (
        <View style={[styles.dreamContainer, { backgroundColor: colors.card }]}>
          {item.imageUri && <Image source={{ uri: item.imageUri }} style={styles.dreamImage} />}
          <View style={styles.textContainer}>
            <Text style={[styles.itemText, { color: colors.text }]}>{item.text}</Text>
            {item.time && <Text style={[styles.timeText, { color: colors.secondary }]}>{new Date(item.time).toLocaleDateString()}</Text>}
            {item.name && <Text style={[styles.nameText, { color: colors.primary }]}>{item.name}</Text>}
          </View>
          <View style={styles.iconContainer}>
            {item.achieved !== undefined && (
              <TouchableOpacity onPress={() => toggleAchieved(item.id, item.achieved)}>
               
              </TouchableOpacity>
            )}
            <TouchableOpacity style={{marginLeft: 20}} onPress={() => deleteItem(item.id, 'dreams')}>
            <FontAwesome name="trash" size={24} color="red" />
            </TouchableOpacity>
          </View>
        </View>
      );
    }
    return null;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TextInput
        style={[
          styles.searchInput,
          { 
            borderColor: colors.border, 
            color: dark ? '#000' : "#000"
          }
        ]}
        placeholder="Search To The Post And The Dreems"
        placeholderTextColor={colors.secondary}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 20,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    fontSize: 16,
    color: '#333',
    paddingVertical: 10,
    marginTop: 20,
  },
  postContainer: {
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    backgroundColor: '#fff',
  },
  dreamContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    backgroundColor: '#fff',
  },
  textContainer: {
    flex: 1,
    marginLeft: 15,
  },
  itemText: {
    fontSize: 18,
    marginBottom: 5,
    color: '#333',
  },
  timeText: {
    fontSize: 14,
    color: '#888',
  },
  nameText: {
    fontSize: 16,
    color: '#555',
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 15,
    marginBottom: 10,
  },
  dreamImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default SearchScreen;