/*
 * @Description:
 * @Author: ldx
 * @Date: 2023-11-15 12:21:19
 * @LastEditors: ldx
 * @LastEditTime: 2023-12-12 13:43:01
 */
import { Object2D, Object2DType } from './object2D'

export class Group extends Object2D {
  // 子集
  children: Object2D[] = []
  // 类型
  readonly isGroup = true

  constructor(attr: Object2DType = {}) {
    super()
    this.setOption(attr)
  }

  /* 设置属性 */
  setOption(attr: Object2DType) {
    Object.assign(this, attr)
  }

  /* 添加元素 */
  add(...objs: Object2D[]) {
    for (const obj of objs) {
      if (obj === this) {
        return this
      }
      obj.parent && obj.remove()
      obj.parent = this
      this.children.push(obj)
      this.dispatchEvent({ type: 'add', obj })
    }
    this.sort()
    return this
  }

  /* 删除元素 */
  remove(...objs: Object2D[]) {
    const { children } = this
    for (const obj of objs) {
      const index = children.indexOf(obj)
      if (index !== -1) {
        obj.parent = undefined
        this.children.splice(index, 1)
        this.dispatchEvent({ type: 'remove', obj })
      } else {
        for (const child of children) {
          if (child instanceof Group) {
            child.remove(obj)
          }
        }
      }
    }
    return this
  }

  /* 清空children */
  clear() {
    for (const obj of this.children) {
      obj.parent = undefined
      this.dispatchEvent({ type: 'removed', obj })
    }
    this.children = []
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

  /* 根据名称获取元素 */
  getObjectByName(name: string) {
    return this.getObjectByProperty('name', name)
  }

  /* 根据某个属性的值获取子对象 */
  getObjectByProperty<T>(name: string, value: T): Object2D | undefined {
    const { children } = this
    for (let i = 0, l = children.length; i < l; i++) {
      const child = children[i]
      if (child[name] === value) {
        return child
      } else if (child instanceof Group) {
        const obj = child.getObjectByProperty<T>(name, value)
        if (obj) {
          return obj
        }
      }
    }
    return undefined
  }

  /* 遍历元素 */
  traverse(callback: (obj: Object2D) => void) {
    callback(this)
    const { children } = this
    for (const child of children) {
      if (child instanceof Group) {
        child.traverse(callback)
      } else {
        callback(child)
      }
    }
  }

  /* 遍历可见元素 */
  traverseVisible(callback: (obj: Object2D) => void) {
    if (!this.visible) {
      return
    }
    callback(this)
    const { children } = this
    for (const child of children) {
      if (!child.visible) {
        continue
      }
      if (child instanceof Group) {
        child.traverse(callback)
      } else {
        callback(child)
      }
    }
  }

  /* 绘图 */
  drawShape(ctx: CanvasRenderingContext2D) {
    const { children } = this
    /* 绘制子对象 */
    for (const obj of children) {
      obj.draw(ctx)
    }
  }
  /* 绘制图像边界 */
  crtPath(ctx: CanvasRenderingContext2D, matrix = this.pvmoMatrix) {
    this.children.forEach(obj=>obj.crtPath(ctx,matrix))
  }
}
