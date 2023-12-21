/*
 * @Description: 工具栏
 * @Author: ldx
 * @Date: 2022-04-06 19:34:55
 * @LastEditors: ldx
 * @LastEditTime: 2023-12-21 16:13:48
 */

import ToolBtn from './toolBtn'
import ToolZoom from './toolZoom'
type Props = {
  className?: string
}
const ToolBar: React.FC<Props> = ({ className = '' }) => {
  return (
    <div className={`${className} flex justify-center items-center `}>
      <ToolBtn></ToolBtn>
      <ToolZoom></ToolZoom>
    </div>
  )
}
export default ToolBar
