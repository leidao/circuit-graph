/*
 * @Description: 地图图层
 * @Author: ldx
 * @Date: 2023-12-11 10:47:23
 * @LastEditors: ldx
 * @LastEditTime: 2023-12-12 18:02:31
 */

import { getPxFromLngLat, getRandomDomainIndex, getTileRowAndCol, TILE_SIZE } from "../math";
import gcoord from 'gcoord';
import { Group } from "@/dxCanvas";
import Tile from "./tile";
const mapList: TileType[] = [
  {
    name: '高德地图',
    value: 'gaode',
    // 'http://192.168.10.247/{z}/{x}/{y}.png'
    // , 'https://webrd0{1-4}.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scale=1&style=8'
    urls: ['https://webrd0{1-4}.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scale=1&style=8'],
    // urls: ['http://192.168.10.247/{z}/{x}/{y}.png'],
  },
  {
    name: '高德影像图',
    value: 'gaodeImage',
    urls: ['https://webst0{1-4}.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&style=6', 'https://wprd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=8&x={x}&y={y}&z={z}&scl=1&ltype=4']
  },
  {
    name: '百度地图',
    value: 'baidu',
    urls: ['https://maponline2.bdimg.com/tile/?qt=vtile&x={x}&y={y}&z={z}&styles=pl&scaler=2&udt=&from=jsapi2_0'],
    origin: 'center',// 坐标系原点
    axis: ['right', 'top'],// 坐标轴方向
    resolutions: (() => { // 自定义分辨率
      let resolutions = [];
      for (let i = 0; i <= 18; i++) {
        resolutions[i] = Math.pow(2, 18 - i);
      }
      return resolutions
    })(),
    // 自定义经纬度和墨卡托坐标转换方法
    lngLatToMercator(lng: number, lat: number) {
      return gcoord.transform(
        [lng, lat],
        gcoord.GCJ02,
        gcoord.BD09MC
      )
    },
    mercatorToLngLat(lng: number, lat: number) {
      return gcoord.transform(
        [lng, lat],
        gcoord.BD09MC,
        gcoord.GCJ02
      )
    }
  },
  {
    name: '腾讯地图',
    value: 'tx',
    urls: ['https://rt{1-3}.map.gtimg.com/tile?z={z}&x={x}&y={y}&styleid=1&scene=0'],
    transformXYZ(x: number, y: number, z: number) {
      // 原点从左上角转换成左下角
      y = Math.pow(2, z) - y - 1
      return [x, y, z]
    }
  },
  {
    name: 'GeoQ',
    value: 'geoq',
    urls: ['http://cache1.arcgisonline.cn/arcgis/rest/services/ChinaOnlineCommunity/MapServer/tile/{z}/{y}/{x}']
  },
  {
    name: '天地图',
    value: 'tianditu',
    urls: ['http://t{0-7}.tianditu.com/DataServer?T=vec_w&tk=2c009e76130364aaf09aa30ef0621154&x={x}&y={y}&l={z}', 'http://t3.tianditu.com/DataServer?T=cva_w&tk=2c009e76130364aaf09aa30ef0621154&x={x}&y={y}&l={z}'],
    // 需要火星坐标系转4326
    transformLngLat(lng: number, lat: number) {
      return gcoord.transform(
        [lng, lat],
        gcoord.GCJ02,
        gcoord.WGS84
      );
    }
  },
  {
    name: '必应中文',
    value: 'bing',
    urls: [''],
    getTileUrl(x: number, y: number, z: number) {
      let result = '', zIndex = 0
      for (; zIndex < z; zIndex++) {
        result = ((x & 1) + 2 * (y & 1)).toString() + result
        x >>= 1
        y >>= 1
      }
      let domainIndex = getRandomDomainIndex('http://dynamic.t{0-3}.tiles.ditu.live.com/comp/ch/')
      return `http://dynamic.t${domainIndex}.tiles.ditu.live.com/comp/ch/${result}?it=G,VE,BX,L,LA&mkt=zh-cn,syr&n=z&og=111&ur=CN`
    }
  },
]
type Option = {
  center?: [number, number]
  zoom?: number
}
export type Opt = {
  origin?: string // 坐标系原点
  resolutions?: number[]// 自定义分辨率
  lngLatToMercator?: (lng: number, lat: number) => [number, number] // 自定义经纬度和墨卡托坐标转换方法
}
export type TileType = Opt & {
  name: string
  value: string
  urls: string[]
  axis?: string[]// 坐标轴方向
  origin?: string // 坐标系原点
  resolutions?: number[]// 自定义分辨率
  lngLatToMercator?: (lng: number, lat: number) => [number, number] // 自定义经纬度和墨卡托坐标转换方法
  mercatorToLngLat?: (lng: number, lat: number) => [number, number]
  transformXYZ?: (x: number, y: number, z: number) => [number, number, number]
  // 需要火星坐标系转4326
  transformLngLat?: (lng: number, lat: number) => [number, number]
  getTileUrl?: (x: number, y: number, z: number) => string
}
class TileLayer extends Group {
  // enableCamera =  false
  /** 图层中心 */
  center: [number, number] = [112.56, 34.59]
  /** 瓦片数据 */
  tile!: TileType
  /** 初始缩放层级 */
  zoom = 14
  /** 缩放层级范围 */
  minZoom = 3
  maxZoom = 18

