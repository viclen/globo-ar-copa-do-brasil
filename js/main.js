window.mobileCheck = function () {
    let check = false;
    (function (a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true; })(navigator.userAgent || navigator.vendor || window.opera);
    return check;
};

Number.prototype.withTolerance = function (tolerance = 0) {
    if (this > 0) {
        if (this - tolerance > 0) {
            return this - tolerance
        }
    } else if (this < 0) {
        if (this + tolerance < 0) {
            return this + tolerance
        }
    }
    return 0;
};

const moveSensitivity = {
    y: 0.02,
    x: 0.02
};
let sceneObjects, worldRotation;
let cameraRig;
let isOpening = false;
let moveObjects;
let movingObjects = false;
let sceneObjectsMove;
const motionThreshold = 5;
let acceleration = { x: 0, y: 0, z: 0, time: new Date().getTime() };
let velocity = { x: 0, y: 0, z: 0 };
let motions = {
    x: [],
    y: [],
    z: [],
    time: new Date().getTime()
};
let currentCameraRotation;
let canAdd = true;

let lastFrame = 0;

function getLocation(cb = () => { }) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(cb);
    } else {
        // alert("Geolocation is not supported by this browser.");
        window.tryReload();
    }
}

function showPosition(position) {
    const objects = document.getElementById("objects");
    sceneObjects = objects;

    objects.setAttribute("gps-entity-place", "latitude: " + position.coords.latitude + "; longitude: " + position.coords.longitude);
    objects.setAttribute("visible", true);

    worldRotation = document.getElementById("world-rotation");

    if (worldRotation) {
        const objectsRotation = worldRotation.getAttribute("rotation");
        objectsRotation.y = -currentCameraRotation.y;
        worldRotation.setAttribute("rotation", objectsRotation);
    }
}

function openurl(url) {
    if (!isOpening) {
        window.open(url);
        console.log(url);
        isOpening = true;
        setTimeout(() => isOpening = false, 200);
    }
}

function showScreen(name) {
    const screen = document.getElementById('screen' + name);
    screen.setAttribute('visible', 'true');
}

AFRAME.registerComponent('ar-scene', {
    init: function () {
        const clickToStart = document.getElementById('clickToStart');

        clickToStart.addEventListener('click', () => {
            const callback = () => {
                document.getElementById("carregando").style.display = "";

                moveObjects = document.getElementById("moveObjects");

                moveObjects.addEventListener("touchstart", (event) => {
                    if (event.touches.length && sceneObjectsMove) {
                        const position = sceneObjectsMove.getAttribute("position");
                        movingObjects = {
                            startX: event.touches[0].clientX,
                            startY: event.touches[0].clientY,
                            startPositionX: position.x,
                            startPositionY: position.y,
                        };
                    }
                });
                moveObjects.addEventListener("touchend", () => {
                    movingObjects = false;
                });
                moveObjects.addEventListener("touchmove", (event) => handleMoveObjects(event));

                sceneObjectsMove = document.querySelector("[scene-objects]");

                document.getElementById("rotate-left").onclick = () => rotateLeft();
                document.getElementById("rotate-right").onclick = () => rotateRight();
                document.getElementById("zoom-in").onclick = () => zoomIn();
                document.getElementById("zoom-out").onclick = () => zoomOut();
                document.getElementById("enable-particles").onclick = () => enableParticles();
            }

            if (window.startTutorial) {
                enableParticles();
                getLocation((position) => {
                    showPosition(position);
                    cameraStart();
                    window.startTutorial(callback);
                });
            } else {
                enableParticles();
                getLocation((position) => {
                    showPosition(position);
                    cameraStart();
                    callback();
                });
            }

            clickToStart.remove();
        });
    }
});

AFRAME.registerComponent("particles-start", {
    init: function () {
        setTimeout(() => {
            this.el.components['particle-system'].startParticles();
        }, 2000);
    }
});

AFRAME.registerComponent('model3dtaca', {
    init: function () {
        this.el.addEventListener('model-loaded', e => {
            onLoadModels();
        });
    }
});

AFRAME.registerComponent('model3dfitas', {
    init: function () {
        this.el.addEventListener('model-loaded', e => {
            onLoadModels();
        });
    }
});

let modelsLoaded = 0;
function onLoadModels() {
    modelsLoaded++;
    if (modelsLoaded >= 2) {
        document.getElementById("carregando").innerHTML = "";
        document.getElementById("carregando").parentElement.style.background = "";
        document.getElementById("model").querySelector("[model3dtaca]").setAttribute("visible", true);
        document.getElementById("model").querySelector("[model3dfitas]").setAttribute("visible", true);
    }
}

function onMoveDevice(event) {
    let acl = event.acceleration;

    if (acl.x !== null && motions.x.length < 5) {
        const now = new Date().getTime();
        const deltaTime = (now - motions.time) / 1000;

        motions.x.push(acl.x * 0.5 * deltaTime ** 2);
        motions.y.push(acl.y * 0.5 * deltaTime ** 2);
        motions.z.push(acl.z * 0.5 * deltaTime ** 2);
        motions.time = now;
    }
}

