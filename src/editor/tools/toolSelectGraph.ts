/*
 * @Description: 拖拽画布
 * @Author: ldx
 * @Date: 2023-12-09 10:21:06
 * @LastEditors: ldx
 * @LastEditTime: 2023-12-21 10:31:51
 */
import { HoverHelper, SelectHelper, Vector2 } from '@/dxCanvas'
import { State } from '@/dxCanvas/helpers/selectHelper'

import { Editor } from '../editor'
import ToolBase from './toolBase'
import ToolManager from './toolManager'
class ToolSelectGraph extends ToolBase {
  readonly keyboard = ''
  readonly type = 'selectGraph'
  /** 鼠标状态 */
  cursorState: State = null
  downCoordPos = new Vector2()
  mouseCoordPos = new Vector2()
  /** 是否按了shift键 */
  isShift = false
  hoverHelper = new HoverHelper({
    style: { strokeStyle: '#558ef0', fillStyle: '#558ef0' }
  })
  selectHelper = new SelectHelper()
  constructor(editor: Editor, manager: ToolManager) {
    super(editor, manager)
    editor.dynamicLayer.add(this.hoverHelper)
    editor.dynamicLayer.add(this.selectHelper)
  }
  /** 鼠标按下 */
  pointerdown(event: PointerEvent) {
    const { clientX, clientY } = event
    this.downCoordPos = this.editor.scene.clientToCoord(clientX, clientY)
    this.mouseCoordPos = this.downCoordPos.clone()
    // 判断鼠标是否在包围盒里
    // const flag = this.selectHelper.isPointInBounds(this.downCoordPos)
    if (this.cursorState) {
      // 在包围盒中按下鼠标
      this.isDown = true
    } else {
      // 清空之前的选中图形（不论是否存在）重新判定是否选中
      !this.isShift && this.selectHelper.clear()
    }

    const obj = this.editor.baseLayer.isPointInGraph(this.downCoordPos)
    if (obj) {
      this.selectHelper.add(obj)
      this.selectHelper.computeBoundingBox()
      this.cursorState = this.selectHelper.getMouseState(this.downCoordPos)
      // 在图形中按下鼠标
      this.isDown = true
    }
    // 鼠标样式
    this.cursorState
      ? this.editor.cursorManager.setCursor('none')
      : this.editor.cursorManager.setCursor('default')

    this.editor.dynamicLayer.render()
  }
  /** 鼠标移动 */
  pointermove(event: PointerEvent) {
    const { clientX, clientY } = event
    const mouseCoordPos = this.editor.scene.clientToCoord(clientX, clientY)
    if (this.isDown) {
      // 下面是平移、旋转、缩放的操作
      console.log('this.cursorState', this.cursorState)

      switch (this.cursorState) {
        case 'move':
          for (const obj of this.selectHelper.children) {
            const delta = mouseCoordPos.clone().sub(this.mouseCoordPos)
            obj.position = obj.position.clone().add(delta)
          }
          break
        case 'scaleX':
          for (const obj of this.selectHelper.children) {
            const delta = mouseCoordPos.clone().sub(this.downCoordPos)
            const { min, max } = obj.boundingBox
            const width = max.x - min.x
            const num =
              delta.x > 0 ? delta.x + width : Math.abs(width - delta.x)
            obj.scale.set(num / width, 1)
          }
          break

        default:
          break
      }

      // 鼠标样式同步更新位置
      this.selectHelper.getMouseState(mouseCoordPos)
      this.mouseCoordPos = mouseCoordPos.clone()
      this.editor.baseLayer.render()
    } else {
      // 正常移动操作，鼠标经过图形时的变化，选中图形后鼠标的样式绘制等
      const obj = this.editor.baseLayer.isPointInGraph(mouseCoordPos)
      this.hoverHelper.clear()
      if (obj) {
        this.hoverHelper.add(obj)
      }
      // 先判断是否有选中图形，在判断是否绘制鼠标样式
      if (this.selectHelper.children.length > 0) {
        this.cursorState = this.selectHelper.getMouseState(mouseCoordPos)
        if (this.cursorState) {
          this.editor.cursorManager.setCursor('none')
        } else {
          this.editor.cursorManager.setCursor('default')
        }
      }
    }
    this.editor.dynamicLayer.render()

    // if (obj)
  }
  /** 鼠标松开 */
  pointerup(event: PointerEvent) {
    this.isDown = false
    const { clientX, clientY } = event
    const upCoordPos = this.editor.scene.clientToCoord(clientX, clientY)
    const obj = this.editor.baseLayer.isPointInGraph(upCoordPos)
    // 没有选中图形并且也没有移动鼠标 清空之前的选中图形
    if (upCoordPos.equals(this.downCoordPos)) {
      !this.isShift && this.selectHelper.clear()
    }
    if (obj) {
      this.selectHelper.add(obj)
    } else {
      this.editor.cursorManager.setCursor('default')
    }
    this.editor.dynamicLayer.render()
  }
  active() {
    this.activeKeyboard()
  }
  inactive() {
    this.inactiveKeyboard()
  }
  /** 激活快捷键 */
  activeKeyboard() {
    this.editor.keybordManager.registry({
      name: 'selectGraph',
      keyboard: ['shift'],
      execute: () => {
        this.isShift = true
      }
    })
    this.editor.keybordManager.registryKeyUp({
      name: 'selectGraph',
      keyboard: ['shift'],
      execute: () => {
        this.isShift = false
      }
    })
  }
  inactiveKeyboard() {
    this.editor.keybordManager.unRegister('selectGraph')
    this.editor.keybordManager.unRegisterKeyUp('selectGraph')
  }
}
export default ToolSelectGraph
