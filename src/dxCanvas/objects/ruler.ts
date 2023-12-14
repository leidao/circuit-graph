// import { rotateInCanvas } from '../utils/canvas'
import { dpr } from '../core/camera'
import { Object2D } from './object2D'
import { getClosestTimesVal, nearestPixelVal } from './objectUtils'
export const HALF_PI = Math.PI / 2
const getStepByZoom = (zoom: number) => {
  /**
   * 步长研究，参考 figma
   * 1
   * 2
   * 5
   * 10（对应 500% 往上） 找到规律了： 50 / zoom = 步长
   * 25（对应 200% 往上）
   * 50（对应 100% 往上）
   * 100（对应 50% 往上）
   * 250
   * 500
   * 1000
   * 2500
   * 5000
   */
  const steps = [1, 2, 5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000]
  const step = 50 / zoom
  for (let i = 0, len = steps.length; i < len; i++) {
    if (steps[i] >= step) return steps[i]
  }
  return steps[0]
}
export type RulerConfig = {
  /** 标尺的高度 */
  w: number
  /**  刻度线基础高度 */
  h: number
}
export class Ruler extends Object2D {
  /** 渲染顺序 */
  index = Infinity
  /** 可见性 */
  config: RulerConfig
  /** 不受相机影响 */
  enableCamera = false
  // 类型
  readonly isRuler = true
  constructor(config: RulerConfig) {
    super()
    this.config = config
  }

  /** 绘图 */
  drawShape(ctx: CanvasRenderingContext2D) {
    // const setting = this.editor.setting
    // const viewport = this.editor.viewportManager.getViewport()
    const { config } = this
    const scene = this.getScene()
    if (!scene) return
    const { viewportWidth, viewportHeight } = scene.getViewPort()
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.save()
    ctx.scale(dpr, dpr)
    // 绘制背景
    ctx.fillStyle = '#fff'

    ctx.fillRect(0, 0, viewportWidth, config.w)
    ctx.fillRect(0, 0, config.w, viewportHeight)

    this.drawXRuler(ctx)
    this.drawYRuler(ctx)

    // 把左上角的小矩形上的刻度盖掉
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, config.w, config.w)

    // 绘制 border
    ctx.strokeStyle = '#e6e6e6'
    ctx.beginPath()
    // 水平 border
    ctx.moveTo(0, config.w + 0.5)
    ctx.lineTo(viewportWidth, config.w + 0.5)
    ctx.stroke()
    ctx.closePath()
    // 垂直 border
    ctx.beginPath()
    ctx.moveTo(config.w + 0.5, 0)
    ctx.lineTo(config.w + 0.5, viewportHeight)
    ctx.stroke()
    ctx.closePath()

    ctx.restore()
  }
  private drawXRuler(ctx: CanvasRenderingContext2D) {
    const scene = this.getScene()
    if (!scene) return
    const { width } = scene.getViewPort()
    const {
      camera: { position, zoom }
    } = scene
    const { config } = this
    // 绘制刻度线和刻度值
    // 计算 x 轴起点和终点范围
    const stepInScene = getStepByZoom(zoom)

    let startXInScene = -position.x / zoom
    startXInScene = getClosestTimesVal(startXInScene, stepInScene)

    const endX = width
    let endXInScene = (endX - position.x) / zoom
    endXInScene = getClosestTimesVal(endXInScene, stepInScene)
    // console.log('startXInScene', startXInScene)

    const y = config.w
    while (startXInScene <= endXInScene) {
      ctx.strokeStyle = '#c1c1c1'
      ctx.fillStyle = '#c1c1c1'
      const x = nearestPixelVal((startXInScene + position.x / zoom) * zoom)
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x, y - config.h)
      ctx.fillText(String(startXInScene), x + 3, y - 11)

      for (let i = 1; i < 10; i++) {
        ctx.moveTo(x + (i * stepInScene * zoom) / 10, y)
        ctx.lineTo(
          x + (i * stepInScene * zoom) / 10,
          i === 5 ? y - config.h + 4 : y - config.h + 8
        )
      }

      ctx.stroke()
      ctx.closePath()
      startXInScene += stepInScene
    }
  }
  private drawYRuler(ctx: CanvasRenderingContext2D) {
    const scene = this.getScene()
    if (!scene) return
    const { height } = scene.getViewPort()
    const {
      camera: { position, zoom }
    } = scene
    const { config } = this
    // 绘制刻度线和刻度值
    const stepInScene = getStepByZoom(zoom)

    // const startY = config.w
    let startYInScene = -position.y / zoom
    startYInScene = getClosestTimesVal(startYInScene, stepInScene)

    const endY = height
    let endYInScene = (endY - position.y) / zoom
    endYInScene = getClosestTimesVal(endYInScene, stepInScene)
    const x = config.w
    // ctx.textAlign = 'center'
    while (startYInScene <= endYInScene) {
      ctx.fillStyle = '#c1c1c1'
      const y = nearestPixelVal((startYInScene + position.y / zoom) * zoom)
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x - config.h, y)
      ctx.save()
      ctx.translate(x - 11, y - 3)
      ctx.rotate((-90 * Math.PI) / 180)
      ctx.fillText(String(startYInScene), 0, 0)
      ctx.restore()
      for (let i = 1; i < 10; i++) {
        ctx.moveTo(x, y + (i * stepInScene * zoom) / 10)
        ctx.lineTo(
          i === 5 ? x - config.h + 4 : x - config.h + 8,
          y + (i * stepInScene * zoom) / 10
        )
      }
      ctx.stroke()
      ctx.closePath()

      // rotateInCanvas(ctx, -HALF_PI, x, y)
      // ctx.fillText(String(startYInScene), x, y - 3)
      // rotateInCanvas(ctx, HALF_PI, x, y)
      startYInScene += stepInScene
    }
  }
}
