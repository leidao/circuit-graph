/*
 * @Description:
 * @Author: ldx
 * @Date: 2023-12-06 10:57:26
 * @LastEditors: ldx
 * @LastEditTime: 2023-12-06 11:14:11
 */
import electricity from './electricity'
import food from './food'
import sewage from './sewage'
export type Children = {
  name: string
  url: string
  id: number
}
const imgs = [
  {
    name: '电力',
    children: electricity as Children[]
  },
  {
    name: '食品加工厂',
    children: food as Children[]
  },
  {
    name: '污水处理',
    children: sewage as Children[]
  }
]

export default imgs
