// Import the functions you need from the SDKs you need
import { initializeApp } from "/firebase/app";
import { updateMetadata, getStorage, ref, uploadBytesResumable, getDownloadURL, getMetadata } from "/firebase/storage"; 
//import { MRef } from "../build/main.js"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyA2A-YUSaMVf-ghxTb1yG0kHTobUq5GWOU",
    authDomain: "cm360scanner.firebaseapp.com",
    projectId: "cm360scanner",
    storageBucket: "cm360scanner.appspot.com",
    messagingSenderId: "216095057966",
    appId: "1:216095057966:web:2b59b04f5ce2dd52e5d7bf",
    measurementId: "G-4856E7YZ0M"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
export const storageRef = ref(storage, 'some-child');

//Get metadata properties
getMetadata(storageRef).then((metadata) => {
  console.log("Official Metadata: ", metadata);
}).catch((error) => {
  console.log("No Metadata or incorrect found");
});

newMetadata = {
  cacheControl: "public,max-age=300",
  contentType: "text/javascript"
}

updateMetadata(storageRef, newMetadata).then((metadata) => {
  console.log("Updated Metadata as .mind file: ", metadata);
}).catch((error) => {
  console.log("Error: ", error);
})

// 'file' comes from the Blob or File API
uploadBytesResumable(storageRef, file, metadata).then((uploadTaskSnapshot) => {
    console.log("Uploaded a blob or file as .mind file!: ", uploadTaskSnapshot);
}).catch((error) => {
  console.log("Unsuccessful .mind file transfer to Storage: ", error);
});

const uploadTask = uploadBytesResumable(storageRef, file, metadata);

// Register three observers:
// 1. 'state_changed' observer, called any time the state changes
// 2. Error observer, called on failure
// 3. Completion observer, called on successful completion
uploadTask.on('state_changed', 
  (snapshot) => {
    // Observe state change events such as progress, pause, and resume
    // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
    console.log('Upload is ' + progress + '% done');
    switch (snapshot.state) {
      case 'paused':
        console.log('Upload is paused');
        break;
      case 'running':
        console.log('Upload is running');
        break;
    }
  }, 
  (error) => {
    // Handle unsuccessful uploads
    console.log("Unsuccessful .mind file transfer to Storage");
  }, 
  () => {
    // Handle successful uploads on complete
    // For instance, get the download URL: https://firebasestorage.googleapis.com/...
    getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
      console.log('File available at', downloadURL);
    });
  }
);