// import { storage, storageRef } from "../src/firebaseConfig.js"; 
// import { ref } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-storage.js";
import { loadGLTF } from "../../libs/loader.js";
const THREE = window.MINDAR.IMAGE.THREE;

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { updateMetadata, uploadBytes,getStorage, ref, uploadBytesResumable, getDownloadURL, getMetadata } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-storage.js";
// import { initializeAppCheck, ReCaptchaV3Provider } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app-check.js";
// import { RefSrc } from "../build/main.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyA2A-YUSaMVf-ghxTb1yG0kHTobUq5GWOU",
    authDomain: "cm360scanner.firebaseapp.com",
    projectId: "cm360scanner",
    storageBucket: "gs://cm360scanner.appspot.com",
    messagingSenderId: "216095057966",
    appId: "1:216095057966:web:2b59b04f5ce2dd52e5d7bf",
    measurementId: "G-4856E7YZ0M"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage();
const storageRef = ref(storage);

// export const RefSrc = null;

/* Enter DOM */
document.addEventListener("DOMContentLoaded", () => {
  /* Check if THREE.js is being imported */
  console.log("THREE IN THE CONSOLE: ", THREE);

  /* Mind-AR variables */
  let mindarThree = null;
  let renderer = null;
  let selectedValue = "";
  let count = 0;

  /* HTML element variables */
  const flexboxOne = document.querySelector(".flexbox-container-one");
  const flexboxTwo = document.querySelector(".flexbox-container-two");
  const background = document.getElementById("B_G");
  //const introButton = document.getElementById("intro_circle");
  const circle = document.querySelector(".circle");

  const introText = document.querySelector(".intro-text");
  
  const fileInput = document.getElementById('fileInput');
  const imageButton = document.getElementById("image-button");
  const assetInput = document.getElementById('assetInput');
  const assetButton = document.getElementById("asset-button");

  const captureButton = document.querySelector(".capture");
  const backButton = document.getElementById("backButton");

  const preview = document.querySelector("#preview");
  const previewClose = document.querySelector("#preview-close");
  const previewImage = document.querySelector("#preview-image");
  const previewShare = document.querySelector("#preview-share"); 

  let animationRunning = false;

  const imageTargetModelCreated = {};

  const Intro = async () => {
    circle.addEventListener('click', () => {
      introText.style.display = "none";
      if (!animationRunning) {
        circle.classList.add('pulse-out');
        animationRunning = true;

        setTimeout(() => {
          circle.classList.remove('pulse-out');
          animationRunning = false;
        }, 500);
      }
      const imageTargetButtons = document.querySelectorAll(".button");
      imageTargetButtons.forEach(button => {
        button.style.display = 'block';
        button.classList.toggle("pulse");
      });
    });
   
    // IMAGE BUTTON TO COMPILE .MIND FILE UPLOADED BY USER
    imageButton.addEventListener("click", function () {
      fileInput.click();
    });

    fileInput.addEventListener('change', () => {
      if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const fileName = file.name.toLowerCase();
        const dotIndex = fileName.lastIndexOf('.');
        const nameWithoutExtension = fileName.substring(0, dotIndex);
        console.log("file: ", file);

        if (file) {
          const img = document.createElement('img');
          img.src = URL.createObjectURL(file);
          console.log('img: ', img);
          console.log('img.src: ', img.src);
          
          const imagesRef = ref(storage,"images");
          const RefSrc = ref(storage,`images/${img.src}`);


          uploadBytes(RefSrc, file).then((snapshot) => {
            console.log("uploaded something");
          });


          console.log(imagesRef);
          console.log(RefSrc);
          if (img) { 
            compile_Mind(img, nameWithoutExtension).then((mindFile) => {
              console.log("Official .mind file: ", mindFile);
              selectedValue = mindFile;
              //storageRef(storage, `mind/${mindFile.name}`);
              console.log(".mind file set to selectedValue: ", selectedValue);
              count += 1;
              console.log("count is now: ", count);
            });
          }
        }
      }
    });

    
    // 3D ASSET BUTTON + INTERACTIONS
    assetButton.addEventListener("click", function () {
      assetInput.click();
    });

    assetInput.addEventListener('change', () => {
      if (assetInput.files.length > 0) {
        const asset = assetInput.files[0];
        if (asset) {
          console.log("THE ASSET UPLOADED: ", asset);
          
          const assetName = asset.name.toLowerCase();
          console.log("asset name: ", assetName);
          
          const validExtensions = ['.glb', '.gltf'];

          if (validExtensions.some(ext => assetName.endsWith(ext))) {
            console.log("VALID EXTENSION - PROCEED");
            const reader = new FileReader();

            reader.onload = () => {
              const fileContent = reader.result;
              console.log('Contents of file: ', fileContent);
              imageTargetModelCreated[selectedValue] = asset;
              const assetString = fileContent.toString();

              console.log('Contents of file to string: ', assetString);
              console.log('Mapping', imageTargetModelCreated);
              console.log(".mind file in mapping: ", imageTargetModelCreated[selectedValue]);
              console.log("Keys: ", Object.keys(imageTargetModelCreated));

              count += 1;
              console.log("count is now: ", count);

              if (Object.keys(imageTargetModelCreated).length >= 1) {
                console.log("You may start!");
                flexboxOne.style.display = "none";
                background.style.display = "none";
                start();
              }
            }
            reader.readAsArrayBuffer(asset);
          } else {
            console.log("Failed to load 3D asset due to invalid file extension.");
          }
        }
      }
    });
    console.log('Mapping', imageTargetModelCreated);
  }

  console.log('Mapping outside of Intro: ', imageTargetModelCreated);
  
  const compile_Mind = async (images, imgName) => {
    const compiler = new window.MINDAR.Compiler();
    const dataList = await compiler.compileImageTargets(images);
    console.log("dataList: ", dataList);
    if (dataList) {
      const exportedBuffer = await compiler.exportData(); // export the compiled data into buffer for download (e.g. the .mind file)
      console.log(".mind file after exportedBuffer within compile_Mind?: ", exportedBuffer);

      const blob = new Blob([exportedBuffer], {type: 'application/octet-stream'} )
      
      const mindFile = new File([blob], imgName + '.mind', { type: 'application/mind' });
      console.log(".mind within compile_Mind: ", mindFile);
      
      const mindName = mindFile.name;
      console.log('mind file name: ', mindName);
      return mindFile;
    }
    return null;
  }

  Intro();

  /* Capture image and save from URL */
  const capture = (mindarThree) => {
    const {video, renderer, scene, camera} = mindarThree;
    const renderCanvas = renderer.domElement;
  
    console.log(camera);

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    canvas.width = renderCanvas.width;
    canvas.height = renderCanvas.height;
 
    const sx = (video.clientWidth - renderCanvas.clientWidth) / 2 * video.videoWidth / video.clientWidth;
    const sy = (video.clientHeight - renderCanvas.clientHeight) / 2 * video.videoHeight / video.clientHeight;
    const sw = video.videoWidth - sx * 2;
    const sh = video.videoHeight - sy * 2;
    
    context.drawImage(video, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
  
    renderer.preserveDrawingBuffer = true;
    renderer.render(scene, camera);
    context.drawImage(renderCanvas, 0, 0, canvas.width, canvas.height);
    renderer.preserveDrawingBuffer = false;

    const data = canvas.toDataURL("image/png");
    return data;
  }

  /* Default start of Mind-AR Scanner after target image button has been selected */
  const start = async () => {

    if (renderer) {
      renderer.setAnimationLoop(null);
      renderer.domElement.remove();
    }
  
    mindarThree = new window.MINDAR.IMAGE.MindARThree({
      container: document.body,
      imageTargetSrc: `${selectedValue}`,
      uiScanning: "#scanning",
    });

    flexboxTwo.style.display = 'block';
    captureButton.style.display = 'block';
    backButton.style.display = 'block';

    console.log(".mind within start?: ", selectedValue);
    
    const { scene, camera } = mindarThree;

    console.log("camera: ?", camera);

    renderer = mindarThree.renderer;

    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
    scene.add(light);

    const LoadedModel = await loadModel(selectedValue);

    backButton.addEventListener("click", () => {
      backIntro();
    });

    captureButton.addEventListener("click", () => {
      const data = capture(mindarThree);
      preview.style.visibility = "visible";
      previewImage.src = data;
    });

    previewClose.addEventListener("click", () => {
      preview.style.visibility = "hidden";
    });

    previewShare.addEventListener("click", () => {
      const canvas = document.createElement('canvas');
      canvas.width = previewImage.width;
      canvas.height = previewImage.height;
      const context = canvas.getContext('2d');
      context.drawImage(previewImage, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        const file = new File([blob], "photo.png", { type: "image/png" });
        const files = [file];
        if (navigator.canShare && navigator.canShare({files})) {
          navigator.share({
            files: files,
            title: 'AR Photo',
          })
        } else {
          const link = document.createElement('a');
          link.download = 'photo.png';
          link.href = previewImage.src;
          link.click();
        }
      });
    });
    
    const clock = new THREE.Clock();

    await mindarThree.start();
    renderer.setAnimationLoop(() => {
      const delta = clock.getDelta();
      LoadedModel.scene.rotation.set(0, LoadedModel.scene.rotation.y + delta, 0);
      renderer.render(scene, camera);
    });
  };
 
  const loadModel = async (selectedValue) => {
    const modelURL = imageTargetModelCreated[selectedValue].name;
    console.log("Loading model ...", modelURL);
    const of_model = await loadGLTF(modelURL);
    
    // Check for .glb model for proper rescaling
    const model_string = `${imageTargetModelCreated[selectedValue]}`;
    console.log(".glb file? :", model_string);
    
    of_model.scene.scale.set(1, 1, 1); //works by centimeter
    of_model.scene.position.set(0, -0.4, 0);

    const modelAnchor = mindarThree.addAnchor(0);
    modelAnchor.group.add(of_model.scene);

    return of_model;
  };
});
