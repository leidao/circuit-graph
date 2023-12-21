/*
 * @Description: 形状
 * @Author: ldx
 * @Date: 2023-11-15 12:21:19
 * @LastEditors: ldx
 * @LastEditTime: 2023-12-21 20:29:00
 */
import { Matrix3 } from '../math/matrix3'
import { Vector2 } from '../math/vector2'
import { BasicStyle } from '../style/basicStyle'
import { StandStyle, StandStyleType } from '../style/standStyle'
import { Object2D, Object2DType } from './object2D'
import { crtPath, crtPathByMatrix } from './objectUtils'

type ShapeType = Object2DType & {
  style?: StandStyleType
  points?: [number, number][]
}

export class Shape extends Object2D {
  style: StandStyle = new StandStyle()
  /** 点位集合 */
  points: [number, number][] = []

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
  /** 样式设置 */
  setStyle(attr: StandStyleType) {
    this.style.setOption(attr)
  }

  /** 设置点位 */
  setPoints(points: [number, number][]) {
    this.points = points
  }
  /** 追加点位 */
  addPoints(points: [number, number][]) {
    this.points = this.points.concat(points)
  }
  /** 替换最后一个坐标 */
  replacePoint(point: [number, number]) {
    const { points } = this
    points.splice(points.length - 1, 1, point)
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
    ctx.fill()
    ctx.stroke()
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
  }
  /** 点位是否在图形中 */
  isPointInGraph(point: Vector2): Shape | false {
    const isPointInBounds = this.isPointInBounds(point)
    // 非零绕组规则
    if (isPointInBounds) {
      const { points } = this
      let wn = 0 // 绕组数

      for (let i = 0; i < points.length; i++) {
        const p1 = points[i]
        const p2 = points[(i + 1) % points.length]

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
