/*
 * @Description:
 * @Author: ldx
 * @Date: 2023-11-15 12:21:19
 * @LastEditors: ldx
 * @LastEditTime: 2023-12-18 16:27:10
 */
import { Camera, dpr } from '../core/camera'
import { sceneParam } from '../core/scene'
import { Matrix3 } from '../math/matrix3'
import { Vector2 } from '../math/vector2'
import { Group } from './group'
import { Img } from './img'
import { Object2D, Object2DType } from './object2D'
export class Layer extends Group {
  // 类型
  readonly isLayer = true
  /** canvas元素 */
  domElement!: HTMLCanvasElement
  /** canvas 上下文对象 */
  ctx!: CanvasRenderingContext2D
  camera!: Camera

  constructor(attr: Object2DType = {}) {
    super()
    if (!sceneParam.container) {
      throw new Error('请在初始化Laye之前先初始化Scene')
    }
    this.setOption(attr)
    this.setOption(sceneParam)
    this.domElement = document.createElement('canvas')
    this.domElement.style.position = 'absolute'
    this.domElement.style.left = '0px'
    this.domElement.style.top = '0px'
    sceneParam.container.appendChild(this.domElement)
    const width = sceneParam.container.clientWidth
    const height = sceneParam.container.clientHeight
    this.setViewPort(width, height)
  }
  /* 设置属性 */
  setOption(attr: Object2DType) {
    Object.assign(this, attr)
  }
  /** 设置视口大小 */
  setViewPort(width = 300, height = 150) {
    this.domElement.style.width = width + 'px'
    this.domElement.style.height = height + 'px'
    this.domElement.width = width * dpr
    this.domElement.height = height * dpr
    this.ctx = this.domElement.getContext('2d') as CanvasRenderingContext2D
  }
  /** 获取视口大小 */
  getViewPort() {
    return {
      width: this.domElement.width,
      height: this.domElement.height,
      viewportWidth: this.domElement.clientWidth,
      viewportHeight: this.domElement.clientHeight
    }
  }
  /*  渲染 */
  async render() {
    const { ctx, children, autoClear, camera } = this
    const { width, height } = this.getViewPort()

    ctx.save()
    // 清理画布
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    autoClear && ctx.clearRect(0, 0, width, height)

    this.computeBoundingBox()

    // 判断layer内的图形是否都在视口内
    const viewportBounds = this.viewportBounds
    const flag = this.isGrapBounshInViewport(this, viewportBounds)
    if (!flag) return

    // 渲染子对象
    for (let i = 0; i < children.length; i++) {
      const obj = children[i]
      ctx.save()
      // 视图投影矩阵
      obj.enableCamera && camera.transformInvert(ctx)
      // 绘图
      obj.draw(ctx)
      ctx.restore()
    }

    ctx.restore()
  }
}
