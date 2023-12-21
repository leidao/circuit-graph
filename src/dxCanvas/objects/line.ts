/*
 * @Description: 线段
 * @Author: ldx
 * @Date: 2023-11-15 12:21:19
 * @LastEditors: ldx
 * @LastEditTime: 2023-12-21 17:12:50
 */
import { Vector2 } from '../math/vector2'
import { BasicStyle } from '../style/basicStyle'
import { StandStyle, StandStyleType } from '../style/standStyle'
import { Object2D, Object2DType } from './object2D'
import { calculateDistanceToLine, crtPath } from './objectUtils'

type LineType = Object2DType & {
  style?: StandStyleType
  points?: [number, number][]
  pickingBuffer?: number
}

export class Line extends Object2D {
  style: StandStyle = new StandStyle()
  /** 点位集合 */
  points: [number, number][] = []
  /** 图层拾取缓存机制，如 1px 宽度的线鼠标很难拾取(点击)到, 通过设置该参数可扩大拾取的范围 */
  pickingBuffer = 4
  // 类型
  readonly isLine = true
  name = 'Line'
  readonly isLineSegments = true
  constructor(attr: LineType = {}) {
    super()
    this.setOption(attr)
  }

  /* 属性设置 */
  setOption(attr: LineType) {
    for (const [key, val] of Object.entries(attr)) {
      switch (key) {
        case 'style':
          this.style.setOption(val as StandStyleType)
          break
        default:
          this[key] = val
      }
    }
  }
  /** 样式设置 */
  setStyle(attr: StandStyleType) {
    this.style.setOption(attr)
  }

  /** 设置点位 */
  setPoints(points: [number, number][]) {
    this.points = points
  }
  /** 追加点位 */
  addPoints(...rest: [number, number][]) {
    this.points.push(...rest)
  }
  /** 替换坐标 */
  replacePoints(i: number, n: number, ...rest: [number, number][]) {
    const { points } = this
    points.splice(i, n, ...rest)
  }
  /* 绘图 */
  drawShape(ctx: CanvasRenderingContext2D, externalStyle?: BasicStyle) {
    const { points, style } = this
    if (points.length === 0) return
    //样式
    style.apply(ctx)
    externalStyle && externalStyle.apply(ctx)
    // 绘制图像
    ctx.beginPath()
    const flatPoints = points.flat()
    crtPath(ctx, flatPoints)
    ctx.stroke()
  }
  /** 获取包围盒数据 */
  computeBoundingBox() {
    const {
      points,
      boundingBox: { min, max },
      pickingBuffer
    } = this
    // 根据点计算边界
    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity

    for (const [x, y] of points) {
      minX = Math.min(minX, x)
      minY = Math.min(minY, y)
      maxX = Math.max(maxX, x)
      maxY = Math.max(maxY, y)
    }

    min.set(minX, minY)
    max.set(maxX, maxY)
    min.applyMatrix3(this.worldMatrix)
    max.applyMatrix3(this.worldMatrix)

    const scene = this.getScene()
    if (!scene) return
    const zoom = scene.camera.zoom
    if (minX !== Infinity && minY !== Infinity) {
      const minPixel = scene.coordToCanvas(min)
      const minCoord = scene.canvasToCoord(
        minPixel.x - pickingBuffer * zoom,
        minPixel.y - pickingBuffer * zoom
      )
      min.copy(minCoord)
    }
    if (maxX !== Infinity && maxY !== Infinity) {
      const maxPixel = scene.coordToCanvas(max)
      const maxCoord = scene.canvasToCoord(
        maxPixel.x + pickingBuffer * zoom,
        maxPixel.y + pickingBuffer * zoom
      )
      max.copy(maxCoord)
    }
  }

  /** 点位是否在图形中 */
  isPointInGraph(point: Vector2): Line | false {
    const isPointInBounds = this.isPointInBounds(point)
    if (isPointInBounds) {
      const { points, pickingBuffer } = this
      const scene = this.getScene()
      if (!scene) return false
      for (let i = 0; i < points.length - 1; i++) {
        const p1 = new Vector2(points[i][0], points[i][1])
        const p2 = new Vector2(points[i + 1][0], points[i + 1][1])
        // 这里转成像素来判断，鼠标范围更精确
        const distance = calculateDistanceToLine(
          scene.coordToCanvas(point),
          scene.coordToCanvas(p1),
          scene.coordToCanvas(p2)
        )
        if (Math.abs(distance) <= pickingBuffer) {
          return this
        }
      }
    }
    return false
  }
}
