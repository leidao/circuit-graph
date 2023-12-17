/*
 * @Description: 图片加载类
 * @Author: ldx
 * @Date: 2023-12-11 14:44:49
 * @LastEditors: ldx
 * @LastEditTime: 2023-12-11 14:49:39
 */
type Option = {
  url:string
  onload:(img:HTMLImageElement)=>void
}
class TileImage {
  /** 计时器id */
  timer: NodeJS.Timeout | null = null
  /** 图片路径 */
  url:string
  onload: (img: HTMLImageElement|null) => void
  /** 图片是否加载失败 */
  called = false
  /** 图片加载重试次数 */
  reloadTimes = 0
  constructor(url: string, onload: (img: HTMLImageElement | null) => void) {
    this.timer = null;
    this.url = url;
    this.onload = onload;
    this.load();
  }

  load() {
    if (this.reloadTimes >= 5) {
      if (!this.called) {
        this.onload(null);
        this.called = true
      }
      return
    }
    this.reloadTimes++
    let img = new Image();
    img.src = this.url;
    // 加载超时，重新加载
    this.timer = setTimeout(() => {
      this.load();
    }, 1000);
    // 加载完成
    img.onload = () => {
      this.timer!== null &&clearTimeout(this.timer);
      if (!this.called) {
        this.onload(img);
        this.called = true
      }
    };
    img.onerror = () => {
      this.load();
    }
  }
}
export default TileImage
