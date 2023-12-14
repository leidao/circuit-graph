/*
 * @Description: 鼠标变换样式
 * @Author: ldx
 * @Date: 2023-11-15 12:24:05
 * @LastEditors: ldx
 * @LastEditTime: 2023-12-03 20:01:14
 */

import { Vector2 } from '../math/vector2'
import { crtPath } from '../objects/objectUtils'
import { State } from './frame'

type MouseShapeType = {
  fillStyle?: string
  strokeStyle?: string
  mousePos?: Vector2
  center?: Vector2
  vertives?: number[]
  moveVertices?: number[]
  rotateVertices?: number[]
  scaleVertices?: number[]
}

export class MouseShape {
  // 鼠标位置
  mousePos = new Vector2()
  // 图案中心位
  center = new Vector2()
  // 图案边框的顶点集合
  vertives: number[] = []

  // 移动图案
  moveVertices: number[] = [0, 0, 14, 14, 6, 14, 0, 20]
  // 旋转图案，由[-15, 0, -9, -5, -9, -1, -5, -1, -1, 1, 1, 5, 1, 9, 5, 9, 0, 15, -5, 9, -1,9, -1, 5, -2.2, 2.2, -5, 1, -9, 1, -9, 5]旋转45°得来
  rotateVertices: number[] = [
    -10.61, -10.61, -2.83, -9.9, -5.66, -7.07, -2.83, -4.24, -1.41, 0, -2.83,
    4.24, -5.66, 7.07, -2.83, 9.9, -10.61, 10.61, -9.9, 2.83, -7.07, 5.66,
    -4.24, 2.83, -3.11, 0, -4.24, -2.83, -7.07, -5.66, -9.9, -2.83
  ]
  // 缩放图案
  scaleVertices: number[] = [
    1, 4, 1, 1, 5, 1, 5, 5, 11, 0, 5, -5, 5, -1, 1, -1, 1, -4, -1, -4, -1, -1,
    -5, -1, -5, -5, -11, 0, -5, 5, -5, 1, -1, 1, -1, 4
  ]

  fillStyle = '#000'
  strokeStyle = '#fff'

  constructor(attr: MouseShapeType = {}) {
    Object.assign(this, attr)
  }

  // scale状态
  scale(ctx: CanvasRenderingContext2D) {
    const { mousePos, center } = this
    this.drawScale(ctx, new Vector2().subVectors(center, mousePos).angle())
  }

  // scaleY状态
  scaleY(ctx: CanvasRenderingContext2D) {
    const { center, vertives } = this
    this.drawScale(
      ctx,
      new Vector2()
        .subVectors(center, new Vector2(vertives[2], vertives[3]))
        .angle()
    )
  }

  // scaleX 状态
  scaleX(ctx: CanvasRenderingContext2D) {
    const { center, vertives } = this
    this.drawScale(
      ctx,
      new Vector2()
        .subVectors(center, new Vector2(vertives[14], vertives[15]))
        .angle()
    )
  }

  // 移动状态
  move(ctx: CanvasRenderingContext2D) {
    ctx.beginPath()
    crtPath(ctx, this.moveVertices)
  }

  // 旋转状态
  rotate(ctx: CanvasRenderingContext2D) {
    const { mousePos, center } = this
    ctx.rotate(new Vector2().subVectors(mousePos, center).angle())
    ctx.beginPath()
    crtPath(ctx, this.rotateVertices)
  }

  drawScale(ctx: CanvasRenderingContext2D, ang: number) {
    ctx.rotate(ang)
    ctx.beginPath()
    crtPath(ctx, this.scaleVertices)
  }

  draw(ctx: CanvasRenderingContext2D, state: State) {
    if (!state) {
      return
    }
    const { mousePos, fillStyle, strokeStyle } = this
    ctx.save()
    ctx.fillStyle = fillStyle
    ctx.strokeStyle = strokeStyle
    ctx.lineWidth = 2
    ctx.translate(mousePos.x, mousePos.y)
    this[state](ctx)
    ctx.closePath()
    ctx.stroke()
    ctx.fill()
    ctx.restore()
  }
}
