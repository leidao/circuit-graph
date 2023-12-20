/*
 * @Description:
 * @Author: ldx
 * @Date: 2023-12-09 18:58:58
 * @LastEditors: ldx
 * @LastEditTime: 2023-12-20 14:53:54
 */
import { Editor } from '../editor'
import { KeyboardCode } from './keybord-code'

type CommandMap = {
  name: string
  keyboard: string[]
  execute: (editor: Editor) => void
}

export default class KeybordManager {
  // [key: string]: any
  keydownMap = new Map<string, CommandMap>() // 存放所有的命令
  keyupMap = new Map<string, CommandMap>() // 存放所有的命令
  constructor(private editor: Editor) {
    // 监听键盘事件
    this.listen()
  }
  /** 注册快捷键 */
  registry(command: CommandMap) {
    const name = command.name
    if (this.keydownMap.has(name)) {
      throw new Error(`快捷键命令 ${name} 已经被使用过，请换一个名称`)
    }
    this.keydownMap.set(command.name, command)
    // this[command.name] = command.execute
  }
  /** 注册快捷键松开事件 */
  registryKeyUp(command: CommandMap) {
    const name = command.name
    if (this.keyupMap.has(name)) {
      throw new Error(`快捷键命令 ${name} 已经被使用过，请换一个名称`)
    }
    this.keyupMap.set(command.name, command)
  }
  /** 取消注册 */
  unRegister(name: string) {
    this.keydownMap.delete(name)
  }
  /** 取消注册 */
  unRegisterKeyUp(name: string) {
    this.keyupMap.delete(name)
  }

  onKeydown = (event: KeyboardEvent) => {
    this.execute(event, this.keydownMap)
  }
  onKeyup = (event: KeyboardEvent)=>{
    this.execute(event, this.keyupMap)
  }
  execute(event: KeyboardEvent, keyBindingMap: Map<string, CommandMap>){
    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement
    ) {
      return
    }

    const { keyCode, shiftKey, altKey, ctrlKey, metaKey } = event
    const keyString: string[] = []
    if (ctrlKey || metaKey) keyString.push('ctrl')
    if (shiftKey) keyString.push('shift')
    if (altKey) keyString.push('alt')

    if (KeyboardCode[keyCode]) {
      if (!keyString.includes(KeyboardCode[keyCode])) {
        keyString.push(KeyboardCode[keyCode])
      }
    }

    const keyNames = keyString.join('+')
    console.log('keyNames', keyNames)

    // 执行对应键盘命令
    keyBindingMap.forEach(({ keyboard, execute }) => {
      if (!keyboard) {
        return
      }
      const keys = Array.isArray(keyboard) ? keyboard : [keyboard]
      if (keys.indexOf(keyNames) > -1) {
        execute(this.editor)
        event.stopPropagation()
        event.preventDefault()
      }
    })
  }

  // 初始化事件
  listen() {
    window.addEventListener('keydown', this.onKeydown)
    window.addEventListener('keyup', this.onKeyup)
  }
  // 销毁事件
  destroy() {
    window.removeEventListener('keydown', this.onKeydown)
    window.removeEventListener('keydown', this.onKeyup)
  }
}
