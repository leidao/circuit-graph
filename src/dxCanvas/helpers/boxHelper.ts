/*
 * @Description:
 * @Author: ldx
 * @Date: 2023-12-19 15:39:29
 * @LastEditors: ldx
 * @LastEditTime: 2023-12-20 16:22:40
 */
import { crtPath } from '../objects/objectUtils'
import Helper, { HelperType } from './helper'

class BoxHelper extends Helper {
  // 类型
  readonly isBoxHelper = true
  name = 'boxHelper'
  constructor(attr: HelperType = {}) {
    super(attr)
  }
  /* 绘图 */
  drawShape(ctx: CanvasRenderingContext2D) {
    const { children, style } = this
    const zoom = this.getScene()?.camera.zoom || 1
    //样式
    style.apply(ctx)
    // 1 / 2 / zoom = n   1 = n * zoom * 2
    ctx.lineWidth = 1 / zoom
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
