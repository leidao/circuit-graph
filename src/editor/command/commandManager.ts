/*
 * @Description:
 * @Author: ldx
 * @Date: 2023-12-09 18:58:58
 * @LastEditors: ldx
 * @LastEditTime: 2023-12-10 08:25:46
 */
import { Editor } from '../editor'
import CommandBase from './commandBase'
import { KeyboardCode } from './keybord-code'
type State = {
  current: number
  queue: any[]
  commandArray: CommandMap[]
}
type CommandMap = {
  name: string
  keyboard: string[]
  execute: (editor: Editor) => void
}

export default class Command {
  // [key: string]: any
  state: State = {
    // 前进后退需要指针
    current: -1, // 前进后退的索引值
    queue: [], //  存放所有的操作命令
    commandArray: [] // 存放所有的命令
  }
  commands = {} // 制作命令和执行功能一个映射表  undo : ()=>{}  redo:()=>{}
  constructor(private editor: Editor) {
    // 监听键盘事件
    this.listen()
  }
  execute(cmd: CommandBase) {
    // 执行命令
    cmd.redo()
    // 如果该命令不允许撤销/重做，结束～
    if (!cmd.inMemory) {
      return
    }
    let { queue } = this.state
    const { current } = this.state
    // 如果先做了 操作1 -> 操作2 -> 撤销操作 -> 操作3
    // 操作1 -> 操作3
    if (queue.length > 0) {
      queue = queue.slice(0, current + 1) // 可能在操作的过程中有撤销操作，所以根据当前最新的current值来计算新的队列
      this.state.queue = queue
    }
    queue.push(cmd) // 保存指令的前进后退
    this.state.current = current + 1
  }
  redo() {
    const cmd = this.state.queue[this.state.current + 1] // 找到当前的下一步还原操作
    if (cmd) {
      cmd.redo && cmd.redo()
      this.state.current++
    }
  }
  undo() {
    if (this.state.current == -1) return // 没有可以撤销的了
    const cmd = this.state.queue[this.state.current] // 找到上一步还原
    if (cmd) {
      cmd.undo && cmd.undo() // 这里没有操作队列
      this.state.current--
    }
  }
  registry(command: CommandMap) {
    this.state.commandArray.push(command)
    // this[command.name] = command.execute
  }

  onKeydown = (event: KeyboardEvent) => {
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

    keyString.push(KeyboardCode[keyCode])
    const keyNames = keyString.join('+')
    console.log('keyNames', keyNames)

    const commandArray = this.state.commandArray
    // 执行对应键盘命令
    commandArray.forEach(({ keyboard, execute }) => {
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
  }
  // 销毁事件
  destroy() {
    window.removeEventListener('keydown', this.onKeydown)
  }
}
