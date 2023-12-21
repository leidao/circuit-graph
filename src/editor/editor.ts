/*
 * @Description:
 * @Author: ldx
 * @Date: 2023-12-01 17:17:18
 * @LastEditors: ldx
 * @LastEditTime: 2023-12-21 17:33:29
 */

import _ from 'lodash'

import {
  HoverHelper,
  Img,
  OrbitControler,
  Scene,
  SelectHelper,
  Vector2
} from '@/dxCanvas'
import { Layer } from '@/dxCanvas/objects/layer'
import { Ruler } from '@/dxCanvas/objects/ruler'

import KeybordManager from './command/keybordManger'
import CursorManager from './cursor/cursorManager'
import ToolManager from './tools/toolManager'

type Option = {
  container: HTMLDivElement
}
export class Editor {
  /** 场景 */
  scene!: Scene
  /** 图层 */
  baseLayer!: Layer
  dynamicLayer!: Layer
  /** 控制器 */
  orbitControler!: OrbitControler
  /** 标尺 */
  ruler!: Ruler
  /** 鼠标按下时的位置 */
  mouseStart = new Vector2(Infinity)
  /** 是否按下鼠标 */
  isMousedown = false
  /** canvas元素 */
  domElement!: HTMLDivElement
  /* 鼠标的相机坐标位 */
  mouseCoordPos = new Vector2(Infinity)
  /** 当前工具栏 */
  toolOperation = 'panning'
  /** 鼠标是否按下 */
  isPanning = false
  /** 选中的图片 */
  selectImg!: null | HTMLImageElement
  /** tool管理器 */
  toolManager!: ToolManager
  /** 快捷键管理器 */
  keybordManager!: KeybordManager
  /** 鼠标样式管理器 */
  cursorManager!: CursorManager
  constructor(option: Option) {
    if (!option.container) return
    // 场景相关
    const container = option.container
    // const canvas = document.createElement('canvas')
    // container.appendChild(canvas)
    this.domElement = container
    this.scene = new Scene({ container: container })
    this.baseLayer = new Layer()
    this.dynamicLayer = new Layer()
    this.scene.add(this.baseLayer)
    this.scene.add(this.dynamicLayer)
    this.listen()
    // 标尺相关
    const rulerConfig = {
      x: 0, // 刻度尺x坐标位置,坐标原点在左上角
      y: 0, // 刻度尺y坐标位置,坐标原点在左上角
      w: 20, // 标尺的高度
      h: 16 // 刻度线基础高度
    }
    this.ruler = new Ruler(rulerConfig)
    this.dynamicLayer.add(this.ruler)
    // 控制器相关
    this.orbitControler = new OrbitControler(this.scene)
    this.orbitControler.maxZoom = 60
    this.orbitControler.minZoom = 0.02
    this.orbitControler.addEventListener('change', () => {
      this.scene.render()
    })
    this.scene.render()
    // tool管理
    this.toolManager = new ToolManager(this)
    // 快捷键管理
    this.keybordManager = new KeybordManager(this)
    // 鼠标样式管理
    this.cursorManager = new CursorManager(this)

    // 快捷键注册
    this.activeKeyboard()
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
    // const { clientX, clientY } = event
    // const mouseCoordPos = this.scene.clientToCoord(clientX, clientY)
    this.toolManager.pointermove(event)
    // const obj = this.dynamicLayer.isPointInGraph(mouseCoordPos)
    // // console.log('obj', obj)
  }, 10)
  /** 鼠标松开 */
  pointerup = (event: PointerEvent) => {
    if (event.button === 0) {
      this.isPanning = false
      this.toolManager.pointerup(event)
    }
  }

  resize = _.throttle(() => {
    const container = this.scene.container
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
      name: this.selectImg.alt,
      image: this.selectImg,
      position: coordinate,
      size: new Vector2(70, 50),
      offset: new Vector2(70, 50).multiplyScalar(-0.5)
    })
    this.baseLayer.add(pattern)
    const selectHelper = this.dynamicLayer.getObjectByName(
      'selectHelper'
    ) as SelectHelper
    selectHelper.clear()
    selectHelper.add(pattern)
    this.scene.render()
  }
  /** 设置缩放大小 */
  setZoom(zoom: number) {
    const { orbitControler, scene } = this
    scene.camera.zoom = zoom
    orbitControler.setZoom()
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
  /** 删除选中的图形 */
  delete = () => {
    const selectHelper = this.dynamicLayer.getObjectByName(
      'selectHelper'
    ) as SelectHelper
    const hoverHelper = this.dynamicLayer.getObjectByName(
      'hoverHelper'
    ) as HoverHelper
    if (!selectHelper || !hoverHelper) return
    for (const obj of selectHelper.children) {
      hoverHelper.remove(obj)
      obj.remove()
    }
    selectHelper.clear()
    this.cursorManager.setCursor('default')
    this.scene.render()
  }
  /** 全选 */
  selectAll = () => {
    const selectHelper = this.dynamicLayer.getObjectByName(
      'selectHelper'
    ) as SelectHelper
    if (!selectHelper) return
    for (const obj of this.baseLayer.children) {
      selectHelper.add(obj)
    }
    this.scene.render()
  }
  /** 显示全部/适应画布 */
  showAll = () => {
    const {
      boundingBox: { min, max },
      center
    } = this.baseLayer
    if (center.isEmpty()) return

    const { viewportWidth, viewportHeight } = this.scene.getViewPort()
    this.scene.camera.zoom = 1
    this.orbitControler.setZoom()

    // 算出图层的中心和画布的中心的距离差，平移相机
    const { position } = this.scene.camera
    const coord = this.scene.canvasToCoord(
      viewportWidth / 2,
      viewportHeight / 2
    )

    const delta = coord.sub(center)
    position.copy(position.clone().add(delta))

    // 算出图层的宽度和高度和画布的宽度和高度，取最大值计算比例，缩放相机
    const vert = this.scene
      .coordToCanvas(max)
      .sub(this.scene.coordToCanvas(min))
    const layerMax = Math.max(vert.x, vert.y)
    // 适当的缩小画布大小，让缩放值更小点，可以看到更多的图形，而不是正好充满屏幕
    // 图层的宽度和高度取最大值，画布则取和图层队友的宽度或者高度
    // 这里用像素的大小去计算比例
    const canvasMax =
      layerMax === vert.x ? viewportWidth - 60 : viewportHeight - 60
    const scale = canvasMax / layerMax

    const zoom = Math.min(9, scale)

    this.scene.camera.zoom = zoom
    this.orbitControler.setZoom()

    this.scene.render()
  }
  /** 显示选中图形/适应选中图形大小 */
  showSelectGraph = () => {
    const selectHelper = this.dynamicLayer.getObjectByName(
      'selectHelper'
    ) as SelectHelper
    if (!selectHelper) return
    const {
      boundingBox: { min, max },
      center
    } = selectHelper
    if (center.isEmpty()) return
    const { viewportWidth, viewportHeight } = this.scene.getViewPort()
    this.scene.camera.zoom = 1
    this.orbitControler.setZoom()

    // 算出图层的中心和画布的中心的距离差，平移相机
    const { position } = this.scene.camera
    const coord = this.scene.canvasToCoord(
      viewportWidth / 2,
      viewportHeight / 2
    )

    const delta = coord.sub(center)
    position.copy(position.clone().add(delta))

    // 算出图层的宽度和高度和画布的宽度和高度，取最大值计算比例，缩放相机
    const vert = this.scene
      .coordToCanvas(max)
      .sub(this.scene.coordToCanvas(min))
    const layerMax = Math.max(vert.x, vert.y)
    // 适当的缩小画布大小，让缩放值更小点，可以看到更多的图形，而不是正好充满屏幕
    // 图层的宽度和高度取最大值，画布则取和图层队友的宽度或者高度
    // 这里用像素的大小去计算比例
    const canvasMax =
      layerMax === vert.x ? viewportWidth - 60 : viewportHeight - 60
    const scale = canvasMax / layerMax

    const zoom = Math.min(9, scale)

    this.scene.camera.zoom = zoom
    this.orbitControler.setZoom()

    this.scene.render()
  }
  /** 激活快捷键 */
  activeKeyboard() {
    // 删除
    this.keybordManager.registry({
      name: 'delete',
      keyboard: ['backspace'],
      execute: this.delete
    })
    // 放大
    this.keybordManager.registry({
      name: 'zoomIn',
      keyboard: ['ctrl+='],
      execute: this.zoomIn
    })
    // 缩小
    this.keybordManager.registry({
      name: 'zoomOut',
      keyboard: ['ctrl+-'],
      execute: this.zoomOut
    })
    // 全选
    this.keybordManager.registry({
      name: 'selectAll',
      keyboard: ['ctrl+a'],
      execute: this.selectAll
    })
    // 适应画布
    this.keybordManager.registry({
      name: 'showAll',
      keyboard: ['ctrl+1'],
      execute: this.showAll
    })
    // 适应选中图形
    this.keybordManager.registry({
      name: 'showSelectGraph',
      keyboard: ['ctrl+2'],
      execute: this.showSelectGraph
    })
  }

  /** 失活快捷键 */
  inactiveKeyboard() {
    this.keybordManager.unRegister('delete')
    this.keybordManager.unRegister('zoomIn')
    this.keybordManager.unRegister('zoomOut')
    this.keybordManager.unRegister('selectAll')
    this.keybordManager.unRegister('showAll')
    this.keybordManager.unRegister('showSelectGraph')
  }

  listen() {
    /* 滑动滚轮缩放 */
    this.domElement.addEventListener('wheel', this.wheel, {
      passive: false
    })
    /* 按住左键平移 */
    this.domElement.addEventListener('pointerdown', this.pointerdown)
    this.domElement.addEventListener('pointermove', this.pointermove)
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
    this.inactiveKeyboard()
  }
}
