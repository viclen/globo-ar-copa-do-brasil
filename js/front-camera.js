const constraints = { video: { facingMode: "user" }, audio: false };
// Define constants
const cameraView = document.querySelector("video"),
    cameraOutput = document.querySelector("#camera--output"),
    cameraSensor = document.querySelector("#camera--sensor"),
    cameraTrigger = document.querySelector("#camera--trigger")
// Access the device camera and stream to cameraView
function cameraStart() {
    navigator.mediaDevices
        .getUserMedia(constraints)
        .then(function (stream) {
            track = stream.getTracks()[0];
            cameraView.srcObject = stream;
        })
        .catch(function (error) {
            console.error("Oops. Something is broken.", error);
        });
}
// Take a picture when cameraTrigger is tapped
cameraTrigger.onclick = function () {
    cameraSensor.width = cameraView.videoWidth;
    cameraSensor.height = cameraView.videoHeight;
    cameraSensor.getContext("2d").drawImage(cameraView, 0, 0);
    cameraOutput.src = cameraSensor.toDataURL("image/webp");
    cameraOutput.classList.add("taken");

    new File();

    setTimeout(() => {
        cameraSensor.toBlob((blob) => {
            const file = new File([blob], 'foto.jpg');
            const filesArray = [file];
            filesArray.forEach(Object.freeze);

            if (navigator.canShare && navigator.canShare({ files: filesArray })) {
                navigator.share({
                    files: filesArray,
                    title: 'Foto',
                    text: 'Campeão da copa do Brasil!',
                })
                    .then(() => console.log('Share was successful.'))
                    .catch((error) => console.log('Sharing failed', error));
            } else {
                console.log(`Your system doesn't support sharing files.`);
            }
        }, "image/jpeg", 1);
    }, 1000);
};
