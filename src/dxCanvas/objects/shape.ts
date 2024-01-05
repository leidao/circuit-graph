/*
 * @Description: 形状
 * @Author: ldx
 * @Date: 2023-11-15 12:21:19
 * @LastEditors: ldx
 * @LastEditTime: 2024-01-05 10:33:12
 */
import { dpr } from '../core/camera'
import { Matrix3 } from '../math/matrix3'
import { Vector2 } from '../math/vector2'
import { BasicStyle } from '../style/basicStyle'
import { StandStyle, StandStyleType } from '../style/standStyle'
import { Object2D, Object2DType } from './object2D'
import { crtPath } from './objectUtils'

type ShapeType = Object2DType & {
  style?: StandStyleType
  points?: [number, number][]
}

export class Shape extends Object2D {
  style: StandStyle = new StandStyle()
  // 类型
  readonly isLineSegments = true
  readonly isShape = true
  name = 'Shape'
  constructor(attr: ShapeType = {}) {
    super()
    this.setOption(attr)
  }
  /* 世界模型矩阵*偏移矩阵 */
  get moMatrix(): Matrix3 {
    return this.worldMatrix
  }
  /* 视图投影矩阵*世界模型矩阵*偏移矩阵  */
  get pvmoMatrix(): Matrix3 {
    return this.pvmMatrix
  }

  /* 属性设置 */
  setOption(attr: ShapeType) {
    for (const [key, val] of Object.entries(attr)) {
      switch (key) {
        case 'style':
          this.style.setOption(val as StandStyleType)
          break
        default:
          this[key] = val
      }
    }
  }

  /** 设置点位 */
  setPoints(points: [number, number][]) {
    this.points = points
    this.computeBoundingBox()
    this.dispatchEvent({ type: 'bound_change', target: this })
  }
  /** 追加点位 */
  addPoints(points: [number, number][]) {
    this.points = this.points.concat(points)
    this.computeBoundingBox()
    this.dispatchEvent({ type: 'bound_change', target: this })
  }
  /** 替换最后一个坐标 */
  replacePoint(point: [number, number]) {
    const { points } = this
    points.splice(points.length - 1, 1, point)
    this.computeBoundingBox()
    this.dispatchEvent({ type: 'bound_change', target: this })
  }
  /* 绘图 */
  drawShape(ctx: CanvasRenderingContext2D, externalStyle?: BasicStyle) {
    const { points, style } = this
    if (points.length === 0) return
    //样式
    style.apply(ctx)
    externalStyle && externalStyle.apply(ctx)
    // 绘制图像
    ctx.beginPath()
    const flatPoints = points.flat()
    crtPath(ctx, flatPoints, true)
    // 绘图
    for (const method of style.drawOrder) {
      style[`${method}Style`] && ctx[`${method}`]()
    }
  }
  /** 获取包围盒数据 */
  computeBoundingBox() {
    const {
      points,
      boundingBox: { min, max }
    } = this
    // 根据点计算边界
    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity

    for (const [x, y] of points) {
      minX = Math.min(minX, x)
      minY = Math.min(minY, y)
      maxX = Math.max(maxX, x)
      maxY = Math.max(maxY, y)
    }
    min.copy(new Vector2(minX, minY).applyMatrix3(this.worldMatrix))
    max.copy(new Vector2(maxX, maxY).applyMatrix3(this.worldMatrix))

    // const scene = this.getScene()
    // if (!scene) return
    // const zoom = scene.camera.zoom
    // const len = (this.style.lineWidth * zoom) / 2 / dpr
    // if (minX !== Infinity && minY !== Infinity) {
    //   const minPixel = scene.coordToCanvas(min)
    //   const minCoord = scene.canvasToCoord(minPixel.x - len, minPixel.y - len)
    //   min.copy(minCoord)
    // }
    // if (maxX !== Infinity && maxY !== Infinity) {
    //   const maxPixel = scene.coordToCanvas(max)
    //   const maxCoord = scene.canvasToCoord(maxPixel.x + len, maxPixel.y + len)
    //   max.copy(maxCoord)
    // }
  }
  /** 点位是否在图形中 */
  isPointInGraph(point: Vector2): Shape | false {
    const isPointInBounds = this.isPointInBounds(point)
    // 非零绕组规则
    if (isPointInBounds) {
      const { points } = this
      let wn = 0 // 绕组数
      const expandPoint = points.map(([x, y]) => {
        return new Vector2(x, y).applyMatrix3(this.worldMatrix).toArray()
      })
      for (let i = 0; i < expandPoint.length; i++) {
        const p1 = expandPoint[i]
        const p2 = expandPoint[(i + 1) % expandPoint.length]
        if (p1[1] <= point.y) {
          if (p2[1] > point.y && this.isLeft(p1, p2, point) > 0) {
            wn++
          }
        } else {
          if (p2[1] <= point.y && this.isLeft(p1, p2, point) < 0) {
            wn--
          }
        }
      }

      return wn !== 0 ? this : false
    }

    return false
  }

  private isLeft(
    p0: [number, number],
    p1: [number, number],
    p2: Vector2
  ): number {
    return (p1[0] - p0[0]) * (p2.y - p0[1]) - (p2.x - p0[0]) * (p1[1] - p0[1])
  }
}
