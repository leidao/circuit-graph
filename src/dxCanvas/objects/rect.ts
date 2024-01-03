/*
 * @Description: 矩形
 * @Author: ldx
 * @Date: 2023-11-15 12:21:19
 * @LastEditors: ldx
 * @LastEditTime: 2024-01-03 10:48:20
 */
import { Vector2 } from '../math/vector2'
import { BasicStyle } from '../style/basicStyle'
import { StandStyle, StandStyleType } from '../style/standStyle'
import { Object2D, Object2DType } from './object2D'

type LineType = Object2DType & {
  style?: StandStyleType
  points?: [[number, number], [number, number]]
}

export class Rect extends Object2D {
  style: StandStyle = new StandStyle()
  // 类型
  readonly isLineSegments = true
  readonly isRect = true
  name = 'Rect'
  constructor(attr: LineType = {}) {
    super()
    this.setOption(attr)
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
  /** 设置点位 */
  setPoints(points: [[number, number], [number, number]]) {
    this.points = points
    this.computeBoundingBox()
    this.dispatchEvent({ type: 'bound_change', target: this })
  }

  /* 绘图 */
  drawShape(ctx: CanvasRenderingContext2D, externalStyle?: BasicStyle) {
    const { points, style } = this
    if (points.length !== 2) return
    //样式
    style.apply(ctx)
    externalStyle && externalStyle.apply(ctx)
    // 绘制图像
    ctx.beginPath()
    ctx.fillRect(points[0][0], points[0][1], points[1][0], points[1][1])

    // ctx.stroke()
  }
  /** 获取包围盒数据 */
  computeBoundingBox() {
    const {
      points,
      boundingBox: { min, max }
    } = this
    min.copy(new Vector2(...points[0]).applyMatrix3(this.worldMatrix))
    max.copy(new Vector2(...points[1]).applyMatrix3(this.worldMatrix))
  }
  /** 点位是否在图形中 */
  isPointInGraph(point: Vector2): Rect | false {
    const isPointInBounds = this.isPointInBounds(point)
    return isPointInBounds ? this : false
  }
}