  /** 缓存瓦片实例 */
  tileCache: { [key: string]: Tile } = {}
  /** 记录当前画布上需要的瓦片 */
  currentTileCache: { [key: string]: boolean } = {}

  constructor(option: Option = {}) {
    super()
    Object.assign(this, option);
    this.tile = mapList[0]
  }

  get width() {
    const scene = this.getScene()
    if (!scene) return 0
    const { viewportWidth } = scene?.getViewPort()
    return viewportWidth
  }
  get height() {
    const scene = this.getScene()
    if (!scene) return 0
    const { viewportHeight } = scene?.getViewPort()
    return viewportHeight
  }
  setCenter(center: [number, number]) {
    this.center = center
  }
  setZoom(zoom: number) {
    this.zoom = zoom
  }
  setZoomAntCenter(zoom: number, center: [number, number]) {
    this.setZoom(zoom)
    this.setCenter(center)
  }
  drawShape(ctx: CanvasRenderingContext2D) {
    this.renderTiles()
    const { children } = this
    /* 绘制子对象 */
    for (const obj of children) {
      obj.draw(ctx)
    }
  }
  async renderTiles(isFadeIn = false) {
    // 图层中心
    let center = this.center
    // 根据不同的厂商的瓦片地图坐标系转换经纬度
    if (this.tile.transformLngLat) {
      center = this.tile.transformLngLat(...center)
    }
    // 地图自定义数据
    let plusOpt = {
      origin: this.tile.origin,
      resolutions: this.tile.resolutions,
      lngLatToMercator: this.tile.lngLatToMercator
    }
    // 中心点对应的瓦片
    let centerTile = getTileRowAndCol(...center, this.zoom, plusOpt);
    // 中心瓦片左上角对应的像素坐标
    let centerTilePos = [
      centerTile[0] * TILE_SIZE,
      centerTile[1] * TILE_SIZE,
    ];
    // 中心点对应的像素坐标
    let centerPos = getPxFromLngLat(...center, this.zoom, plusOpt);

    // 中心像素坐标距中心瓦片左上/下角的差值
    let offset = [
      centerPos[0] - centerTilePos[0],
      centerPos[1] - centerTilePos[1],
    ];
    // console.log('rowMinNum====', this.zoom);

    // 计算瓦片数量
    let rowMinNum = Math.ceil((this.width / 2 - offset[0]) / TILE_SIZE);
    let colMinNum = Math.ceil((this.height / 2 - offset[1]) / TILE_SIZE);
    let rowMaxNum = Math.ceil(
      (this.width / 2 - (TILE_SIZE - offset[0])) / TILE_SIZE
    );
    let colMaxNum = Math.ceil(
      (this.height / 2 - (TILE_SIZE - offset[1])) / TILE_SIZE
    );
    // y轴向上
    let axisYIsTop = this.tile.axis ? this.tile.axis[1] === 'top' : false
    this.currentTileCache = {}; // 清空缓存对象
    // 渲染画布内所有瓦片
    for (let i = -rowMinNum; i <= rowMaxNum; i++) {
      for (let j = -colMinNum; j <= colMaxNum; j++) {
        // 当前瓦片的行列号
        let row = centerTile[0] + i;
        let col = centerTile[1] + j;
        // 当前瓦片的显示位置
        let _j = j
        // 百度地图，坐标系和画布坐标系y轴相反
        if (axisYIsTop && j !== 0) {
          _j = -j
        }
        let x = i * TILE_SIZE - offset[0];
        // 百度地图的offset[1]是中心点距中心瓦片左下角的距离，需要换算成左上角的y值
        let y = _j * TILE_SIZE - (axisYIsTop ? TILE_SIZE - offset[1] : offset[1]);
        // 缓存key
        let cacheKey = row + "_" + col + "_" + this.zoom;
        // 记录当前需要的瓦片
        this.currentTileCache[cacheKey] = true;
        // 该瓦片已加载过
        // let layer = this.getCurrentMainLayer();
        const tile = this.tileCache[cacheKey]
        // console.log('cacheKey', cacheKey, tile);

        if (tile) {
          // tile.updateLayer(layer)
          tile.updatePos(x, y)
          tile.render(isFadeIn);
        } else {
          // 未加载过
          const tile = new Tile({
            layer: this,
            row,
            col,
            zoom: this.zoom,
            x,
            y,
            // 判断瓦片是否在当前画布缓存对象上，是的话则代表需要渲染
            shouldRender: (key) => {
              return this.currentTileCache[key];
            },
            // 获取当前地图类型
            getMapTypeData: () => {
              return this.tile
            },
          });
          this.tileCache[cacheKey] = tile
        }
      }
    }

  }
}
export default TileLayer
