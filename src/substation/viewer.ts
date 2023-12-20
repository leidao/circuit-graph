/*
 * @Description:
 * @Author: ldx
 * @Date: 2023-12-08 17:16:01
 * @LastEditors: ldx
 * @LastEditTime: 2023-12-15 16:45:03
 */
import _ from 'lodash'

import {
  Group,
  Img,
  Line,
  OrbitControler,
  Scene,
  Shape,
  Text2D,
  Vector2
} from '@/dxCanvas'

import location from './images/136.png'
import TileLayer from './layer/tileLayer'
import {
  // calculatePolygonCenter,
  getPolygonAreaCenter,
  // getPxFromLngLat,
  lngLatToMercator,
  mercatorToLngLat,
  resolutions
} from './math'
type Option = {
  container: HTMLDivElement
}
export class Viewer {
  option: Option
  /** canvas元素 */
  domElement!: HTMLCanvasElement
  /** 场景 */
  scene!: Scene
  orbitControler!: OrbitControler
  center: [number, number] = [112.45, 34.62]
  zoom = 8
  /** 是否按下 */
  isMousedown = false
  lastMouseTime: null | number = null
  lastDuration = 0
  lastDistance!: [number, number]
  shapeGroup = new Group()
  group = new Group()
  tileLayer: TileLayer
  text2D = new Text2D({
    style: {
      fontSize: 20,
      fillStyle: '#00acec',
      textAlign: 'center',
      textBaseline: 'middle'
    }
  })
  /** 投影坐标，单位为米 */
  centerMercator: [number, number]
  colors = [
    '#5b8ff9',
    '#5ad8a6',
    '#5d7092',
    '#f6bd16',
    '#e86452',
    '#6dc8ec',
    '#945fb9',
    '#cc1a03'
  ]
  constructor(option: Option) {
    this.option = option
    this.centerMercator = lngLatToMercator(...this.center)
    this.init()
    this.listen()
    this.shapeGroup.index = 1
    this.group.index = 10
    this.text2D.index = 20
    this.scene.add(this.shapeGroup)
    this.scene.add(this.group)
    this.scene.add(this.text2D)
    this.tileLayer = new TileLayer({ center: this.center, zoom: this.zoom })
    this.scene.add(this.tileLayer)
    this.scene.render()
  }

