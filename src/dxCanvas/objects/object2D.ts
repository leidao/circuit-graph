/*
 * @Description:
 * @Author: ldx
 * @Date: 2023-11-15 12:19:56
 * @LastEditors: ldx
 * @LastEditTime: 2023-12-19 15:13:04
 */
import { EventDispatcher } from '../core/eventDispatcher'
import { Scene } from '../core/scene'
import { generateUUID } from '../math/mathUtils.js'
import { Matrix3 } from '../math/matrix3'
import { Vector2 } from '../math/vector2'
import { Group } from './group'
import { Layer } from './layer'
import { crtPath } from './objectUtils'

export type Object2DType = {
  position?: Vector2
  rotate?: number
  scale?: Vector2
  visible?: boolean
  index?: number
  name?: string
  parent?: Scene | Layer | Group | undefined
  enableCamera?: boolean
  userData?: { [key: string]: any }
  [key: string]: any
}

type boundingBox = {
  min: Vector2
  max: Vector2
}
export abstract class Object2D extends EventDispatcher {
  /** 自定义属性 */
  [key: string]: any
  /** 位置 */
  position = new Vector2()
  /** 旋转 */
  rotate = 0
  /** 缩放 */
  scale = new Vector2(1, 1)
  /** 可见性 */
  visible = true
  /** 渲染顺序 */
  index = 0
  /** 名称 */
  name = ''
  /** 父级 */
  parent: Scene | Layer | Group | undefined
  /** 是否受相机影响-只适用于Scene的children元素 */
  enableCamera = true
  /** UUID */
  uuid = generateUUID()
  /** 自定义数据 */
  userData: { [key: string]: any } = {}
  /** 包围盒 */
  boundingBox = {
    min: new Vector2(),
    max: new Vector2()
  }
  /** 类型 */
  readonly isObject2D = true

  /* 本地模型矩阵 */
  get matrix(): Matrix3 {
    const { position, rotate, scale } = this
    return new Matrix3()
      .scale(scale.x, scale.y)
      .rotate(rotate)
      .translate(position.x, position.y)
  }
  /* 世界模型矩阵 */
  get worldMatrix(): Matrix3 {
    const { parent, matrix } = this
    if (parent && parent instanceof Object2D) {
      return parent.worldMatrix.multiply(matrix)
    } else {
      return matrix
    }
  }

  /* pvm 投影视图模型矩阵 */
  get pvmMatrix(): Matrix3 {
    const layer = this.getLayer()

    if (layer) {
      const { camera } = layer
      // console.log('layer', camera.pvMatrix, this.worldMatrix)
      return new Matrix3().multiplyMatrices(camera.pvMatrix, this.worldMatrix)
    } else {
      return this.worldMatrix
    }
  }

  /* 总缩放量 */
  get worldScale(): Vector2 {
    const { scale, parent } = this
    if (parent && parent instanceof Object2D) {
      return scale.clone().multiply(parent.worldScale)
    } else {
      return scale
    }
  }
  /** 视口范围 */
  get viewportBounds() {
    const scene = this.getScene()
    if (!scene) return { min: new Vector2(), max: new Vector2() }
    const { viewportHeight, viewportWidth } = scene.getViewPort()
    const viewportMin = scene.canvasToCoord(0, 0)
    const viewportmax = scene.canvasToCoord(viewportWidth, viewportHeight)
    return {
      min: viewportMin,
      max: viewportmax
    }
  }

  /* 先变换(缩放+旋转)后位移 */
  transform(ctx: CanvasRenderingContext2D) {
    const { position, rotate, scale } = this
    // translate/rotate/scale执行顺序，从后往前执行
    ctx.translate(position.x, position.y)
    ctx.rotate(rotate)
    ctx.scale(scale.x, scale.y)
  }

  /* 从父级中删除自身 */
  remove() {
    const { parent } = this
    if (!parent) return
    if (parent instanceof Scene) {
      parent.remove(this as unknown as Layer)
    } else {
      parent.remove(this as unknown as Object2D)
    }
  }
  show() {
    this.visible = true
  }
  hide() {
    this.visible = false
  }

  /* 获取图层 */
  getLayer(): Layer | null {
    if ('isLayer' in this) {
      return this as unknown as Layer
    } else if (this.parent && this.parent instanceof Object2D) {
      return this.parent.getLayer()
    } else {
      return null
    }
  }
  /* 获取场景 */
  getScene(): Scene | null {
    if ('isScene' in this) {
      return this as unknown as Scene
    } else if (this.parent && this.parent instanceof Object2D) {
      return this.parent.getScene()
    } else if (this.parent && this.parent instanceof Scene) {
      return this.parent
    } else {
      return null
    }
  }

  /* 绘图 */
  draw(ctx: CanvasRenderingContext2D) {
    if (!this.visible) {
      return
    }
    // 判断图形是否在视口内
    const viewportBounds = this.viewportBounds
    const flag = this.isGrapBounshInViewport(this, viewportBounds)
    if (!flag) return

    ctx.save()
    /*  矩阵变换 */
    this.transform(ctx)
    /* 绘制图形 */
    this.drawShape(ctx)

    ctx.restore()
  }

  /* 绘制图像边界 */
  crtPath(ctx: CanvasRenderingContext2D) {
    const {
      boundingBox: {
        min: { x: x0, y: y0 },
        max: { x: x1, y: y1 }
      }
    } = this
    crtPath(ctx, [x0, y0, x1, y0, x1, y1, x0, y1], true)
    ctx.stroke()
  }
  /** 点位是否在包围盒 */
  isPointInBounds({ x, y }: Vector2, boundingBox = this.boundingBox) {
    const {
      min: { x: x0, y: y0 },
      max: { x: x1, y: y1 }
    } = boundingBox
    return x >= x0 && x <= x1 && y >= y0 && y <= y1
  }

  /** 图形的包围盒是否在视口内 */
  isGrapBounshInViewport(obj: Object2D, viewportBounds: boundingBox) {
    const { boundingBox } = obj
    return this.isBoundingBoxIntersect(viewportBounds, boundingBox)
  }
  /** 判断两个包围盒是否相交 */
  isBoundingBoxIntersect(box1: boundingBox, box2: boundingBox) {
    return (
      box1.min.x <= box2.max.x &&
      box1.max.x >= box2.min.x &&
      box1.min.y <= box2.max.y &&
      box1.max.y >= box2.min.y
    )
  }

  /* 绘制图形-接口 */
  abstract drawShape(ctx: CanvasRenderingContext2D): void
  /** 获取包围盒 */
  abstract computeBoundingBox(): void
  /** 点位是否在图形中 */
  abstract isPointInGraph(point: Vector2): Object2D | false
}
