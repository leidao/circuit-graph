/*
 * @Description:
 * @Author: ldx
 * @Date: 2023-11-15 12:19:56
 * @LastEditors: ldx
 * @LastEditTime: 2023-12-16 23:58:45
 */
import { Matrix3 } from '../math/matrix3'
import { Vector2 } from '../math/vector2'
import { Group } from '../objects/group'
import { Img } from '../objects/img'
import { Object2D } from '../objects/object2D'
import { Camera, dpr } from './camera'

type SceneType = {
  domElement?: HTMLCanvasElement
  camera?: Camera
  autoClear?: boolean
  isCenter?: boolean
}

export class Scene extends Group {
  width!: number
  height!: number
  /** canvas画布 */
  _domElement!: HTMLCanvasElement
  /** canvas 上下文对象 */
  ctx!: CanvasRenderingContext2D
  /** 相机 */
  camera = new Camera()
  /** 是否自动清理画布 */
  autoClear = true
  /** 画布是否居中 */
  isCenter = true
  // 类型
  readonly isScene = true

  constructor(attr: SceneType = {}) {
    super()
    this.setOption(attr)

    // this.camera.position.copy(this.position)
  }

  get domElement() {
    return this._domElement
  }
  set domElement(value) {
    if (this._domElement === value) {
      return
    }
    this._domElement = value
    const container = this._domElement.parentElement
    if (!container) return
    const width = container.clientWidth
    const height = container.clientHeight
    this.setViewPort(width, height)
    if (this.isCenter) {
      this.camera.position.set(width / 2, height / 2)
    }
  }
  setViewPort(width: number, height: number) {
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

  /* 设置属性 */
  setOption(attr: SceneType) {
    for (const [key, val] of Object.entries(attr)) {
      this[key] = val
    }
  }

  /*  渲染 */
  async render() {
    const {
      domElement: { width, height },
      ctx,
      camera,
      children,
      autoClear
    } = this
    ctx.save()
    // 清理画布
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    autoClear && ctx.clearRect(0, 0, width, height)
    ctx.fillStyle = '#f4f4f4'
    ctx.fillRect(0, 0, width, height)

    //TODO 缩放不准,需解决
    // this.transform(ctx)

    // 渲染子对象
    for (const obj of children) {
      ctx.save()
      // 视图投影矩阵
      obj.enableCamera && camera.transformInvert(ctx)
      // 绘图
      obj.draw(ctx)
      ctx.restore()
    }

    ctx.restore()
  }

  /* client坐标转canvas坐标 */
  clientToCanvas(clientX: number, clientY: number) {
    const { domElement } = this
    const { left, top } = domElement.getBoundingClientRect()
    return new Vector2(clientX - left, clientY - top)
  }
  /* canvas坐标转client坐标*/
  canvasToClient(x: number, y: number): Vector2 {
    const { domElement } = this
    const { left, top } = domElement.getBoundingClientRect()
    return new Vector2(x + left, y + top)
  }

  /* canvas坐标转裁剪坐标 */
  canvastoClip({ x, y }: Vector2): Vector2 {
    const { position } = this
    return new Vector2(x - position.x, y - position.y)
  }

  /* client坐标转裁剪坐标 */
  clientToClip(clientX: number, clientY: number): Vector2 {
    return this.canvastoClip(this.clientToCanvas(clientX, clientY))
  }
  /* client坐标转相机坐标 */
  clientToCoord(clientX: number, clientY: number): Vector2 {
    const {
      camera: { pvMatrixInvert }
    } = this
    return this.clientToClip(clientX, clientY).applyMatrix3(pvMatrixInvert)
  }
  /** 相机坐标转裁剪坐标 */
  coordToClip(coord: Vector2): Vector2 {
    const {
      camera: { pvMatrix }
    } = this
    return coord.clone().applyMatrix3(pvMatrix)
  }

  /* 基于某个坐标系，判断某个点是否在图形内 */
  isPointInObj(obj: Object2D, mp: Vector2, matrix: Matrix3 = new Matrix3()) {
    const { ctx } = this
    ctx.save()
    ctx.beginPath()
    // 画布缩放了，这里进行矩阵计算时要调整回来
    // ctx.scale(1 / dpr, 1 / dpr)
    obj.crtPath(ctx, matrix)
    ctx.restore()
    return ctx.isPointInPath(mp.x, mp.y)
  }
  /* 选择图案 */
  selectObj(mp: Vector2, imgGroup: Object2D[] = this.children): Img | null {
    for (const img of [...imgGroup].reverse()) {
      if (img instanceof Img && this.isPointInObj(img, mp, img.pvmoMatrix)) {
        return img
      }
    }
    return null
  }
}
