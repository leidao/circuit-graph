/*
 * @Description:
 * @Author: ldx
 * @Date: 2023-11-15 12:19:56
 * @LastEditors: ldx
 * @LastEditTime: 2023-12-19 14:28:46
 */
import { Matrix3 } from '../math/matrix3'
import { Vector2 } from '../math/vector2'
import { Img } from '../objects/img'
import { Layer } from '../objects/layer'
import { Object2D } from '../objects/object2D'
import { Camera } from './camera'
import { EventDispatcher } from './eventDispatcher'

type SceneType = {
  container: HTMLDivElement
  autoClear?: boolean
  autoCenter?: boolean
}
/** 场景的参数 */
export const sceneParam = {} as SceneType & { camera: Camera }
export class Scene extends EventDispatcher {
  width!: number
  height!: number
  /** 容器 */
  container!: HTMLDivElement
  /** 相机 */
  camera = new Camera()
  /** 是否自动清理画布 */
  autoClear = true
  /** 是否自动居中画布 */
  autoCenter = true
  // 类型
  readonly isScene = true
  children: Layer[] = []
  constructor(attr: SceneType) {
    super()
    Object.assign(sceneParam, {
      container: attr.container,
      camera: this.camera,
      autoClear: attr.autoClear || this.autoClear,
      autoCenter: attr.autoCenter || this.autoCenter
    })
    Object.assign(this, attr)
    if (this.autoCenter) {
      const { clientWidth, clientHeight } = attr.container
      this.camera.position.set(clientWidth / 2, clientHeight / 2)
    }
  }

  /* 添加元素 */
  add(...objs: Layer[]) {
    for (const obj of objs) {
      if (!obj.isLayer) {
        return this
      }
      obj.parent && obj.remove()
      obj.parent = this
      this.children.push(obj)
      this.dispatchEvent({ type: 'add', target: obj })
    }
    this.sort()
    return this
  }

  /* 删除元素 */
  remove(...objs: Layer[]) {
    const { children } = this
    for (const obj of objs) {
      const index = children.indexOf(obj)
      if (index !== -1) {
        obj.parent = undefined
        this.children.splice(index, 1)
        this.dispatchEvent({ type: 'remove', target: obj })
      }
    }
    return this
  }

  /* 清空children */
  clear() {
    for (const obj of this.children) {
      obj.parent = undefined
      this.dispatchEvent({ type: 'removed', target: obj })
    }
    this.children = []
    return this
  }

  /* 排序 */
  private sort() {
    const { children } = this
    children.sort((a, b) => {
      return a.index - b.index
    })
  }
  /*  渲染 */
  render() {
    const { children } = this
    for (let i = 0; i < children.length; i++) {
      const layer = children[i]
      layer.render()
    }
  }
  getViewPort() {
    const child = this.children[0]
    return child.getViewPort()
  }
  setViewPort(width: number, height: number) {
    const { children } = this
    for (let i = 0; i < children.length; i++) {
      const layer = children[i]
      layer.setViewPort(width, height)
    }
  }

  /* client坐标转canvas坐标 */
  clientToCanvas(clientX: number, clientY: number) {
    const { container } = this
    const { left, top } = container.getBoundingClientRect()
    return new Vector2(clientX - left, clientY - top)
  }
  /* canvas坐标转client坐标*/
  canvasToClient(x: number, y: number): Vector2 {
    const { left, top } = this.container.getBoundingClientRect()
    return new Vector2(x + left, y + top)
  }

  /* canvas坐标转裁剪坐标 */
  canvastoClip({ x, y }: Vector2): Vector2 {
    return new Vector2(x, y)
  }

  /* client坐标转裁剪坐标 */
  clientToClip(clientX: number, clientY: number): Vector2 {
    return this.canvastoClip(this.clientToCanvas(clientX, clientY))
  }
  /* canvas坐标转相机坐标 */
  canvasToCoord(clientX: number, clientY: number): Vector2 {
    const {
      camera: { zoom, position }
    } = this
    return new Vector2(clientX, clientY).sub(position).divideScalar(zoom)
  }
  /* client坐标转相机坐标 */
  clientToCoord(clientX: number, clientY: number): Vector2 {
    return this.canvasToCoord(...this.clientToClip(clientX, clientY).toArray())
  }
  /** 相机坐标转canvas坐标 */
  coordToCanvas(coord: Vector2): Vector2 {
    const {
      camera: { zoom, position }
    } = this
    return coord.clone().multiplyScalar(zoom).add(position)
  }
  /** 相机坐标转client坐标 */
  coordToClient(coord: Vector2): Vector2 {
    const {
      camera: { zoom, position }
    } = this
    const { left, top } = this.container.getBoundingClientRect()
    return coord
      .clone()
      .multiplyScalar(zoom)
      .add(position)
      .add(new Vector2(left, top))
  }

  /** 点位是否在图形中 */
  isPointInGraph(point: Vector2, children = this.children): Object2D | false {
    for (let i = 0; i < children.length; i++) {
      const layer = children[i]
      const obj = layer.isPointInGraph(point)
      if (obj) return obj
    }
    return false
  }
}
