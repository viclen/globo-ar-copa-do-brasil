let facingMode = { exact: "environment" };

const constraints = { audio: false };
// Define constants
let cameraView, cameraOutput, cameraCanvas, cameraTrigger, cameraChange, shareButton, downloadButton, objectsRotation;
let canvas;
let scene;
let renderer;
let arController;
let skyCanvas;
let imagesEntity;
let skyInterval;
// Access the device camera and stream to cameraView
function cameraStart() {
    window.facingMode = facingMode;

    cameraView = document.querySelector("#arjs-video");
    cameraOutput = document.querySelector("#camera--output");
    scene = document.querySelector("#arScene");
    renderer = scene.renderer;
    canvas = document.querySelector(".a-canvas");
    cameraCanvas = document.querySelector("#camera--sensor");
    cameraTrigger = document.querySelector("#camera--trigger");
    cameraChange = document.querySelector("#camera--change");
    shareButton = document.querySelector("#share--button");
    downloadButton = document.querySelector("#download--button");
    objectsRotation = document.getElementById("world-rotation");

    skyCanvas = document.querySelector("#sky--canvas");
    imagesEntity = document.querySelector("#images");

    const callback = (stream) => {
        track = stream.getTracks()[0];
        cameraView.srcObject = stream;
    };

    cameraChange.onclick = () => changeCamera();
    shareButton.onclick = () => shareImg();
    downloadButton.onclick = () => downloadImg();
    cameraOutput.onclick = () => showImageFullscreen();

    if (facingMode == "user") {
        if (cameraView) cameraView.classList.add("reverse");
        document.querySelector("#camera-rig").setAttribute("rotation", "0 180 0");
        document.querySelector("[scene-objects]").setAttribute("position", "0 -4 10");
        document.querySelector("#objects").setAttribute("rotation", "0 0 0");
        document.querySelector("#model").setAttribute("rotation", "0 180 0");

        let scale = document.querySelector("#model").getAttribute("scale");
        scale.x = scale.x > 0 ? -scale.x : scale.x;
        document.querySelector("#model").setAttribute("scale", scale);

        const rot = objectsRotation.getAttribute("rotation");
        rot.x = 0;
        rot.z = 0;
        objectsRotation.setAttribute("rotation", rot);

        cameraTrigger.setAttribute("data-camera", "frontal");
        canvas.classList.add("reverse");

        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            (async () => {
                try {
                    const stream = await navigator.mediaDevices
                        .getUserMedia({ ...constraints, video: { facingMode } });
                    callback(stream);
                } catch (error) {
                    cameraTrigger.classList.add("hidden");
                    facingMode = { exact: "environment" };
                    cameraStart();
                }
            })();
        } else {
            try {
                if (!navigator.getUserMedia) {
                    navigator.getUserMedia = navigator.webkitGetUserMedia;
                }

                navigator
                    .getUserMedia({ ...constraints, video: { facingMode } }, callback, function (error) {
                        // alert("Não foi possível executar por falta de permissões.");
                        cameraTrigger.classList.add("hidden");
                        facingMode = { exact: "environment" };
                        cameraStart();
                    });
            } catch (error) {
                cameraTrigger.classList.add("hidden");
                facingMode = { exact: "environment" };
                cameraStart();
            }
        }
    } else {
        if (cameraView) cameraView.classList.remove("reverse");
        document.querySelector("#camera-rig").setAttribute("rotation", "0 0 0");
        document.querySelector("[scene-objects]").setAttribute("position", "0 -4 -10");
        document.querySelector("#objects").setAttribute("rotation", "0 0 0");
        document.querySelector("#model").setAttribute("rotation", "0 0 0");

        let scale = document.querySelector("#model").getAttribute("scale");
        scale.x = scale.x < 0 ? -scale.x : scale.x;
        document.querySelector("#model").setAttribute("scale", scale);

        const rot = objectsRotation.getAttribute("rotation");
        rot.x = 0;
        rot.z = 0;
        objectsRotation.setAttribute("rotation", rot);

        cameraTrigger.setAttribute("data-camera", "traseira");
        canvas.classList.remove("reverse");

        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices
                .getUserMedia({ ...constraints, video: { facingMode } }).then(callback).catch(function (error) {
                    // alert("Não foi possível executar por falta de permissões.");
                    window.tryReload();
                });
        } else {
            if (!navigator.getUserMedia) {
                navigator.getUserMedia = navigator.webkitGetUserMedia;
            }

            navigator
                .getUserMedia({ ...constraints, video: { facingMode } }, callback, function (error) {
                    // alert("Não foi possível executar por falta de permissões.");
                    window.tryReload();
                });
        }
    }

    // Take a picture when cameraTrigger is tapped
    cameraTrigger.onclick = function () {
        const tutorial = document.querySelector(".tutorial");
        if (tutorial && tutorial.classList.contains("start")) return;

        cameraCanvas.width = cameraView.videoWidth * 2;
        cameraCanvas.height = cameraView.videoHeight * 2;

        cameraCanvas.getContext('2d').clearRect(0, 0, cameraCanvas.width, cameraCanvas.height);

        let oldZIndex = cameraView.style.zIndex;
        cameraView.style.zIndex = -1;
        cameraCanvas.getContext("2d").drawImage(cameraView, 0, 0, cameraCanvas.width, cameraCanvas.height);
        cameraView.style.zIndex = oldZIndex;

        renderer.render(scene.object3D, scene.camera);
        let img = new Image();
        img.style.width = canvas.width;
        img.style.height = canvas.height;
        img.src = renderer.domElement.toDataURL();
        img.style.objectFit = "contain";
        img.style.zIndex = 1000;
        // img.style.transform = "scaleX(-1)";
        // img.style.filter = "FlipH";

        img.onload = () => {
            let { width, height } = cover({ width: canvas.width, height: canvas.height }, { width: cameraCanvas.width, height: cameraCanvas.height });

            cameraCanvas.getContext("2d").drawImage(img, -(width - cameraCanvas.width) / 2, 0, width, height);

            let saveCanvas = document.createElement("canvas");
            saveCanvas.width = cameraCanvas.width;
            saveCanvas.height = cameraCanvas.height;

            let context = saveCanvas.getContext('2d');
            context.clearRect(0, 0, saveCanvas.width, saveCanvas.height);

            if (facingMode == "user") {
                context.save();
                context.scale(-1, 1);
                context.drawImage(cameraCanvas, 0, 0, saveCanvas.width * -1, saveCanvas.height);
                context.restore();
            } else {
                context.drawImage(cameraCanvas, 0, 0, saveCanvas.width, saveCanvas.height);
            }

            cameraOutput.style.display = "block";

            setTimeout(() => {
                cameraOutput.src = saveCanvas.toDataURL();
                cameraOutput.classList.add("taken");

                if (!isIos()) {
                    shareButton.classList.remove("hidden");
                }
                downloadButton.classList.remove("hidden");
            }, 100);
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
            .catch((error) => {

            });
    }
}

function downloadImg() {
    const a = document.createElement("a");
    a.href = cameraOutput.src;
    a.target = '_blank';
    a.download = "foto";
    a.click();
}

function changeCamera() {
    if (facingMode == "user") {
        facingMode = { exact: "environment" };
    } else {
        facingMode = "user";
    }

    cameraStart();
}

function isIos() {
    return [
        'iPad Simulator',
        'iPhone Simulator',
        'iPod Simulator',
        'iPad',
        'iPhone',
        'iPod'
    ].includes(navigator.platform)
        // iPad on iOS 13 detection
        || (navigator.userAgent.includes("Mac") && "ontouchend" in document)
}

function showImageFullscreen() {
    if (cameraOutput.classList.contains("show-fullscreen")) {
        cameraOutput.classList.remove("show-fullscreen");
    } else {
        cameraOutput.classList.add("show-fullscreen");
    }
}