/*
 * @Description: 绘制线段
 * @Author: ldx
 * @Date: 2023-12-09 10:21:06
 * @LastEditors: ldx
 * @LastEditTime: 2024-09-04 17:53:27
 */
import { v4 } from 'uuid'
import { EditorView } from '@/editor/view'
import ToolBase from './toolBase'
import { DragEvent, Rect } from 'leafer-editor'
export default class ToolDrawRect extends ToolBase {
  readonly keyboard = 'r'
  readonly type = 'drawRect'
  rect!: Rect
  constructor(view: EditorView) {
    super(view)
  }

  start = (e: DragEvent) => {
    this.rect = new Rect({
      editable: true,
      fill: {
        type:'solid',
        color:'#d9d9d9'
      },
      name: '矩形',
      id: v4()
    })
    this.app.tree.add(this.rect)
  }

  drag = (e: DragEvent) => {
    if (this.rect) {
      this.rect.set(e.getPageBounds())
    }
  }
  end = () => {
    this.view.manager.tools.setSelectedName('operationGraph')
    this.view.manager.tools.setActiveTool('operationGraph')
    this.app.tree.emit('add')
  }

  active() {
    this.app.editor.visible = false
    this.app.tree.hitChildren = false
    this.app.on(DragEvent.START, this.start)
    this.app.on(DragEvent.DRAG, this.drag)
    this.app.on(DragEvent.END, this.end)
  }
  inactive() {
    this.app.editor.visible = true
    this.app.tree.hitChildren = true
    this.app.off(DragEvent.START, this.start)
    this.app.off(DragEvent.DRAG, this.drag)
    this.app.on(DragEvent.END, this.end)
  }

}

