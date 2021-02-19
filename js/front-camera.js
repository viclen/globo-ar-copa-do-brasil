const constraints = { video: { facingMode: "user" }, audio: false };
// Define constants
let cameraView, cameraOutput, cameraCanvas, cameraTrigger;
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

    navigator.mediaDevices
        .getUserMedia(constraints)
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
        cameraCanvas.width = canvas.videoWidth;
        cameraCanvas.height = canvas.videoHeight;
        cameraCanvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
        renderer.render(scene.object3D, scene.camera);

        cameraCanvas.getContext("2d").drawImage(cameraView, 0, 0);
        cameraCanvas.getContext("2d").drawImage(renderer.domElement, 0, 0);

        cameraOutput.src = cameraCanvas.toDataURL("image/jpg");
        cameraOutput.classList.add("taken");
    };
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

    if (navigator.share) { // || navigator.canShare && navigator.canShare({ files: filesArray })) {
        navigator.share({
            files: filesArray,
        })
            .then(() => alert('Share was successful.'))
            .catch((error) => alert('Sharing failed', error));
    } else {
        alert(`Your system doesn't support sharing files.`);
    }
}