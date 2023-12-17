/*
 * @Description:
 * @Author: ldx
 * @Date: 2023-11-15 12:21:19
 * @LastEditors: ldx
 * @LastEditTime: 2023-12-17 10:49:49
 */
import { dpr } from '../core/camera'
import { sceneParam } from '../core/scene'
import { Group } from './group'
import { Object2DType } from './object2D'
export class Layer extends Group {
  // 类型
  readonly isLayer = true
  /** canvas元素 */
  domElement!: HTMLCanvasElement
  /** canvas 上下文对象 */
  ctx!: CanvasRenderingContext2D

  constructor(attr: Object2DType = {}) {
    super()
    this.setOption(attr)
    this.domElement = document.createElement('canvas')
    if (!sceneParam.container) {
      throw new Error('请在初始化Laye之前先初始化Scene')
    }
    sceneParam.container.appendChild(this.domElement)
    const width = sceneParam.container.clientWidth
    const height = sceneParam.container.clientHeight
    this.setViewPort(width, height)
  }
  /* 设置属性 */
  setOption(attr: Object2DType) {
    Object.assign(this, attr)
  }
  setViewPort(width = 300, height = 150) {
    this.domElement.style.width = width + 'px'
    this.domElement.style.height = height + 'px'
    this.domElement.width = width * dpr
    this.domElement.height = height * dpr
    this.ctx = this.domElement.getContext('2d') as CanvasRenderingContext2D
  }
  getViewPort() {
    return {
      width: this.domElement.width,
      height: this.domElement.height,
      viewportWidth: this.domElement.clientWidth,
      viewportHeight: this.domElement.clientHeight
    }
  }
}
