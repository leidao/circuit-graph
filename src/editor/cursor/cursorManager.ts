/*
 * @Description:
 * @Author: ldx
 * @Date: 2023-12-20 11:16:47
 * @LastEditors: ldx
 * @LastEditTime: 2023-12-20 12:19:35
 */
import './cursor.less'

import { Editor } from '../editor'

export interface ICursorRotation {
  type: 'rotation'
  degree: number
}

export type ICursor =
  | 'default'
  | 'grab'
  | 'grabbing'
  | 'move'
  | 'pointer'
  | 'crosshair'
  | 'text'
  | 'wait'
  | 'help'
  | 'not-allowed'
  | 'zoom-in'
  | 'zoom-out'
  | 'none'

export default class CursorManger {
  private cursor!: ICursor
  // the cursors with custom style, need to add class to canvas element
  private customClassCursor = new Set<ICursor>(['default'])

  constructor(private editor: Editor) {
    this.setCursor('default')
  }

  getCursor() {
    return this.cursor
  }

  setCursor(cursor: ICursor) {
    if (cursor === this.cursor) {
      return
    }

    this.cursor = cursor

    // 自定义鼠标样式
    const clsPrefix = 'editor-cursor-'

    const domElement = this.editor.domElement
    domElement.classList.forEach((className) => {
      if (className.startsWith(clsPrefix)) {
        domElement.classList.remove(className)
      }
    })
    domElement.style.cursor = ''

    if (this.customClassCursor.has(cursor)) {
      const className = `${clsPrefix}${cursor}`
      domElement.classList.add(className)
    } else {
      domElement.style.cursor = cursor
    }
  }
}
