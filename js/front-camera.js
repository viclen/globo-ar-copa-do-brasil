let facingMode = "user";

window.facingMode = facingMode;

const constraints = { audio: false };
// Define constants
let cameraView, cameraOutput, cameraCanvas, cameraTrigger, cameraChange;
let canvas;
let scene;
let renderer;
let arController;
// Access the device camera and stream to cameraView
function cameraStart() {
    cameraView = document.querySelector("video");
    cameraOutput = document.querySelector("#camera--output");
    scene = document.querySelector("#arScene");
    renderer = scene.renderer;
    canvas = document.querySelector(".a-canvas");
    cameraCanvas = document.querySelector("#camera--sensor");
    cameraTrigger = document.querySelector("#camera--trigger");
    cameraChange = document.querySelector("#camera--change");

    cameraChange.onclick = changeCamera();

    navigator.mediaDevices
        .getUserMedia({ ...constraints, video: { facingMode } })
        .then(function (stream) {
            track = stream.getTracks()[0];
            cameraView.srcObject = stream;
        })
        .catch(function (error) {
            alert("Oops. Something is broken." + JSON.stringify(error));
        });

    cameraOutput.onclick = () => shareImg();

    // Take a picture when cameraTrigger is tapped
    cameraTrigger.onclick = function () {
        cameraCanvas.width = cameraView.videoWidth;
        cameraCanvas.height = cameraView.videoHeight;

        cameraCanvas.getContext('2d').clearRect(0, 0, cameraCanvas.width, cameraCanvas.height);

        let oldZIndex = cameraView.style.zIndex;
        cameraView.style.zIndex = -1;
        cameraCanvas.getContext("2d").drawImage(cameraView, 0, 0, cameraCanvas.width, cameraCanvas.height);
        cameraView.style.zIndex = oldZIndex;

        renderer.render(scene.object3D, scene.camera);
        let img = new Image();
        img.src = renderer.domElement.toDataURL();
        img.style.objectFit = "contain";
        img.style.width = canvas.width;
        img.style.height = canvas.height;
        img.style.zIndex = 1000;
        img.onload = () => {
            let { width, height } = cover({ width: canvas.width, height: canvas.height }, { width: cameraCanvas.width, height: cameraCanvas.height });

            cameraCanvas.getContext("2d").drawImage(img, -(width - cameraCanvas.width) / 2, 0, width, height);
            cameraOutput.src = cameraCanvas.toDataURL("image/jpg");
            cameraOutput.classList.add("taken");
        };
    };
}

function cover({ width: imageWidth, height: imageHeight }, { width: areaWidth, height: areaHeight }) {
    var originalRatios = {
        width: areaWidth / imageWidth,
        height: areaHeight / imageHeight
    };

    // formula for cover:
    var coverRatio = Math.max(originalRatios.width, originalRatios.height);

    // result:
    var newImageWidth = imageWidth * coverRatio;
    var newImageHeight = imageHeight * coverRatio;

    // longest edge is vertical
    return { width: newImageWidth, height: newImageHeight };
}

function contain({ width: imageWidth, height: imageHeight }, { width: areaWidth, height: areaHeight }) {
    const imageRatio = imageWidth / imageHeight;
    const areaRatio = areaWidth / areaHeight;

    if (imageRatio >= areaRatio) {
        // longest edge is horizontal
        return { width: areaWidth, height: areaWidth / imageRatio };
    } else {
        // longest edge is vertical
        return { width: areaHeight * imageRatio, height: areaHeight };
    }
}

function shareImg() {
    let dataUrl = cameraOutput.src.split(',');
    let base64 = dataUrl[1];
    let mime = dataUrl[0].match(/:(.*?);/)[1];
    let bin = atob(base64);
    let length = bin.length;
    let buf = new ArrayBuffer(length);
    let arr = new Uint8Array(buf);
    bin.split('').forEach((e, i) => arr[i] = e.charCodeAt(0));

    const file = new File([buf], 'foto.jpg', { type: mime });
    const filesArray = [file];

    if (navigator.share && navigator.canShare && navigator.canShare({ files: filesArray })) {
        navigator.share({
            files: filesArray,
        })
            .then(() => alert('Share was successful.'))
            .catch((error) => alert('Sharing failed' + JSON.stringify(error)));
    } else {
        const a = document.createElement("a");
        a.href = cameraOutput.src;
        a.target = '_blank';
        a.download = "foto.jpg";
        a.click();
    }
}

function changeCamera() {
    if (facingMode == "user") {
        facingMode = { exact: "environment" };

        document.querySelector("#camera-rig").setAttribute("rotation", "0 0 0");
        document.querySelector("[scene-objects]").setAttribute("position", "0 0 -10");
    } else {
        facingMode = "user";

        document.querySelector("#camera-rig").setAttribute("rotation", "0 180 0");
        document.querySelector("[scene-objects]").setAttribute("position", "0 0 10");
    }

    window.facingMode = facingMode;

    cameraStart();
}