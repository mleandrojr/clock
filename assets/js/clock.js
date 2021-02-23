class Clock {

    /**
     * Sets the smooth pointers status.
     *
     * @author Marcos Leandro
     * @since  2020-02-18
     *
     * @param  {Bool}
     */
    smoothPointers = true;

    /**
     * Stores the pointers current degrees.
     *
     * @author Marcos Leandro
     * @since  2021-02-18
     *
     * @param  {Object}
     */
    currentDegrees = {};

    /**
     * Stores the digital display status.
     *
     * @author Marcos Leandro
     * @since  2021-02-20
     */
    displayActive = true;

    /**
     * Alarm pointer degrees.
     *
     * @author Marcos Leandro
     * @since  2021-02-20
     *
     * @param  {Number}
     */
    alarmDegrees = 0;

    /**
     * Stores the alarm status.
     *
     * @author Marcos Leandro
     * @since  2021-02-20
     *
     * @param  {Bool}
     */
    alarmActive = false;

    /**
     * Stores whether the clock is in
     * half step or not.
     * It's important to control colons
     * status.
     *
     * @author Marcos Leandro
     * @since  2021-02-20
     */
    halfstep = false;

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
     * Display updating interval.
     *
     * @author Marcos Leandro
     * @since  2021-02-20
     */
    displayInterval;

    /**
     * Object constructor.
     *
     * @author Marcos Leandro
     * @since  2021-02-18
     */
    constructor() {
        this.addScrollListeners();
        this.addAlarmButtonListeners();
        this.interval = setInterval(() => { this.update() }, 500);
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
        this.alarm(degrees);

        if (this.displayActive) {
            this.updateDigitalClock(time, !this.halfStep);
        }
    }

    /**
     * Evaluates the alarm.
     *
     * @author Marcos Leandro
     * @since  2021-02-20
     *
     * @param {Object} degrees
     */
    alarm(degrees) {

        /*
         * Verifies if it's time to play the alarm.
         */
        let start = this.alarmDegrees;
        let end   = this.alarmDegrees + .25;

        if (this.alarmActive && (degrees.hours >= start && degrees.hours <= end)) {
            this.playAlarm();
            return;
        }

        /*
         * Plays a beep on each hour.
         */
        if (degrees.minutes == 0 && degrees.seconds == 0) {
            this.playAlarm();
        }
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
            this.halfStep = true;
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
        this.halfStep = false;

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
    updateDigitalClock(time, colonStatus) {

        let hours   = time.hours.toString().padStart(2, "0");
        let minutes = time.minutes.toString().padStart(2, "0");
        let seconds = time.seconds.toString().padStart(2, "0");

        document.querySelector(".clock__digital-hours").innerHTML   = hours;
        document.querySelector(".clock__digital-minutes").innerHTML = minutes;
        document.querySelector(".clock__digital-seconds").innerHTML = seconds;

        let colon = document.getElementsByClassName("clock__digital-colon");

        for (let i = 0, length = colon.length; i < length; i++) {
            colon[i].style.opacity = colonStatus ? 1 : 0;
        }
    }

    /**
     * Writes a message on display.
     *
     * @author Marcos Leandro
     * @since  2021-02-22
     *
     * @param {String} message
     * @param {Bool}   colonStatus
     */
    displayWrite(message, colonStatus) {

        if (message.length > 6) {
            throw "Message overflow.";
        }

        this.displayActive = false;

        let object = {
            hours: message.substring(0, 2).replace(/\s/g, "&nbsp;"),
            minutes: message.substring(2, 4).replace(/\s/g, "&nbsp;"),
            seconds: message.substring(4, 6).replace(/\s/g, "&nbsp;")
        }

        clearTimeout(this.displayInterval);

        this.displayInterval = setTimeout(() => {
            this.displayActive = true;
        }, 2000);

        this.updateDigitalClock(object, colonStatus);
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
     * Adjusts the alarm.
     *
     * @author Marcos Leandro
     * @since  2021-02-20
     *
     * @param {Event} e
     */
    adjustAlarm = (e) => {

        this.alarmDegrees += e.deltaY > 0 ? .5 : -.5;

        /*
         * We don't want a negative value because
         * the time is ALWAYS positive, so we
         * calculate the difference.
         */
        if (this.alarmDegrees < 0) {
            this.alarmDegrees = 360 - this.alarmDegrees;
        }

        let degrees = this.alarmDegrees % 360;
        let pointer = document.querySelector(".clock__pointer-alarm");

        if (!pointer) {
            return;
        }

        pointer.style.transform = "translate(-50%, 0) rotate(" + degrees + "deg)";

        let minutes = this.alarmDegrees * 2 % 60;
        let hours   = (this.alarmDegrees * 2 / 60) % 12;

        if (hours < 1) {
            hours = 12;
        }

        let message =
            Math.floor(hours).toString().padStart(2, "0") +
            Math.floor(minutes).toString().padStart(2, "0") +
            "00";

        this.displayWrite(message, true);
    }

    /**
     * Plays the alarm.
     *
     * @author Marcos Leandro
     * @since  2021-02-20
     */
    playAlarm() {

        try {

            document.querySelector(".clock__alarm-sound")
                .play()
                .catch(function(err) {});

        } catch (err) {
            document.querySelector(".clock__alarm-sound").play();
        }
    }

    /**
     * Toggles the alarm.
     *
     * @author Marcos Leandro
     * @since  2021-02-22
     */
    toggleAlarm = (e) => {

        e.preventDefault();

        this.alarmActive = !this.alarmActive;

        if (this.alarmActive) {
            this.displayWrite("AL  ON", false);
            return;
        }

        this.displayWrite("AL OFF", false);
    }

    /**
     * Adds the scroll listeners.
     *
     * @author Marcos Leandro
     * @since  2021-02-20
     */
    addScrollListeners() {
        document.addEventListener("wheel", this.adjustAlarm);
    }

    /**
     * Adds the alarm button listeners.
     *
     * @author Marcos Leandro
     * @since  2021-02-22
     */
    addAlarmButtonListeners() {
        let buttons = document.getElementsByClassName("clock__button-alarm");
        for (let i = 0, length = buttons.length; i < length; i++) {
            buttons[i].addEventListener("mousedown", this.toggleAlarm);
        }
    }
};

let clock = new Clock();
