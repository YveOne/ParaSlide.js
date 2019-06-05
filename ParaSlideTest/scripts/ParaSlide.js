/*
 *  ParaSlide.js v1.0.0
 *  https://github.com/YveOne/ParaSlide.js
 *  https://yveone.com/ParaSlide.js
**/
"use strict";

((name, deps, factory) => {

    // AMD
    if (define && define.amd){
        define(deps, factory);

    // Node.js
    } else if (module && module.exports) {
        module.exports = factory.apply(deps.map(require));

    // Browser
    } else {
        let d, i = 0, global = this, old = global[name], mod;
        while(d = deps[i]){
            deps[i++] = this[d];
        }
        global[name] = mod = factory.apply(deps);
        mod.noConflict = () => {
            global[name] = old;
            return mod;
        };
    }

})("ParaSlide", [], () => {

    return class ParaSlide {

        constructor(el, cfg) {

            let elStyle = el.style;
            let handlers = [];

            let renderTime = 1000 / (cfg.fps || 100);
            let slideWidth = cfg.slideWidth || 0;
            let slideHeight = cfg.slideHeight || 0;
            let x = cfg.initialX || 0;
            let y = cfg.initialY || 0;
            elStyle.transform = 'translate3d(' + x + 'px, ' + y + 'px, 0)';

            let progressStart = 0;
            let progressDone = 0;
            let progressAll = 0;
            let progressLast = 0;

            let sumHandler = (sum, func, i) => {
                let add = func(progressDone, progressAll);
                return [
                    sum[0] + add[0],
                    sum[1] + add[1]
                ];
            };

            let step = (timestamp) => {
                if (!progressStart) progressStart = timestamp;
                progressAll = timestamp - progressStart;
                progressDone = progressAll - progressLast;
                if (progressDone >= renderTime) {
                    let add = handlers.reduce(sumHandler, [0,0]);
                    //if (add) {
                        x += add[0];
                        y += add[1];
                        if (slideWidth) x = (x - slideWidth) % slideWidth;
                        if (slideHeight) y = (y - slideHeight) % slideHeight;
                        elStyle.transform = 'translate3d(' + x + 'px, ' + y + 'px, 0)';
                    //}
                    progressLast = progressAll;
                }
                window.requestAnimationFrame(step);
            };

            this.addHandler = (func) => {
                let ret = {
                    "enabled": true,
                    "factorX": 1,
                    "factorY": 0
                };
                handlers.push((...args) => {
                    let add = ret.enabled ? func.apply(null, args) : 0;
                    return [
                        add * ret.factorX,
                        add * ret.factorY
                    ];
                    //return ret.enabled ? func.apply(null, args) * ret.factor : 0;
                });
                return ret;
            };

            this.addSinusHandler = (duration, steps, callback) => {
                let timeDone = 0;
                let lastValue = 0;
                return this.addHandler((done, all) => {
                    timeDone += done;
                    let doSin = timeDone / (duration/steps);
                    if (timeDone < duration) {
                        doSin = Math.sin( doSin ) - lastValue;
                        lastValue += doSin;
                    } else {
                        timeDone = 0;
                        doSin = -lastValue;
                        lastValue = 0;
                        if (callback) setTimeout(callback, 1);
                    }
                    return doSin;
                });
            };

            this.addLinearHandler = (timeFactor) => {
                return this.addHandler((done, all) => {
                    return timeFactor * done;
                });
            };

            this.addTimedOffsetHandler = (time, offset, callback) => {
                let timeFactor = offset / time;
                let timeDone = 0;
                return this.addHandler((done, all) => {
                    timeDone += done;
                    if (timeDone >= time) {
                        done = time - (timeDone - done); // do the rest pixels
                        timeDone = 0;
                        if (callback) setTimeout(callback, 1);
                    }
                    return timeFactor * done;
                });
            };

            window.requestAnimationFrame(step);
        }

    };

});

