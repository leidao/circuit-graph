/*
 * @Description:
 * @Author: ldx
 * @Date: 2023-12-09 09:38:54
 * @LastEditors: ldx
 * @LastEditTime: 2024-08-30 12:43:02
 */

import ToolManager from './tools/toolManager'
import KeybordManger from './keybord/keybordManger'
import { EditorView } from '../view'
import CommandManger from './command/commandManager'
export default class Manager {
  tools: ToolManager
  keybord: KeybordManger
  command: CommandManger
  constructor(public view: EditorView) {
    this.tools = new ToolManager(view)
    this.keybord = new KeybordManger(view)
    this.command = new CommandManger(view)
  }

  destroy() {
    this.tools.destroy()
    this.keybord.destroy()
    this.command.destroy()
  }
}
