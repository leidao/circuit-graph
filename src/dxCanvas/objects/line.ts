/*
 * @Description: 线段
 * @Author: ldx
 * @Date: 2023-11-15 12:21:19
 * @LastEditors: ldx
 * @LastEditTime: 2023-12-16 17:51:48
 */
import { dpr } from '../core/camera'
import { Matrix3 } from '../math/matrix3'
import { StandStyle, StandStyleType } from '../style/standStyle'
import { Object2D, Object2DType } from './object2D'
import { crtPath, crtPathByMatrix } from './objectUtils'

type LineType = Object2DType & {
  style?: StandStyleType
  points?: [number, number][]
}

export class Line extends Object2D {
  style: StandStyle = new StandStyle()
  /** 点位集合 */
  points: [number, number][] = []
  // 类型
  readonly isLine = true
  constructor(attr: LineType = {}) {
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
  setOption(attr: LineType) {
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
  addPoints(...rest: [number, number][]) {
    this.points.push(...rest)
  }
  /** 替换坐标 */
  replacePoints(i: number, n: number, ...rest: [number, number][]) {
    const { points } = this
    points.splice(i, n, ...rest)
  }
  /* 绘图 */
  drawShape(ctx: CanvasRenderingContext2D) {
    const { points, style } = this
    if (points.length === 0) return
    //样式
    style.apply(ctx)
    // 绘制图像
    ctx.beginPath()
    const flatPoints = points.flat()
    crtPath(ctx, flatPoints)
    ctx.stroke()
  }

  /* 绘制图像边界 */
  crtPath(ctx: CanvasRenderingContext2D, matrix = this.pvmoMatrix) {
    const { points, style } = this
    //样式
    style.apply(ctx)
    // 绘制图像
    const flatPoints = points.flat()
    crtPath(ctx, flatPoints)
  }
}
