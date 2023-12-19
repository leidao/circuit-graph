/*
 * @Description: 动画
 * @Author: ldx
 * @Date: 2023-12-11 15:03:42
 * @LastEditors: ldx
 * @LastEditTime: 2023-12-19 10:50:43
 */

import { Clock } from './clock'

class Animation {
  animationId: number | null = null
  stopAnimation = false
  fn: (time: number) => void
  clock = new Clock()
  constructor(fn: (time: number) => void) {
    this.fn = fn
  }
  start = () => {
    if (this.stopAnimation) return
    const time = this.clock.getElapsedTime()
    this.fn(time)
    this.animationId = requestAnimationFrame(this.start)
  }
  stop = () => {
    this.stopAnimation = true
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
    }
    this.stopAnimation = false
  }
}

export { Animation }
