/*
 * @Description:
 * @Author: ldx
 * @Date: 2023-11-15 12:21:19
 * @LastEditors: ldx
 * @LastEditTime: 2024-01-03 14:05:22
 */
import { Camera, dpr } from '../core/camera'
import { sceneParam } from '../core/scene'
import { Group } from './group'
import { Object2D, Object2DType } from './object2D'
export class Layer extends Group {
  // 类型
  readonly isLayer = true
  /** canvas元素 */
  domElement!: HTMLCanvasElement
  /** canvas 上下文对象 */
  ctx!: CanvasRenderingContext2D
  camera!: Camera

  constructor(attr: Object2DType = {}) {
    super()
    if (!sceneParam.container) {
      throw new Error('请在初始化Laye之前先初始化Scene')
    }
    this.setOption(attr)
    this.setOption(sceneParam)
    this.domElement = document.createElement('canvas')
    this.domElement.style.position = 'absolute'
    this.domElement.style.left = '0px'
    this.domElement.style.top = '0px'
    sceneParam.container.appendChild(this.domElement)
    const width = sceneParam.container.clientWidth
    const height = sceneParam.container.clientHeight
    this.setViewPort(width, height)
  }

  /* 设置属性 */
  setOption(attr: Object2DType) {
    Object.assign(this, attr)
  }
  /** 设置视口大小 */
  setViewPort(width = 300, height = 150) {
    this.domElement.style.width = width + 'px'
    this.domElement.style.height = height + 'px'
    this.domElement.width = width * dpr
    this.domElement.height = height * dpr
    this.ctx = this.domElement.getContext('2d') as CanvasRenderingContext2D
  }
  /** 获取视口大小 */
  getViewPort() {
    return {
      width: this.domElement.width,
      height: this.domElement.height,
      viewportWidth: this.domElement.clientWidth,
      viewportHeight: this.domElement.clientHeight
    }
  }
  /*  渲染 */
  async render() {
    const { ctx, children, autoClear, camera } = this
    const { width, height } = this.getViewPort()
    ctx.save()
    // 清理画布
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    autoClear && ctx.clearRect(0, 0, width, height)
    // 优化，不全量计算包围盒，只计算操作（平移、旋转、缩放）后的图形包围盒和组下修改的包围盒（add、remove、clear）
    // this.computeBoundingBox()
    // 是否需要判断包围盒是否在视口内
    // 如果不需要优化，那么就不判断组的包围盒是否在视口内，只判断每一个具体图形的包围盒是否在视口内
    const isEnableBoundingBoxOptimize =
      this.isEnableBoundingBoxOptimize(children)
    if (isEnableBoundingBoxOptimize) {
      // 判断layer内的图形是否都在视口内
      const viewportBounds = this.viewportBounds
      const flag = this.isGraphBounshInViewport(this, viewportBounds)
      if (!flag) return
    }

    // 渲染子对象
    for (let i = 0; i < children.length; i++) {
      const obj = children[i]
      ctx.save()
      // 视图投影矩阵
      obj.enableCamera && camera.transformInvert(ctx)
      // 绘图
      obj.draw(ctx)
      // obj.crtPath(ctx)

      ctx.restore()
    }

    ctx.restore()
  }
  isEnableBoundingBoxOptimize(children: Object2D[]): boolean {
    for (const child of children) {
      if (child instanceof Group) {
        const isChildEnableBoundingBoxOptimize =
          this.isEnableBoundingBoxOptimize(child.children)
        if (!isChildEnableBoundingBoxOptimize) {
          return false
        }
      } else if (!child.enableBoundingBoxOptimize) {
        return false
      }
    }
    return true
  }
  /** 获取包围盒数据 该操作会重新计算图层内所有的包围盒 */
  // computeBoundingBox() {
  //   const {
  //     children,
  //     boundingBox: { min, max }
  //   } = this
  //   // 根据点计算边界
  //   let minX = Infinity
  //   let minY = Infinity
  //   let maxX = -Infinity
  //   let maxY = -Infinity
  //   for (const child of children) {
  //     child.computeBoundingBox()
  //     minX = Math.min(minX, child.boundingBox.min.x)
  //     minY = Math.min(minY, child.boundingBox.min.y)
  //     maxX = Math.max(maxX, child.boundingBox.max.x)
  //     maxY = Math.max(maxY, child.boundingBox.max.y)
  //   }
  //   min.set(minX, minY)
  //   max.set(maxX, maxY)
  // }
}
