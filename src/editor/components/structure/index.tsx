/*
 * @Description: 结构
 * @Author: ldx
 * @Date: 2023-12-21 15:31:25
 * @LastEditors: ldx
 * @LastEditTime: 2023-12-22 22:43:14
 */
import { Tabs, TabsProps } from 'antd'

import Assets from './assets'
import Layer from './layer'
const items: TabsProps['items'] = [
  {
    key: 'layer',
    label: '图层',
    children: <Layer />
  },
  {
    key: 'assets',
    label: '资源',
    children: <Assets />
  }
]

const Structure = () => {
  return (
    <div className="w-240px box-border h-100%">
      <Tabs defaultActiveKey="layer" centered items={items} size="small"></Tabs>
    </div>
  )
}
export default Structure
