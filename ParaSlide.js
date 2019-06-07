/*
 *  ParaSlide.js v1.1.0
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

    function ParaSlide(el, cfg) {
            let that = this;

            el = document.querySelector(el);
            if (!el) {
                // ERROR
                return;
            }
            let elStyle = el.style;

            let handlers = [];
            let handlerFuncs = [];

            this.frametime = cfg.frametime || 10;
            this.width = cfg.width || 0;
            this.height = cfg.height || 0;
            this.x = cfg.x || 0;
            this.y = cfg.y || 0;

            let progressStart = 0;
            let progressDone = 0;
            let progressAll = 0;
            let progressLast = 0;

            let updateObject = function() {
                //elStyle.transform = 'translate3d(' + that.x + 'px, ' + that.y + 'px, 0)';
                elStyle.transform = `translate3d(${that.x}px, ${that.y}px, 0)`;
            };

            let sumHandler = function(sum, func, i) {
                let add = func();
                return [
                    sum[0] + add[0],
                    sum[1] + add[1]
                ];
            };

            let animateStep = (timestamp) => {
                if (!progressStart) progressStart = timestamp;
                progressAll = timestamp - progressStart;
                progressDone = progressAll - progressLast;
                let progressOver = progressDone - that.frametime;
                if (progressOver >= 0) {
                    let add = handlers.reduce(sumHandler, [0,0]);
                    that.x += add[0];
                    that.y += add[1];
                    if (that.width)     that.x = (that.x - that.width) % that.width;
                    if (that.height)    that.y = (that.y - that.height) % that.height;
                    updateObject();
                    progressLast = progressAll;
                }
                window.requestAnimationFrame(animateStep);
            };

            this.addHandler = function(userFunc) {
                userFunc = userFunc.bind(that);
                let ret = {
                    "index": handlerFuncs.length,
                    "enabled": true,
                    "factorX": 1,
                    "factorY": 0
                };
                let callFunc = function(...args) {
                    let add = ret.enabled ? userFunc(progressDone, progressAll) : 0;
                    return [
                        add * ret.factorX,
                        add * ret.factorY
                    ];
                };
                handlerFuncs.push(callFunc);
                handlers.push(callFunc);
                return ret;
            };

            this.removeHandler = function(res) {
                if (res.index !== undefined) {
                    let func = handlerFuncs[res.index];
                    if (func) {
                        let i = handlers.indexOf(func);
                        if (i !== -1) {
                            handlers.splice(i, 1);
                            handlerFuncs[res.index] = null;
                        }
                    }
                }
            };

            updateObject();
            window.requestAnimationFrame(animateStep);
    }

    ParaSlide.prototype.addSinusHandler = function(duration, steps, callback) {
        let doneTime = 0;
        let doneValue = 0;
        let stepFactor = duration / steps;
        let sin = Math.sin;
        return this.addHandler(function(done, all) {
            doneTime += done;
            let addValue = doneTime / stepFactor;
            if (doneTime < duration) {
                addValue = sin(addValue) - doneValue;
                doneValue += addValue;
            } else {
                doneTime = 0;
                addValue = -doneValue;
                doneValue = 0;
                if (callback) setTimeout(function() {
                    callback.call(this);
                }.bind(this), 1);
            }
            return addValue;
        });
    };

    ParaSlide.prototype.addLinearHandler = function(timeFactor) {
        return this.addHandler(function(done, all) {
            return timeFactor * done;
        });
    };

    ParaSlide.prototype.addTimedHandler = function(value, time, callback) {
        let timeFactor = value / time;
        let timeDone = 0;
        return this.addHandler(function(done, all) {
            timeDone += done;
            if (timeDone >= time) {
                done = time - (timeDone - done); // do the rest pixels
                timeDone = 0;
                if (callback) setTimeout(function() {
                    callback.call(this);
                }.bind(this), 1);
            }
            return timeFactor * done;
        });
    };

    return ParaSlide;
});

