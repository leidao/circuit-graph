/*
 * @Description: 标尺
 * @Author: ldx
 * @Date: 2024-08-28 14:10:14
 * @LastEditors: ldx
 * @LastEditTime: 2024-10-09 11:33:42
 */
import { App, EditorEvent, Group, LayoutEvent, Line, Rect, ResizeEvent, Text } from "leafer-editor";
import globalConfig from '../config'
import { getClosestTimesVal, getStepByZoom } from "../utils";
import _ from "lodash";
export const HALF_PI = Math.PI / 2

export default class Ruler {
  group = new Group()
  constructor(private app: App) {
    this.app.sky.add(this.group)
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
      this.drawRect()
      this.drawXRuler()
      this.drawYRuler()
      this.drawMask()
    }
  }
  /** 绘制背景 */
  drawRect() {
    const { width, height } = this.app
    // 背景色
    this.group.add(new Rect({
      width: width,
      height: 20,
      fill: globalConfig.rulerBgColor,
      zIndex: 10,
    }))
    this.group.add(new Rect({
      width: 20,
      height: height,
      fill: globalConfig.rulerBgColor,
      zIndex: 10,
    }))
    // 线条
    this.group.add(new Line({
      width: width,
      strokeWidth: 1,
      stroke: globalConfig.rulerBorderColor,
      x: 0,
      y: 20,
      zIndex: 50,
    }))
    this.group.add(new Line({
      width: width,
      strokeWidth: 1,
      stroke: globalConfig.rulerBorderColor,
      rotation: 90,
      x: 20,
      y: 0,
      zIndex: 50,
    }))
    // 背景+文字
    this.group.add(new Rect({
      width: 20,
      height: 20,
      fill: globalConfig.rulerBgColor,
      zIndex: 40
    }))
    this.group.add(new Text({
      x: 9,
      y: 9,
      text: `px`,
      zIndex: 40,
      fill: globalConfig.rulerTextColor,
      fontSize: 10,
      textAlign: 'center',
      verticalAlign: 'middle',
    }))
  }
  drawXRuler = () => {
    const zoom = this.getZoom()
    const stepInScene = getStepByZoom(zoom)
    const { x: x1 } = this.app.getPagePoint({ x: 0, y: 0 })
    // console.log('====',x1);
    let startX = getClosestTimesVal(x1, stepInScene)
    const { x: x2 } = this.app.getPagePoint({ x: this.app.width!, y: 0 })
    const endX = getClosestTimesVal(x2, stepInScene)
    // console.log('startX', x1, startX, x2, endX, zoom, stepInScene);
    while (startX <= endX) {
      const x = (startX - x1) * zoom
      const line = new Line({
        width: 6,
        strokeWidth: 1,
        stroke: globalConfig.rulerLineColor,
        rotation: 90,
        x: x,
        y: 14,
        zIndex: 30
      })
      this.group.add(line)
      const text = new Text({
        x,
        y: 8,
        fill: globalConfig.rulerTextColor,
        fontSize: 10,
        text: `${startX}`,
        textAlign: 'center',
        verticalAlign: 'middle',
        zIndex: 30
      })
      this.group.add(text)
      startX += stepInScene
    }

  }
  drawYRuler = () => {
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
        width: 6,
        strokeWidth: 1,
        stroke:globalConfig.rulerLineColor,
        x: 14,
        y: y,
        zIndex: 30
      })
      this.group.add(line)
      const text = new Text({
        x: 8,
        y,
        fill: globalConfig.rulerTextColor,
        fontSize: 10,
        rotation: -90,
        text: `${startY}`,
        textAlign: 'center',
        verticalAlign: 'middle',
        zIndex: 30
      })
      this.group.add(text)
      startY += stepInScene
    }

  }
  /** 选中图形的遮罩 */
  drawMask() {
    const graphs = this.app.editor?.list || []
    for (let i = 0; i < graphs.length; i++) {
      const graph = graphs[i];
      const bounds = graph.getBounds()
      const rectX = new Rect({
        width: bounds.width,
        height: 20,
        fill: globalConfig.rulerMaskColor,
        x: bounds.x,
        zIndex: 20
      })
      this.group.add(rectX)
      const rectY = new Rect({
        width: 20,
        height: bounds.height,
        fill: globalConfig.rulerMaskColor,
        y: bounds.y,
        zIndex: 20
      })
      this.group.add(rectY)
    }
  }
  listen() {
    this.app.tree.on(LayoutEvent.AFTER, this.drawShape)
    this.app.tree.on(ResizeEvent.RESIZE, this.drawShape)
    // this.app.editor.on(EditorEvent.SELECT, this.drawShape)
  }
  destroy() {
    this.app.tree.off(LayoutEvent.AFTER, this.drawShape)
    this.app.tree.off(ResizeEvent.RESIZE, this.drawShape)
    // this.app.editor.off(EditorEvent.SELECT, this.drawShape)
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