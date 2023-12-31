/*
 * @Description:
 * @Author: ldx
 * @Date: 2023-12-19 15:39:29
 * @LastEditors: ldx
 * @LastEditTime: 2024-01-08 10:12:01
 */
import { Vector2 } from '../math/vector2'
import {
  calculateDistanceToLine,
  crtPath,
  isLeft
} from '../objects/objectUtils'
import Helper, { HelperType } from './helper'
/* 鼠标状态 */
export type State = 'scale' | 'scaleX' | 'scaleY' | 'rotate' | 'move' | null

/* 布尔变量 */
let _bool = false
let distance = Infinity

class SelectHelper extends Helper {
  // 类型
  readonly isSelectHelper = true
  name = 'selectHelper'
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
  // 鼠标位置
  mousePos = new Vector2()
  // 图案边框的顶点集合
  vertices: number[] = []
  fillStyle = '#000'
  strokeStyle = '#fff'
  state: State = null
  constructor(attr: HelperType = {}) {
    super(attr)
  }
  /* 绘图 */
  drawShape(ctx: CanvasRenderingContext2D) {
    const { style } = this
    //样式
    // 1 / 2 / zoom = n   1 = n * zoom * 2
    const zoom = this.getScene()?.camera.zoom || 1
    // style.strokeStyle = '#558ef0'
    // style.fillStyle = '#558ef0'
    // style.apply(ctx)
    // hover样式
    // for (const obj of children) {
    //   ctx.beginPath()
    //   if (obj.isImg) {
    //     const {
    //       boundingBox: {
    //         min: { x: x0, y: y0 },
    //         max: { x: x1, y: y1 }
    //       }
    //     } = obj
    //     ctx.lineWidth = 1 / zoom
    //     crtPath(ctx, [x0, y0, x1, y0, x1, y1, x0, y1], true)
    //     ctx.stroke()
    //   } else if (obj.isLineSegments) {
    //     style.lineWidth = obj.style.lineWidth + 3
    //     obj.draw(ctx, style)
    //   } else {
    //     obj.draw(ctx, style)
    //   }
    // }
    style.strokeStyle = '#558ef0'
    style.fillStyle = '#fff'
    style.apply(ctx)
    // 包围盒
    ctx.beginPath()
    const {
      boundingBox: { _path },
      children
    } = this
    ctx.lineWidth = 1 / zoom
    if (children.length === 1) {
      this.vertices = children[0].boundingBox._path
        .map((vector) => vector.toArray())
        .flat()
    } else {
      this.vertices = _path.map((vector) => vector.toArray()).flat()
    }
    // this.vertices = [x0, y0, x1, y0, x1, y1, x0, y1]
    // console.log('xxxx', this.vertices)

    crtPath(ctx, this.vertices, true)
    ctx.stroke()

    // 四个节点
    ctx.beginPath()
    const pointSize = new Vector2(8 / zoom, 8 / zoom)
    const [w, h] = [pointSize.x / 2, pointSize.y / 2]
    for (let i = 0; i < this.vertices.length; i += 2) {
      const bx = this.vertices[i]
      const by = this.vertices[i + 1]
      crtPath(
        ctx,
        [bx - w, by - h, bx + w, by - h, bx + w, by + h, bx - w, by + h],
        true
      )
    }
    ctx.fill()
    ctx.stroke()

    // cursor手势
    if (this.state) {
      ctx.beginPath()
      const { mousePos, fillStyle, strokeStyle } = this
      ctx.save()
      ctx.fillStyle = fillStyle
      ctx.strokeStyle = strokeStyle
      ctx.lineWidth = 2
      ctx.translate(mousePos.x, mousePos.y)
      ctx.scale(1 / zoom, 1 / zoom)
      this[`${this.state}Cursor`](ctx)
      ctx.closePath()
      ctx.stroke()
      ctx.fill()
    }

    ctx.restore()
  }
  setMousePosition(mp: Vector2) {
    this.mousePos.copy(mp.clone())
  }
  /* 获取变换状态 */
  getMouseState(): State {
    const scene = this.getScene()
    if (!scene) return null

    const { vertices } = this
    const [x0, y0, x1, y1, x2, y2, x3, y3] = vertices

    /* x,y缩放 */
    for (let i = 0; i < vertices.length; i += 2) {
      const x = vertices[i]
      const y = vertices[i + 1]
      if (
        scene
          .coordToCanvas(new Vector2(x, y))
          .sub(scene.coordToCanvas(this.mousePos))
          .length() < 8
      ) {
        // const ind = (i + 8) % 16
        this.state = 'scale'
        return 'scale'
      }
    }

    /* x向缩放 */
    distance = calculateDistanceToLine(
      scene.coordToCanvas(this.mousePos),
      scene.coordToCanvas(new Vector2(x1, y1)),
      scene.coordToCanvas(new Vector2(x2, y2))
    )
    _bool = distance <= 4
    if (_bool) {
      this.state = 'scaleX'
      return 'scaleX'
    }
    distance = calculateDistanceToLine(
      scene.coordToCanvas(this.mousePos),
      scene.coordToCanvas(new Vector2(x0, y0)),
      scene.coordToCanvas(new Vector2(x3, y3))
    )
    _bool = distance <= 4
    if (_bool) {
      this.state = 'scaleX'
      return 'scaleX'
    }
    scene.coordToCanvas(this.mousePos)
    /* y向缩放 */
    distance = calculateDistanceToLine(
      scene.coordToCanvas(this.mousePos),
      scene.coordToCanvas(new Vector2(x0, y0)),
      scene.coordToCanvas(new Vector2(x1, y1))
    )
    _bool = distance <= 4
    if (_bool) {
      this.state = 'scaleY'
      return 'scaleY'
    }
    distance = calculateDistanceToLine(
      scene.coordToCanvas(this.mousePos),
      scene.coordToCanvas(new Vector2(x2, y2)),
      scene.coordToCanvas(new Vector2(x3, y3))
    )
    _bool = distance <= 4
    if (_bool) {
      this.state = 'scaleY'
      return 'scaleY'
    }

    /* 移动 */
    const [x, y] = this.mousePos.toArray()
    _bool =
      isLeft([x, y], [x0, y0], [x1, y1]) > 0 &&
      isLeft([x, y], [x1, y1], [x2, y2]) > 0 &&
      isLeft([x, y], [x2, y2], [x3, y3]) > 0 &&
      isLeft([x, y], [x3, y3], [x0, y0]) > 0
    if (_bool) {
      this.state = 'move'
      return 'move'
    }

    /* 旋转 */
    for (let i = 0; i < this.vertices.length; i += 2) {
      const x = this.vertices[i]
      const y = this.vertices[i + 1]
      if (
        scene
          .coordToCanvas(new Vector2(x, y))
          .sub(scene.coordToCanvas(this.mousePos))
          .length() < 22
      ) {
        this.state = 'rotate'
        return 'rotate'
      }
    }

    /* 无状态 */
    this.state = null
    return null
  }

