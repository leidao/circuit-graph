/*
 * @Description:
 * @Author: ldx
 * @Date: 2023-11-15 12:21:19
 * @LastEditors: ldx
 * @LastEditTime: 2024-01-08 10:34:34
 */
import { Vector2 } from '../math/vector2'
import { Object2D, Object2DType } from './object2D'
import { nextTick } from './objectUtils'

export class Group extends Object2D {
  // 子集
  children: Object2D[] = []
  // 类型
  readonly isGroup = true

  constructor(attr: Object2DType = {}) {
    super()
    this.setOption(attr)
    this.addEventListener('bound_change', this.computeBoundingBox)
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
      obj.computeBoundingBox()
      this.children.push(obj)
      this.dispatchEvent({ type: 'add', target: obj })
      obj.addEventListener('bound_change', this.computeBoundingBox)
    }
    this.sort()

    // nextTick(() => {
    this.dispatchEvent({ type: 'bound_change', target: this })
    this.dispatchEvent({ type: 'change', target: this })
    // })

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
        this.dispatchEvent({ type: 'remove', target: obj })
        obj.removeEventListener('bound_change', this.computeBoundingBox)
      } else {
        for (const child of children) {
          if (child instanceof Group) {
            child.remove(obj)
          }
        }
      }
    }
    this.dispatchEvent({ type: 'bound_change', target: this })
    this.dispatchEvent({ type: 'change', target: this })
    return this
  }

  /* 清空children */
  clear() {
    for (const obj of this.children) {
      obj.parent = undefined
      this.dispatchEvent({ type: 'removed', target: obj })
      obj.removeEventListener('bound_change', this.computeBoundingBox)
    }
    this.children = []
    this.dispatchEvent({ type: 'bound_change', target: this })
    this.dispatchEvent({ type: 'change', target: this })
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
  crtPath(ctx: CanvasRenderingContext2D) {
    this.children.forEach((obj) => obj.crtPath(ctx))
  }
  /** 获取包围盒数据 */
  computeBoundingBox = () => {
    const {
      children,
      boundingBox: { min, max }
    } = this
    // 根据点计算边界
    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity
    for (const child of children) {
      for (const path of child.boundingBox._path) {
        minX = Math.min(minX, path.x)
        minY = Math.min(minY, path.y)
        maxX = Math.max(maxX, path.x)
        maxY = Math.max(maxY, path.y)
      }
    }
    min.set(minX, minY)
    max.set(maxX, maxY)
    min.applyMatrix3(this.worldMatrix)
    max.applyMatrix3(this.worldMatrix)

    this.boundingBox._path = [
      min,
      new Vector2(maxX, minY).applyMatrix3(this.worldMatrix),
      max,
      new Vector2(minX, maxY).applyMatrix3(this.worldMatrix)
    ]
    // console.log('group', this.boundingBox._path)
  }
  /** 点位是否在图形中 */
  isPointInGraph(point: Vector2): Object2D | false {
    const isPointInBounds = this.isPointInBounds(point)
    if (isPointInBounds) {
      for (const child of this.children) {
        const flag = child.isPointInGraph(point)
        if (flag) return child
      }
    }
    return false
  }
}