  init() {
    if (!this.option.container) return
    const container = this.option.container
    const canvas = document.createElement('canvas')
    container.appendChild(canvas)
    this.domElement = canvas
    this.scene = new Scene({ domElement: canvas, isCenter: false })

    this.orbitControler = new OrbitControler(this.scene)
    this.orbitControler.addEventListener('change', () => {
      this.scene.render()
    })
    // const rect = new Rect({ startX: 0, startY: 0, width: 100, height: 100 })

    // this.scene.add(rect)
  }
  /** 缩放 */
  wheel = _.throttle((event: WheelEvent) => {
    this.orbitControler.wheel(event)
    const scale = 0.1
    if (event.deltaY > 0) {
      this.zoom -= scale
    } else {
      this.zoom += scale
    }
    const zoom = Math.ceil(this.zoom)
    if (zoom < 3 || zoom > 18) return
    this.tileLayer.setZoom(zoom)
    this.scene.render()
  }, 10)
  /** 鼠标按下 */
  pointerdown = (event: PointerEvent) => {
    const { button } = event
    if (button === 0) {
      this.isMousedown = true
      this.orbitControler.pointerdown(event)
    }
  }
  /** 鼠标移动 */
  pointermove = _.throttle((event: PointerEvent) => {
    this.orbitControler.pointermove(event)
    const { clientX, clientY } = event
    const mouseCoordPos = this.scene.clientToCoord(clientX, clientY)
    let isExists = null
    this.shapeGroup.children.forEach((shape) => {
      const flag = this.scene.isPointInObj(
        shape,
        mouseCoordPos,
        shape.pvmoMatrix
      )
      if (flag) {
        isExists = flag
        shape.setOption({
          index: 5,
          style: {
            fillStyle: '#f00',
            strokeStyle: '#f00'
          }
        })
        // const [x, y] = calculatePolygonCenter(shape.points)
        const [x, y] = getPolygonAreaCenter(shape.points)
        this.text2D.setOption({
          text: shape.name,
          offset: new Vector2(x, y)
        })
      } else {
        shape.setOption({
          index: 1,
          style: {
            fillStyle: shape.userData.originColor,
            strokeStyle: shape.userData.originColor
          }
        })
      }
    })
    !isExists && this.text2D.setOption({ text: '' })
    if (this.isMousedown) {
      const zoom = Math.ceil(this.zoom)
      // 记录本次拖动的时间段及偏移量
      const curTime = Date.now()
      if (this.lastMouseTime) {
        this.lastDuration = curTime - this.lastMouseTime
        this.lastDistance = [event.movementX, event.movementY]
      }
      this.lastMouseTime = curTime
      // 计算本次拖动的距离对应的经纬度数据
      const mx = event.movementX * resolutions[zoom]
      const my = event.movementY * resolutions[zoom]
      console.log('mx', mx, my)

      const [x, y] = lngLatToMercator(...this.center)
      // 更新拖动后的中心点经纬度
      this.center = mercatorToLngLat(x - mx, my + y)
      this.tileLayer.setCenter(this.center)
    }
    this.scene.render()
  }, 10)
  /** 鼠标松开 */
  pointerup = (event: PointerEvent) => {
    if (event.button === 0) {
      this.isMousedown = false
      this.orbitControler.pointerup()
    }
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
  }
  destroy() {
    /* 滑动滚轮缩放 */
    this.domElement.removeEventListener('wheel', this.wheel)
    /* 按住左键平移 */
    this.domElement.removeEventListener('pointerdown', this.pointerdown)
    window.removeEventListener('pointermove', this.pointermove)
    window.removeEventListener('pointerup', this.pointerup)
  }
  drawShape(data: any) {
    const { center, zoom } = this
    data.features.forEach((country: any, index: number) => {
      const color = this.colors[index % 8]
      if (country.geometry.type === 'Polygon') {
        const points: [number, number][] = []
        const coordinates = country.geometry.coordinates[0] || []
        if (coordinates.length === 0) return
        coordinates.forEach((elem: any) => {
          // points.push(...getPxFromLngLat(elem[0], elem[1], 14))
          points.push(this.lnglatToCoord(elem, zoom))
          //  points.push(elem[0]*10, elem[1]*10)
        })
        const shape = new Shape({
          points: points,
          style: {
            globalAlpha: 0.5,
            fillStyle: color,
            strokeStyle: color,
            lineWidth: 0.5
          },
          name: country.properties.name,
          userData: {
            originColor: color
          }
        })
        this.group.add(shape)
      } else if (country.geometry.type === 'MultiPolygon') {
        country.geometry.coordinates.forEach((polygon: any) => {
          const points: [number, number][] = []
          const coordinates = polygon[0] || []
          if (coordinates.length === 0) return
          coordinates.forEach((elem: any) => {
            // points.push(...getPxFromLngLat(elem[0], elem[1], 14))
            points.push(this.lnglatToCoord(elem, zoom))
            // points.push(elem[0]*10, elem[1]*10)
          })
          // if (country.properties.name !== '老城区') return
          const shape = new Shape({
            points: points,
            style: {
              globalAlpha: 0.3,
              fillStyle: color,
              strokeStyle: color
            },
            name: country.properties.name,
            userData: {
              originColor: color
            }
          })
          // const line = new Line({ points, lineWidth: 0.5 })
          // console.log('points',points);
          this.shapeGroup.add(shape)
        })
      }
    })

    this.scene.render()
  }
  drawLine(data: any[]) {
    const zoom = Math.floor(this.zoom)
    data.forEach(({ from, to }, i: number) => {
      if (from.length !== 2 || to.length !== 2) return
      this.drawPoint(from)
      this.drawPoint(to)
      const coord = this.lnglatToCoord(from, zoom).concat(
        this.lnglatToCoord(to, zoom)
      ) as unknown as [number, number][]
      const line = new Line({
        points: coord,
        style: { strokeStyle: this.colors[i % 8], lineWidth: 2 }
      })
      this.group.add(line)
    })
    this.scene.render()
  }
  drawPoint(lnglat: [number, number]) {
    if (lnglat.length !== 2) return
    const zoom = Math.floor(this.zoom)
    const coord = this.lnglatToCoord(lnglat, zoom)
    const img = new Img({
      src: location,
      position: new Vector2(coord[0], coord[1]),
      size: new Vector2(60, 60),
      offset: new Vector2(-30, -30)
    })
    this.group.add(img)
  }
  /** 经纬度转相机坐标 */
  lnglatToCoord(lnglat: [number, number], zoom: number): [number, number] {
    // 目标位置经纬度转3857坐标
    const mercatorCoord = lngLatToMercator(...lnglat)
    // 计算两者的距离，转换成像素
    const translate: [number, number] = [
      (mercatorCoord[0] - this.centerMercator[0]) / resolutions[zoom],
      -(mercatorCoord[1] - this.centerMercator[1]) / resolutions[zoom]
    ]
    return translate
  }
}
