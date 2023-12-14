/*
 * @Description:
 * @Author: ldx
 * @Date: 2023-12-01 17:17:18
 * @LastEditors: ldx
 * @LastEditTime: 2023-12-09 14:57:41
 */

import _ from 'lodash'

import { Img, Line, OrbitControler, Scene, Vector2 } from '@/dxCanvas'
import { Ruler } from '@/dxCanvas/objects/ruler'

import ToolManager from './tools/toolManager'

type Option = {
  container: HTMLDivElement
}
export class Editor {
  /** 场景 */
  scene!: Scene
  /** 控制器 */
  orbitControler!: OrbitControler
  option: Option
  /** 标尺 */
  ruler!: Ruler
  /** 鼠标按下时的位置 */
  mouseStart = new Vector2(Infinity)
  /** 是否按下鼠标 */
  isMousedown = false
  /** 缩放速度 */
  zoomSpeed = 1
  /** 缩放比例 */
  scale = 1
  /** canvas元素 */
  domElement!: HTMLCanvasElement
  /* 鼠标的裁剪坐标位 */
  mouseClipPos = new Vector2(Infinity)
  /** 当前工具栏 */
  toolOperation = 'panning'
  /** 鼠标是否按下 */
  isPanning = false
  line!: Line
  /** 选中的图片 */
  selectImg!: null | HTMLImageElement
  /** tool管理器 */
  toolManager!: ToolManager
  constructor(option: Option) {
    this.option = option
    if (!this.option.container) return
    // 场景相关
    const container = this.option.container
    const canvas = document.createElement('canvas')
    container.appendChild(canvas)
    this.domElement = canvas
    this.scene = new Scene({ domElement: canvas })
    this.listen()
    // 标尺相关
    const rulerConfig = {
      x: 0, // 刻度尺x坐标位置,坐标原点在左上角
      y: 0, // 刻度尺y坐标位置,坐标原点在左上角
      w: 20, // 标尺的高度
      h: 16 // 刻度线基础高度
    }
    this.ruler = new Ruler(rulerConfig)
    this.scene.add(this.ruler)
    // 控制器相关
    this.orbitControler = new OrbitControler(this.scene)
    this.orbitControler.maxZoom = 10
    this.orbitControler.minZoom = 0.1
    this.orbitControler.addEventListener('change', () => {
      this.scene.render()
    })
    this.scene.render()
    // tool管理
    this.toolManager = new ToolManager(this)
  }

  /** 缩放 */
  wheel = _.throttle((event: WheelEvent) => {
    if (event.ctrlKey || event.metaKey) {
      this.orbitControler.wheel(event)
    } else {
      const down = new PointerEvent('pointerdown', { clientX: 0, clientY: 0 })
      this.orbitControler.pointerdown(down)
      const move = new PointerEvent('pointermove', {
        clientX: -event.deltaX,
        clientY: -event.deltaY
      })
      this.orbitControler.pointermove(move)
      this.orbitControler.pointerup()
    }
  }, 10)
  /** 鼠标按下 */
  pointerdown = (event: PointerEvent) => {
    const { button } = event
    if (button === 0) {
      this.isPanning = true
      this.toolManager.pointerdown(event)
    }
  }
  /** 鼠标移动 */
  pointermove = _.throttle((event: PointerEvent) => {
    this.toolManager.pointermove(event)
  }, 10)
  /** 鼠标松开 */
  pointerup = (event: PointerEvent) => {
    if (event.button === 0) {
      this.isPanning = false
      this.toolManager.pointerup(event)
    }
  }

  resize = _.throttle(() => {
    const container = this.option.container
    const width = container.clientWidth
    const height = container.clientHeight
    this.scene.setViewPort(width, height)
    this.scene.render()
  }, 20)
  /** 拖拽进入目标元素 */
  dragenter = (event: DragEvent) => {
    // 表示在当前位置放置拖拽元素将进行移动操作
    event.dataTransfer && (event.dataTransfer.dropEffect = 'move')
  }
  /** 拖拽离开目标元素 */
  dragleave = (event: DragEvent) => {
    // 表示在当前位置不允许放置拖拽元素，即拖放操作无效。
    event.dataTransfer && (event.dataTransfer.dropEffect = 'none')
  }
  /** 拖拽元素在目标元素上移动 */
  dragover = (event: DragEvent) => {
    // 如果默认行为没有被阻止,drop事件不会被触发
    event.preventDefault()
  }
  /** 拖拽元素在目标元素上松开鼠标 */
  drop = (event: DragEvent) => {
    if (!this.selectImg) return
    const { clientX, clientY } = event
    const coordinate = this.scene.clientToCoord(clientX, clientY)
    const pattern = new Img({
      image: this.selectImg,
      position: coordinate,
      size: new Vector2(70, 50),
      offset: new Vector2(70, 50).multiplyScalar(-0.5)
    })
    this.scene.add(pattern)
    this.scene.render()
  }
  /**  放大 */
  zoomIn = () => {
    const { orbitControler, scene } = this
    const scale = Math.pow(0.95, orbitControler.zoomSpeed)
    if (scene.camera.zoom > orbitControler.maxZoom) return
    scene.camera.zoom /= scale
    this.orbitControler.setZoom()

    this.scene.render()
  }

  /** 缩小 */
  zoomOut = () => {
    const { orbitControler, scene } = this
    const scale = Math.pow(0.95, orbitControler.zoomSpeed)
    if (scene.camera.zoom < orbitControler.minZoom) return
    scene.camera.zoom *= scale
    this.orbitControler.setZoom()
    this.scene.render()
  }

  listen() {
    /* 滑动滚轮缩放 */
    this.domElement.addEventListener('wheel', this.wheel, {
      passive: false
    })
    /* 按住左键平移 */
    this.domElement.addEventListener('pointerdown', this.pointerdown)
    window.addEventListener('pointermove', this.pointermove)
    window.addEventListener('pointerup', this.pointerup)
    window.addEventListener('resize', this.resize)
  }
  destroy() {
    /* 滑动滚轮缩放 */
    this.domElement.removeEventListener('wheel', this.wheel)
    /* 按住左键平移 */
    this.domElement.removeEventListener('pointerdown', this.pointerdown)
    window.removeEventListener('pointermove', this.pointermove)
    window.removeEventListener('pointerup', this.pointerup)
    window.removeEventListener('resize', this.resize)
  }
}
