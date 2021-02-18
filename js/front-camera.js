const constraints = { video: { facingMode: "user" }, audio: false };
// Define constants
let cameraView, cameraOutput, cameraCanvas, cameraTrigger;
let canvas;
// Access the device camera and stream to cameraView
function cameraStart() {
    cameraView = document.querySelector("video");
    cameraOutput = document.querySelector("#camera--output");
    canvas = document.querySelector("canvas");
    cameraCanvas = document.querySelector("#camera--sensor");
    cameraTrigger = document.querySelector("#camera--trigger");

    navigator.mediaDevices
        .getUserMedia(constraints)
        .then(function (stream) {
            track = stream.getTracks()[0];
            cameraView.srcObject = stream;
        })
        .catch(function (error) {
            console.error("Oops. Something is broken.", error);
        });

    cameraOutput.onclick = () => shareImg();

    // Take a picture when cameraTrigger is tapped
    cameraTrigger.onclick = function () {
        cameraCanvas.width = cameraView.videoWidth;
        cameraCanvas.height = cameraView.videoHeight;

        cameraCanvas.getContext('2d').clearRect(0, 0, cameraCanvas.width, cameraCanvas.height);
        cameraCanvas.getContext("2d").drawImage(cameraView, 0, 0);
        cameraCanvas.getContext("2d").drawImage(canvas, 0, 0);
        cameraOutput.src = cameraCanvas.toDataURL("image/jpeg");
        cameraOutput.classList.add("taken");
    };
}

function shareImg() {
    let dataUrl = cameraOutput.src.split(',');
    let base64 = dataUrl[1];
    let mime = dataUrl[0].match(/:(.*?);/)[1];
    let bin = atob(base64);
    let length = bin.length;
    // From http://stackoverflow.com/questions/14967647/ (continues on next line)
    // encode-decode-image-with-base64-breaks-image (2013-04-21)
    let buf = new ArrayBuffer(length);
    let arr = new Uint8Array(buf);
    bin.split('').forEach((e, i) => arr[i] = e.charCodeAt(0));

    const file = new File([buf], 'foto.jpg', { type: mime });
    const filesArray = [file];

    if (navigator.canShare && navigator.canShare({ files: filesArray })) {
        navigator.share({
            files: filesArray,
            title: 'Foto',
            text: 'Campeão da copa do Brasil!',
        })
            .then(() => alert('Share was successful.'))
            .catch((error) => alert('Sharing failed', error));
    } else {
        alert(`Your system doesn't support sharing files.`);
    }
}