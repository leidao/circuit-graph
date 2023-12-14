/*
 * @Description:
 * @Author: ldx
 * @Date: 2023-11-15 12:27:07
 * @LastEditors: ldx
 * @LastEditTime: 2023-12-12 16:48:13
 */

import { Camera } from '../core/camera'
import { EventDispatcher } from '../core/eventDispatcher'
import { Scene } from '../core/scene'
import { Vector2 } from '../math/vector2'
/* change 事件 */
// const _changeEvent = { type: 'change' }

/* 暂存数据类型 */
type Stage = {
  cameraZoom: number
  cameraPosition: Vector2
  panStart: Vector2
}

/* 配置项 */
type Option = {
  enableZoom?: boolean
  zoomSpeed?: number
  enablePan?: boolean
  panSpeed?: number
  /** 最小缩放值 */
  minZoom?: number
  /** 最大缩放值 */
  maxZoom?: number
}

/* 相机轨道控制 */
export class OrbitControler extends EventDispatcher {
  /** 相机 */
  camera: Camera
  scene: Scene
  /** 允许缩放 */
  enableZoom = true
  /** 缩放速度 */
  zoomSpeed = 3.0

  /** 允许位移 */
  enablePan = true
  /** 位移速度 */
  panSpeed = 1.0

  /** 是否正在拖拽中 */
  panning = false
  /** 最小缩放值 */
  minZoom = Infinity
  /** 最大缩放值 */
  maxZoom = Infinity
  /** 是否以鼠标为中心缩放 */
  scaleForMouse = false
  //变换相机前的暂存数据
  stage: Stage = {
    cameraZoom: 1,
    cameraPosition: new Vector2(),
    panStart: new Vector2()
  }

  constructor(scene: Scene, option: Option = {}) {
    super()
    this.camera = scene.camera
    this.scene = scene
    this.setOption(option)
  }

  /* 设置属性 */
  setOption(option: Option) {
    Object.assign(this, option)
  }
  setZoom(mousePosition?: Vector2) {
    const { camera, stage } = this
    let _mousePosition = new Vector2()
    if (mousePosition) {
      _mousePosition = this.scene.clientToCanvas(
        mousePosition.x,
        mousePosition.y
      )
    } else {
      const { viewportWidth, viewportHeight } = this.scene.getViewPort()
      _mousePosition.set(viewportWidth / 2, viewportHeight / 2)
    }
    const position = _mousePosition.sub(
      _mousePosition
        .clone()
        .sub(camera.position)
        .multiplyScalar(camera.zoom)
        .divideScalar(stage.cameraZoom)
    )
    // const p = _mousePosition
    //   .clone()
    //   .sub(camera.position)
    //   .multiplyScalar(camera.zoom)
    //   .sub(
    //     _mousePosition
    //       .clone()
    //       .sub(camera.position)
    //       .multiplyScalar(stage.cameraZoom)
    //   )
    // console.log('p', p.divideScalar(stage.cameraZoom))
    // const p2 = camera.position.clone().sub(p)
    camera.position.copy(position.clone())
    stage.cameraPosition.copy(position.clone())
    stage.cameraZoom = camera.zoom
  }

  /* 缩放 */
  wheel = (event: WheelEvent) => {
    const { deltaY, clientX, clientY } = event
    const { enableZoom, camera, zoomSpeed } = this
    if (!enableZoom) {
      return
    }
    const scale = Math.pow(0.95, zoomSpeed)

    if (deltaY > 0) {
      if (camera.zoom < this.minZoom && this.minZoom !== Infinity) return

      camera.zoom *= scale
    } else {
      if (camera.zoom > this.maxZoom && this.maxZoom !== Infinity) return
      camera.zoom /= scale
    }

    this.setZoom(new Vector2(clientX, clientY))

    const _changeEvent = {
      type: 'change',
      target: event
    }
    this.dispatchEvent(_changeEvent)
  }

  /* 鼠标按下 */
  pointerdown = (event: PointerEvent) => {
    const { clientX: cx, clientY: cy } = event
    const {
      enablePan,
      stage: { cameraPosition, panStart },
      camera: { position }
    } = this
    if (!enablePan) {
      return
    }
    this.panning = true
    cameraPosition.copy(position.clone())
    panStart.set(cx, cy)
  }

  /* 鼠标抬起 */
  pointerup = () => {
    const {
      camera: { position },
      stage: { cameraPosition }
    } = this
    this.panning = false
    cameraPosition.copy(position.clone())
  }

  /* 位移 */
  pointermove = (event: PointerEvent) => {
    const { clientX: cx, clientY: cy } = event
    const {
      enablePan,
      camera: { position },
      stage: {
        panStart: { x, y },
        cameraPosition
      },
      panning
    } = this
    if (!enablePan || !panning) {
      return
    }

    position.copy(cameraPosition.clone().add(new Vector2(cx - x, cy - y)))

    const _changeEvent = {
      type: 'change',
      target: event
    }
    this.dispatchEvent(_changeEvent)
  }
}
