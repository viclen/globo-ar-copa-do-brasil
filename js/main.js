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


let sceneObjects;
let cameraRig;
let isOpening = false;

const motionThreshold = 5;
let acceleration = { x: 0, y: 0, z: 0, time: new Date().getTime() };
let velocity = { x: 0, y: 0, z: 0 };
let motions = {
    x: [],
    y: [],
    z: []
};

let canAdd = true;

let lastFrame = 0;

function getLocation(cb = () => { }) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(cb);
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

function showPosition(position) {
    const objects = document.getElementById("objects");
    sceneObjects = objects;

    objects.setAttribute("gps-entity-place", "latitude: " + position.coords.latitude + "; longitude: " + position.coords.longitude);
    objects.setAttribute("visible", "true");
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
        if (!window.mobileCheck()) {
            document.getElementById("clickToStart").innerHTML = `
                <img src="./img/qr-code.png" />
            `;
            document.getElementById("arScene").remove();
            document.getElementsByTagName("video")[0].remove();
            return;
        }

        const clickToStart = document.getElementById('clickToStart');

        clickToStart.addEventListener('click', () => {
            cameraStart();

            getLocation(showPosition);

            clickToStart.remove();

            window.addEventListener("devicemotion", onMoveDevice);

            document.addEventListener("click", (event) => {
                if (event.target.classList.contains("fixed-front")) {
                    createParticles();
                }
            });

            document.getElementById("carregando").style.display = "";
            document.querySelector(".fixed-front").remove();
        });
    }
});

AFRAME.registerComponent('3dmodel', {
    init: function () {
        this.el.addEventListener('model-loaded', e => {
            document.getElementById("carregando").innerHTML = "";
        })
    }
});

function onMoveDevice(event) {
    let acl = event.acceleration;

    if (acl.x !== null) {
        const now = new Date().getTime();
        const deltaTime = (now - acceleration.time) / 1000;

        acceleration = {
            x: Math.round(acl.x.withTolerance(0)) * deltaTime,
            y: Math.round(acl.y.withTolerance(0.2) - 9.81) * deltaTime,
            z: Math.round(acl.z.withTolerance(0)) * deltaTime,
            time: now
        }

        velocity.x += acceleration.x;
        velocity.y += acceleration.y;
        velocity.z += acceleration.z;
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

function createParticles() {
    if (!canAdd) return;

    canAdd = false;

    // document.getElementById("particles").innerHTML = `
    //     <a-entity sprite-particles="
    //         spawnRate: 30;
    //         texture: url(img/star.png);
    //         lifeTime: 1..5;
    //         radialVelocity: 2..6;
    //         radialAcceleration: -1;
    //         opacity: 1,0;
    //         color: white;
    //         scale: 4;
    //         spawnType: burst;
    //     "></a-entity>
    // `;

    setTimeout(() => {
        document.getElementById("particles").innerHTML = "";
        canAdd = true;
    }, 2000);
}

AFRAME.registerComponent('scene-objects', {
    tick: (function () {
        const position = new THREE.Vector3();
        // const quaternion = new THREE.Quaternion();

        return function () {
            // this.el.object3D.getWorldPosition(position);
            // this.el.object3D.getWorldQuaternion(quaternion);

            if (!position || isNaN(position.x) || isNaN(position.y) || isNaN(position.z)) {
                return;
            }

            const now = new Date().getTime();
            const deltaTime = (now - lastFrame) / 1000;
            lastFrame = now;

            // const newPosition = {
            //     x: position.x - velocity.x * deltaTime * 0,
            //     y: position.y - velocity.y * deltaTime * 0,
            //     z: position.z - velocity.z * deltaTime
            // };

            // this.el.object3D.position.set(newPosition.x, newPosition.y, newPosition.z);

            // document.getElementById("cameraPosition").innerHTML = `
            //     ${velocity.x},
            //     ${velocity.y},
            //     ${velocity.z}
            // `;

            // document.getElementById("cameraRotation").innerHTML = `
            //     ${Math.round(quaternion.x * 180)},
            //     ${Math.round(quaternion.y * 180)},
            //     ${Math.round(quaternion.z * 180)}
            // `;
        };
    })()
});

AFRAME.registerComponent('rotation-reader', {
    init: function () {
        cameraRig = document.getElementById("camera-rig");
    },
    tick: (function () {
        return function () {
            if (window.facingMode == "user") {
                const rotation = this.el.getAttribute("rotation");
                const rigRotation = cameraRig.getAttribute("rotation");

                rigRotation.x = -rotation.x * 2;

                cameraRig.setAttribute("rotation", rigRotation);

                document.getElementById("cameraPosition").innerHTML = `
                    ${Math.round(rigRotation.x)},
                    ${Math.round(rigRotation.y)},
                    ${Math.round(rigRotation.z)}
                `;

                document.getElementById("cameraRotation").innerHTML = `
                    ${Math.round(rotation.x)},
                    ${Math.round(rotation.y)},
                    ${Math.round(rotation.z)}
                `;
            }
        };
    })()
});

let object3d;

function zoomIn() {
    object3d = document.querySelector("#model");

    let newScale;
    const currentScale = object3d.getAttribute("scale").x;
    if (currentScale < 7) {
        newScale = currentScale + 1;
    } else {
        newScale = 8;
    }

    object3d.setAttribute("animation", `property: scale; to: ${newScale} ${newScale} ${newScale}; dur: 500; easing: linear; loop: false`);
}

function zoomOut() {
    object3d = document.querySelector("#model");

    let newScale;
    const currentScale = object3d.getAttribute("scale").x;
    if (currentScale > 3) {
        newScale = currentScale - 1;
    } else {
        newScale = 2;
    }

    object3d.setAttribute("animation", `property: scale; to: ${newScale} ${newScale} ${newScale}; dur: 500; easing: linear; loop: false`);
}

THREE.BufferGeometry.prototype.addAttribute = THREE.BufferGeometry.prototype.setAttribute;