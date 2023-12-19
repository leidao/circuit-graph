/*
 * @Description: 拖拽画布
 * @Author: ldx
 * @Date: 2023-12-09 10:21:06
 * @LastEditors: ldx
 * @LastEditTime: 2023-12-19 16:26:43
 */
import { BoxHelper, Line } from '@/dxCanvas'

import { Editor } from '../editor'
import ToolBase from './toolBase'
import ToolManager from './toolManager'
class ToolSelectGraph extends ToolBase {
  readonly keyboard = ''
  readonly type = 'selectGraph'
  line: Line | null = null
  boxHelper = new BoxHelper({ style: { strokeStyle: '#0d90ff' } })
  constructor(editor: Editor, manager: ToolManager) {
    super(editor, manager)
    editor.dynamicLayer.add(this.boxHelper)
  }
  /** 鼠标按下 */
  pointerdown(event: PointerEvent) {}
  /** 鼠标移动 */
  pointermove(event: PointerEvent) {
    const { clientX, clientY } = event
    const mouseClipPos = this.editor.scene.clientToCoord(clientX, clientY)
    const obj = this.editor.baseLayer.isPointInGraph(mouseClipPos)
    this.boxHelper.clear()
    if (obj) {
      this.boxHelper.add(obj)
    }
    this.editor.dynamicLayer.render()

    // if (obj)
  }
  /** 鼠标松开 */
  pointerup() {}
  active() {}
  inactive() {}
}
export default ToolSelectGraph
