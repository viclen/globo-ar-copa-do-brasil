let tutorialConfirm, tutorialText, tutorialMain, tutorialStandard, tutorialClose;

let tutorials = [{
    el: ".tutorial--move",
    text: "Deslize o dedo pela tela para mover a taça."
}, {
    el: ".tutorial--change-camera",
    text: "Pressione este botão para mudar a camera.",
    btn: "#camera--change"
}, {
    el: ".tutorial--particles",
    text: "Pressione este botão para mostrar ou não os confetes.",
    btn: "#enable-particles"
}, {
    el: ".tutorial--rotate",
    text: "Toque nos botões com seta para rodar a taça.",
    btn: ["#rotate-left", "#rotate-right"]
}, {
    el: ".tutorial--zoom",
    text: "Toque nos botões com lupa para dar zoom na taça.",
    btn: ["#zoom-in", "#zoom-out"]
}, {
    el: ".tutorial--picture",
    text: "Toque no botão na parte inferior para tirar uma foto.",
    btn: "#camera--trigger"
}, {
    el: "",
    text: "Beleza, vamos começar!"
}];

let currentIndex = -1;
let tutorialCallback = () => { };

function shouldShowTutorial() {
    return !localStorage.getItem("tutorial");
}

function startTutorial(cb) {
    if (cb) {
        tutorialCallback = cb;
    }

    if (shouldShowTutorial()) {
        tutorialText = document.querySelector(".tutorial--text");
        tutorialConfirm = document.querySelector(".tutorial--confirm");
        tutorialConfirm.onclick = () => nextTutorial();
        tutorialClose = document.querySelector(".tutorial--close");
        tutorialClose.onclick = () => finishTutorial();

        tutorialStandard = document.querySelector(".tutorial--standard");

        tutorialMain = document.querySelector(".tutorial");
        tutorialMain.classList.add("start");

        setTimeout(() => nextTutorial(), 500);
    } else {
        finishTutorial();
    }
}

window.startTutorial = startTutorial;

function nextTutorial() {
    currentIndex++;

    if (tutorialMain && currentIndex < tutorials.length && tutorialConfirm && tutorialText) {
        tutorialStandard.classList.remove("show");

        if (currentIndex > 0) {
            if (tutorials[currentIndex - 1].el)
                document.querySelector(tutorials[currentIndex - 1].el).classList.remove("show");
        }

        setTimeout(() => {
            const tutorial = tutorials[currentIndex];

            if (tutorial.el) {
                const el = document.querySelector(tutorial.el);
                el.classList.add("show");
            }

            showBtn(tutorial.btn);

            tutorialText.innerHTML = tutorial.text;
            tutorialStandard.classList.add("show");
        }, 500);
    } else {
        finishTutorial();
    }
}

function finishTutorial() {
    for (const tutorial of tutorials) {
        showBtn(tutorial.btn);
    }

    if (tutorialMain)
        tutorialMain.remove();
    tutorialMain = null;
    localStorage.setItem("tutorial", "1");
    tutorialCallback();
}

function showBtn(selector) {
    if (selector) {
        if (Array.isArray(selector)) {
            for (const btn of selector) {
                const button = document.querySelector(btn);
                button.classList.remove("hidden");
            }
        } else {
            const button = document.querySelector(selector);
            button.classList.remove("hidden");
        }
    }
}