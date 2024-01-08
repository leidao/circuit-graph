import { Matrix3 } from '../math/matrix3'
import { Vector2 } from '../math/vector2'
import { BasicStyle } from '../style/basicStyle'
import { TextStyle, TextStyleType } from '../style/textStyle'
import { Object2D, Object2DType } from './object2D'
import { crtPathByMatrix } from './objectUtils'
const chineseRegex = /[\u4e00-\u9fa5]/
/* 构造参数的类型 */
type TextType = Object2DType & {
  text?: string
  maxWidth?: number | undefined
  style?: TextStyleType
  offset?: Vector2
}

/* 虚拟上下文对象 */
const virtuallyCtx = document
  .createElement('canvas')
  .getContext('2d') as CanvasRenderingContext2D

/* 文字对齐方式引起的偏移量 */
export const alignRatio = {
  start: 0,
  left: 0,
  center: -0.5,
  end: -1,
  right: -1
}
export const baselineRatio = {
  top: 0,
  middle: -0.5,
  bottom: -1,
  hanging: -0.05,
  alphabetic: -0.78,
  ideographic: -1
}

class Text2D extends Object2D {
  private text = ''
  maxWidth: number | undefined
  style: TextStyle = new TextStyle()
  offset = new Vector2(0, 0)
  pickingBuffer = 4
  name = 'Text2D'
  // 类型
  readonly isText = true

  constructor(attr: TextType = {}) {
    super()
    this.setOption(attr)
  }
  /* 世界模型矩阵*偏移矩阵 */
  get worldMatrix(): Matrix3 {
    const {
      offset: { x, y }
    } = this
    return super.worldMatrix.multiply(new Matrix3().makeTranslation(x, y))
  }
  /** 设置文字内容 */
  setText(text: string) {
    this.text = text
    this.computeBoundingBox()
    this.dispatchEvent({ type: 'bound_change', target: this })
  }
  /** 获取文字内容 */
  getText(): string {
    return this.text
  }
  /* 视图投影矩阵*世界模型矩阵*偏移矩阵  */
  get pvmMatrix(): Matrix3 {
    const {
      offset: { x, y }
    } = this
    return super.pvmMatrix.multiply(new Matrix3().makeTranslation(x, y))
  }

  /* 属性设置 */
  setOption(attr: TextType) {
    for (const [key, val] of Object.entries(attr)) {
      if (key === 'style') {
        this.style.setOption(val)
      } else {
        this[key] = val
      }
    }
  }

  /* 文本尺寸 */
  get size(): Vector2 {
    const { style, text, maxWidth } = this
    style.setFont(virtuallyCtx)

    // const width = virtuallyCtx.measureText(text).width
    // const w = maxWidth === undefined ? width : Math.min(width, maxWidth)
    let width = 0
    for (let i = 0; i < text.length; i++) {
      const char = text[i]
      const flag = chineseRegex.test(char)
      const charWidth = virtuallyCtx.measureText(char).width
      width += flag ? charWidth : Number(charWidth.toFixed(2))
    }
    // console.log('=====', width, virtuallyCtx.measureText(text).width)

    const w = maxWidth === undefined ? width : Math.min(width, maxWidth)
    return new Vector2(w, style.fontSize)
  }

  /* 绘图 */
  drawShape(ctx: CanvasRenderingContext2D, externalStyle?: BasicStyle) {
    const {
      text,
      offset: { x, y },
      maxWidth,
      style
    } = this

    //样式
    style.apply(ctx)
    externalStyle && externalStyle.apply(ctx)
    // 绘图
    for (const method of style.drawOrder) {
      style[`${method}Style`] && ctx[`${method}Text`](text, x, y, maxWidth)
    }
  }

  /* 计算边界盒子 */
  computeBoundingBox() {
    const {
      boundingBox: { min, max },
      size,
      offset,
      style: { textAlign, textBaseline },
      pickingBuffer
    } = this

    const vertMin = new Vector2(
      offset.x + size.x * alignRatio[textAlign],
      offset.y + size.y * baselineRatio[textBaseline]
    )
    const vertMax = new Vector2().addVectors(vertMin, size)
    min.copy(vertMin.applyMatrix3(this.worldMatrix))
    max.copy(vertMax.applyMatrix3(this.worldMatrix))

    const scene = this.getScene()
    if (!scene) return
    const zoom = scene.camera.zoom
    const minPixel = scene.coordToCanvas(min)
    const minCoord = scene.canvasToCoord(
      minPixel.x - pickingBuffer * zoom,
      minPixel.y - pickingBuffer * zoom
    )
    min.copy(minCoord)
    const maxPixel = scene.coordToCanvas(max)
    const maxCoord = scene.canvasToCoord(
      maxPixel.x + pickingBuffer * zoom,
      maxPixel.y + pickingBuffer * zoom
    )
    max.copy(maxCoord)
    this.boundingBox._path = [
      min,
      new Vector2(vertMax.x, vertMin.y).applyMatrix3(this.worldMatrix),
      max,
      new Vector2(vertMin.x, vertMax.y).applyMatrix3(this.worldMatrix)
    ]
  }
  /** 点位是否在图形中 */
  isPointInGraph(point: Vector2): Text2D | false {
    const isPointInBounds = this.isPointInBounds(point)
    return isPointInBounds ? this : false
  }
}

export { Text2D }
