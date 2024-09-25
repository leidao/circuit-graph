/*
 * @Description: 
 * @Author: ldx
 * @Date: 2024-08-20 14:50:58
 * @LastEditors: ldx
 * @LastEditTime: 2024-09-25 15:16:51
 */

import _ from 'lodash'
import { App, Rect } from 'leafer-editor'
// import { Ruler } from 'leafer-x-ruler'
import { Line, Image, Text, Ellipse, Group } from 'leafer-ui'
import { v4 } from 'uuid'
// import KeybordManager from './command/keybordManger'
// import CursorManager from './cursor/cursorManager'
import Manager from './manager/index'
import Ruler from './objects/ruler'
import { loadSVG } from './utils'
import data from './data.json'
type Option = {
  container: HTMLDivElement
}
export class EditorView {
  domElement!: HTMLDivElement
  app!: App
  /** 管理器 */
  manager!: Manager
  /** 标尺 */
  ruler!: Ruler
  constructor(option: Option) {
    if (!option.container) return
    // 场景相关
    this.domElement = option.container

    this.app = new App({
      view: this.domElement,
      // 会自动创建 editor实例、tree层、sky层
      editor: {
        /** 锁定元素的宽高比 */
        // lockRatio: true
      }
    })
    this.ruler = new Ruler(this.app)

    // 管理器
    this.manager = new Manager(this)

    // const text = new Text({
    //   x: 400,
    //   y: 200,
    //   text: 'dx-editor，实现电路图和工业组态编辑器',
    //   name: '文字',
    //   editable: true,
    //   id: v4()
    // })
    // this.app.tree.add(text)

    // const rect = new Rect({
    //   editable: true,
    //   fill: {
    //     type: 'solid',
    //     color: '#d9d9d9'
    //   },
    //   name: '矩形',
    //   x: 500,
    //   y: 400,
    //   width: 100,
    //   height: 100,
    //   id: v4()
    // })
    // this.app.tree.add(rect)
    // const rect2 = new Rect({
    //   editable: true,
    //   fill: {
    //     type: 'solid',
    //     color: '#d9d9d9'
    //   },
    //   name: '矩形',
    //   x: 500,
    //   y: 100,
    //   width: 200,
    //   height: 100,
    //   id: v4()
    // })
    // this.app.tree.add(rect2)

    // const line = new Line({
    //   editable: true,
    //   strokeWidth: 20,
    //   stroke: '#ff0000',
    //   x: 100,
    //   y: 100,
    //   toPoint: { x: 300, y: 300 },
    //   name: '线段',
    // })
    // this.app.tree.add(line)
    this.app.tree.set(data as any)

    this.app.tree.emit('update')

  }

  /** 拖拽进入目标元素 */
  dragenter = (event: any) => {
    // 表示在当前位置放置拖拽元素将进行移动操作
    event.dataTransfer && (event.dataTransfer.dropEffect = 'move')
  }
  /** 拖拽离开目标元素 */
  dragleave = (event: any) => {
    // 表示在当前位置不允许放置拖拽元素，即拖放操作无效。
    event.dataTransfer && (event.dataTransfer.dropEffect = 'none')
  }
  /** 拖拽元素在目标元素上移动 */
  dragover = (event: any) => {
    // 如果默认行为没有被阻止,drop事件不会被触发
    event.preventDefault()
  }
  /** 拖拽元素在目标元素上松开鼠标 */
  drop = (event: any) => {
    const src = event.dataTransfer.getData('img');
    const coord = this.app.getPagePointByClient(event)
    loadSVG(src).then(svgDocument => {
      const svg = svgDocument.querySelectorAll('svg');
      // 获取svg的大小
      const width = +(svg[0].getAttribute('width') || 70)
      const height = +(svg[0].getAttribute('height') || 50)
      // 查找所有灰色圆点
      const viewBox = svg[0].getAttribute('viewBox')
      const pixel = (viewBox?.split(' ') || []).map(Number)
      const circles = svgDocument.querySelectorAll('circle[fill="#4F4F4F"]');
      let data: any[] = []
      circles.forEach((circle) => {
        const cx = +(circle.getAttribute('cx') || 0);
        const cy = +(circle.getAttribute('cy') || 0);
        data.push({ x: cx - pixel[0], y: cy - pixel[1] })
      });
      const group = new Group({
        id: v4(),
        name: '图元',
        editable: true,
        x: coord.x - width / 2,
        y: coord.y - height / 2,
        lockRatio: true,
        zIndex:Infinity
      })

      const image = new Image({
        url: src,
        x: 0,
        y: 0,
        width: width,
        height: height,
        // editable: true,
        name: '图元_内容',
      })

      group.add(image)
      data.forEach(item => {
        const ellipse = new Ellipse({
          width: 4,
          height: 4,
          x: item.x ,
          y: item.y ,
          offsetX:-2,
          offsetY:-2,
          name: '图元_圆点',
          fill: "rgb(255,5,5)",
          opacity:0
          // editable: true,
        })
        group.add(ellipse)
      })
      group.editable = true
      group.hitChildren = false
      this.app.tree.add(group)
      // this.app.editor.select(group)
      // this.app.editor.group()
      
      this.app.tree.emit('add')
    })
    // console.log('this.app.tree.toJSON()',this.app.tree.toJSON());
  }

  destroy() {
    this.app.destroy()
    this.manager.destroy()
  }

}
