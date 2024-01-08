/*
 * @Description:
 * @Author: ldx
 * @Date: 2023-12-19 15:39:29
 * @LastEditors: ldx
 * @LastEditTime: 2024-01-07 23:35:55
 */
import { crtPath } from '../objects/objectUtils'
import { StandStyle } from '../style/standStyle'
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
          boundingBox: { _path }
        } = obj
        style.apply(ctx)
        ctx.lineWidth = 1 / zoom
        const path = _path.map((vector) => vector.toArray()).flat()
        console.log('path', path, _path)

        crtPath(ctx, path, true)
        ctx.stroke()
      } else if (obj.isLineSegments) {
        style.lineWidth = (obj.style as StandStyle).lineWidth + 3
        obj.draw(ctx, style)
      } else {
        obj.draw(ctx, style)
      }
      ctx.restore()
    }
  }
}

export { HoverHelper }
