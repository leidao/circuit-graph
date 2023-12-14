/*
 * @Description: 时间
 * @Author: ldx
 * @Date: 2023-12-11 14:58:09
 * @LastEditors: ldx
 * @LastEditTime: 2023-12-11 14:58:13
 */
class Clock {
  autoStart:boolean
  startTime = 0
  oldTime = 0
  elapsedTime = 0
  running = false;
  constructor(autoStart = true) {

    this.autoStart = autoStart;

  }

  start() {

    this.startTime = now();

    this.oldTime = this.startTime;
    this.elapsedTime = 0;
    this.running = true;

  }

  stop() {

    this.getElapsedTime();
    this.running = false;
    this.autoStart = false;

  }

  getElapsedTime() {

    this.getDelta();
    return this.elapsedTime;

  }

  getDelta() {

    let diff = 0;

    if (this.autoStart && !this.running) {

      this.start();
      return 0;

    }

    if (this.running) {

      const newTime = now();

      diff = (newTime - this.oldTime) / 1000;
      this.oldTime = newTime;

      this.elapsedTime += diff;

    }

    return diff;

  }

}

function now() {

  return (typeof performance === 'undefined' ? Date : performance).now(); // see #10732

}

export { Clock };
