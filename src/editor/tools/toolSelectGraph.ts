/*
 * @Description: 拖拽画布
 * @Author: ldx
 * @Date: 2023-12-09 10:21:06
 * @LastEditors: ldx
 * @LastEditTime: 2023-12-19 14:34:45
 */
import { Line } from '@/dxCanvas'

import { Editor } from '../editor'
import ToolBase from './toolBase'
import ToolManager from './toolManager'
class ToolSelectGraph extends ToolBase {
  readonly keyboard = ''
  readonly type = 'selectGraph'
  line: Line | null = null
  constructor(editor: Editor, manager: ToolManager) {
    super(editor, manager)
  }
  /** 鼠标按下 */
  pointerdown(event: PointerEvent) {}
  /** 鼠标移动 */
  pointermove(event: PointerEvent) {
    const { clientX, clientY } = event
    const mouseClipPos = this.editor.scene.clientToCoord(clientX, clientY)
    const obj = this.editor.baseLayer.isPointInGraph(mouseClipPos)
    console.log('obj', obj)

    // if (obj)
  }
  /** 鼠标松开 */
  pointerup() {}
  active() {}
  inactive() {}
}
export default ToolSelectGraph
