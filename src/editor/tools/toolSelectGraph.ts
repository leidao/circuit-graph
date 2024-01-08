/*
 * @Description: 拖拽画布
 * @Author: ldx
 * @Date: 2023-12-09 10:21:06
 * @LastEditors: ldx
 * @LastEditTime: 2024-01-08 10:46:36
 */
import Big from 'big.js'

import {
  HoverHelper,
  Object2D,
  radToDeg,
  SelectHelper,
  Vector2
} from '@/dxCanvas'
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
  /* 获取图案本地的缩放量 */
  getLocalScale(obj: Object2D, mouseCoordPos: Vector2) {
    const { rotate } = obj
    const { min, max } = obj.boundingBox
    const orign = max.clone().add(min).multiplyScalar(0.5)

    const rotateInvert = -rotate

    return mouseCoordPos
      .clone()
      .sub(orign)
      .rotate(rotateInvert)
      .divide(this.mouseCoordPos.clone().sub(orign).rotate(rotateInvert))
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
    // console.log('obj', obj)

    if (obj && !obj.userData.lock) {
      this.selectHelper.add(obj)
      // this.selectHelper.computeBoundingBox()
      this.selectHelper.setMousePosition(this.downCoordPos)
      this.cursorState = this.selectHelper.getMouseState()
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
      // console.log('this.cursorState', this.cursorState)

      switch (this.cursorState) {
        case 'move': {
          // this.editor.cursorManager.setCursor('move')
          const delta = mouseCoordPos.clone().sub(this.mouseCoordPos)
          for (const obj of this.selectHelper.children) {
            if (obj.userData.lock) continue
            const position = obj.position.clone().add(delta)
            position.x = Number(new Big(position.x).toFixed(3))
            position.y = Number(new Big(position.y).toFixed(3))
            obj.position.copy(position)
            obj.computeBoundingBox()
            obj.dispatchEvent({ type: 'bound_change', target: obj })
          }
          break
        }

        case 'scaleX': {
          for (const obj of this.selectHelper.children) {
            if (obj.userData.lock) continue
            const scale = obj.scale
              .clone()
              .multiply(this.getLocalScale(obj, mouseCoordPos))
            obj.scale.set(Math.abs(scale.x), obj.scale.y)
            obj.computeBoundingBox()
            obj.dispatchEvent({ type: 'bound_change', target: obj })
          }
          break
        }
        case 'scaleY': {
          for (const obj of this.selectHelper.children) {
            if (obj.userData.lock) continue

            const scale = obj.scale
              .clone()
              .multiply(this.getLocalScale(obj, mouseCoordPos))
            obj.scale.set(obj.scale.x, Math.abs(scale.y))
            obj.computeBoundingBox()
            obj.dispatchEvent({ type: 'bound_change', target: obj })
          }
          break
        }
        case 'scale': {
          for (const obj of this.selectHelper.children) {
            if (obj.userData.lock) continue

            const scale = obj.scale
              .clone()
              .multiply(this.getLocalScale(obj, mouseCoordPos))
            obj.scale.copy(scale)
            obj.computeBoundingBox()
            obj.dispatchEvent({ type: 'bound_change', target: obj })
          }
          break
        }
        case 'rotate': {
          for (const obj of this.selectHelper.children) {
            if (obj.userData.lock) continue
            const { min, max } = obj.boundingBox
            const orign = max.clone().add(min).multiplyScalar(0.5)
            const l1 = this.mouseCoordPos.clone().sub(orign).normalize()
            const l2 = mouseCoordPos.clone().sub(orign).normalize()
            // console.log('l1.dot(l2)', l1.cross(l2))
            const direction = l1.cross(l2)
            const rad = Math.acos(l1.dot(l2)) * (direction > 0 ? 1 : -1)
            obj.rotate = (obj.rotate + rad) % (Math.PI * 2)
            // console.log('angle', rad, radToDeg(obj.rotate))
            obj.computeBoundingBox()
            obj.dispatchEvent({ type: 'bound_change', target: obj })
          }
          break
        }

        default:
          break
      }
      // this.editor.scene.computeBoundingBox()
      this.selectHelper.dispatchEvent({
        type: 'graph_operation',
        target: this.selectHelper
      })
      // 鼠标样式同步更新位置
      this.selectHelper.setMousePosition(mouseCoordPos)
      // this.selectHelper.getMouseState(mouseCoordPos)
      this.mouseCoordPos = mouseCoordPos.clone()
      this.editor.baseLayer.render()
    } else {
      // 正常移动操作，鼠标经过图形时的变化，选中图形后鼠标的样式绘制等
      if (!(event.target instanceof HTMLCanvasElement)) return
      const obj = this.editor.baseLayer.isPointInGraph(mouseCoordPos)
      this.hoverHelper.clear()
      if (obj) {
        this.hoverHelper.add(obj)
      }
      // 先判断是否有选中图形，在判断是否绘制鼠标样式
      if (this.selectHelper.children.length > 0) {
        this.selectHelper.setMousePosition(mouseCoordPos)
        this.cursorState = this.selectHelper.getMouseState()
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
    if (obj && event.target instanceof HTMLCanvasElement) {
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
