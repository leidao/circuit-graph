/*
 * @Description:
 * @Author: ldx
 * @Date: 2023-12-19 15:39:29
 * @LastEditors: ldx
 * @LastEditTime: 2023-12-20 09:09:31
 */
import { Vector2 } from '../math/vector2'
import { crtPath } from '../objects/objectUtils'
import Helper, { HelperType } from './helper'

class SelectHelper extends Helper {
  // 类型
  readonly isSelectHelper = true
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
      const {
        boundingBox: {
          min: { x: x0, y: y0 },
          max: { x: x1, y: y1 }
        }
      } = obj
      style.apply(ctx)
      ctx.lineWidth = 2 / zoom
      crtPath(ctx, [x0, y0, x1, y0, x1, y1, x0, y1], true)
      ctx.stroke()

      // 节点尺寸，消去缩放量
      const pointSize = new Vector2(8 / zoom, 8 / zoom)
      const [w, h] = [pointSize.x / 2, pointSize.y / 2]
      const points = [
        [x0, y0],
        [x1, y0],
        [x1, y1],
        [x0, y1]
      ]
      // 绘制节点
      ctx.beginPath()
      for (let i = 0; i < points.length; i++) {
        const [bx, by] = points[i]
        crtPath(
          ctx,
          [bx - w, by - h, bx + w, by - h, bx + w, by + h, bx - w, by + h],
          true
        )
      }
      ctx.fill()
      ctx.stroke()
      ctx.restore()
    }
  }
}

export { SelectHelper }
