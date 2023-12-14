/*
 * @Description: 选中状态
 * @Author: ldx
 * @Date: 2023-11-15 12:24:05
 * @LastEditors: ldx
 * @LastEditTime: 2023-12-03 19:29:12
 */

import { Matrix3 } from '../math/matrix3'
import { Vector2 } from '../math/vector2'
import { Img } from '../objects/img'
import { crtPath, crtPathByMatrix } from '../objects/objectUtils'

const pi2 = Math.PI * 2

//在哪个坐标系绘制控制框
//moMatrix:偏移坐标转世界坐标
//pvmoMatrix:偏移坐标转裁剪坐标
type Leve = 'moMatrix' | 'pvmoMatrix'

//参数类型
type FrameType = {
  img?: Img
  level?: Leve
}
/* 鼠标状态 */
export type State = 'scale' | 'scaleX' | 'scaleY' | 'rotate' | 'move' | null

/* 布尔变量 */
let _bool = false

/* 虚拟canvas上下文对象 */
const ctx = document
  .createElement('canvas')
  .getContext('2d') as CanvasRenderingContext2D

export class Frame {
  /** 自定义属性 */
  [key: string]: any

  _img = new Img()
  // 图案边框的顶点集合
  vertives: number[] = []
  // 图案中点
  center = new Vector2()
  // 路径变换矩阵
  matrix = new Matrix3()
  // 要把路径变换到哪个坐标系中，默认裁剪坐标系
  level = 'pvmoMatrix'

  // 描边色
  strokeStyle = '#558ef0'
  // 填充色
  fillStyle = '#fff'

  constructor(attr: FrameType = {}) {
    for (const [key, val] of Object.entries(attr)) {
      this[key] = val
    }
  }

  get img() {
    return this._img
  }
  set img(val) {
    this._img = val
    this.updateShape()
  }

  /* 更新矩阵、路径初始顶点、中点 */
  updateShape() {
    const {
      vertives: fv,
      center,
      img,
      level,
      img: {
        size: { x: imgW, y: imgH }
      }
    } = this

    const vertices = [
      0,
      0,
      imgW / 2,
      0,
      imgW,
      0,
      imgW,
      imgH / 2,
      imgW,
      imgH,
      imgW / 2,
      imgH,
      0,
      imgH,
      0,
      imgH / 2
    ]

    /* 更新路径变换矩阵 */
    this.matrix = img[level]
    for (let i = 0, len = vertices.length; i < len; i += 2) {
      const { x, y } = new Vector2(vertices[i], vertices[i + 1]).applyMatrix3(
        this.matrix
      )
      /* 更新路径顶点 */
      fv[i] = x
      fv[i + 1] = y
    }
    /* 更新中点 */
    center.copy(new Vector2(fv[0], fv[1]).lerp(new Vector2(fv[8], fv[9]), 0.5))
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.updateShape()
    const {
      img: { size },
      vertives: fv,
      center,
      matrix,
      strokeStyle,
      fillStyle
    } = this

    /* 图案尺寸的一半 */
    const [halfWidth, halfheight] = [size.width / 2, size.height / 2]

    /* 绘图 */
    ctx.save()
    ctx.strokeStyle = strokeStyle
    ctx.fillStyle = fillStyle

    /* 矩形框 */
    ctx.beginPath()
    crtPath(
      ctx,
      [fv[0], fv[1], fv[4], fv[5], fv[8], fv[9], fv[12], fv[13]],
      true
    )

    ctx.stroke()

    /* 矩形节点 */
    const { elements: e } = matrix
    // 矩阵内的缩放量
    const sx = new Vector2(e[0], e[1]).length()
    const sy = new Vector2(e[3], e[4]).length()
    // 节点尺寸，消去缩放量
    const pointSize = new Vector2(8 / sx, 8 / sy)
    const [w, h] = [pointSize.x / 2, pointSize.y / 2]

    // 绘制节点
    ctx.beginPath()
    for (let y = 0; y < 3; y++) {
      for (let x = 0; x < 3; x++) {
        if (y === 1 && x === 1) {
          continue
        }
        const [bx, by] = [halfWidth * x, halfheight * y]
        crtPathByMatrix(
          ctx,
          [bx - w, by - h, bx + w, by - h, bx + w, by + h, bx - w, by + h],
          matrix,
          true
        )
      }
    }
    ctx.fill()
    ctx.stroke()

    /* 中点 */
    ctx.beginPath()
    ctx.arc(center.x, center.y, 5, 0, pi2)
    ctx.fill()
    ctx.stroke()
    ctx.restore()
  }
  /* 获取变换状态 */
  getMouseState(mp: Vector2): State {
    const { vertives: fv } = this

    /* 对角线距离 */
    const diagonal = new Vector2(fv[0] - fv[8], fv[1] - fv[9]).length()

    /* 判断缩放的距离 */
    const scaleDist = Math.min(12, diagonal / 3)

    /* x,y缩放 */
    for (let i = 0, len = fv.length; i < len; i += 4) {
      if (new Vector2(fv[i], fv[i + 1]).sub(mp).length() < scaleDist) {
        const ind = (i + 8) % 16
        return 'scale'
      }
    }

    /* y向缩放 */
    ctx.save()
    ctx.lineWidth = scaleDist
    ctx.beginPath()
    crtPath(ctx, [fv[0], fv[1], fv[4], fv[5]])
    _bool = ctx.isPointInStroke(mp.x, mp.y)
    ctx.restore()
    if (_bool) {
      return 'scaleY'
    }

    ctx.save()
    ctx.lineWidth = scaleDist
    ctx.beginPath()
    crtPath(ctx, [fv[8], fv[9], fv[12], fv[13]])
    _bool = ctx.isPointInStroke(mp.x, mp.y)
    ctx.restore()
    if (_bool) {
      return 'scaleY'
    }

    /* x向缩放 */
    ctx.save()
    ctx.lineWidth = scaleDist
    ctx.beginPath()
    crtPath(ctx, [fv[12], fv[13], fv[0], fv[1]])
    _bool = ctx.isPointInStroke(mp.x, mp.y)
    ctx.restore()
    if (_bool) {
      return 'scaleX'
    }

    ctx.save()
    ctx.lineWidth = scaleDist
    ctx.beginPath()
    crtPath(ctx, [fv[4], fv[5], fv[8], fv[9]])
    _bool = ctx.isPointInStroke(mp.x, mp.y)
    ctx.restore()
    if (_bool) {
      return 'scaleX'
    }

    /* 移动 */
    ctx.beginPath()
    crtPath(ctx, fv)
    if (ctx.isPointInPath(mp.x, mp.y)) {
      return 'move'
    }

    /* 旋转 */
    ctx.save()
    ctx.lineWidth = 40
    ctx.beginPath()
    crtPath(ctx, fv)
    ctx.closePath()
    _bool = ctx.isPointInStroke(mp.x, mp.y)
    ctx.restore()
    if (_bool) {
      return 'rotate'
    }

    /* 无状态 */
    return null
  }
}
