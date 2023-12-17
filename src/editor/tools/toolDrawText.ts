/*
 * @Description: 绘制文字
 * @Author: ldx
 * @Date: 2023-12-09 10:21:06
 * @LastEditors: ldx
 * @LastEditTime: 2023-12-16 17:52:43
 */
import { Line, Text2D } from '@/dxCanvas'

import { Editor } from '../editor'
import ToolBase from './toolBase'
class ToolDrawText extends ToolBase {
  readonly keyboard = ''
  readonly type = 'drawLine'
  line: Line | null = null
  direction: 'x' | 'y' = 'x'
  /** 鼠标按下后是否移动过 */
  isMoveInDown = false
  constructor(editor: Editor) {
    super(editor)
  }
  /** 鼠标按下 */
  pointerdown(event: PointerEvent) {
    const { editor } = this
    const { clientX, clientY } = event
    this.isDown = true
    this.isMoveInDown = false
    this.downPoint.copy(editor.scene.clientToCoord(clientX, clientY))
    if (!this.line) {
      const point = this.downPoint.toArray()
      const points: [number, number][] = [point]
      this.line = new Line({ points })
      editor.scene.add(this.line)
    } else {
      const [[x, y]] = this.line.points.slice(-1)
      const deltaX = Math.abs(this.downPoint.x - x)
      const deltaY = Math.abs(this.downPoint.y - y)
      const max = Math.max(deltaX, deltaY)
      const mouseX = max === deltaX ? this.downPoint.x : x
      const mouseY = max === deltaY ? this.downPoint.y : y
      this.line.addPoints([mouseX, mouseY])
    }
    editor.scene.render()
  }
  /** 鼠标移动 */
  pointermove(event: PointerEvent) {
    const { editor } = this
    const { clientX, clientY } = event
    // 没有先点击起点的话，不用绘制线段
    if (this.downPoint.isEmpty()) return
    this.dragPoint.copy(editor.scene.clientToCoord(clientX, clientY))
    if (this.line) {
      const sub = this.dragPoint.clone().sub(this.downPoint)
      const pixelDelta = sub.multiplyScalar(editor.scene.camera.zoom)
      if (pixelDelta.length() < 50) {
        // 判断线段绘制方向
        this.direction =
          Math.abs(pixelDelta.x) > Math.abs(pixelDelta.y) ? 'x' : 'y'
      }
      // 计算中间过渡点位坐标
      const mouseX =
        this.direction === 'x' ? this.dragPoint.x : this.downPoint.x
      const mouseY =
        this.direction === 'y' ? this.dragPoint.y : this.downPoint.y
      // 鼠标按下后第一次移动，先添加两个点位，后面再移动直接替换点位
      if (!this.isMoveInDown) {
        this.line.addPoints([mouseX, mouseY], this.dragPoint.toArray())
      }
      this.line.replacePoints(-2, 2, [mouseX, mouseY], this.dragPoint.toArray())

      editor.scene.render()
    }
    this.isMoveInDown = true
  }
  /** 鼠标松开 */
  pointerup() {
    this.isDown = false
  }
  finish = () => {
    if (this.isMoveInDown) {
      this.line?.replacePoints(-2, 2)
    }
    this.line = null
    this.editor.scene.render()
  }
  /** 激活快捷键 */
  activeKeyboard() {
    this.editor.keybordManager.registry({
      name: 'drawLineFinish',
      keyboard: ['enter'],
      execute: this.finish
    })
  }
  inactiveKeyboard() {
    this.editor.keybordManager.unRegister('drawLineFinish')
  }
}
export default ToolDrawText
