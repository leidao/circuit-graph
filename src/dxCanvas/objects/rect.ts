/*
 * @Description: 矩形
 * @Author: ldx
 * @Date: 2023-11-15 12:21:19
 * @LastEditors: ldx
 * @LastEditTime: 2023-12-08 16:07:29
 */
import { dpr } from '../core/camera'
import { Matrix3 } from '../math/matrix3'
import { BasicStyle, BasicStyleType } from '../style/basicStyle'
import { Object2D, Object2DType } from './object2D'
import { crtPath, crtPathByMatrix } from './objectUtils'

type LineType = Object2DType & {
  style?: BasicStyleType
  lineWidth?: number
  color?: string
  width?: number
  height?: number
  startX?: number
  startY?: number
}

export class Rect extends Object2D {
  style: BasicStyle = new BasicStyle()
  /** 矩形宽高 */
  width = 0
  height = 0
  startX = 0
  startY = 0
  lineWidth = 2
  color = '#f00'
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
          this.style.setOption(val as BasicStyleType)
          break
        default:
          this[key] = val
      }
    }
  }

  /* 世界模型矩阵*偏移矩阵 */
  get moMatrix(): Matrix3 {
    const {
      offset: { x, y }
    } = this
    return this.worldMatrix.multiply(new Matrix3().makeTranslation(x, y))
  }

  /* 视图投影矩阵*世界模型矩阵*偏移矩阵  */
  get pvmoMatrix(): Matrix3 {
    const {
      offset: { x, y }
    } = this
    return this.pvmMatrix.multiply(new Matrix3().makeTranslation(x, y))
  }

  /* 绘图 */
  drawShape(ctx: CanvasRenderingContext2D) {
    const { startX, startY, width, height, style, color, lineWidth } = this
    //样式
    style.apply(ctx)
    // ctx.strokeStyle = color
    ctx.fillStyle = color
    ctx.lineWidth = lineWidth
    // 绘制图像
    // ctx.beginPath()
    ctx.fillRect(startX, startY, width, height)

    // ctx.stroke()
  }

  /* 绘制图像边界 */
  crtPath(ctx: CanvasRenderingContext2D, matrix = this.pvmoMatrix) {
    // const {
    //   size: { x: imgW, y: imgH }
    // } = this
    // crtPathByMatrix(ctx, [0, 0, imgW, 0, imgW, imgH, 0, imgH], matrix, true)
  }
}
