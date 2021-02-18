// const video = document.getElementById('video');
const button = document.getElementById('button');
const select = document.getElementById('cameraRotation');
let currentStream;

function stopMediaTracks(stream) {
    stream.getTracks().forEach(track => {
        track.stop();
    });
}

function gotDevices(mediaDevices) {
    select.innerHTML = '';
    let html = "";
    mediaDevices.forEach(mediaDevice => {
        if (mediaDevice.kind === 'videoinput') {
            html += mediaDevice.deviceId + " - " + mediaDevice.label + "<br />";
        }
    });
    select.innerHTML = html;
}

// button.addEventListener('click', event => {
//     if (typeof currentStream !== 'undefined') {
//         stopMediaTracks(currentStream);
//     }
//     const videoConstraints = {};
//     if (select.value === '') {
//         videoConstraints.facingMode = 'environment';
//     } else {
//         videoConstraints.deviceId = { exact: select.value };
//     }
//     const constraints = {
//         video: videoConstraints,
//         audio: false
//     };
//     navigator.mediaDevices
//         .getUserMedia(constraints)
//         .then(stream => {
//             currentStream = stream;
//             video.srcObject = stream;
//             return navigator.mediaDevices.enumerateDevices();
//         })
//         .then(gotDevices)
//         .catch(error => {
//             console.error(error);
//         });
// });

navigator.mediaDevices.getUserMedia({ video: true }).then(() => {
    navigator.mediaDevices.enumerateDevices().then(gotDevices);
})