function movementThreshold(acl) {
    if (acl && acl.x && acl.y && acl.z) {
        if (motions.x.length >= motionThreshold) {
            motions.x.shift();
        }
        motions.x.push(acl.x.withTolerance(0.2));
        if (motions.y.length >= motionThreshold) {
            motions.y.shift();
        }
        motions.y.push(acl.y.withTolerance(0.2));
        if (motions.z.length >= motionThreshold) {
            motions.z.shift();
        }
        motions.z.push(acl.z.withTolerance(0.2));
        acceleration = {
            x: Math.round(motions.x.reduce((a, v, i) => (a * i + v) / (i + 1)) * 10) / 10,
            y: Math.round(motions.y.reduce((a, v, i) => (a * i + v) / (i + 1)) * 10) / 10,
            z: Math.round(motions.z.reduce((a, v, i) => (a * i + v) / (i + 1)) * 10) / 10,
            time: new Date().getTime()
        }
    }
}

AFRAME.registerComponent('camera-data', {
    init: function () {
        cameraRig = document.getElementById("camera-rig");
    },
    tick: (function () {
        return function () {
            const rotation = this.el.getAttribute("rotation");
            currentCameraRotation = rotation;

            // if (worldRotation) {
            //     const objectsRotation = worldRotation.getAttribute("rotation");

            //     document.getElementById("cameraPosition").innerHTML = `
            //         ${objectsRotation.x}<br />
            //         ${objectsRotation.y}<br />
            //         ${objectsRotation.z}<br />
            //     `;

            //     document.getElementById("cameraRotation").innerHTML = `
            //         ${rotation.x}<br />
            //         ${rotation.y}<br />
            //         ${rotation.z}<br />
            //     `;
            // }

            if (window.facingMode == "user") {
                const rigRotation = worldRotation.getAttribute("rotation");

                if (rigRotation.y > 135 || rigRotation.y < -135) {
                    rigRotation.x = -rotation.x * 2;
                    rigRotation.z = -rotation.z * 2;
                } else if (rigRotation.y > 45) {
                    rigRotation.z = rotation.x * 2;
                    rigRotation.x = -rotation.z * 2;
                } else if (rigRotation.y < -45) {
                    rigRotation.z = -rotation.x * 2;
                    rigRotation.x = rotation.z * 2;
                } else {
                    rigRotation.x = rotation.x * 2;
                    rigRotation.z = rotation.z * 2;
                }

                // rigRotation.y = - 180 + rotation.y * 0.5;

                worldRotation.setAttribute("rotation", rigRotation);
            }
        };
    })()
});

let object3d;

function zoomIn() {
    object3d = document.querySelector("#model");

    let newScale;
    const currentScale = object3d.getAttribute("scale").y;
    const front = window.facingMode == "user";

    if (currentScale < 7) {
        newScale = currentScale + 1;
    } else {
        newScale = 8;
    }

    if (front) {
        object3d.setAttribute("scale", {
            x: -newScale,
            y: newScale,
            z: newScale
        });
    } else {
        object3d.setAttribute("animation", `property: scale; to: ${newScale} ${newScale} ${newScale}; dur: 500; easing: linear; loop: false`);
    }
}

function zoomOut() {
    object3d = document.querySelector("#model");

    let newScale;
    const currentScale = object3d.getAttribute("scale").y;
    const front = window.facingMode == "user";

    if (currentScale > 3) {
        newScale = currentScale - 1;
    } else {
        newScale = 2;
    }

    if (front) {
        object3d.setAttribute("scale", {
            x: -newScale,
            y: newScale,
            z: newScale
        });
    } else {
        object3d.setAttribute("animation", `property: scale; to: ${newScale} ${newScale} ${newScale}; dur: 500; easing: linear; loop: false`);
    }
}

function rotateLeft() {
    object3d = document.querySelector("#model");

    const rotation = object3d.getAttribute("rotation");

    rotation.y = (Math.floor(rotation.y / 45) - 1) * 45;

    const front = window.facingMode == "user";
    if (front) {
        object3d.setAttribute("rotation", rotation);
    } else {
        object3d.setAttribute("animation__2", `property: rotation; to: ${rotation.x} ${rotation.y} ${rotation.z}; dur: 500; easing: linear; loop: false`);
    }
}

function rotateRight() {
    object3d = document.querySelector("#model");

    const rotation = object3d.getAttribute("rotation");

    rotation.y = (Math.ceil(rotation.y / 45) + 1) * 45;

    const front = window.facingMode == "user";
    if (front) {
        object3d.setAttribute("rotation", rotation);
    } else {
        object3d.setAttribute("animation__2", `property: rotation; to: ${rotation.x} ${rotation.y} ${rotation.z}; dur: 500; easing: linear; loop: false`);
    }
}

function enableParticles() {
    const particlesEl = document.getElementById("particles");
    let visible = particlesEl.getAttribute("visible");

    visible = !visible;

    document.getElementById("particles").setAttribute("visible", visible);
    document.getElementById("enable-particles").setAttribute("data-active", visible ? "1" : "0");

    if (visible) {
        document.getElementById("enable-particles").classList.add("active");
    } else {
        document.getElementById("enable-particles").classList.remove("active");
    }
}

