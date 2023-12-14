/*
 * @Description:
 * @Author: ldx
 * @Date: 2023-12-12 14:32:31
 * @LastEditors: ldx
 * @LastEditTime: 2023-12-12 14:32:41
 */
import { StandStyle, StandStyleType } from './standStyle'

type FontStyle = '' | 'italic'
type FontWeight = '' | 'bold'

export type TextStyleType = {
  fontStyle?: FontStyle
  fontWeight?: FontWeight
  fontSize?: number
  fontFamily?: string
  textAlign?: CanvasTextAlign
  textBaseline?: CanvasTextBaseline
} & StandStyleType

class TextStyle extends StandStyle {
  fontStyle: FontStyle = ''
  fontWeight: FontWeight = ''
  fontSize: number = 12
  fontFamily: string = 'arial'
  textAlign: CanvasTextAlign = 'start'
  textBaseline: CanvasTextBaseline = 'alphabetic'

  constructor(attr: TextStyleType = {}) {
    super()
    this.setOption(attr)
  }

  /* 设置样式 */
  setOption(attr: TextStyleType = {}) {
    Object.assign(this, attr)
  }

  /* 应用样式 */
  apply(ctx: CanvasRenderingContext2D) {
    super.apply(ctx)
    this.setFont(ctx)
    ctx.textAlign = this.textAlign
    ctx.textBaseline = this.textBaseline
  }

  /* font 相关样式 */
  setFont(ctx: CanvasRenderingContext2D) {
    ctx.font = `${this.fontStyle} ${this.fontWeight} ${this.fontSize}px  ${this.fontFamily}`
  }
}
export { TextStyle }
