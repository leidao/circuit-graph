/*
 * @Description:
 * @Author: ldx
 * @Date: 2023-12-14 16:15:05
 * @LastEditors: ldx
 * @LastEditTime: 2023-12-19 14:32:54
 */
import { Vector2 } from '@/dxCanvas'

import { Editor } from '../editor'
import ToolManager from './toolManager'

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
  constructor(public editor: Editor, public manager: ToolManager) {}
  /** 鼠标按下 */
  abstract pointerdown(event: PointerEvent): void
  /** 鼠标移动 */
  abstract pointermove(event: PointerEvent): void
  /** 鼠标松开 */
  abstract pointerup(event: PointerEvent): void
  /** 激活 */
  abstract active(): void
  /** 失活 */
  abstract inactive(): void
}

export default ToolBase
