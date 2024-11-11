import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert, StatusBar, ActivityIndicator, RefreshControl, Image, Modal, Animated } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, push, onValue, remove, update, set } from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { AntDesign, Feather, FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import { MenuProvider, Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';
import * as Notifications from 'expo-notifications';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';

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
const storage = getStorage(app);

const Home = () => {
  const { isDarkMode } = useTheme();
  const [post, setPost] = useState('');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [imageUri, setImageUri] = useState(null);
  
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editPostId, setEditPostId] = useState(null);
  const [editPostText, setEditPostText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [fullScreenImageUri, setFullScreenImageUri] = useState(null);
  const [note, setNote] = useState('');
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [notes, setNotes] = useState({});
  const [likeAnimation] = useState(new Animated.Value(1));
  const [videoUri, setVideoUri] = useState(null);

  const Navigation = useNavigation()
  useEffect(() => {
    fetchPosts();
  }, []);
  const goToChat =  ()=> {
    Navigation.navigate('Chat')
  
}
  const fetchPosts = () => {
    setLoading(true);
    const postsRef = ref(database, 'posts');
    onValue(postsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const postsArray = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        setPosts(postsArray.reverse());
      } else {
        setPosts([]);
      }
      setLoading(false);
    });
  };

  const fetchNotes = (postId) => {
    const notesRef = ref(database, `posts/${postId}/notes`);
    onValue(notesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setNotes(prevNotes => ({ ...prevNotes, [postId]: Object.keys(data).map(key => ({ id: key, ...data[key] })) }));
      } else {
        setNotes(prevNotes => ({ ...prevNotes, [postId]: [] }));
      }
    });
  };

  const uploadMedia = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      quality: 1,
    });
  
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };
  
  const uploadImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const sendNotification = async (title, body) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: title,
        body: body,
      },
      trigger: null,
    });
  };

  const downloadImage = async (imageUrl) => {
    try {
      const storageRef = ref(storage, imageUrl);
      const downloadURL = await getDownloadURL(storageRef);
  
      const filename = downloadURL.substring(downloadURL.lastIndexOf('/') + 1);
      const localPath = `${FileSystem.documentDirectory}${filename}`;
      
      const { uri } = await FileSystem.downloadAsync(downloadURL, localPath);
  
      Alert.alert('Success', 'Image downloaded successfully', [
        { text: 'OK', onPress: () => Sharing.shareAsync(uri) },
      ]);
    } catch (error) {
      Alert.alert('Error', 'An error occurred while downloading the image');
      console.error(error);
    }
  };
  
  const submitPost = async () => {
    if (post.trim() === '' || !imageUri) {
      Alert.alert('Error', 'Please enter a post and select an image.');
      return;
    }

    setUploading(true);
    const response = await fetch(imageUri);
    const blob = await response.blob();
    const storageReference = storageRef(storage, `images/${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

    const uploadTask = uploadBytesResumable(storageReference, blob);

    uploadTask.on('state_changed', 
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      }, 
      (error) => {
        console.error(error);
        setUploading(false);
      }, 
      async () => {
        const imageUrl = await getDownloadURL(uploadTask.snapshot.ref);
        const postsRef = ref(database, 'posts');
        const currentTime = new Date().toISOString();
        await push(postsRef, { text: post, imageUri: imageUrl, time: currentTime, likes: 0 });
        setPost('');
        setImageUri(null);
        setUploading(false);
        setUploadProgress(0);

        // Send notification
        sendNotification('New Post Created', 'A new post has been added.');
      }
    );
  };

  const deletePost = (id) => {
    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'OK', onPress: async () => {
            const postRef = ref(database, `posts/${id}`);
            await remove(postRef);

            // Send notification
            sendNotification('Post Deleted', 'A post has been deleted.');
          }},
      ]
    );
  };

  const editPost = (id, currentText) => {
    setEditPostId(id);
    setEditPostText(currentText);
    setModalVisible(true);
  };

  const handleEditPost = async () => {
    if (editPostText.trim() === '') {
      Alert.alert('Error', 'Post text cannot be empty.');
      return;
    }

    const postRef = ref(database, `posts/${editPostId}`);
    await update(postRef, { text: editPostText });
    setEditPostId(null);
    setEditPostText('');
    setModalVisible(false);
  };

  const likePost = (id, currentLikes) => {
    if (isNaN(currentLikes)) {
      currentLikes = 0;
    }
  
    // Update animation
    Animated.sequence([
      Animated.timing(likeAnimation, {
        toValue: 1.5,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(likeAnimation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  
    // Update likes in the database
    const postRef = ref(database, `posts/${id}`);
    update(postRef, { likes: currentLikes + 1 })
      .then(() => {
        // Send notification after successful update
        sendNotification('Post Liked', 'A post has been liked.');
      })
      .catch(error => {
        console.error(error);
        Alert.alert('Error', 'Failed to like the post.');
      });
  };

  const submitNote = async () => {
    if (note.trim() === '') {
      Alert.alert('Error', 'Please enter a note.');
      return;
    }

    const notesRef = ref(database, `posts/${selectedPostId}/notes`);
    const newNoteRef = push(notesRef);
    const currentTime = new Date().toISOString();

    await set(newNoteRef, {
      text: note,
      time: currentTime
    });

    setNote('');
    setSelectedPostId(null); // Close the note input
  };

  const toggleNoteInput = (postId) => {
    if (selectedPostId === postId) {
      setSelectedPostId(null);
      setNote('');
    } else {
      setSelectedPostId(postId);
      fetchNotes(postId);
    }
  };

  const renderItem = ({ item }) => (
    <View style={[styles.postContainer, isDarkMode && styles.darkPostContainer]}>
      <View style={[styles.postHeader, isDarkMode && styles.darkPostHeader]}>
        <Text style={[styles.postDate, isDarkMode && styles.darkText]}>{new Date(item.time).toLocaleDateString()} {new Date(item.time).toLocaleTimeString()}</Text>
        <View style={styles.menuContainer}>
          <Menu>
            <MenuTrigger>
              <MaterialCommunityIcons name="dots-vertical" size={24} color={isDarkMode ? '#fff' : '#000'} />
            </MenuTrigger>
            <MenuOptions >
              <MenuOption onSelect={() => editPost(item.id, item.text)} style={[styles.menuOption, isDarkMode && styles.darkMenuOption]}>
                <Feather name="edit" size={16} color={isDarkMode ? '#fff' : '#000'} />
                <Text style={[styles.menuOptionText, isDarkMode && styles.darkText]}>Edit</Text>
              </MenuOption>
              <MenuOption onSelect={() => deletePost(item.id)} style={[styles.menuOption, isDarkMode && styles.darkMenuOption]}>
                <AntDesign name="delete" size={16} color={isDarkMode ? '#fff' : '#000'} />
                <Text style={[styles.menuOptionText, isDarkMode && styles.darkText]}>Delete</Text>
              </MenuOption>
              <MenuOption onSelect={() => downloadImage(item.imageUri)} style={[styles.menuOption, isDarkMode && styles.darkMenuOption]}>
                <AntDesign name="download" size={16} color={isDarkMode ? '#fff' : '#000'} />
                <Text style={[styles.menuOptionText, isDarkMode && styles.darkText]}>Downloads</Text>
              </MenuOption>
            </MenuOptions>
          </Menu>
        </View>
      </View>
      <TouchableOpacity onPress={() => setFullScreenImageUri(item.imageUri)}>
        <Image source={{ uri: item.imageUri }} style={styles.image} />
      </TouchableOpacity>
      <View style={styles.postContent}>
        <Text style={[styles.postText, isDarkMode && styles.darkText]}>{item.text}</Text>
        <View style={styles.actionContainer}>
          <TouchableOpacity 
            onPress={() => likePost(item.id, item.likes)} 
            style={styles.likeButton}
          >
            <Animated.View style={{ transform: [{ scale: likeAnimation }] }}>
              <AntDesign name="like2" size={24} color={isDarkMode ? '#fff' : '#000'} />
            </Animated.View>
          </TouchableOpacity>
          <Text style={[styles.likeCount, isDarkMode && styles.darkText]}>{item.likes}</Text>
          <TouchableOpacity 
            onPress={() => toggleNoteInput(item.id)}
            style={styles.noteButton}
          >
            <FontAwesome name="comment" size={24} color={isDarkMode ? '#fff' : '#000'} />
          </TouchableOpacity>
        </View>
        {selectedPostId === item.id && (
          <View style={styles.notesContainer}>
            <View style={styles.noteInputContainer}>
              <TextInput
                style={[styles.noteInput, isDarkMode && styles.darkNoteInput]}
                placeholder="Write a note..."
                placeholderTextColor={isDarkMode ? '#fff' : '#000'}
                value={note}
                onChangeText={setNote}
              />
              <TouchableOpacity style={styles.iconButton} onPress={submitNote}>
                <FontAwesome name="send" size={24} color={isDarkMode ? '#fff' : '#000'} />
              </TouchableOpacity>
            </View>
            {notes[item.id]?.map(noteItem => (
              <View key={noteItem.id} style={[styles.noteItem, isDarkMode && styles.darkNoteItem]}>
                <Text style={[styles.noteText, isDarkMode && styles.darkText]}>{noteItem.text}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );

  return (
    <MenuProvider>
      <View style={[styles.container, isDarkMode && styles.darkContainer]}>
        {/* <StatusBar barStyle="d" /> */}
        <View style={[styles.header, isDarkMode && styles.darkHeader]}>
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <MaterialIcons name="post-add" size={24} color={isDarkMode ? '#fff' : '#000'} />
          </TouchableOpacity>
          <Text style={[styles.headerText, isDarkMode && styles.darkText]}>My Posts</Text>
          <TouchableOpacity onPress={goToChat}>
            <MaterialCommunityIcons name="chat-processing" size={24} color={isDarkMode ? '#fff' : '#000'} />
          </TouchableOpacity>
        </View>
        {loading ? (
          <ActivityIndicator size="large" color={isDarkMode ? '#fff' : '#000'} />
        ) : (
          <FlatList
            data={posts}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => {
                  setRefreshing(true);
                  fetchPosts();
                  setRefreshing(false);
                }}
              />
            }
            contentContainerStyle={styles.listContainer}
          />
        )}
        <Modal
          visible={modalVisible}
          transparent={true}
          animationType="slide"
        >
          <View style={styles.modalContainer}>
            <View style={[styles.modalContent, isDarkMode && styles.darkModalContent]}>
              <TextInput
                style={[styles.postInput, isDarkMode && styles.darkPostInput]}
                placeholder="What's on your mind?"
                placeholderTextColor={isDarkMode ? '#fff' : '#000'}
                value={post}
                onChangeText={setPost}
              />
              <TouchableOpacity onPress={uploadImage} style={[styles.imageButton, isDarkMode && styles.darkImageButton]}>
                <Text style={[styles.imageButtonText, isDarkMode && styles.darkText]}>Choose Image</Text>
              </TouchableOpacity>
              {imageUri && <Image source={{ uri: imageUri }} style={styles.previewImage} />}
              <TouchableOpacity onPress={submitPost} style={[styles.submitButton, isDarkMode && styles.darkSubmitButton]}>
                <Text style={[styles.submitButtonText, isDarkMode && styles.darkText]}>{uploading ? `Uploading ${Math.round(uploadProgress)}%` : 'Post'}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                <AntDesign name="close" size={24} color={isDarkMode ? '#fff' : '#000'} />
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        <Modal
          visible={!!fullScreenImageUri}
          transparent={true}
          animationType="fade"
        >
          <View style={styles.fullScreenImageContainer}>
            {fullScreenImageUri && <Image source={{ uri: fullScreenImageUri }} style={styles.fullScreenImage} />}
            <TouchableOpacity onPress={() => setFullScreenImageUri(null)} style={styles.fullScreenCloseButton}>
              <AntDesign name="close" size={24} color={isDarkMode ? '#fff' : '#000'} />
            </TouchableOpacity>
          </View>
        </Modal>
        <Modal
          visible={!!editPostId}
          transparent={true}
          animationType="slide"
        >
          <View style={styles.modalContainer}>
            <View style={[styles.modalContent, isDarkMode && styles.darkModalContent]}>
              <TextInput
                style={[styles.postInput, isDarkMode && styles.darkPostInput]}
                placeholder="Edit post..."
                placeholderTextColor={isDarkMode ? '#fff' : '#000'}
                value={editPostText}
                onChangeText={setEditPostText}
              />
              <TouchableOpacity onPress={handleEditPost} style={[styles.submitButton, isDarkMode && styles.darkSubmitButton]}>
                <Text style={[styles.submitButtonText, isDarkMode && styles.darkText]}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setEditPostId(null)} style={styles.closeButton}>
                <AntDesign name="close" size={24} color={isDarkMode ? '#fff' : '#000'} />
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </MenuProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    // marginTop:2
  },
  header: {
    backgroundColor: '#333333',
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop:23
  },
  headerText: {
    color: 'white',
    fontSize: 20,
  },
  listContainer: {
    paddingBottom: 100,
  },
  postContainer: {
    backgroundColor: '#1E1E1E',
    margin: 15,
    borderRadius: 10,
    overflow: 'hidden',
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#555555',
  },
  postDate: {
    color: 'white',
    fontSize: 14,
  },
  menuContainer: {
    flexDirection: 'row',
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  menuOptionText: {
    marginLeft: 5,
  },
  image: {
    width: '100%',
    height: 200,
  },
  postContent: {
    padding: 10,
  },
  postText: {
    color: 'white',
    fontSize: 16,
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  likeButton: {
    marginRight: 10,
  },
  likeCount: {
    color: 'white',
    marginRight: 10,
  },
  noteButton: {
    marginRight: 10,
  },
  notesContainer: {
    marginTop: 10,
  },
  noteInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  noteInput: {
    backgroundColor: '#333333',
    color: 'white',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    flex: 1,
  },
  iconButton: {
    marginLeft: 10,
  },
  noteItem: {
    backgroundColor: '#555555',
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
  },
  noteText: {
    color: 'white',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#333333',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  postInput: {
    backgroundColor: '#444444',
    color: 'white',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  imageButton: {
    backgroundColor: '#555555',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  imageButtonText: {
    color: 'white',
  },
  previewImage: {
    width: '100%',
    height: 200,
    marginVertical: 10,
  },
  submitButton: {
    backgroundColor: '#666666',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  fullScreenImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  fullScreenImage: {
    width: '90%',
    height: '90%',
  },
  fullScreenCloseButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  darkContainer: {
    backgroundColor: '#121212',
  },
  darkHeader: {
    backgroundColor: '#1E1E1E',
  },
  darkText: {
    color: '#fff',
  },
  darkPostContainer: {
    backgroundColor: '#1E1E1E',
  },
  darkPostHeader: {
    backgroundColor: '#2C2C2C',
  },
  darkMenuOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  darkNoteInput: {
    backgroundColor: '#2C2C2C',
    color: '#fff',
  },
  darkNoteItem: {
    backgroundColor: '#2C2C2C',
  },
  darkModalContent: {
    backgroundColor: '#1E1E1E',
  },
  darkPostInput: {
    backgroundColor: '#2C2C2C',
    color: '#fff',
  },
  darkImageButton: {
    backgroundColor: '#2C2C2C',
  },
  darkSubmitButton: {
    backgroundColor: '#2C2C2C',
  },
});

export default Home;
// Home