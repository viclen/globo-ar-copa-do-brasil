window.mobileCheck = function () {
    let check = false;
    (function (a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true; })(navigator.userAgent || navigator.vendor || window.opera);
    return check;
};

function getLocation(cb = () => { }) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(cb);
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

function showPosition(position) {
    const objects = document.getElementById("objects");

    objects.setAttribute("gps-entity-place", "latitude: " + position.coords.latitude + "; longitude: " + position.coords.longitude);
    objects.setAttribute("visible", "true");
}

let isOpening = false;
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
            window.addEventListener("devicemotion", onMoveDevice);

            getLocation(showPosition);
            clickToStart.remove();

            document.addEventListener("click", () => {
                createParticles();
            });

            document.getElementById("carregando").style.display = "";
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

let lastMotion = { x: 0, y: 0, z: 0, time: new Date().getTime() };

function onMoveDevice(event) {
    let acl = event.acceleration;

    lastMotion = {
        x: Math.round(acl.x * 10) / 10,
        y: Math.round(acl.y * 10) / 10,
        z: Math.round(acl.z * 10) / 10,
        time: new Date().getTime()
    }
}

let canAdd = true;

function createParticles() {
    if (!canAdd) return;

    canAdd = false;

    document.getElementById("particles").innerHTML = `
        <a-entity sprite-particles="
            spawnRate: 30;
            texture: url(img/star.png);
            lifeTime: 1..5;
            radialVelocity: 2..6;
            radialAcceleration: -1;
            opacity: 1,0;
            color: white;
            scale: 4;
            spawnType: burst;
        "></a-entity>
    `;

    setTimeout(() => {
        document.getElementById("particles").innerHTML = "";
        canAdd = true;
    }, 2000);
}

AFRAME.registerComponent('camera-data', {
    tick: (function () {
        const position = new THREE.Vector3();
        const quaternion = new THREE.Quaternion();

        return function () {
            this.el.object3D.getWorldPosition(position);
            this.el.object3D.getWorldQuaternion(quaternion);

            const now = new Date().getTime();

            const newPosition = {
                x: Math.round((position.x + lastMotion.x) / (now - lastMotion.time) * 10) / 10,
                y: Math.round((position.y + lastMotion.y) / (now - lastMotion.time) * 10) / 10,
                z: Math.round((position.z + lastMotion.z) / (now - lastMotion.time) * 10) / 10
            };

            this.el.object3D.position.set(newPosition.x, newPosition.y, newPosition.z);

            document.getElementById("cameraPosition").innerHTML = `
                ${newPosition.x},
                ${newPosition.y},
                ${newPosition.z}
            `;

            document.getElementById("cameraRotation").innerHTML = `
                ${Math.round(quaternion.x * 180)},
                ${Math.round(quaternion.y * 180)},
                ${Math.round(quaternion.z * 180)}
            `;
        };
    })()
});