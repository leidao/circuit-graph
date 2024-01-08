/*
 * @Description: 线段
 * @Author: ldx
 * @Date: 2023-11-15 12:21:19
 * @LastEditors: ldx
 * @LastEditTime: 2024-01-07 23:56:26
 */
import { dpr } from '../core/camera'
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

  /** 设置点位 */
  setPoints(points: [number, number][]) {
    this.points = points
    this.computeBoundingBox()
    this.dispatchEvent({ type: 'bound_change', target: this })
  }
  /** 追加点位 */
  addPoints(...rest: [number, number][]) {
    this.points.push(...rest)
    this.computeBoundingBox()
    this.dispatchEvent({ type: 'bound_change', target: this })
  }
  /** 替换坐标 */
  replacePoints(i: number, n: number, ...rest: [number, number][]) {
    const { points } = this
    points.splice(i, n, ...rest)
    this.computeBoundingBox()
    this.dispatchEvent({ type: 'bound_change', target: this })
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
    const len = (this.style.lineWidth * zoom) / 2 / dpr
    const pickingLen = pickingBuffer * zoom
    if (minX !== Infinity && minY !== Infinity) {
      const minPixel = scene.coordToCanvas(min)
      const minCoord = scene.canvasToCoord(
        minPixel.x - pickingLen - len,
        minPixel.y - pickingLen - len
      )
      min.copy(minCoord)
    }
    if (maxX !== Infinity && maxY !== Infinity) {
      const maxPixel = scene.coordToCanvas(max)
      const maxCoord = scene.canvasToCoord(
        maxPixel.x + pickingLen + len,
        maxPixel.y + pickingLen + len
      )
      max.copy(maxCoord)
    }
    this.boundingBox._path = [
      min,
      new Vector2(maxX, minY).applyMatrix3(this.worldMatrix),
      max,
      new Vector2(minX, maxY).applyMatrix3(this.worldMatrix)
    ]
  }

  /** 点位是否在图形中 */
  isPointInGraph(point: Vector2): Line | false {
    const isPointInBounds = this.isPointInBounds(point)
    if (isPointInBounds) {
      const { points, pickingBuffer } = this
      const scene = this.getScene()
      if (!scene) return false
      // 计算线宽，包围盒计算时需要考虑线宽
      const len = (this.style.lineWidth * scene.camera.zoom) / 2 / dpr
      const expandPoint = points.map(([x, y]) => {
        return new Vector2(x, y).applyMatrix3(this.worldMatrix)
      })
      for (let i = 0; i < expandPoint.length - 1; i++) {
        const p1 = expandPoint[i]
        const p2 = expandPoint[i + 1]
        // 这里转成像素来判断，鼠标范围更精确
        const distance = calculateDistanceToLine(
          scene.coordToCanvas(point),
          scene.coordToCanvas(p1),
          scene.coordToCanvas(p2)
        )
        if (Math.abs(distance) <= pickingBuffer + len) {
          return this
        }
      }
    }
    return false
  }
}
