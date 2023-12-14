/*
 * @Description:
 * @Author: ldx
 * @Date: 2023-11-15 12:24:05
 * @LastEditors: ldx
 * @LastEditTime: 2023-12-03 19:55:50
 */
import { Scene } from '../core/scene'
import { Matrix3 } from '../math/matrix3'
import { Vector2 } from '../math/vector2'
import { Img } from '../objects/img'
import { Object2D, Object2DType } from '../objects/object2D'
import { Frame, State } from './frame'
import { MouseShape } from './mouseShape'
// import { ImgTransformer } from './imgTransformer'
// import { MouseShape } from './mouseShape'

const _changeEvent = { type: 'change' }

export class ImgControler extends Object2D {
  /** 要控制的图片 */
  _img: Img | null = null
  /** 图案控制框 */
  frame = new Frame()
  /** 渲染顺序 */
  index = Infinity
  /** 不受相机影响 */
  enableCamera = false
  /** 鼠标状态 */
  mouseState: State = null
  /** 鼠标的裁剪坐标位 */
  clipMousePos = new Vector2()

  /** 鼠标图案 */
  mouseShape = new MouseShape({
    vertives: this.frame.vertives,
    center: this.frame.center,
    mousePos: this.clipMousePos
  })
  get img() {
    return this._img
  }
  set img(val) {
    if (this._img === val) {
      return
    }
    this._img = val
    if (val) {
      this.frame.img = val
      this.dispatchEvent({ type: 'selected', img: val })
    }
    this.dispatchEvent(_changeEvent)
  }
  /* 鼠标按下 */
  pointerdown(img: Img | null, mp: Vector2) {
    if (!this.mouseState) {
      this.img = img
      if (!img) {
        return
      }
    }
    // 更新鼠标裁剪坐标位
    this.clipMousePos.copy(mp)
    // 获取鼠标状态
    this.mouseState = this.frame.getMouseState(mp)
    this.dispatchEvent(_changeEvent)
  }
  /* 鼠标移动 */
  pointermove(mp: Vector2) {
    if (!this.img) {
      return
    }
    // 更新鼠标裁剪坐标位
    this.clipMousePos.copy(mp)
    // 获取鼠标状态
    this.mouseState = this.frame.getMouseState(mp)
    // console.log('mouseState', this.mouseState)

    this.dispatchEvent(_changeEvent)
  }
  /* 绘图 */
  draw(ctx: CanvasRenderingContext2D) {
    const { img } = this
    if (!img) {
      return
    }
    const { frame, mouseShape, mouseState } = this
    /* 绘制外框 */
    frame.draw(ctx)
    /* 绘制鼠标图案 */
    mouseShape.draw(ctx, mouseState)
  }
}
