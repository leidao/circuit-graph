/*
 * @Description: 图片
 * @Author: ldx
 * @Date: 2023-11-15 12:21:19
 * @LastEditors: ldx
 * @LastEditTime: 2023-12-19 17:26:15
 */
import { Matrix3 } from '../math/matrix3'
import { Vector2 } from '../math/vector2'
import { BasicStyle, BasicStyleType } from '../style/basicStyle'
import { Object2D, Object2DType } from './object2D'
import { crtPath, crtPathByMatrix } from './objectUtils'

type ImgType = Object2DType & {
  image?: CanvasImageSource
  offset?: Vector2
  size?: Vector2
  view?: View | undefined
  src?: string
  style?: BasicStyleType
}

type View = {
  x: number
  y: number
  width: number
  height: number
}

export class Img extends Object2D {
  image: CanvasImageSource = new Image()
  offset: Vector2 = new Vector2()
  size: Vector2 = new Vector2(300, 150)
  view: View | undefined
  style: BasicStyle = new BasicStyle()

  // 类型
  readonly isImg = true
  constructor(attr: ImgType = {}) {
    super()
    this.setOption(attr)
  }

  /* 属性设置 */
  setOption(attr: ImgType) {
    for (const [key, val] of Object.entries(attr)) {
      switch (key) {
        case 'src':
          if (this.image instanceof Image) {
            this.image.src = val as 'string'
          }
          break
        case 'style':
          this.style.setOption(val as BasicStyleType)
          break
        default:
          this[key] = val
      }
    }
  }

  /* 世界模型矩阵*偏移矩阵 */
  get worldMatrix(): Matrix3 {
    const {
      offset: { x, y }
    } = this
    return super.worldMatrix.multiply(new Matrix3().makeTranslation(x, y))
  }

  /* 视图投影矩阵*世界模型矩阵*偏移矩阵  */
  get pvmMatrix(): Matrix3 {
    const {
      offset: { x, y }
    } = this
    return super.pvmMatrix.multiply(new Matrix3().makeTranslation(x, y))
  }

  /* 绘图 */
  drawShape(ctx: CanvasRenderingContext2D) {
    const { image, offset, size, view, style } = this
    //样式
    style.apply(ctx)
    /**
     * 在画布指定位置绘制原图
      ctx.drawimage(image, dx, dy);
      在画布指定位置按原图大小绘制指定大小的图
      ctx.drawimage(image, dx, dy, dwidth, dheight);
      剪切图像，并在画布上绘制被剪切的部分
      ctx.drawimage(image, sx, sy, swidth, sheight, dx, dy, dwidth, dheight);
     */
    // 绘制图像
    if (view) {
      ctx.drawImage(
        image,
        view.x,
        view.y,
        view.width,
        view.height,
        offset.x,
        offset.y,
        size.x,
        size.y
      )
    } else {
      ctx.drawImage(image, offset.x, offset.y, size.x, size.y)
    }
  }
  /** 获取包围盒数据 */
  computeBoundingBox() {
    const {
      size: { x: imgW, y: imgH },
      boundingBox: { min, max }
    } = this
    min.copy(new Vector2(0, 0).applyMatrix3(this.worldMatrix))
    max.copy(new Vector2(imgW, imgH).applyMatrix3(this.worldMatrix))
  }
  /** 点位是否在图形中 */
  isPointInGraph(point: Vector2): Img | false {
    const isPointInBounds = this.isPointInBounds(point)
    return isPointInBounds ? this : false
  }
}
