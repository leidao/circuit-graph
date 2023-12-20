/*
 * @Description: 拖拽画布
 * @Author: ldx
 * @Date: 2023-12-09 10:21:06
 * @LastEditors: ldx
 * @LastEditTime: 2023-12-19 18:10:24
 */
import { BoxHelper, HoverHelper, Line, SelectHelper } from '@/dxCanvas'

import { Editor } from '../editor'
import ToolBase from './toolBase'
import ToolManager from './toolManager'
class ToolSelectGraph extends ToolBase {
  readonly keyboard = ''
  readonly type = 'selectGraph'
  line: Line | null = null
  boxHelper = new BoxHelper({ style: { strokeStyle: '#558ef0' } })
  hoverHelper = new HoverHelper({
    style: { strokeStyle: '#558ef0', fillStyle: '#558ef0' }
  })
  selectHelper = new SelectHelper({
    style: { strokeStyle: '#558ef0', fillStyle: '#fff' }
  })
  constructor(editor: Editor, manager: ToolManager) {
    super(editor, manager)
    editor.dynamicLayer.add(this.boxHelper)
    editor.dynamicLayer.add(this.hoverHelper)
    editor.dynamicLayer.add(this.selectHelper)
  }
  /** 鼠标按下 */
  pointerdown(event: PointerEvent) {
    const { clientX, clientY } = event
    const mouseClipPos = this.editor.scene.clientToCoord(clientX, clientY)
    const obj = this.editor.baseLayer.isPointInGraph(mouseClipPos)
    this.selectHelper.clear()
    if (obj) {
      this.selectHelper.add(obj)
    }
    this.editor.dynamicLayer.render()
  }
  /** 鼠标移动 */
  pointermove(event: PointerEvent) {
    const { clientX, clientY } = event
    const mouseClipPos = this.editor.scene.clientToCoord(clientX, clientY)
    const obj = this.editor.baseLayer.isPointInGraph(mouseClipPos)
    this.hoverHelper.clear()
    if (obj) {
      this.hoverHelper.add(obj)
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
