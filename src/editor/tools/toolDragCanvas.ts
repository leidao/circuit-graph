/*
 * @Description: 拖拽画布
 * @Author: ldx
 * @Date: 2023-12-09 10:21:06
 * @LastEditors: ldx
 * @LastEditTime: 2023-12-19 14:35:10
 */
import { Line } from '@/dxCanvas'

import { Editor } from '../editor'
import ToolBase from './toolBase'
import ToolManager from './toolManager'
class ToolDragCanvas extends ToolBase {
  readonly keyboard = ''
  readonly type = 'dragCanvas'
  line: Line | null = null
  constructor(editor: Editor, manager: ToolManager) {
    super(editor, manager)
  }
  /** 鼠标按下 */
  pointerdown(event: PointerEvent) {
    this.editor.cursorManager.setCursor('grabbing')
    this.editor.orbitControler.pointerdown(event)
  }
  /** 鼠标移动 */
  pointermove(event: PointerEvent) {
    this.editor.orbitControler.pointermove(event)
  }
  /** 鼠标松开 */
  pointerup() {
    this.editor.cursorManager.setCursor('grab')
    this.editor.orbitControler.pointerup()
  }
  active() {
    //
  }
  inactive() {
    //
  }
}
export default ToolDragCanvas
