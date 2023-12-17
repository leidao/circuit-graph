/*
 * @Description:
 * @Author: ldx
 * @Date: 2023-11-15 12:19:56
 * @LastEditors: ldx
 * @LastEditTime: 2023-12-17 10:59:24
 */
import { EventDispatcher } from '../core/eventDispatcher'
import { Scene } from '../core/scene'
import { generateUUID } from '../math/mathUtils.js'
import { Matrix3 } from '../math/matrix3'
import { Vector2 } from '../math/vector2'
import { Group } from './group'

export type Object2DType = {
  position?: Vector2
  rotate?: number
  scale?: Vector2
  visible?: boolean
  index?: number
  name?: string
  parent?: Scene | Group | undefined
  enableCamera?: boolean
  userData?: { [key: string]: any }
  [key: string]: any
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
  parent: Scene | Group | undefined
  /** 是否受相机影响-只适用于Scene的children元素 */
  enableCamera = true
  /** UUID */
  uuid = generateUUID()
  /** 自定义数据 */
  userData: { [key: string]: any } = {}
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
    if (parent) {
      return parent.worldMatrix.multiply(matrix)
    } else {
      return matrix
    }
  }

  /* pvm 投影视图模型矩阵 */
  get pvmMatrix(): Matrix3 {
    const scene = this.getScene()
    if (scene) {
      const { camera } = scene
      return new Matrix3().multiplyMatrices(camera.pvMatrix, this.worldMatrix)
    } else {
      return this.worldMatrix
    }
  }

  /* 总缩放量 */
  get worldScale(): Vector2 {
    const { scale, parent } = this
    if (parent) {
      return scale.clone().multiply(parent.worldScale)
    } else {
      return scale
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
    parent && parent.remove(this)
  }
  show() {
    this.visible = true
  }
  hidden() {
    this.visible = false
  }

  /* 获取场景 */
  getScene(): Scene | null {
    if ('isScene' in this) {
      return this as unknown as Scene
    } else if (this.parent) {
      return this.parent.getScene()
    } else {
      return null
    }
  }

  /* 绘图 */
  draw(ctx: CanvasRenderingContext2D) {
    if (!this.visible) {
      return
    }
    ctx.save()
    /*  矩阵变换 */
    this.transform(ctx)
    /* 绘制图形 */
    this.drawShape(ctx)
    ctx.restore()
  }

  /* 绘制图形-接口 */
  abstract drawShape(ctx: CanvasRenderingContext2D): void

  /* 创建路径-接口 */
  abstract crtPath(
    ctx: CanvasRenderingContext2D,
    projectionMatrix: Matrix3
  ): void
}
