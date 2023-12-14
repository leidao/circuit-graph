/*
 * @Description:
 * @Author: ldx
 * @Date: 2023-12-09 19:06:44
 * @LastEditors: ldx
 * @LastEditTime: 2023-12-09 19:12:10
 */
type Option = {
  type: string
  id: number
  name: string
}
//命令基类（编辑的对象）
export default abstract class CommandBase {
  id = -1
  inMemory = false //命令是否放入队列中允许撤销和重做
  name = '' //命令的名称
  type = '' //命令的类型
  keyboard = '' //命令的快捷键

  constructor() {}
  abstract undo(): void
  abstract redo(): void
  abstract execute(): void

  toJSON() {
    //返回对象
    const output: Option = {
      type: this.type,
      id: this.id,
      name: this.name
    }
    return output
  }
  fromJSON(json: Option) {
    this.inMemory = true
    this.type = json.type
    this.id = json.id
    this.name = json.name
  }
}
