let tutorialConfirm, tutorialText, tutorialMain, tutorialStandard;

let tutorials = [{
    el: ".tutorial--move",
    text: "Você pode mover a taça passando o dedo na tela."
}, {
    el: ".tutorial--change-camera",
    text: "Toquem no botão na parte superior esquerda para mudar a camera."
}, {
    el: ".tutorial--zoom",
    text: "Toquem nos botões da esquerda e direita para dar zoom na taça."
}, {
    el: ".tutorial--picture",
    text: "Toquem no botão na parte inferior para tirar uma foto."
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

            tutorialText.innerHTML = tutorial.text;
            tutorialStandard.classList.add("show");
        }, 500);
    } else {
        finishTutorial();
    }
}

function finishTutorial() {
    if (tutorialMain)
        tutorialMain.remove();
    tutorialMain = null;
    localStorage.setItem("tutorial", "1");
    tutorialCallback();
}