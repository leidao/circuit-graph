/*
 * @Description:
 * @Author: ldx
 * @Date: 2023-12-19 15:39:29
 * @LastEditors: ldx
 * @LastEditTime: 2023-12-23 21:40:13
 */
import { Group } from '../objects/group'
import { Object2D, Object2DType } from '../objects/object2D'
import { StandStyle, StandStyleType } from '../style/standStyle'

export type HelperType = Object2DType & {
  style?: StandStyleType
}

abstract class Helper extends Group {
  style: StandStyle = new StandStyle()
  // 类型
  readonly isHelper = true
  // 子集
  children: Object2D[] = []
  constructor(attr: HelperType = {}) {
    super()
    this.setOption(attr)
  }

  /* 属性设置 */
  setOption(attr: HelperType) {
    for (const [key, val] of Object.entries(attr)) {
      switch (key) {
        case 'style':
          this.style.setOption(val as StandStyleType)
          break
        default:
          this[key] = val
      }
    }
  }
  /** 样式设置 */
  setStyle(attr: StandStyleType) {
    this.style.setOption(attr)
  }
  /* 绘图 */
  abstract drawShape(ctx: CanvasRenderingContext2D): void

  /* 添加元素 */
  add(...objs: Object2D[]) {
    // debugger
    for (const obj of objs) {
      if (obj === this) {
        return this
      }
      if (this.children.indexOf(obj) > -1) {
        return this
      }
      this.children.push(obj)
      this.dispatchEvent({ type: 'add_helper', target: obj })
    }
    this.sort()
    this.computeBoundingBox()
    this.dispatchEvent({
      type: 'change_helper',
      target: this
    })
    return this
  }

  /* 删除元素 */
  remove(...objs: Object2D[]) {
    const { children } = this
    for (const obj of objs) {
      const index = children.indexOf(obj)
      if (index !== -1) {
        this.children.splice(index, 1)
        this.dispatchEvent({ type: 'remove_helper', target: obj })
      }
    }
    this.computeBoundingBox()
    this.dispatchEvent({
      type: 'change_helper',
      target: this
    })
    return this
  }

  /* 清空children */
  clear() {
    for (const obj of this.children) {
      this.dispatchEvent({ type: 'removed_helper', target: obj })
    }
    this.children = []
    this.computeBoundingBox()
    this.dispatchEvent({
      type: 'change_helper',
      target: this
    })
    return this
  }

  /* 排序 */
  sort() {
    const { children } = this
    children.sort((a, b) => {
      return a.index - b.index
    })
    for (const child of children) {
      child instanceof Group && child.sort()
    }
  }
}

export default Helper
