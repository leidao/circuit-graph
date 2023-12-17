/*
 * @Description:
 * @Author: ldx
 * @Date: 2023-11-15 12:19:56
 * @LastEditors: ldx
 * @LastEditTime: 2023-12-17 10:58:17
 */
import { Matrix3 } from '../math/matrix3'
import { Vector2 } from '../math/vector2'
import { Img } from '../objects/img'
import { Layer } from '../objects/layer'
import { Object2D } from '../objects/object2D'
import { Camera } from './camera'

type SceneType = {
  container: HTMLDivElement
  autoClear?: boolean
  autoCenter?: boolean
}
/** 场景的参数 */
export const sceneParam = {} as SceneType
export class Scene extends Layer {
  width!: number
  height!: number
  /** 容器 */
  container!: HTMLDivElement
  /** 相机 */
  camera = new Camera()
  /** 是否自动清理画布 */
  autoClear = true
  /** 是否自动居中画布 */
  autoCenter = true
  // 类型
  readonly isScene = true

  constructor(attr: SceneType) {
    Object.assign(sceneParam, attr)
    super()
    this.setOption(attr)
    if (this.autoCenter) {
      const { viewportWidth, viewportHeight } = this.getViewPort()
      this.camera.position.set(viewportWidth / 2, viewportHeight / 2)
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
