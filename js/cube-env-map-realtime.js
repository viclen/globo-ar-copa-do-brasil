let canvasEnvMap, cameraEnvMap, texture;

function ensureMaterialArray(material) {
    if (!material) {
        return [];
    } else if (Array.isArray(material)) {
        return material;
    } else if (material.materials) {
        return material.materials;
    } else {
        return [material];
    }
}

function applyEnvMap(mesh, envMap, reflectivity) {
    if (!mesh) return;

    mesh.traverse(function (node) {
        if (!node.isMesh) return;

        var meshMaterials = ensureMaterialArray(node.material);

        meshMaterials.forEach(function (material) {
            material.envMap = envMap;
            material.reflectivity = reflectivity;
            material.needsUpdate = true;
        });
    });
}

AFRAME.registerComponent('cube-env-map-realtime', {
    multiple: true,
    init: function init() {
        this.object3dsetHandler = () => {
            this.interval = setInterval(() => {
                if (!cameraEnvMap || !canvasEnvMap) {
                    cameraEnvMap = document.querySelector("#arjs-video");
                    canvasEnvMap = document.querySelector(".canvas-env-map");

                    if (!cameraEnvMap || !canvasEnvMap) return;

                    canvasEnvMap.width = cameraEnvMap.videoWidth;
                    canvasEnvMap.height = cameraEnvMap.videoHeight;
                }

                canvasEnvMap.getContext("2d").drawImage(cameraEnvMap, 0, 0);
                const dataUrl = canvasEnvMap.toDataURL();

                texture = new THREE.TextureLoader().load("./img/cubemap/negx.png");
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                texture.magFilter = THREE.LinearFilter;
                texture.minFilter = THREE.LinearMipMapLinearFilter;
                texture.mapping = THREE.EquirectangularReflectionMapping;
                texture.format = THREE.RGBFormat;

                applyEnvMap(this.el.getObject3D('mesh'), tex, 0.9);
            }, 5000);

            this.el.addEventListener('object3dset', this.object3dsetHandler);
        };
    },

    remove: function remove() {
        if (this.interval)
            clearInterval(this.interval);
    }
});