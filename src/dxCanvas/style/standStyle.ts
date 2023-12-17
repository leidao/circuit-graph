/*
 * @Description:
 * @Author: ldx
 * @Date: 2023-12-12 14:30:55
 * @LastEditors: ldx
 * @LastEditTime: 2023-12-12 14:39:46
 */
import { dpr } from '../core/camera'
import { BasicStyle, BasicStyleType } from './basicStyle'

/* 绘图顺序 */
type OrderType = 0 | 1

/* 绘图方法顺序 */
type MethodsType = ['fill', 'stroke'] | ['stroke', 'fill']

export type StandStyleType = {
  strokeStyle?: string | CanvasGradient | CanvasPattern | undefined
  fillStyle?: string | CanvasGradient | CanvasPattern | undefined
  lineWidth?: number
  lineDash?: number[] | undefined
  lineDashOffset?: number
  lineCap?: CanvasLineCap
  lineJoin?: CanvasLineJoin
  miterLimit?: number
  order?: OrderType
} & BasicStyleType

class StandStyle extends BasicStyle {
  strokeStyle: string | CanvasGradient | CanvasPattern | undefined
  fillStyle: string | CanvasGradient | CanvasPattern | undefined
  lineWidth = 1
  lineDash: number[] | undefined
  lineDashOffset = 0
  lineCap: CanvasLineCap = 'butt'
  lineJoin: CanvasLineJoin = 'miter'
  miterLimit = 10

  // 填充和描边的顺序, 默认0，即先填充再描边
  order: OrderType = 0

  constructor(attr: StandStyleType = {}) {
    super()
    this.setOption(attr)
  }

  /* 设置样式 */
  setOption(attr: StandStyleType = {}) {
    Object.assign(this, attr)
  }

  /* 获取有顺序的绘图方法 */
  get drawOrder(): MethodsType {
    return this.order ? ['fill', 'stroke'] : ['stroke', 'fill']
  }

  /* 应用样式 */
  apply(ctx: CanvasRenderingContext2D) {
    super.apply(ctx)
    const {
      fillStyle,
      strokeStyle,
      lineWidth,
      lineCap,
      lineJoin,
      miterLimit,
      lineDash,
      lineDashOffset
    } = this

    if (strokeStyle) {
      ctx.strokeStyle = strokeStyle
      ctx.lineWidth = lineWidth / dpr
      ctx.lineCap = lineCap
      ctx.lineJoin = lineJoin
      ctx.miterLimit = miterLimit
      if (lineDash) {
        ctx.setLineDash(lineDash)
        ctx.lineDashOffset = lineDashOffset
      }
    }
    fillStyle && (ctx.fillStyle = fillStyle)
  }
}
export { StandStyle }