  // scale状态
  scaleCursor(ctx: CanvasRenderingContext2D) {
    const { mousePos, center } = this
    this.drawScale(ctx, new Vector2().subVectors(center, mousePos).angle())
  }

  // scaleX 状态
  scaleXCursor(ctx: CanvasRenderingContext2D) {
    const { center, vertices } = this
    this.drawScale(
      ctx,
      new Vector2()
        .subVectors(
          center,
          new Vector2(vertices[2], vertices[3])
            .add(new Vector2(vertices[4], vertices[5]))
            .multiplyScalar(0.5)
        )
        .angle()
    )
  }

  // scaleY 状态
  scaleYCursor(ctx: CanvasRenderingContext2D) {
    const { center, vertices } = this
    this.drawScale(
      ctx,
      new Vector2()
        .subVectors(
          center,
          new Vector2(vertices[0], vertices[1])
            .add(new Vector2(vertices[2], vertices[3]))
            .multiplyScalar(0.5)
        )
        .angle()
    )
  }

  // 移动状态
  moveCursor(ctx: CanvasRenderingContext2D) {
    ctx.beginPath()
    crtPath(ctx, this.moveVertices)
  }

  // 旋转状态
  rotateCursor(ctx: CanvasRenderingContext2D) {
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
}

export { SelectHelper }
