let tutorialConfirm, tutorialText, tutorialMain, tutorialStandard, tutorialClose, helpButton;
let finished = false;
let tutorials = [{
    el: "",
    text: "Bem vind@! Vamos agora te explicar alguns pontos da nossa experiência RA, está bom?"
}, {
    el: ".tutorial--move",
    text: "Deslize o dedo pela tela para mover a taça."
}, {
    el: ".tutorial--zoom",
    text: "Faça o gesto de pinça na tela para ampliar ou reduzir a taça",
}, {
    el: ".tutorial--particles",
    text: "Pressione este botão para desabilitar os confetes.",
    btn: "#enable-particles"
}, {
    el: ".tutorial--rotate",
    text: "Pressione os botões com seta para rodar a taça.",
    btn: ["#rotate-left", "#rotate-right"]
}, {
    el: ".tutorial--change-camera",
    text: "Pressione este botão para mudar a camera.",
    btn: "#camera--change"
}, {
    el: ".tutorial--center",
    text: "Pressione este botão para centralizar o objeto.",
    btn: "#center--model"
}, {
    el: ".tutorial--picture",
    text: "E, por fim, pressione o botão do meio para tirar uma foto.",
    btn: "#camera--trigger"
}, {
    el: "",
    text: "Vamos começar!"
}];

let currentIndex = -1;
let tutorialCallback = () => { };

function shouldShowTutorial() {
    return !localStorage.getItem("tutorial") || localStorage.getItem("tutorial") == "0";
}

function startTutorial(cb) {
    helpButton = document.getElementById("help--button");
    if (helpButton) {
        helpButton.classList.add("hidden");
        helpButton.onclick = () => {
            localStorage.setItem("tutorial", "0");
            startTutorial(() => { });
        };
    }

    if (cb) {
        tutorialCallback = cb;
    }

    if (shouldShowTutorial()) {
        finished = false;
        currentIndex = -1;

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
            if (finished) return;

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
    finished = true;

    for (const tutorial of tutorials) {
        showBtn(tutorial.btn);
    }

    currentIndex = tutorials.length;

    if (tutorialMain) {
        tutorialMain.classList.remove("start");
    }

    if (helpButton) {
        helpButton.classList.remove("hidden");
    }

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