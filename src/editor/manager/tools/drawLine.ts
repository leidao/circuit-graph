/*
 * @Description: 绘制线段
 * @Author: ldx
 * @Date: 2023-12-09 10:21:06
 * @LastEditors: ldx
 * @LastEditTime: 2024-09-27 13:56:54
 */
import { v4 } from 'uuid'
import { EditorView } from '@/editor/view'
import ToolBase from './toolBase'
import { Bounds, DragEvent, LeafList, Line, Image, Ellipse, Group, PointerEvent } from 'leafer-editor'
import _, { reject } from 'lodash'
import { DISTANCE, updateLinePoints, leafList, calculatedAdsorptionEffect } from './common'
import { getDistance, loadSVG } from '@/editor/utils'

export default class ToolDrawLine extends ToolBase {
  readonly keyboard = 'l'
  readonly type = 'drawLine'
  line!: Line
  constructor(view: EditorView) {
    super(view)
  }
  move = (e: PointerEvent) => {
    leafList.reset()
    calculatedAdsorptionEffect(e, this.app, 7)
  }
  start = (e: DragEvent) => {
    this.app.off(PointerEvent.MOVE, this.move)
    /** 吸附的点位坐标 */
    this.line = new Line({
      editable: true,
      strokeWidth: 1,
      // strokeWidthFixed:true,
      stroke: '#ff0000',
      name: '线段',
      id: v4()
    })
    leafList.add(this.line)
    const { adsorbPoint } = calculatedAdsorptionEffect(e, this.app, 7)
    const { x, y } = adsorbPoint ? adsorbPoint : this.app.getPagePoint({ x: e.x, y: e.y })
    this.line.x = x
    this.line.y = y
    this.app.tree.add(this.line)
  }

  drag = _.throttle((e: DragEvent) => {
    this.app.off(PointerEvent.MOVE, this.move)
    if (this.line) {
      leafList.add(this.line)
      /** 吸附的点位坐标 */
      const { adsorbPoint } = calculatedAdsorptionEffect(e, this.app, 3)
      let { x, y } = adsorbPoint ? adsorbPoint : this.app.getPagePointByClient(e.origin as any)
      updateLinePoints(this.line, { x, y }, 3)
    }
  }, 16)

  end = () => {
    this.app.on(PointerEvent.MOVE, this.move)
    /** 触发撤销回退栈栈的收集 */
    this.app.tree.emit('add')
  }
  active() {
    this.app.editor.visible = false
    this.app.tree.hitChildren = false
    this.app.on(PointerEvent.MOVE, this.move)
    this.app.on(DragEvent.START, this.start)
    this.app.on(DragEvent.DRAG, this.drag)
    this.app.on(DragEvent.END, this.end)
  }
  inactive() {
    this.app.editor.visible = true
    this.app.tree.hitChildren = true
    this.app.off(PointerEvent.MOVE, this.move)
    this.app.off(DragEvent.START, this.start)
    this.app.off(DragEvent.DRAG, this.drag)
    this.app.off(DragEvent.END, this.end)
  }

}

