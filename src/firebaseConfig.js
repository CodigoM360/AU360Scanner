// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { updateMetadata, getStorage, ref, uploadBytesResumable, getDownloadURL, getMetadata } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-storage.js";
import { initializeAppCheck, ReCaptchaV3Provider } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app-check.js";
import { RefSrc } from "../build/main.js";
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
//const isTokenAutoRefreshEnabled = false

// Pass your reCAPTCHA v3 site key (public key) to activate(). Make sure this
// key is the counterpart to the secret key you set in the Firebase console.
const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider('6LeCndsmAAAAABnXR99-VnLctrkJP82xPR1aJiOl'),

  // Optional argument. If true, the SDK automatically refreshes App Check
  // tokens as needed.
  isTokenAutoRefreshEnabled: true
});


//Get metadata properties
getMetadata(RefSrc).then((metadata) => {
  console.log("Official Metadata: ", metadata);
}).catch((error) => {
  console.log("No Metadata or incorrect found");
});

const newMetadata = {
  cacheControl: "public,max-age=300",
  contentType: RefSrc.type
}

updateMetadata(RefSrc, newMetadata).then((metadata) => {
  console.log("Updated new Metadata: ", metadata);
}).catch((error) => {
  console.log("Error: ", error);
});

const bytes = new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f, 0x2c, 0x20, 0x77, 0x6f, 0x72, 0x6c, 0x64, 0x21]);
uploadBytes(RefSrc, bytes).then((snapshot) => {
  console.log('Uploaded an array!');
});

// Raw string is the default if no format is provided
const message = 'This is my message.';
uploadString(RefSrc, message).then((snapshot) => {
  console.log('Uploaded a raw string!');
});

// Base64 formatted string
const message2 = '5b6p5Y+344GX44G+44GX44Gf77yB44GK44KB44Gn44Go44GG77yB';
uploadString(RefSrc, message2, 'base64').then((snapshot) => {
  console.log('Uploaded a base64 string!');
});

// Base64url formatted string
const message3 = '5b6p5Y-344GX44G-44GX44Gf77yB44GK44KB44Gn44Go44GG77yB';
uploadString(RefSrc, message3, 'base64url').then((snapshot) => {
  console.log('Uploaded a base64url string!');
});

// Data URL string
const message4 = 'data:text/plain;base64,5b6p5Y+344GX44G+44GX44Gf77yB44GK44KB44Gn44Go44GG77yB';
uploadString(RefSrc, message4, 'data_url').then((snapshot) => {
  console.log('Uploaded a data_url string!');
});

// 'file' comes from the Blob or File API
uploadBytesResumable(RefSrc, file, metadata).then((uploadTaskSnapshot) => {
    console.log("Uploaded a blob or file as .mind file!: ", uploadTaskSnapshot);
    console.log("File: ", file);
}).catch((error) => {
  console.log("Unsuccessful .mind file transfer to Storage: ", error);
});

const uploadTask = uploadBytesResumable(RefSrc, file, metadata);

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