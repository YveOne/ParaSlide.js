"use strict";

requirejs([
    "ParaSlide"
], function(ParaSlide) {

    let vw = document.body.clientWidth;
    let vh = document.body.clientHeight;
    let rw = vh / 900 * 1538; // relative width

    /*
     * clouds
    **/

    let cloudSlide = new ParaSlide(document.getElementById("clouds"), {
        "x": 0,
        "width": rw
    });

    let cloudSlowHandler = cloudSlide.addLinearHandler(rw / 90000);
    cloudSlowHandler.enabled = true;
    cloudSlowHandler.factorX = 1;

    let cloudFastHandler = cloudSlide.addLinearHandler(vw / 2000);
    cloudFastHandler.enabled = false;
    cloudFastHandler.factorX = -1;

    let cloudShakeHandler = cloudSlide.addSinusHandler(400, 12, () => {
        cloudShakeHandler.enabled = false;
    });
    cloudShakeHandler.enabled = false;
    cloudShakeHandler.factorX = 2;

    /*
     * windows
    **/

    let windowSlide = new ParaSlide(document.getElementById("windows"), {
        "x": -vw,
        "width": 0
    });

    let windowSlideHandler = windowSlide.addTimedOffsetHandler(vw, 500, () => {
        windowSlideHandler.enabled = false;
        //cloudSlowHandler.enabled = true;
        cloudFastHandler.enabled = false;
    });
    windowSlideHandler.enabled = false;
    windowSlideHandler.factorX = 1;

    let windowShakeHandler = windowSlide.addSinusHandler(400, 12, () => {
        windowShakeHandler.enabled = false;
    });
    windowShakeHandler.enabled = false;
    windowShakeHandler.factorX = 10;

    /*
     * buttons
    **/

    function toLeft() {
        windowSlideHandler.factorX = 1;
        windowSlideHandler.enabled = true;
        cloudFastHandler.factorX = 1;
        cloudFastHandler.enabled = true;
        //cloudSlowHandler.enabled = false;
    }

    function toRight() {
        windowSlideHandler.factorX = -1;
        windowSlideHandler.enabled = true;
        cloudFastHandler.factorX = -1;
        cloudFastHandler.enabled = true;
        //cloudSlowHandler.enabled = false;
    }

    document.getElementById("leftBtn1").addEventListener("click", toLeft);
    document.getElementById("leftBtn2").addEventListener("click", toLeft);
    document.getElementById("rightBtn1").addEventListener("click", toRight);
    document.getElementById("rightBtn2").addEventListener("click", toRight);

    document.getElementById("shakeBtn").addEventListener("click", () => {
        windowShakeHandler.enabled = true;
        cloudShakeHandler.enabled = true;
    });













});
