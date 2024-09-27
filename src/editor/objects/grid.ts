/*
 * @Description: 标尺
 * @Author: ldx
 * @Date: 2024-08-28 14:10:14
 * @LastEditors: ldx
 * @LastEditTime: 2024-09-26 15:09:15
 */
import { App, EditorEvent, Group, LayoutEvent, Line, Rect, ResizeEvent, Text } from "leafer-editor";

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
/**
 * 找出离 value 最近的 segment 的倍数值
 */
export const getClosestTimesVal = (value: number, segment: number) => {
  const n = Math.floor(value / segment)
  const left = segment * n
  const right = segment * (n + 1)
  // console.log('====', value, segment, n, left, right)

  return value - left <= right - value ? left : right
}
export default class Grid {
  group = new Group()
  lineColor = '#f0f0f0'
  constructor(private app: App) {
    console.log('this.app.ground',this.app.ground);
    
    this.app.ground.add(this.group)
    this.listen()
  }
  get visible(): boolean {
    return this.group.visible || false
  }
  set visible(visible: boolean) {
    this.group.visible = visible
    this.drawShape()
  }
  drawShape = () => {
    if (this.visible) {
      this.group.clear()
      this.drawXLine()
      this.drawYLine()
    }
  }

  drawXLine = () => {
    const zoom = this.getZoom()
    const stepInScene = getStepByZoom(zoom)
    const { x: x1 } = this.app.getPagePoint({ x: 0, y: 0 })
    let startX = getClosestTimesVal(x1, stepInScene)
    const { x: x2 } = this.app.getPagePoint({ x: this.app.width!, y: 0 })
    const endX = getClosestTimesVal(x2, stepInScene)
    console.log('startX',  startX,  stepInScene);
    while (startX <= endX) {
      const x = (startX - x1) * zoom
      const line = new Line({
        width: this.app.height,
        strokeWidth: 1,
        stroke: this.lineColor,
        rotation: 90,
        x: x,
        y: 20,
        zIndex: 30
      })
      this.group.add(line)
      startX += 10
    }

  }
  drawYLine = () => {
    const zoom = this.getZoom()
    const stepInScene = getStepByZoom(zoom)
    const { y: y1 } = this.app.getPagePoint({ x: 0, y: 0 })
    let startY = getClosestTimesVal(y1, stepInScene)
    const { y: y2 } = this.app.getPagePoint({ x: 0, y: this.app.height! })
    const endY = getClosestTimesVal(y2, stepInScene)
    // console.log('startXY',y1,startY,y2,endY,zoom,stepInScene);
    while (startY <= endY) {
      const y = (startY - y1) * zoom
      const line = new Line({
        width: this.app.width,
        strokeWidth: 1,
        stroke: this.lineColor,
        x: 20,
        y: y,
        zIndex: 30
      })
      this.group.add(line)
     
      startY += 10
    }

  }

  listen() {
    this.app.tree.on(LayoutEvent.AFTER, this.drawShape)
    this.app.tree.on(ResizeEvent.RESIZE, this.drawShape)
  }
  destroy() {
    this.app.tree.off(LayoutEvent.AFTER, this.drawShape)
    this.app.tree.off(ResizeEvent.RESIZE, this.drawShape)
  }
  getZoom(): number {
    if (this.app.tree) {
      if (typeof this.app.tree.scale === 'number') {
        return this.app.tree.scale
      } else {
        return 1
      }
    } else {
      return 1
    }
  }
}