function handleMoveObjects(event) {
    if (movingObjects && event.touches.length && sceneObjectsMove) {
        const { startX, startY, startPositionX, startPositionY } = movingObjects;
        const { clientX, clientY } = event.touches[0];

        const movement = {
            x: (clientX - startX) * moveSensitivity.x,
            y: (clientY - startY) * moveSensitivity.y,
        }

        const position = sceneObjectsMove.getAttribute("position");

        position.x = startPositionX + movement.x;
        position.y = startPositionY - movement.y;

        sceneObjectsMove.setAttribute("position", position);
    }
}

document.addEventListener("readystatechange", function () {
    setTimeout(() => {
        if (!window.mobileCheck()) {
            document.body.innerHTML = `
                <div class="not-mobile">
                    <div class="logo">
                        <svg xmlns="http://www.w3.org/2000/svg" width="205.293" height="42.542" viewBox="0 0 205.293 42.542">
                            <g id="Grupo_256" data-name="Grupo 256" transform="translate(11947 1678.059)">
                                <path id="Caminho_293" data-name="Caminho 293"
                                    d="M4.689-7.156a.726.726,0,0,1,.456.134.475.475,0,0,1,.173.4.593.593,0,0,1-.181.44.789.789,0,0,1-.432.173,2.233,2.233,0,0,0-.755.2,2.269,2.269,0,0,0-.692.511,2.589,2.589,0,0,0-.645,1.069,4.6,4.6,0,0,0-.22,1.462V0a.638.638,0,0,1-.181.5.64.64,0,0,1-.448.165A.646.646,0,0,1,1.34.5.619.619,0,0,1,1.151,0V-6.449a.682.682,0,0,1,.173-.5.577.577,0,0,1,.425-.173.609.609,0,0,1,.409.165.644.644,0,0,1,.189.511v1.289a3.185,3.185,0,0,1,.967-1.5A2.155,2.155,0,0,1,4.689-7.156ZM12.5-1.149a.367.367,0,0,1,.3.134.469.469,0,0,1,.11.307.64.64,0,0,1-.063.275,1.076,1.076,0,0,1-.252.307,3.127,3.127,0,0,1-1.085.59A4.653,4.653,0,0,1,10.02.69,4.522,4.522,0,0,1,8.377.407a3.481,3.481,0,0,1-1.242-.8,3.554,3.554,0,0,1-.786-1.234,4.415,4.415,0,0,1-.275-1.6,4.219,4.219,0,0,1,.291-1.588A3.865,3.865,0,0,1,7.15-6.056a3.55,3.55,0,0,1,1.164-.81,3.565,3.565,0,0,1,1.439-.291,3.59,3.59,0,0,1,1.266.22,2.932,2.932,0,0,1,1.022.637,2.919,2.919,0,0,1,.676,1.014,3.554,3.554,0,0,1,.244,1.352.831.831,0,0,1-.142.543.509.509,0,0,1-.409.165H7.362a2.825,2.825,0,0,0,.8,2.091,2.8,2.8,0,0,0,2,.723,3.372,3.372,0,0,0,.92-.118,3.21,3.21,0,0,0,.763-.322l.37-.212A.58.58,0,0,1,12.5-1.149ZM9.753-6.056a2.233,2.233,0,0,0-1.462.5,2.525,2.525,0,0,0-.833,1.4h4.434a2.083,2.083,0,0,0-.645-1.368A2.087,2.087,0,0,0,9.753-6.056ZM21.358-7.078a.59.59,0,0,1,.448.173.678.678,0,0,1,.165.487V-.112a.846.846,0,0,1-.157.543.568.568,0,0,1-.472.2q-.629,0-.629-.739V-.866A2.613,2.613,0,0,1,19.557.3,3.5,3.5,0,0,1,17.93.69,3.535,3.535,0,0,1,16.593.423a3.671,3.671,0,0,1-1.187-.778A3.9,3.9,0,0,1,14.557-1.6a4.073,4.073,0,0,1-.322-1.659,4.063,4.063,0,0,1,.314-1.635,3.855,3.855,0,0,1,.826-1.227,3.536,3.536,0,0,1,1.179-.771,3.673,3.673,0,0,1,1.376-.267,3.605,3.605,0,0,1,1.635.37,2.578,2.578,0,0,1,1.148,1.156v-.786a.684.684,0,0,1,.165-.48A.617.617,0,0,1,21.358-7.078ZM18.134-.442a2.59,2.59,0,0,0,1.006-.2,2.474,2.474,0,0,0,.826-.558,2.608,2.608,0,0,0,.558-.881,3.152,3.152,0,0,0,.2-1.164,3.154,3.154,0,0,0-.2-1.14,2.446,2.446,0,0,0-.55-.865,2.532,2.532,0,0,0-.826-.55,2.631,2.631,0,0,0-1.022-.2,2.648,2.648,0,0,0-1.014.2,2.454,2.454,0,0,0-.833.558,2.644,2.644,0,0,0-.558.865,2.985,2.985,0,0,0-.2,1.132,3.048,3.048,0,0,0,.212,1.164,2.643,2.643,0,0,0,.574.881,2.56,2.56,0,0,0,.833.558A2.55,2.55,0,0,0,18.134-.442ZM25.981.706A1.719,1.719,0,0,1,24.762.289a1.648,1.648,0,0,1-.448-1.266v-9.687a.7.7,0,0,1,.157-.487.606.606,0,0,1,.472-.173.617.617,0,0,1,.456.173.659.659,0,0,1,.173.487v9.529a.739.739,0,0,0,.2.59.7.7,0,0,0,.464.165,1.177,1.177,0,0,0,.487-.086.868.868,0,0,1,.362-.086.336.336,0,0,1,.252.118.431.431,0,0,1,.11.307.647.647,0,0,1-.33.582,1.575,1.575,0,0,1-.5.189A3.047,3.047,0,0,1,25.981.706Zm3.585-9.875a.847.847,0,0,1-.66-.259.892.892,0,0,1-.236-.621.836.836,0,0,1,.236-.605.876.876,0,0,1,.66-.244.829.829,0,0,1,.637.244.852.852,0,0,1,.228.605.909.909,0,0,1-.228.621A.8.8,0,0,1,29.566-9.169ZM29.692.643q-.629,0-.629-.66V-6.433q0-.66.629-.66a.606.606,0,0,1,.448.165.673.673,0,0,1,.165.5V-.017Q30.305.643,29.692.643Zm9.466-12a.59.59,0,0,1,.448.173.678.678,0,0,1,.165.487V-.1a.819.819,0,0,1-.157.527.55.55,0,0,1-.456.2q-.645,0-.645-.723V-.882a2.484,2.484,0,0,1-.519.684A3.174,3.174,0,0,1,37.3.289a3.536,3.536,0,0,1-.794.3,3.456,3.456,0,0,1-.826.1A3.515,3.515,0,0,1,34.339.423a3.519,3.519,0,0,1-1.164-.778A3.929,3.929,0,0,1,32.349-1.6a4.162,4.162,0,0,1-.315-1.659,4.25,4.25,0,0,1,.3-1.635,3.654,3.654,0,0,1,.81-1.227,3.556,3.556,0,0,1,1.172-.771A3.654,3.654,0,0,1,35.7-7.156a3.941,3.941,0,0,1,.818.086,3.26,3.26,0,0,1,.786.275,2.972,2.972,0,0,1,.692.48,2.485,2.485,0,0,1,.519.684v-5.063a.678.678,0,0,1,.165-.487A.632.632,0,0,1,39.158-11.355ZM35.951-.442a2.55,2.55,0,0,0,.991-.2,2.474,2.474,0,0,0,.826-.558,2.608,2.608,0,0,0,.558-.881,3.152,3.152,0,0,0,.2-1.164,3.045,3.045,0,0,0-.2-1.14,2.6,2.6,0,0,0-.55-.865,2.445,2.445,0,0,0-.818-.55,2.59,2.59,0,0,0-1.006-.2,2.689,2.689,0,0,0-1.03.2,2.454,2.454,0,0,0-.833.558,2.644,2.644,0,0,0-.558.865,2.985,2.985,0,0,0-.2,1.132,3.048,3.048,0,0,0,.212,1.164,2.643,2.643,0,0,0,.574.881,2.56,2.56,0,0,0,.833.558A2.59,2.59,0,0,0,35.951-.442ZM48.672-7.078a.59.59,0,0,1,.448.173.678.678,0,0,1,.165.487V-.112a.846.846,0,0,1-.157.543.568.568,0,0,1-.472.2q-.629,0-.629-.739V-.866A2.613,2.613,0,0,1,46.872.3,3.5,3.5,0,0,1,45.244.69,3.535,3.535,0,0,1,43.907.423,3.671,3.671,0,0,1,42.72-.355,3.9,3.9,0,0,1,41.871-1.6a4.073,4.073,0,0,1-.322-1.659,4.063,4.063,0,0,1,.314-1.635,3.855,3.855,0,0,1,.826-1.227,3.536,3.536,0,0,1,1.179-.771,3.673,3.673,0,0,1,1.376-.267,3.605,3.605,0,0,1,1.635.37,2.578,2.578,0,0,1,1.148,1.156v-.786a.684.684,0,0,1,.165-.48A.617.617,0,0,1,48.672-7.078ZM45.448-.442a2.59,2.59,0,0,0,1.006-.2A2.474,2.474,0,0,0,47.28-1.2a2.609,2.609,0,0,0,.558-.881,3.152,3.152,0,0,0,.2-1.164,3.154,3.154,0,0,0-.2-1.14,2.446,2.446,0,0,0-.55-.865,2.533,2.533,0,0,0-.826-.55,2.631,2.631,0,0,0-1.022-.2,2.648,2.648,0,0,0-1.014.2,2.454,2.454,0,0,0-.833.558,2.644,2.644,0,0,0-.558.865,2.985,2.985,0,0,0-.2,1.132,3.048,3.048,0,0,0,.212,1.164,2.643,2.643,0,0,0,.574.881,2.56,2.56,0,0,0,.833.558A2.55,2.55,0,0,0,45.448-.442ZM58.186-11.355a.59.59,0,0,1,.448.173.678.678,0,0,1,.165.487V-.1a.819.819,0,0,1-.157.527.55.55,0,0,1-.456.2q-.645,0-.645-.723V-.882a2.484,2.484,0,0,1-.519.684,3.174,3.174,0,0,1-.692.487,3.536,3.536,0,0,1-.794.3,3.456,3.456,0,0,1-.826.1A3.515,3.515,0,0,1,53.366.423,3.519,3.519,0,0,1,52.2-.355,3.929,3.929,0,0,1,51.377-1.6a4.162,4.162,0,0,1-.314-1.659,4.25,4.25,0,0,1,.3-1.635,3.655,3.655,0,0,1,.81-1.227,3.556,3.556,0,0,1,1.172-.771,3.654,3.654,0,0,1,1.384-.267,3.941,3.941,0,0,1,.818.086,3.26,3.26,0,0,1,.786.275,2.972,2.972,0,0,1,.692.48,2.484,2.484,0,0,1,.519.684v-5.063a.678.678,0,0,1,.165-.487A.632.632,0,0,1,58.186-11.355ZM54.978-.442a2.55,2.55,0,0,0,.991-.2,2.474,2.474,0,0,0,.826-.558,2.608,2.608,0,0,0,.558-.881,3.152,3.152,0,0,0,.2-1.164,3.045,3.045,0,0,0-.2-1.14,2.6,2.6,0,0,0-.55-.865,2.445,2.445,0,0,0-.818-.55,2.59,2.59,0,0,0-1.006-.2,2.689,2.689,0,0,0-1.03.2,2.454,2.454,0,0,0-.833.558,2.644,2.644,0,0,0-.558.865,2.985,2.985,0,0,0-.2,1.132,3.048,3.048,0,0,0,.212,1.164,2.643,2.643,0,0,0,.574.881,2.56,2.56,0,0,0,.833.558A2.59,2.59,0,0,0,54.978-.442Zm12.03-.708a.367.367,0,0,1,.3.134.469.469,0,0,1,.11.307.639.639,0,0,1-.063.275,1.076,1.076,0,0,1-.252.307,3.127,3.127,0,0,1-1.085.59A4.653,4.653,0,0,1,64.523.69,4.522,4.522,0,0,1,62.88.407a3.481,3.481,0,0,1-1.242-.8,3.554,3.554,0,0,1-.786-1.234,4.415,4.415,0,0,1-.275-1.6,4.219,4.219,0,0,1,.291-1.588,3.865,3.865,0,0,1,.786-1.242,3.55,3.55,0,0,1,1.164-.81,3.565,3.565,0,0,1,1.439-.291,3.59,3.59,0,0,1,1.266.22,2.932,2.932,0,0,1,1.022.637,2.919,2.919,0,0,1,.676,1.014,3.554,3.554,0,0,1,.244,1.352.831.831,0,0,1-.142.543.509.509,0,0,1-.409.165H61.865a2.825,2.825,0,0,0,.8,2.091,2.8,2.8,0,0,0,2,.723,3.372,3.372,0,0,0,.92-.118,3.209,3.209,0,0,0,.763-.322l.37-.212A.58.58,0,0,1,67.007-1.149ZM64.255-6.056a2.233,2.233,0,0,0-1.462.5,2.525,2.525,0,0,0-.833,1.4h4.434a2.083,2.083,0,0,0-.645-1.368A2.087,2.087,0,0,0,64.255-6.056ZM7.708,8.647a.59.59,0,0,1,.448.173.678.678,0,0,1,.165.487v6.306a.846.846,0,0,1-.157.543.568.568,0,0,1-.472.2q-.629,0-.629-.739v-.755a2.613,2.613,0,0,1-1.156,1.164,3.525,3.525,0,0,1-2.964.126,3.671,3.671,0,0,1-1.187-.778,3.9,3.9,0,0,1-.849-1.242,4.073,4.073,0,0,1-.322-1.659A4.063,4.063,0,0,1,.9,10.833a3.855,3.855,0,0,1,.826-1.227A3.536,3.536,0,0,1,2.9,8.836,3.673,3.673,0,0,1,4.28,8.569a3.605,3.605,0,0,1,1.635.37,2.578,2.578,0,0,1,1.148,1.156V9.308a.684.684,0,0,1,.165-.48A.617.617,0,0,1,7.708,8.647ZM4.485,15.283a2.59,2.59,0,0,0,1.006-.2,2.474,2.474,0,0,0,.826-.558,2.608,2.608,0,0,0,.558-.881,3.409,3.409,0,0,0,.008-2.3,2.446,2.446,0,0,0-.55-.865,2.533,2.533,0,0,0-.826-.55,2.735,2.735,0,0,0-2.036,0,2.454,2.454,0,0,0-.833.558,2.644,2.644,0,0,0-.558.865,2.985,2.985,0,0,0-.2,1.132,3.048,3.048,0,0,0,.212,1.164,2.643,2.643,0,0,0,.574.881,2.569,2.569,0,0,0,1.824.755Zm11.9-6.667a.583.583,0,0,1,.44.181.687.687,0,0,1,.173.5v6.463a.56.56,0,0,1-.173.448.585.585,0,0,1-.393.149.615.615,0,0,1-.4-.149.548.548,0,0,1-.181-.448V15a2.481,2.481,0,0,1-.983,1.061,2.856,2.856,0,0,1-1.439.354,3.176,3.176,0,0,1-1.109-.189,2.358,2.358,0,0,1-.881-.566,2.643,2.643,0,0,1-.582-.959,3.99,3.99,0,0,1-.212-1.368V9.292a.687.687,0,0,1,.173-.5.665.665,0,0,1,.912,0,.687.687,0,0,1,.173.5v4.026a2.058,2.058,0,0,0,.511,1.58,1.9,1.9,0,0,0,1.329.464,1.962,1.962,0,0,0,.841-.173,1.875,1.875,0,0,0,.629-.472,2.127,2.127,0,0,0,.4-.708,2.724,2.724,0,0,0,.142-.9V9.292Q15.76,8.616,16.389,8.616Zm10.835-.047a3.112,3.112,0,0,1,.991.157,2.281,2.281,0,0,1,.826.48,2.327,2.327,0,0,1,.566.818,3,3,0,0,1,.212,1.187v4.482q0,.66-.629.66a.59.59,0,0,1-.448-.173.678.678,0,0,1-.165-.487V11.258a1.822,1.822,0,0,0-.134-.731,1.307,1.307,0,0,0-.362-.5,1.576,1.576,0,0,0-.511-.283,1.828,1.828,0,0,0-.582-.094,1.768,1.768,0,0,0-.684.134,1.793,1.793,0,0,0-.566.37,1.743,1.743,0,0,0-.385.558,1.761,1.761,0,0,0-.142.715v4.261a.678.678,0,0,1-.165.487.59.59,0,0,1-.448.173.617.617,0,0,1-.456-.173.659.659,0,0,1-.173-.487V11.258a1.822,1.822,0,0,0-.134-.731,1.349,1.349,0,0,0-.354-.5,1.475,1.475,0,0,0-.511-.283,1.9,1.9,0,0,0-.59-.094,1.768,1.768,0,0,0-.684.134,1.7,1.7,0,0,0-.558.37,1.809,1.809,0,0,0-.377.558,1.761,1.761,0,0,0-.142.715H20.6v4.261q0,.66-.629.66a.59.59,0,0,1-.448-.173.678.678,0,0,1-.165-.487V9.308a.7.7,0,0,1,.157-.487.565.565,0,0,1,.44-.173.59.59,0,0,1,.448.173.678.678,0,0,1,.165.487v.519a2.218,2.218,0,0,1,.9-.943,2.529,2.529,0,0,1,1.234-.314,2.8,2.8,0,0,1,1.36.338A2.043,2.043,0,0,1,24.99,10a2.33,2.33,0,0,1,.928-1.077A2.515,2.515,0,0,1,27.223,8.569Zm10.74,6.007a.367.367,0,0,1,.3.134.469.469,0,0,1,.11.307.639.639,0,0,1-.063.275,1.076,1.076,0,0,1-.252.307,3.127,3.127,0,0,1-1.085.59,4.653,4.653,0,0,1-1.494.228,4.522,4.522,0,0,1-1.643-.283,3.481,3.481,0,0,1-1.242-.8,3.554,3.554,0,0,1-.786-1.234,4.415,4.415,0,0,1-.275-1.6,4.219,4.219,0,0,1,.291-1.588,3.865,3.865,0,0,1,.786-1.242,3.557,3.557,0,0,1,2.6-1.1,3.59,3.59,0,0,1,1.266.22,2.869,2.869,0,0,1,1.7,1.651,3.554,3.554,0,0,1,.244,1.352.831.831,0,0,1-.142.543.509.509,0,0,1-.409.165H32.821a2.626,2.626,0,0,0,2.8,2.815,3.372,3.372,0,0,0,.92-.118,3.209,3.209,0,0,0,.763-.322l.37-.212A.58.58,0,0,1,37.963,14.576ZM35.211,9.669a2.233,2.233,0,0,0-1.462.5,2.525,2.525,0,0,0-.833,1.4H37.35a2.021,2.021,0,0,0-2.139-1.9Zm8.727-1.1a2.854,2.854,0,0,1,2.036.731,2.982,2.982,0,0,1,.778,2.272v4.1a.729.729,0,0,1-.157.5.686.686,0,0,1-.92.008.7.7,0,0,1-.165-.5V11.588a1.9,1.9,0,0,0-.519-1.494,2.26,2.26,0,0,0-2.909.157,2.316,2.316,0,0,0-.566,1.635v3.79a.729.729,0,0,1-.157.5.592.592,0,0,1-.472.181q-.629,0-.629-.676V9.292a.675.675,0,0,1,.157-.472.585.585,0,0,1,.456-.173.612.612,0,0,1,.44.165.632.632,0,0,1,.173.48v.566a2.542,2.542,0,0,1,1-.959A3.055,3.055,0,0,1,43.939,8.569Zm8.586,6.667a.364.364,0,0,1,.267.11.426.426,0,0,1,.11.314.6.6,0,0,1-.3.5,2.7,2.7,0,0,1-.621.2,3.72,3.72,0,0,1-.731.071,2.041,2.041,0,0,1-1.557-.55,2.429,2.429,0,0,1-.519-1.714V9.638H48.31A.427.427,0,0,1,48,9.512a.5.5,0,0,1,0-.66.427.427,0,0,1,.314-.126h.865V7.09a.687.687,0,0,1,.173-.5.665.665,0,0,1,.912,0,.687.687,0,0,1,.173.5V8.726h1.793a.427.427,0,0,1,.314.126.5.5,0,0,1,0,.66.427.427,0,0,1-.314.126H50.433v4.387a1.563,1.563,0,0,0,.291,1.069,1.132,1.132,0,0,0,.873.315,1.828,1.828,0,0,0,.605-.086A1.271,1.271,0,0,1,52.525,15.236Zm8.193-6.589a.59.59,0,0,1,.448.173.678.678,0,0,1,.165.487v6.306a.846.846,0,0,1-.157.543.568.568,0,0,1-.472.2q-.629,0-.629-.739v-.755a2.613,2.613,0,0,1-1.156,1.164,3.525,3.525,0,0,1-2.964.126,3.671,3.671,0,0,1-1.187-.778,3.9,3.9,0,0,1-.849-1.242,4.073,4.073,0,0,1-.322-1.659,4.063,4.063,0,0,1,.314-1.635,3.855,3.855,0,0,1,.826-1.227,3.536,3.536,0,0,1,1.179-.771,3.673,3.673,0,0,1,1.376-.267,3.605,3.605,0,0,1,1.635.37,2.578,2.578,0,0,1,1.148,1.156V9.308a.684.684,0,0,1,.165-.48A.617.617,0,0,1,60.717,8.647Zm-3.224,6.636a2.59,2.59,0,0,0,1.006-.2,2.474,2.474,0,0,0,.826-.558,2.609,2.609,0,0,0,.558-.881,3.409,3.409,0,0,0,.008-2.3,2.446,2.446,0,0,0-.55-.865,2.533,2.533,0,0,0-.826-.55,2.735,2.735,0,0,0-2.036,0,2.454,2.454,0,0,0-.833.558,2.644,2.644,0,0,0-.558.865,2.985,2.985,0,0,0-.2,1.132,3.048,3.048,0,0,0,.212,1.164,2.643,2.643,0,0,0,.574.881,2.569,2.569,0,0,0,1.824.755ZM70.231,4.37a.59.59,0,0,1,.448.173.678.678,0,0,1,.165.487v10.6a.819.819,0,0,1-.157.527.55.55,0,0,1-.456.2q-.645,0-.645-.723v-.786a2.484,2.484,0,0,1-.519.684,3.174,3.174,0,0,1-.692.487,3.536,3.536,0,0,1-.794.3,3.456,3.456,0,0,1-.826.1,3.545,3.545,0,0,1-2.508-1.046,3.929,3.929,0,0,1-.826-1.242,4.162,4.162,0,0,1-.314-1.659,4.25,4.25,0,0,1,.3-1.635,3.654,3.654,0,0,1,.81-1.227,3.557,3.557,0,0,1,1.172-.771,3.654,3.654,0,0,1,1.384-.267,3.941,3.941,0,0,1,.818.086,3.26,3.26,0,0,1,.786.275,2.972,2.972,0,0,1,.692.48,2.484,2.484,0,0,1,.519.684V5.03a.678.678,0,0,1,.165-.487A.632.632,0,0,1,70.231,4.37ZM67.023,15.283a2.55,2.55,0,0,0,.991-.2,2.474,2.474,0,0,0,.826-.558,2.609,2.609,0,0,0,.558-.881,3.152,3.152,0,0,0,.2-1.164,3.045,3.045,0,0,0-.2-1.14,2.6,2.6,0,0,0-.55-.865,2.445,2.445,0,0,0-.818-.55,2.59,2.59,0,0,0-1.006-.2,2.689,2.689,0,0,0-1.03.2,2.454,2.454,0,0,0-.833.558,2.644,2.644,0,0,0-.558.865,2.985,2.985,0,0,0-.2,1.132,3.048,3.048,0,0,0,.212,1.164,2.643,2.643,0,0,0,.574.881,2.56,2.56,0,0,0,.833.558A2.59,2.59,0,0,0,67.023,15.283ZM79.745,8.647a.59.59,0,0,1,.448.173.678.678,0,0,1,.165.487v6.306a.846.846,0,0,1-.157.543.568.568,0,0,1-.472.2q-.629,0-.629-.739v-.755a2.613,2.613,0,0,1-1.156,1.164,3.525,3.525,0,0,1-2.964.126,3.671,3.671,0,0,1-1.187-.778,3.9,3.9,0,0,1-.849-1.242,4.073,4.073,0,0,1-.322-1.659,4.063,4.063,0,0,1,.314-1.635,3.855,3.855,0,0,1,.826-1.227,3.536,3.536,0,0,1,1.179-.771,3.673,3.673,0,0,1,1.376-.267,3.605,3.605,0,0,1,1.635.37A2.578,2.578,0,0,1,79.1,10.094V9.308a.684.684,0,0,1,.165-.48A.617.617,0,0,1,79.745,8.647Zm-3.224,6.636a2.59,2.59,0,0,0,1.006-.2,2.474,2.474,0,0,0,.826-.558,2.608,2.608,0,0,0,.558-.881,3.409,3.409,0,0,0,.008-2.3,2.446,2.446,0,0,0-.55-.865,2.532,2.532,0,0,0-.826-.55,2.735,2.735,0,0,0-2.036,0,2.454,2.454,0,0,0-.833.558,2.644,2.644,0,0,0-.558.865,2.985,2.985,0,0,0-.2,1.132,3.048,3.048,0,0,0,.212,1.164,2.643,2.643,0,0,0,.574.881,2.569,2.569,0,0,0,1.824.755Z"
                                    transform="translate(-11830.585 -1661.431)" fill="#fff" />
                                <g id="Grupo_168" data-name="Grupo 168" transform="translate(-10176.795 -839.722)">
                                    <path id="Caminho_142" data-name="Caminho 142"
                                        d="M-1672.058-809.988a5.792,5.792,0,0,1-5.7-6.048,5.792,5.792,0,0,1,5.7-6.048,5.792,5.792,0,0,1,5.7,6.048,5.792,5.792,0,0,1-5.7,6.048m-25.668,0c-3.049,0-5.606-2.409-5.606-6.048a5.716,5.716,0,0,1,5.606-6.048,5.716,5.716,0,0,1,5.606,6.048c0,3.639-2.557,6.048-5.606,6.048m-25.914,0a5.792,5.792,0,0,1-5.7-6.048,5.792,5.792,0,0,1,5.7-6.048,5.792,5.792,0,0,1,5.7,6.048,5.792,5.792,0,0,1-5.7,6.048m-35.01-.049a5.762,5.762,0,0,1-5.7-6.048,5.733,5.733,0,0,1,5.7-6.048,5.7,5.7,0,0,1,5.655,6.048,5.724,5.724,0,0,1-5.655,6.048m86.592-17.8a11.587,11.587,0,0,0-11.654,11.8,11.528,11.528,0,0,0,11.654,11.8,11.587,11.587,0,0,0,11.654-11.8,11.527,11.527,0,0,0-11.654-11.8m-51.581,0a11.587,11.587,0,0,0-11.654,11.8,11.527,11.527,0,0,0,11.654,11.8,11.587,11.587,0,0,0,11.654-11.8,11.527,11.527,0,0,0-11.654-11.8m-27.979.393a1.086,1.086,0,0,0-1.18,1.18v1.279a8.428,8.428,0,0,0-6.245-2.852c-6,0-11.162,5.114-11.162,11.8s4.868,11.309,11.015,11.309a8.321,8.321,0,0,0,6.1-2.606c-.049,4.671-2.508,6.786-6.736,6.786a12.275,12.275,0,0,1-6.835-2.262,1.108,1.108,0,0,0-1.721.393l-1.475,2.9a1.245,1.245,0,0,0,.443,1.77,18.52,18.52,0,0,0,9.736,2.95c8.113,0,12.588-4.376,12.588-14.457v-17.013a1.086,1.086,0,0,0-1.18-1.18Zm54.581-.393a8.817,8.817,0,0,0-6.2,2.606v-10.424a1.086,1.086,0,0,0-1.18-1.18h-3.639a1.086,1.086,0,0,0-1.18,1.18v29.847a1.086,1.086,0,0,0,1.18,1.18h3.295a1.086,1.086,0,0,0,1.18-1.18v-1.279a9.358,9.358,0,0,0,6.687,2.852c5.753,0,10.719-5.212,10.719-11.8,0-6.687-5.016-11.8-10.867-11.8m-44.6-9.2c-1.426-.639-2.409,0-2.409,1.573v29.454c0,1.573.983,2.213,2.409,1.573l1.869-.836a2.6,2.6,0,0,0,1.721-2.606v-25.717a2.6,2.6,0,0,0-1.721-2.606Z"
                                        transform="translate(0 -1)" fill="#fff" />
                                </g>
                                <g id="Globo_logo_and_wordmark" transform="translate(-11750.228 -1678.059)">
                                    <path id="Caminho_1" data-name="Caminho 1"
                                        d="M-86.426-269.837a4.27,4.27,0,0,0-4.259,4.27,4.272,4.272,0,0,0,4.259,4.275,4.273,4.273,0,0,0,4.262-4.275A4.271,4.271,0,0,0-86.426-269.837Zm-.36,2.139h.36a26.432,26.432,0,0,1,2.908.119c.269.028.411.092.443.384.05.53.055,1.075.055,1.628s0,1.1-.055,1.633c-.032.293-.174.357-.443.384a27.681,27.681,0,0,1-2.908.119,27.645,27.645,0,0,1-2.9-.118c-.269-.028-.411-.092-.443-.384-.05-.53-.055-1.075-.055-1.633s0-1.1.055-1.628c.032-.292.174-.356.443-.384a24.755,24.755,0,0,1,2.544-.119Zm.36.4a1.729,1.729,0,0,0-1.73,1.728,1.726,1.726,0,0,0,.507,1.223,1.726,1.726,0,0,0,1.224.505,1.726,1.726,0,0,0,1.226-.5,1.726,1.726,0,0,0,.508-1.225,1.73,1.73,0,0,0-.509-1.224,1.73,1.73,0,0,0-1.225-.5Z"
                                        transform="translate(90.685 269.837)" fill="#fff" fill-rule="evenodd" />
                                </g>
                            </g>
                        </svg>
                    </div>

                    <div>Aponte a câmera do celular para o QRCode <br>para mostrar a realidade aumentada.</div>
                    <img src="./img/qr-code.png">
                </div>
            `;
        } else {
            const el = document.querySelector("#first-loading");

            if (el) {
                el.remove();
            }
        }
    }, 5000);
});
