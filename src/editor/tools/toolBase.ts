import { Vector2 } from '@/dxCanvas'

import { Editor } from '../editor'

abstract class ToolBase {
  /** 快捷键 */
  keyboard = ''
  /** 类型 */
  type = 'base'
  /** 按下的点位 */
  downPoint = new Vector2(Infinity, Infinity)
  /** 拖拽的点位 */
  dragPoint = new Vector2(Infinity, Infinity)
  /** 是否拖拽中 */
  isDragging = false
  /** 是否按下 */
  isDown = false
  constructor(public editor: Editor) {}
  /** 鼠标按下 */
  abstract pointerdown(event: PointerEvent): void
  /** 鼠标移动 */
  abstract pointermove(event: PointerEvent): void
  /** 鼠标松开 */
  abstract pointerup(event: PointerEvent): void
  /** 激活 */
  active() {}
  /** 失活 */
  inactive() {}
}

export default ToolBase
