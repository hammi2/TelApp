import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Alert, TouchableOpacity, Modal, Image, LogBox } from 'react-native';
import { GiftedChat, Bubble, InputToolbar, Actions, Composer } from 'react-native-gifted-chat';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, push, onValue, remove, update, get } from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { launchImageLibrary } from 'react-native-image-picker';
import { auth } from '../../firebase';
import EmojiSelector from 'react-native-emoji-selector';
import { StatusBar } from "expo-status-bar";

// إخفاء التحذيرات
LogBox.ignoreAllLogs();

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

const ChatScreen = () => {
  const [messages, setMessages] = useState([]);
  const [replyToMessage, setReplyToMessage] = useState(null);
  const [reactionModalVisible, setReactionModalVisible] = useState(false);
  const [currentMessage, setCurrentMessage] = useState(null);
  const [imageUri, setImageUri] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [smallReactionMenuVisible, setSmallReactionMenuVisible] = useState(false);

  useEffect(() => {
    const messagesRef = ref(database, 'messages');
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      const messagesList = data ? Object.entries(data).map(([key, message]) => ({
        ...message,
        _id: key,
        createdAt: new Date(message.createdAt),
        replyTo: message.replyTo || null,
        replyMessage: message.replyMessage || null,
        reactions: message.reactions || {}
      })) : [];
      setMessages(messagesList.reverse());
    });

    return () => unsubscribe();
  }, []);

  const onSend = (newMessages = []) => {
    if (editingMessage) {
      submitEditedMessage(newMessages[0].text);
    } else {
      newMessages.forEach(message => {
        const messageWithTimestamp = {
          ...message,
          createdAt: new Date().toISOString(),
        };
        if (replyToMessage) {
          messageWithTimestamp.replyTo = replyToMessage._id;
          messageWithTimestamp.replyMessage = replyToMessage.text;
        }
        push(ref(database, 'messages'), messageWithTimestamp);
        setReplyToMessage(null);
      });
    }
  };

  const deleteMessage = (messageId) => {
    const messageRef = ref(database, `messages/${messageId}`);
    remove(messageRef);
  };

  const handleToggleReaction = async (messageId, reaction) => {
    const userId = auth.currentUser.uid;
    const messageRef = ref(database, `messages/${messageId}`);
    const snapshot = await get(messageRef);
    const currentReactions = snapshot.val().reactions || {};
    
    if (currentReactions[reaction] && currentReactions[reaction].includes(userId)) {
      // إزالة الرد التفاعلي
      currentReactions[reaction] = currentReactions[reaction].filter(id => id !== userId);
      if (currentReactions[reaction].length === 0) {
        delete currentReactions[reaction];
      }
    } else {
      // إضافة الرد التفاعلي
      if (!currentReactions[reaction]) {
        currentReactions[reaction] = [];
      }
      currentReactions[reaction].push(userId);
    }

    update(messageRef, { reactions: currentReactions });
  };

  const onLongPress = (context, message) => {
    const options = ['Reply', 'React', 'Edit', 'Delete Message', 'Cancel'];
    const cancelButtonIndex = options.length - 1;
    context.actionSheet().showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
      },
      (buttonIndex) => {
        if (buttonIndex === 0) {
          setReplyToMessage(message);
        } else if (buttonIndex === 1) {
          setCurrentMessage(message);
          setSmallReactionMenuVisible(true);
        } else if (buttonIndex === 2) {
          setEditingMessage(message);
        } else if (buttonIndex === 3) {
          Alert.alert(
            'Delete Message',
            'Are you sure you want to delete this message?',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Delete', onPress: () => deleteMessage(message._id), style: 'destructive' },
            ],
            { cancelable: true }
          );
        }
      }
    );
  };

  const submitEditedMessage = (newText) => {
    if (editingMessage) {
      const messageRef = ref(database, `messages/${editingMessage._id}`);
      update(messageRef, { text: newText });
      setEditingMessage(null);
    }
  };

 const renderBubble = (props) => {
  const { currentMessage } = props;
  return (
    <View style={styles.bubbleWrapper}>
      {currentMessage.replyMessage && (
        <View style={styles.replyContainer}>
          <View style={styles.replyCard}>
            <Text style={styles.replyText}>{currentMessage.replyMessage}</Text>
          </View>
        </View>
      )}
      <Bubble
        {...props}
        wrapperStyle={{
          left: styles.bubbleLeft,
          right: styles.bubbleRight,
        }}
        textStyle={{
          left: styles.bubbleTextLeft,
          right: styles.bubbleTextRight,
        }}
        onLongPress={(context) => onLongPress(context, currentMessage)}
      />
      {currentMessage.reactions && (
        <View style={styles.reactionsContainer}>
          {Object.entries(currentMessage.reactions).map(([reaction, users]) => (
            <View key={reaction} style={styles.reactionWrapper}>
              <TouchableOpacity 
                onPress={() => handleToggleReaction(currentMessage._id, reaction)}
                style={styles.reactionButton}
              >
                <Text style={styles.reactionText}>{reaction}</Text>
                <Text style={styles.reactionCount}>{users.length}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};
const renderSmallReactionMenu = () => (
  <Modal
    transparent={true}
    animationType="fade"
    visible={smallReactionMenuVisible}
    onRequestClose={() => setSmallReactionMenuVisible(false)}
  >
    <TouchableOpacity style={styles.centeredView} onPress={() => setSmallReactionMenuVisible(false)}>
      <View style={styles.smallReactionMenu}>
        {['❤️', '😂', '😮', '😢', '😡', '👍'].map((reaction) => (
          <TouchableOpacity
            key={reaction}
            onPress={() => {
              handleToggleReaction(currentMessage._id, reaction);
              setSmallReactionMenuVisible(false);
            }}
            style={styles.smallReactionButton}
          >
            <Text style={styles.smallReactionText}>{reaction}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          onPress={() => {
            setSmallReactionMenuVisible(false);
            setReactionModalVisible(true);
          }}
          style={styles.smallReactionButton}
        >
          <Text style={styles.smallReactionText}>➕</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  </Modal>
);
const renderReactionModal = () => (
  <Modal
    transparent={true}
    animationType="slide"
    visible={reactionModalVisible}
    onRequestClose={() => setReactionModalVisible(false)}
  >
    <View style={styles.modalContainer}>
      <View style={styles.modalContent}>
        <EmojiSelector
          onEmojiSelected={(emoji) => {
            handleToggleReaction(currentMessage._id, emoji);
            setReactionModalVisible(false);
          }}
          showSearchBar={true}
          showTabs={true}
          showHistory={true}
          showSectionTitles={true}
        />
      </View>
    </View>
  </Modal>
);
  const uploadImage = async (uri, imageName) => {
    const response = await fetch(uri);
    const blob = await response.blob();

    const imageRef = storageRef(storage, `images/${imageName}`);
    await uploadBytes(imageRef, blob);

    const downloadURL = await getDownloadURL(imageRef);
    return downloadURL;
  };

  const selectImage = (callback) => {
    launchImageLibrary({}, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else {
        const source = { uri: response.assets[0].uri };
        callback(source);
      }
    });
  };

  const handleSelectImage = () => {
    selectImage((source) => {
      setImageUri(source.uri);
    });
  };

  const handleUploadImage = async () => {
    if (imageUri) {
      const imageName = `image_${Date.now()}`;
      const downloadURL = await uploadImage(imageUri, imageName);
      await saveImageUrlToFirestore(downloadURL);
      setUploadedImageUrl(downloadURL);
      onSend([{
        _id: Math.random().toString(36).substring(7),
        text: '',
        createdAt: new Date().toISOString(),
        user: {
          _id: auth.currentUser.uid,
          name: auth.currentUser.email,
        },
        image: downloadURL,
      }]);
      setImageUri(null);
    }
  };

  const saveImageUrlToFirestore = async (imageUrl) => {
    const docRef = await firestore().collection('images').add({
      url: imageUrl,
      createdAt: firestore.FieldValue.serverTimestamp()
    });
    return docRef.id;
  };

  const renderActions = (props) => (
    <Actions
      {...props}
      options={{
        ['Send Image']: handleSelectImage,
      }}
      icon={() => (
        <View style={styles.iconContainer}>
          <Text style={styles.iconText}>+</Text>
        </View>
      )}
    />
  );

  useEffect(() => {
    if (imageUri) {
      handleUploadImage();
    }
  }, [imageUri]);

  return (
    <View style={styles.container}>
      <GiftedChat
        messages={messages}
        onSend={onSend}
        user={{
          _id: auth.currentUser.uid,
          name: auth.currentUser.email,
          avatar: 'https://static.thenounproject.com/png/2734299-200.png',
        }}
        onLongPress={onLongPress}
        renderBubble={renderBubble}
        renderInputToolbar={(props) => <InputToolbar {...props} containerStyle={styles.inputToolbar} />}
        text={editingMessage ? editingMessage.text : undefined}
        onInputTextChanged={(text) => {
          if (editingMessage) {
            setEditingMessage({ ...editingMessage, text });
          }
        }}
      />
      <StatusBar style="dark" />
      {renderSmallReactionMenu()}
      {renderReactionModal()}
      {uploadedImageUrl && (
        <Image
          source={{ uri: uploadedImageUrl }}
          style={styles.image}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  inputToolbar: {
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    color: '#FFF',
    fontSize: 24,
    lineHeight: 24,
  },
  replyContainer: {
    backgroundColor: '#0946FC',
    padding: 1,
    borderRadius: 5,
    marginBottom: 6,
  },
  replyCard: {
    backgroundColor: '#e6e6e6',
    borderRadius: 5,
    padding: 2,
  },
  replyText: {
    fontSize: 14,
    color: '#333',
  },
  bubbleWrapper: {
    marginBottom:10,
    position: 'relative',
  },
  bubbleLeft: {
    backgroundColor: '#2C2C2E',
  },
  bubbleRight: {
    backgroundColor: '#007AFF',
  },
  bubbleTextLeft: {
    color: '#FFF',
  },
  bubbleTextRight: {
    color: '#FFF',
  },
  reactionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -2,
    marginLeft: -2,
    marginBottom: -8,
  },
  reactionWrapper: {
    //backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    //borderColor: '#FFD700',
    //paddingHorizontal: 4,
    //paddingVertical: 2,
    flexDirection: 'column',
    alignItems: 'center',
    //marginRight: 5,
  },
  reactionButton: {
    flexDirection: "column",
    alignItems: 'center',
  },
  reactionText: {
    fontSize: 11,
    color: '#FFD700',
  },
  reactionCount: {
    fontSize: 10,
    marginLeft: 3,
    color: '#FFD700',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 10,
    width: '90%',
    height: '60%',
  },
  reactionButton: {
    padding: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    marginTop: 20,
  },centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  smallReactionMenu: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  smallReactionButton: {
    marginHorizontal: 5,
  },
  smallReactionText: {
    fontSize: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 10,
    width: '90%',
    height: '60%',
  },
});

export default ChatScreen;