class Clock {

    /**
     * Sets the smooth pointers status.
     *
     * @author Marcos Leandro
     * @since  2020-02-18
     *
     * @param {Bool}
     */
    smoothPointers = true;

    /**
     * Stores the pointers current degrees.
     *
     * @author Marcos Leandro
     * @since  2021-02-18
     *
     * @param {Object}
     */
    currentDegrees = {};

    /**
     * Clock updating interval.
     *
     * @author Marcos Leandro
     * @since  2021-02-18
     *
     * @param  {Interval}
     */
    interval;

    /**
     * Object constructor.
     *
     * @author Marcos Leandro
     * @since  2021-02-18
     */
    constructor() {

        /*
         * Adds the listeners to the checkbox
         * that will control the pointers behavior.
         */
        this.addPointersToggleListeners();

        /**
         * Defines the clock updating interval.
         *
         * We need to use arrow functions here
         * because the simple method call causes
         * loss of (this) context.
         *
         * We're updating the clock every 500 milisseconds (half second)
         * because the pointers behavior changing effect freezes the clock
         * for a bit.
         */
        this.interval = setInterval(() => { this.update() }, 500);
    }

    /**
     * Toggles the smooth pointers.
     *
     * @author Marcos Leandro
     * @since  2021-02-18
     */
    toggleSmoothPointers() {
        this.smoothPointers = !this.smoothPointers;
    }

    /**
     * Updates the pointers behavior.
     * We need to use an arrow funcion here
     * because we need to keep the context.
     *
     * @author Marcos Leandro
     * @since  2021-02-19
     *
     * @param {Event} e
     */
    updatePointersBehavior = (e) => {

        e.preventDefault();

        let target = e.currentTarget;
        this.smoothPointers = target.checked;
    }

    /**
     * Clock updating method.
     *
     * @author Marcos Leandro
     * @since  2021-02-18
     */
    update() {

        let time    = this.getTime();
        let degrees = this.getDegrees(time);

        this.updatePointer(".clock__pointer-seconds", degrees.seconds);
        this.updatePointer(".clock__pointer-minutes", degrees.minutes);
        this.updatePointer(".clock__pointer-hours", degrees.hours);
        this.updateDigitalClock(time);
    }

    /**
     * Updates the pointer position.
     *
     * @author Marcos Leandro
     * @since  2020-02-18
     *
     * @param {Element} selector
     * @param {Number}  degrees
     */
    updatePointer(selector, degrees) {

        /*
         * If the pointer is getting to the degree 0,
         * we add one more degree to avoid the pointer spin.
         * This happens because 0 is less than 354, so the
         * pointer goes anti-clockwise.
         * We will fix the pointer position later.
         *
         * Do you want to see this spin? Just comment the
         * condition below.
         */
        if (degrees == 0) {
            degrees = 360;
        }

        /*
         * We are storing the current pointer position
         * and will return if the new position is the same
         * as the current.
         * It saves resources and fixes a little bug with
         * spinning pointer caused by the condition above. p=
         */
        if (degrees == this.currentDegrees[selector]) {
            return;
        }

        /*
         * If the pointer doesn't exists, we just return.
         */
        let pointer = document.querySelector(selector);
        if (!pointer) {
            return;
        }

        /*
         * We re-enable the wobbling effect everytime the
         * pointer is updated, just in case it's disabled.
         */
        pointer.classList.toggle("no-transition", false);
        pointer.style.transform = "translate(-50%, 0) rotate(" + degrees + "deg)";

        /*
         * We save the current pointer degree here.
         */
        this.currentDegrees[selector] = degrees;

        /*
         * Here we fix the pointer position to 360 to 0 degrees.
         * To do this without users perception, we need to
         * disable the pointer wobbling effect first.
         *
         * It runs 400 milisseconds after the pointer
         * update, because the pointer's effect has a
         * 300 milissecond duration.
         *
         * We will not re-enable the effect here because
         * it will be fired with the pointer spinning.
         */
        if (degrees == 360) {
            setTimeout(() => {
                pointer.classList.toggle("no-transition", true);
                pointer.style.transform = "translate(-50%, 0) rotate(0deg)";
            }, 400);
        }
    }

    /**
     * Updates the digital clock.
     *
     * @author Marcos Leandro
     * @since  2021-02-18
     *
     * @param {Object} time
     */
    updateDigitalClock(time) {

        document.querySelector(".clock__digital-hours").innerHTML   = time.hours.toString().padStart(2, "0");
        document.querySelector(".clock__digital-minutes").innerHTML = time.minutes.toString().padStart(2, "0");
        document.querySelector(".clock__digital-seconds").innerHTML = time.seconds.toString().padStart(2, "0");

        let colon = document.getElementsByClassName("clock__digital-colon");
        for (let i = 0, length = colon.length; i < length; i++) {
            colon[i].style.opacity = Math.abs(parseInt(colon[i].style.opacity || 0) - 1);
        }
    }

    /**
     * Returns the pointer degrees.
     *
     * @author Marcos Leandro
     * @since  2021-02-18
     *
     * @return {Object}
     */
    getDegrees(time) {

        let result = {
            hours   : time.hours % 12 * 30,
            minutes : time.minutes * 6,
            seconds : time.seconds * 6
        };

        if (this.smoothPointers) {
            result.minutes += (result.seconds / 360 * 6);
            result.hours   += (result.minutes / 360 * 30);
        }

        return result;
    }

    /**
     * Returns the current time.
     *
     * @author Marcos Leandro
     * @since  2021-02-18
     *
     * @return {Object}
     */
    getTime() {

        let date = new Date();

        let result = {
            hours   : date.getHours(),
            minutes : date.getMinutes(),
            seconds : date.getSeconds()
        };

        return result;
    }

    /**
     * Adds the pointers behavior checkbox listeners.
     *
     * @author Marcos Leandro
     * @since  2021-02-19
     */
    addPointersToggleListeners() {
        let element = document.getElementById("smoothPointersToggle");
        if (element) {
            element.addEventListener("change", this.updatePointersBehavior);
        }
    }
};

let clock = new Clock();
