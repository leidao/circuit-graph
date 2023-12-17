import { Group, Img, Vector2, Clock, Animation } from '@/dxCanvas'
import { getTileUrlPro, TILE_SIZE } from '../math';
import TileImage from './tileImage';
import TileLayer, { TileType } from './tileLayer';
type Option = {
  layer: TileLayer,
  row: number,
  col: number,
  zoom: number,
  x: number,
  y: number,
  shouldRender: (key: string) => boolean,
  getMapTypeData: () => TileType
}
// 瓦片类
class Tile {
  /** 组 */
  layer: TileLayer
  /** 行 */
  row: number
  /** 列 */
  col: number
  /** 缩放等级 */
  zoom: number
  /** 显示位置 */
  x: number
  /** 显示位置 */
  y: number
  shouldRender: (key: string) => boolean
  getMapTypeData: () => TileType
  /** 瓦片url */
  urls: string[] = []
  /** 缓存key */
  cacheKey: string
  /** 瓦片图片 */
  imgs: Img[] = []
  /** 瓦片透明度 */
  opacity = 1
  /** 图片是否加载完成 */
  loaded = false
  /** 图片加载超时定时器 */
  timer = null
  /** 瓦片渐现过渡时间 */
  fadeInDuration = 400
  clock = new Clock()
  constructor({ layer, row, col, zoom, x, y, shouldRender, getMapTypeData }: Option) {
    // 瓦片显示图层
    this.layer = layer;
    // 瓦片行列号
    this.row = row;
    this.col = col;
    // 瓦片层级
    this.zoom = zoom;
    // 显示位置
    this.x = x;
    this.y = y;
    // 判断瓦片是否应该渲染
    this.shouldRender = shouldRender;
    // 获取当前地图类型数据
    this.getMapTypeData = getMapTypeData;
    // 缓存key
    this.cacheKey = this.row + "_" + this.col + "_" + this.zoom;

    this.createUrl();
    this.load();
  }

  // 生成url
  createUrl() {
    let tile = this.getMapTypeData()
    this.urls = tile.urls.map((url) => {
      return getTileUrlPro(this.row, this.col, this.zoom, url, { getTileUrl: tile.getTileUrl, transformXYZ: tile.transformXYZ })
    });
  }

  // 加载图片
  load() {
    let tasks = this.urls.map((url, index) => {
      return new Promise((resolve) => {
        new TileImage(url, (img) => {
          if (img) {
            // document.body.appendChild(img)

            this.imgs[index] = new Img({
              // enableCamera: false,
              image: img,
              size: new Vector2(TILE_SIZE, TILE_SIZE),
              position: new Vector2(this.x, this.y),
              style: { globalAlpha: this.opacity }
              // opacity: this.opacity,
            })
            // console.log('this.x,this.y', this.x, this.y, this.imgs[index]);

            // console.log('this.imgs[index]', this.imgs[index]);

          }
          resolve(true)
        })
      })
    })
    return Promise.all(tasks)
      .then(() => {
        this.loaded = true
        this.render()
      })
  }

  // 渲染
  render(isFadeIn = false) {
    if (!this.loaded || this.imgs.length <= 0 || !this.shouldRender(this.cacheKey)) {
      return;
    }
    // 添加到图层
    this.imgs.forEach((img) => {
      if (img) {
        img.position.set(this.x, this.y)
        this.layer.add(img);
        // 设置显示位置
        // img.x(this.x).y(this.y);
      }
    });
    // const scene = this.layer.getScene()
    // if (scene) {
    //   scene.render()
    // }
    // 需要渐现
    if (isFadeIn && this.opacity !== 0) {
      this.hide();
    }
    this.fadeIn();
  }

  // 渐现
  fadeIn() {
    if (this.opacity >= 1 || this.imgs.length <= 0) {
      return;
    }
    let base = this.opacity;
    let anim = new Animation((time) => {
      let opacity = (time / this.fadeInDuration) * 1 + base;
      this.opacity = opacity;
      this.imgs.forEach((img) => {
        if (img) {
          img.setOption({ style: { globalAlpha: this.opacity } })
        }
      });
      // const scene = this.layer.getScene()
      // if (scene) {
      //   scene.render()
      // }
      if (opacity >= 1) {
        anim.stop();
      }
    });
    anim.start();
  }

  // 隐藏
  hide() {
    if (this.imgs.length <= 0) {
      return
    }
    this.opacity = 0;
    this.imgs.forEach((img) => {
      if (img) {
        img.hide();
      }
    });
  }

  // 更新要添加到的图层
  updateLayer(layer: TileLayer) {
    this.layer = layer;
  }

  // 更新位置
  updatePos(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}
export default Tile
