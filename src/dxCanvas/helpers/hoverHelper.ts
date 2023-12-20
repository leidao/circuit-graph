/*
 * @Description:
 * @Author: ldx
 * @Date: 2023-12-19 15:39:29
 * @LastEditors: ldx
 * @LastEditTime: 2023-12-20 16:22:32
 */
import { crtPath } from '../objects/objectUtils'
import Helper, { HelperType } from './helper'

class HoverHelper extends Helper {
  // 类型
  readonly isHoverHelper = true
  name = 'hoverHelper'
  constructor(attr: HelperType = {}) {
    super(attr)
  }
  /* 绘图 */
  drawShape(ctx: CanvasRenderingContext2D) {
    const { children, style } = this
    //样式
    // 1 / 2 / zoom = n   1 = n * zoom * 2
    const zoom = this.getScene()?.camera.zoom || 1
    for (const obj of children) {
      if (!obj.visible) continue
      ctx.beginPath()
      ctx.save()
      if (obj.isImg) {
        const {
          boundingBox: {
            min: { x: x0, y: y0 },
            max: { x: x1, y: y1 }
          }
        } = obj
        style.apply(ctx)
        ctx.lineWidth = 1 / zoom
        crtPath(ctx, [x0, y0, x1, y0, x1, y1, x0, y1], true)
        ctx.stroke()
      } else if (obj.isLineSegments) {
        style.lineWidth = obj.style.lineWidth + 3
        obj.draw(ctx, style)
      } else {
        obj.draw(ctx, style)
      }
      ctx.restore()
    }
  }
}

export { HoverHelper }
