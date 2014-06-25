(function (undefined) {
    "use strict";
    var
        isArray = Array.isArray || function (v) {
            return Object.prototype.toString.call(v) === "[object Array]";
        },

        isFunction = function (v) {
            return Object.prototype.toString.call(v) === "[object Function]"
        },

        emptyMaker = function () {
            return Array.prototype.slice.call(arguments);
        },

        versionCounter = 0;

    /**
     * Cell function constructor
     * @param {Array.<XCell>} [parents]
     * @param {function(...*):*} [maker]
     * @returns {XCell}
     */
    var Cell = function (parents, maker) {
        return new XCell(
            isArray(parents) ? parents : [],
            isFunction(maker) ? maker : emptyMaker
        );
    };

    /**
     * Cell object
     * @param {Array.<XCell>} parents
     * @param {function} maker
     * @constructor
     */
    var XCell = function (parents, maker) {
        var value,
            listeners = [],
            version = versionCounter,
            self = this;

        /**
         * Get current value
         * @returns {*}
         */
        this.value = function () {
            if (parents.length == 0) return value;
            var args = [], i;
            for (i = 0; i < parents.length; i++) args.push(parents[i].value());
            return maker.apply(this, args);
        };

        var updateListeners = function (val) { for (var i = 0; i < listeners.length; i++) listeners[i].call(null, val, version); };

        /**
         * Set value for scalar (without parents) cell
         * @param {*} x
         * @returns {XCell}
         */
        this.set = function (x) {
            if (parents.length == 0) {
                value = x;
                version = ++versionCounter;
            }
            updateListeners(this.value());
            return this;
        };

        /**
         * Function foo handles cell update
         * @param {function(*)} foo
         * @returns {XCell}
         */
        this.onValue = function (foo) {
            listeners.push(foo);
            var v = this.value();
            if (v !== undefined) foo.call(null, v, version);
            return this;
        };

        this.listen = this.onValue;

        this.unListen = function (foo) {
            for (var i = 0; i < listeners.length; i++) {
                if (foo === listeners[i]) {
                    listeners.splice(i, 1);
                    break;
                }
            }
            return this;
        };

        /**
         * Same as onValue, but value of cell treated as array and passed to foo as arguments
         * @param {function(...*)} foo
         * @returns {XCell}
         */
        this.onValues = function (foo) {
            return this.onValue(function (a) { foo.apply(null, a); });
        };

        //// Listening to parents ////
        for (var i = 0; i < parents.length; i++) {
            parents[i].onValue(function (_, ver) {
                if (ver > version) {
                    version = ver;
                    updateListeners(self.value());
                }
            });
        }
    };

    /////////////////////////////////////////
    // Service prototype methods
    /////////////////////////////////////////

    /**
     * Returns a new cell with the values filtered by foo
     * Foo is function returns boolean
     * @param {function(*):boolean} foo
     * @returns {XCell}
     */
    XCell.prototype.filter = function (foo) {
        var cell = Cell();
        this.onValue(function (v) {
            if (foo(v)) cell.set(v);
        });
        return cell;
    };

    /**
     * Returns a new cell with the values modified by foo
     * @param {function(*):*|*} foo
     * @returns {XCell}
     */
    XCell.prototype.map = function (foo) {
        if (isFunction(foo)) {
            return Cell([this], foo);
        } else {
            return Cell([this], function () { return foo; });
        }
    };

    /**
     * Returns a new cell with values, selected from initial values by query
     * Query is a string started with dot like ".foo", ".foo.bar", ".foo.0.bar"
     * @param {string} query
     * @returns {XCell}
     */
    XCell.prototype.select = function (query) {
        if (typeof query == "string" && query.charAt(0) == ".") {
            var parts = query.substr(1).split(".");
            return Cell([this], function (v) {
                for (var i = 0; i < parts.length; i++) {
                    if (v instanceof Object && parts[i] in v) {
                        v = v[parts[i]];
                    } else {
                        return undefined;
                    }
                }
                return v;
            });
        } else {
            return Cell([this], function () { return undefined; })
        }
    };

    //noinspection JSUnusedGlobalSymbols
    /**
     * Fold cell values with given seed value and accumulator function foo
     * @param {*} seed
     * @param {function(*, *):*} foo
     * @returns {XCell}
     */
    XCell.prototype.fold = function (seed, foo) {
        var self = this;
        return Cell.construct(function (cell) {
            cell.set(seed);
            self.onValue(function (v) { cell.set(foo(cell.value(), v)); });
        });
    };

    /**
     * Bypasses values no more than once per timeout (ms)
     * @param {number} timeout
     * @returns {XCell}
     */
    XCell.prototype.throttle = function (timeout) {
        var timer = null,
            fired = false,
            value = null,
            cell = Cell(),
            handler = function (v) {
                if (timer) {
                    fired = true;
                    value = v;
                } else {
                    fired = false;
                    cell.set(v);
                    timer = setTimeout(function () {
                        timer = null;
                        if (fired) handler(value);
                    }, timeout);
                }
            };
        this.onValue(handler);
        return cell;
    };

    /**
     * @param {function(*):XCell} foo
     * @returns {XCell}
     */
    XCell.prototype.flatMapLatest = function (foo) {
        var
            outCell = Cell(),
            prevCell = null,
            handler = function (x) { outCell.set(x); };

        this.onValue(function (v) {
            if (prevCell != null) prevCell.unListen(handler);
            prevCell = foo(v).listen(handler);
        });
        return outCell;
    };

    /////////////////////////////////////////
    // 'Static' methods
    /////////////////////////////////////////

    /**
     * Creates cell and initialises it with function foo
     * @param {function(XCell)} foo
     * @returns {XCell}
     */
    Cell.construct = function (foo) {
        var cell = Cell();
        foo.call(cell, cell);
        return cell;
    };

    /**
     *
     * @param {HTMLElement} input
     * @param {string} eventName
     * @param {string} property
     */
    Cell.fromInput = function (input, eventName, property) {
        eventName = eventName || "input";
        property = property || "value";
        var cell = Cell().set(input[property]);
        if ("addEventListener" in input) {
            input.addEventListener(eventName, function () { cell.set(input[property]); });
        } else {
            input.attachEvent("on" + eventName, function () { cell.set(input[property]); });
        }
        return cell;
    };

    /////////////////////////////////////////
    // THE END //
    /////////////////////////////////////////

    Cell.fn = XCell.prototype;

    var _Cell = window.Cell;
    window.Cell = Cell;
    Cell.noConflict = function () {
        if (window.Cell === Cell) {
            window.Cell = _Cell;
        }
        return Cell;
    };
})();

