/*
 * @Description:
 * @Author: ldx
 * @Date: 2023-12-09 09:38:54
 * @LastEditors: ldx
 * @LastEditTime: 2023-12-21 21:05:39
 */
/*
 * @Description:
 * @Author: ldx
 * @Date: 2023-12-09 09:38:54
 * @LastEditors: ldx
 * @LastEditTime: 2023-12-09 10:10:29
 */

import { EventDispatcher } from '@/dxCanvas/core/eventDispatcher'

import cursorDefault from '../cursor/cursor-icons/editor-cursor-default.png'
import { Editor } from '../editor'
import ToolBase from './toolBase'
import ToolDragCanvas from './toolDragCanvas'
import ToolDrawLine from './toolDrawLine'
import ToolDrawText from './toolDrawText'
import ToolSelectGraph from './toolSelectGraph'
class ToolManager extends EventDispatcher {
  toolMap = new Map<string, ToolBase>()
  /**
   * keyboard => tool type
   */
  keyboardMap = new Map<string, string>()
  /** 激活的tool */
  activeTool: ToolBase | null = null
  /** 禁止切换tool */
  enableSwitchTool = true
  constructor(private editor: Editor) {
    super()
    this.register(new ToolDragCanvas(editor, this))
    this.register(new ToolDrawLine(editor, this))
    this.register(new ToolSelectGraph(editor, this))
    this.register(new ToolDrawText(editor, this))
  }
  /** 注册 */
  register(tool: ToolBase) {
    this.registerTool(tool)
    this.registerKeyboard(tool)
  }
  registerTool(tool: ToolBase) {
    if (!tool.type) {
      throw new Error(`tool ${tool.type} 属性没有定义`)
    }
    if (this.toolMap.has(tool.type)) {
      console.warn(`tool ${tool.type} 已经被注册过`)
    }
    this.toolMap.set(tool.type, tool)
  }
  registerKeyboard(tool: ToolBase) {
    if (!tool.keyboard) return
    if (this.keyboardMap.has(tool.keyboard)) {
      console.warn(`tool快捷键 ${tool.type} 已经被注册过`)
    }
    this.keyboardMap.set(tool.keyboard, tool.type)
  }
  /** 设置工具激活 */
  setActiveTool(toolName: string) {
    if (!this.enableSwitchTool || this.getActiveToolName() === toolName) {
      return
    }

    const prevTool = this.activeTool
    const activeTool = (this.activeTool = this.toolMap.get(toolName) || null)
    if (!activeTool) {
      throw new Error(`没有 ${toolName} 对应的工具对象`)
    }

    if (prevTool) {
      prevTool.inactive()
      this.dispatchEvent({ type: 'tool_inactive', target: prevTool })
    }

    activeTool.active()
    this.setCursor()
    this.dispatchEvent({ type: 'tool_active', target: activeTool })
  }
  getActiveToolName() {
    return this.activeTool?.type
  }
  /** 鼠标按下 */
  pointerdown = (event: PointerEvent) => {
    if (this.activeTool) {
      this.activeTool.pointerdown(event)
    }
  }
  /** 鼠标移动 */
  pointermove = (event: PointerEvent) => {
    if (this.activeTool) {
      this.activeTool.pointermove(event)
    }
  }
  /** 鼠标松开 */
  pointerup = (event: PointerEvent) => {
    if (this.activeTool) {
      this.activeTool.pointerup(event)
    }
  }
  /** 设置鼠标样式 */
  setCursor() {
    if (!this.activeTool) return
    switch (this.activeTool.type) {
      case 'selectGraph':
        this.editor.cursorManager.setCursor('default')
        break
      case 'dragCanvas':
        this.editor.cursorManager.setCursor('grab')
        break
      default:
        this.editor.cursorManager.setCursor('crosshair')
        break
    }
  }
  listen() {
    const canvas = this.editor.domElement
    canvas.addEventListener('pointerdown', this.pointerdown)
    window.addEventListener('pointermove', this.pointermove)
    window.addEventListener('pointerup', this.pointerup)

    // 快捷键绑定
    // this.keyboardMap.forEach((type, key) => {
    //   key = `Key${key.toUpperCase()}`
    //   this.editor.keybindingManager.register({
    //     key: { keyCode: key },
    //     actionName: type,
    //     action: () => {
    //       this.setActiveTool(type)
    //     }
    //   })
    // })
  }
  destroy() {
    const canvas = this.editor.domElement
    canvas.removeEventListener('pointerdown', this.pointerdown)
    window.removeEventListener('pointermove', this.pointermove)
    window.removeEventListener('pointerup', this.pointerup)
  }
}
export default ToolManager
