/*
 * @Description: 绘制文字
 * @Author: ldx
 * @Date: 2023-12-09 10:21:06
 * @LastEditors: ldx
 * @LastEditTime: 2023-12-19 11:03:28
 */
import { Animation, Line, Text2D, Vector2 } from '@/dxCanvas'

import { Editor } from '../editor'
import ToolBase from './toolBase'
class ToolDrawText extends ToolBase {
  readonly keyboard = ''
  readonly type = 'drawText'
  text: Text2D | null = null
  input = document.createElement('input')
  cursor = new Line()
  animation: Animation
  constructor(editor: Editor) {
    super(editor)
    this.cursor.setPoints([
      [0, 10],
      [0, -10]
    ])
    editor.dynamicLayer.add(this.cursor)
    this.animation = new Animation((time) => {
      const num = time.toString().replace(/^\d+\./, '0.')
      Number(num) <= 0.5 ? this.cursor.show() : this.cursor.hide()
      editor.dynamicLayer.render()
    })
    //
    this.input.style.position = 'absolute'
    // this.input.style.width = '1000px'
    this.input.style.height = '17.376px'
    this.input.style.opacity = '0'
    const a = (e: Event) => {
      if (e.target && this.text) {
        const { size, offset } = this.text
        const value = (e.target as HTMLInputElement).value
        this.text.text = value
        const { min, max } = this.text.boundingBox

        const pixelMin = editor.scene.coordToCanvas(min)
        const pixelMax = editor.scene.coordToCanvas(max)
        const deltaX = pixelMax.x - pixelMin.x
        const deltaY = pixelMax.y - pixelMin.y
        // this.cursor.style.left = `${this.downPoint.x + offset.x + deltaX}px`
        // this.cursor.style.top = `${this.downPoint.y}px`
        // this.input.style.transform = `translate(${
        //   this.downPoint.x + offset.x + deltaX
        // }px, -50%)`
        // this.cursor.style.transform = `scaleY(${editor.scene.camera.zoom})`
        // ;(e.target as HTMLInputElement).value = ''
        editor.scene.render()
        console.log('xxxx', value)
      }
    }
    this.input.addEventListener('input', a)
  }
  /** 鼠标按下 */
  pointerdown(event: PointerEvent) {
    const { editor } = this
    const { clientX, clientY } = event
    this.isDown = true
    this.downPoint = editor.scene.clientToCanvas(clientX, clientY)
    // this.cursor.style.left = `${this.downPoint.x}px`
    // this.cursor.style.top = `${this.downPoint.y}px`
    this.animation.start()
    this.text = new Text2D({
      text: '',
      style: {
        fontSize: 12,
        fillStyle: '#000',
        textAlign: 'left',
        textBaseline: 'middle'
      },
      position: editor.scene.clientToCoord(clientX, clientY)
    })
    editor.baseLayer.add(this.text)

    // editor.scene.render()
  }
  /** 鼠标移动 */
  pointermove(event: PointerEvent) {
    const { editor } = this
  }
  /** 鼠标松开 */
  pointerup() {
    // this.isDown = false
  }
  finish = () => {}
  active() {
    this.activeKeyboard()
    // this.editor.domElement.appendChild(this.input)
  }
  inactive() {
    this.inactiveKeyboard()
    // this.editor.domElement.removeChild(this.input)
  }
  /** 激活快捷键 */
  activeKeyboard() {
    this.editor.keybordManager.registry({
      name: 'drawLineFinish',
      keyboard: ['enter'],
      execute: () => {
        //
      }
    })
  }
  inactiveKeyboard() {
    this.editor.keybordManager.unRegister('drawLineFinish')
  }
}
export default ToolDrawText
