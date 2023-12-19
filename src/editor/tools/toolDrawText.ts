/*
 * @Description: 绘制文字
 * @Author: ldx
 * @Date: 2023-12-09 10:21:06
 * @LastEditors: ldx
 * @LastEditTime: 2023-12-19 15:17:54
 */
import { Animation, Line, Text2D, Vector2 } from '@/dxCanvas'

import { Editor } from '../editor'
import ToolBase from './toolBase'
import ToolManager from './toolManager'
class ToolDrawText extends ToolBase {
  readonly keyboard = ''
  readonly type = 'drawText'
  text: Text2D | null = null
  input = document.createElement('input')
  cursor = new Line()
  animation: Animation
  downPointPixel = new Vector2()
  downPointCoord = new Vector2()
  constructor(editor: Editor, manager: ToolManager) {
    super(editor, manager)
    this.cursor.setPoints([
      [0, 10],
      [0, -10]
    ])
    this.cursor.hide()
    editor.dynamicLayer.add(this.cursor)
    this.animation = new Animation((time) => {
      const num = time.toString().replace(/^\d+\./, '0.')
      Number(num) <= 0.5 ? this.cursor.show() : this.cursor.hide()
      this.input.focus()
      editor.dynamicLayer.render()
    })
    //
    this.input.style.position = 'absolute'
    this.input.style.transform = 'translate(0, -50%)'
    this.input.style.height = '17.376px'
    this.input.style.opacity = '0'
  }
  inputChange = (e: Event) => {
    if (e.target && this.text) {
      const value = (e.target as HTMLInputElement).value
      this.text.text = value
      this.text.computeBoundingBox()
      const {
        boundingBox: { max }
      } = this.text
      this.cursor.position.set(max.x, this.downPointCoord.y)
      this.editor.scene.render()
    }
  }
  /** 鼠标按下 */
  pointerdown(event: PointerEvent) {
    const { editor } = this
    const { clientX, clientY } = event
    this.downPointPixel = editor.scene.clientToCanvas(clientX, clientY)
    this.downPointCoord = editor.scene.clientToCoord(clientX, clientY)
    if (!this.isDown) {
      this.cursor.position.copy(editor.scene.clientToCoord(clientX, clientY))
      this.input.style.left = `${this.downPointPixel.x}px`
      this.input.style.top = `${this.downPointPixel.y}px`
      this.animation.start()
      this.text = new Text2D({
        text: '',
        style: {
          fontSize: 12,
          fillStyle: '#000',
          textAlign: 'left',
          textBaseline: 'middle'
        },
        position: this.downPointCoord.clone()
      })
      editor.baseLayer.add(this.text)
    } else {
      this.finish()
    }
    this.isDown = true
    editor.dynamicLayer.render()
  }
  /** 鼠标移动 */
  pointermove(event: PointerEvent) {
    const { editor } = this
    const { clientX, clientY } = event
    const moveCoord = editor.scene.clientToCoord(clientX, clientY)
    const flag = this.text?.isPointInGraph(moveCoord)
    if (flag) {
      this.editor.domElement.style.cursor = 'text'
      this.input.style.cursor = 'text'
    } else {
      this.editor.domElement.style.cursor = 'crosshair'
      this.input.style.cursor = 'crosshair'
    }
  }
  /** 鼠标松开 */
  pointerup() {}
  finish = () => {
    console.log('11123')
    this.input.value = ''
    this.animation.stop()
    this.cursor.hide()
    this.manager.dispatchEvent({ type: 'finish', target: this })
  }
  active() {
    this.isDown = false
    // this.activeKeyboard()
    this.editor.domElement.appendChild(this.input)
    this.input.addEventListener('input', this.inputChange)
  }
  inactive() {
    // this.inactiveKeyboard()
    this.editor.domElement.removeChild(this.input)
    this.input.removeEventListener('input', this.inputChange)
  }
  /** 激活快捷键 */
  activeKeyboard() {
    this.editor.keybordManager.registry({
      name: 'drawTextFinish',
      keyboard: ['esc'],
      execute: this.finish
    })
  }
  inactiveKeyboard() {
    this.editor.keybordManager.unRegister('drawTextFinish')
  }
}
export default ToolDrawText
