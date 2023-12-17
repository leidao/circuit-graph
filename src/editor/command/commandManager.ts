/*
 * @Description:
 * @Author: ldx
 * @Date: 2023-12-09 18:58:58
 * @LastEditors: ldx
 * @LastEditTime: 2023-12-16 17:45:06
 */
import { Editor } from '../editor'
import CommandBase from './commandBase'
import { KeyboardCode } from './keybord-code'
type State = {
  current: number
  queue: any[]
}
type CommandMap = {
  name: string
  keyboard: string[]
  execute: (editor: Editor) => void
}

export default class CommandManger {
  // [key: string]: any
  state: State = {
    // 前进后退需要指针
    current: -1, // 前进后退的索引值
    queue: [] //  存放所有的操作命令
  }
  constructor(private editor: Editor) {}
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
}
