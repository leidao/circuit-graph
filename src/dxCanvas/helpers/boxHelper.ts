/*
 * @Description:
 * @Author: ldx
 * @Date: 2023-12-19 15:39:29
 * @LastEditors: ldx
 * @LastEditTime: 2023-12-19 16:09:08
 */
import { crtPath } from '../objects/objectUtils'
import Helper, { HelperType } from './helper'

class BoxHelper extends Helper {
  // 类型
  readonly isBoxHelper = true
  constructor(attr: HelperType = {}) {
    super(attr)
  }
  /* 绘图 */
  drawShape(ctx: CanvasRenderingContext2D) {
    const { children, style } = this
    //样式
    style.apply(ctx)
    for (const obj of children) {
      if (!obj.visible) continue
      const {
        boundingBox: {
          min: { x: x0, y: y0 },
          max: { x: x1, y: y1 }
        }
      } = obj
      ctx.beginPath()
      crtPath(ctx, [x0, y0, x1, y0, x1, y1, x0, y1], true)
      ctx.stroke()
    }
  }
}

export { BoxHelper }
