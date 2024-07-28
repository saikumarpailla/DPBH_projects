var Gear = (function (fnST, fnCT, fnSI, fnCI, fnDt, global) {
    var iRate = 1;
    var iFreeFrame = 9e9;
    var iLast, iTick;

    var aQueue = [];
    var nQueue = 1;
    var iFlag = 0;

    function addQueue(code, delay, arg, repeat) {
        if (!code) {
            return;
        }

        
        delay = +delay || 0;

        if (delay < 1) {
            delay = 1;
        }

        aQueue[nQueue] = {
            code: code,
            delay: delay,
            arg: arg,
            repeat: repeat,
            sum: 0,
            flag: iFlag,
        };

        return nQueue++;
    }

    function delQueue(id) {
        if (id >= 0) {
            delete aQueue[id];
        }
    }

    function hook() {
        global.setTimeout = setTimeout;
        global.clearTimeout = clearTimeout;
        global.setInterval = setInterval;
        global.clearInterval = clearInterval;
        global.Date = Date;

        for (var i = 0; i < requestFrameName.length; i++) {
            global[requestFrameName[i]] = requestAnimationFrame;
            global[cancelFrameName[i]] = clearTimeout;
        }

        iLast = iTick = +new fnDt();
        tid = fnSI(onTimer, 1);
    }

    function unhook() {
        global.setTimeout = fnST;
        global.clearTimeout = fnCT;
        global.setInterval = fnSI;
        global.clearInterval = fnCI;
        global.Date = fnDt;

        for (var i = 0; i < requestFrameName.length; i++) {
            var k = requestFrameName[i];
            global[k] = requestFrameFn[k];
        }
    }

    function execute(task) {
        var code = task.code;

        if (typeof code == "function") {
            if (execScript) {
                
                code();
            } else {
               
                task.arg ? code.apply(global, task.arg) : code();
            }
        } else {
            if (execScript) {
               
                task.arg ? execScript(code, task.arg[0]) : execScript(code);
            } else {
                
                global.eval(code);
            }
        }
    }

    function onTimer() {
        var cur = +new fnDt();
        var elapse = (cur - iLast) * iRate;

        for (var k in aQueue) {
            var task = aQueue[k];

            
            if (task.flag == iFlag) {
                continue;
            }

           
            task.sum += elapse;

            if (task.repeat) {
                // setInterval
                
                var skip = (task.sum / task.delay) >> 0;

               
                if (skip > 32) {
                    skip = 32;
                }

                
                while (--skip >= 0) {
                    execute(task);
                }

                
                task.sum %= task.delay;
            } else {
                // setTimeout
                if (task.sum >= task.delay) {
                    execute(task);

                    delete aQueue[k];
                    continue;
                }
            }
        }

        iLast = cur;
        iTick += elapse;
        iFlag++;
    }

    var SLICE = [].slice;

    function setTimeout(code, delay, arg) {
        if (arg) {
            arg = SLICE.call(arguments, 2);
        }
        return addQueue(code, delay, arg, false);
    }

    function clearTimeout(id) {
        delQueue(id);
    }

    function setInterval(code, delay, arg) {
        if (arg) {
            arg = SLICE.call(arguments, 2);
        }
        return addQueue(code, delay, arg, true);
    }

    function clearInterval(id) {
        delQueue(id);
    }

    function requestAnimationFrame(cb) {
        return setTimeout(cb, 16);
    }

    var requestFrameName = [],
        requestFrameFn = {},
        cancelFrameName = [],
        cancelFrameFn = {};

    var REQUEST_FRAME = [
        "oRequestAnimationFrame",
        "mozRequestAnimationFrame",
        "webkitRequestAnimationFrame",
        "msRequestAnimationFrame",
        "requestAnimationFrame",
    ];

    var CANCEL_FRAME = [
        "cancelAnimationFrame",
        "cancelRequestAnimationFrame",
        "mozCancelAnimationFrame",
        "mozCancelRequestAnimationFrame",
        "webkitCancelAnimationFrame",
        "webkitCancelRequestAnimationFrame",
        "oCancelAnimationFrame",
        "oCancelRequestAnimationFrame",
        "msCancelAnimationFrame",
        "msCancelRequestAnimationFrame",
    ];

    for (var i = REQUEST_FRAME.length - 1; i >= 0; i--) {
        var k = REQUEST_FRAME[i];
        if (global[k]) {
            requestFrameName.push(k);
            requestFrameFn[k] = global[k];
        }

        k = CANCEL_FRAME[i];
        if (global[k]) {
            cancelFrameName.push(k);
            cancelFrameFn[k] = global[k];
        }
    }

    // ==================================================
    // ==================================================
    function Date(y, m, d, h, min, s, ms) {
        if (this instanceof Date) {
            // new Date(...)
            switch (arguments.length) {
                case 0:
                    var cur = +new fnDt();
                    iTick += (cur - iLast) * iRate;
                    iLast = cur;
                    return new fnDt(iTick);

                case 1:
                    return new fnDt(y);
                case 2:
                    return new fnDt(y, m);
                case 3:
                    return new fnDt(y, m, d);
                case 4:
                    return new fnDt(y, m, d, h);
                case 5:
                    return new fnDt(y, m, d, h, min);
                case 6:
                    return new fnDt(y, m, d, h, min, s);
                default:
                    return new fnDt(y, m, d, h, min, s, ms);
            }
        } else {
            
            return STD
                ? new Date().toString()
                : new Date().toString().replace(/UTC.+ /, "");
        }
    }

    if (fnDt.now)
        Date.now = function () {
            var cur = fnDt.now();
            iTick += (cur - iLast) * iRate;
            iLast = cur;
            return Math.round(iTick);
        };

    Date.UTC = fnDt.UTC;
    Date.parse = fnDt.parse;
    Date.prototype = fnDt.prototype;

   
    var nativeFn = typeof fnCT == "object";

    function setup() {
        if (nativeFn) {
            fixNative();
        }
        hook();
    }

    function unsetup() {
        unhook();
    }

    function setRate(rate) {
        iRate = rate;
    }

    function pause() {
        iFreeFrame = 0;
    }

    function resume() {
        iFreeFrame = 9e9;
    }

    function next(count) {
        iFreeFrame = count || 1;
    }

    setup();

    return {
        setup: setup,
        unsetup: unsetup,
        setRate: setRate,
        pause: pause,
        resume: resume,
        next: next,

        rawSetTimeout: nativeFn
            ? fnST
            : function () {
                return fnST.apply(global, arguments);
            },
        rawClearTimeout: nativeFn
            ? fnCT
            : function () {
                return fnCT.apply(global, arguments);
            },
        rawSetInterval: nativeFn
            ? fnSI
            : function () {
                return fnSI.apply(global, arguments);
            },
        rawClearInterval: nativeFn
            ? fnCI
            : function () {
                return fnCI.apply(global, arguments);
            },
    };
})(setTimeout, clearTimeout, setInterval, clearInterval, Date, this);
//init the jsgear
var t = Gear.rawSetInterval(function () {
    Gear.rawClearInterval(t);
}, 20);

Gear.setRate(1000000);
