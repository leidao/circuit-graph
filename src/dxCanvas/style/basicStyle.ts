/*
 * @Description:
 * @Author: ldx
 * @Date: 2023-11-19 16:01:15
 * @LastEditors: ldx
 * @LastEditTime: 2023-12-12 14:38:02
 */
export type BasicStyleType = {
  // 投影相关
  /** 投影颜色 */
  shadowColor?: string | undefined
  /** 投影模糊 */
  shadowBlur?: number
  /** 投影偏移 */
  shadowOffsetX?: number
  /** 投影偏移 */
  shadowOffsetY?: number

  /** 全局透明度 */
  globalAlpha?: number | undefined

  /** 合成相关 */
  globalCompositeOperation?: GlobalCompositeOperation | undefined

  /** 裁剪 */
  clip?: boolean
}

export class BasicStyle {
  // 投影相关
  shadowColor: string | undefined
  shadowBlur = 0
  shadowOffsetX = 0
  shadowOffsetY = 0

  // 全局透明度
  globalAlpha: number | undefined

  //合成相关
  globalCompositeOperation: GlobalCompositeOperation | undefined

  // 裁剪
  clip = false

  /* 设置样式 */
  setOption(attr: BasicStyleType = {}) {
    Object.assign(this, attr)
  }

  /* 应用样式 */
  apply(ctx: CanvasRenderingContext2D) {
    const {
      globalAlpha,
      globalCompositeOperation,
      shadowColor,
      shadowBlur,
      shadowOffsetX,
      shadowOffsetY,
      clip
    } = this

    /* 投影 */
    if (shadowColor) {
      ctx.shadowColor = shadowColor
      ctx.shadowBlur = shadowBlur
      ctx.shadowOffsetX = shadowOffsetX
      ctx.shadowOffsetY = shadowOffsetY
    }

    /* 全局合成 */
    globalCompositeOperation &&
      (ctx.globalCompositeOperation = globalCompositeOperation)

    /*透明度合成*/
    globalAlpha !== undefined && (ctx.globalAlpha = globalAlpha)

    /* 裁剪 */
    clip && ctx.clip()
  }
}
