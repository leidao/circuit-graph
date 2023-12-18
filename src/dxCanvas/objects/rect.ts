/*
 * @Description: 矩形
 * @Author: ldx
 * @Date: 2023-11-15 12:21:19
 * @LastEditors: ldx
 * @LastEditTime: 2023-12-18 16:38:47
 */
import { dpr } from '../core/camera'
import { Matrix3 } from '../math/matrix3'
import { Vector2 } from '../math/vector2'
import { StandStyle, StandStyleType } from '../style/standStyle'
import { Object2D, Object2DType } from './object2D'
import { crtPath, crtPathByMatrix } from './objectUtils'

type LineType = Object2DType & {
  style?: StandStyleType
  width?: number
  height?: number
  x?: number
  y?: number
}

export class Rect extends Object2D {
  style: StandStyle = new StandStyle()
  /** 矩形宽高 */
  width = 0
  height = 0
  x = 0
  y = 0
  // 类型
  readonly isLine = true
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

  /* 绘图 */
  drawShape(ctx: CanvasRenderingContext2D) {
    const { x, y, width, height, style } = this
    //样式
    style.apply(ctx)
    // 绘制图像
    // ctx.beginPath()
    ctx.fillRect(x, y, width, height)

    // ctx.stroke()
  }
  /** 获取包围盒数据 */
  computeBoundingBox() {
    const {
      x,
      y,
      width,
      height,
      boundingBox: { min, max }
    } = this
    min.set(x, y)
    max.set(x + width, y + height)
  }
  /** 点位是否在图形中 */
  isPointInGraph(point: Vector2): Rect | false {
    const isPointInBounds = this.isPointInBounds(point)
    return isPointInBounds ? this : false
  }
}
