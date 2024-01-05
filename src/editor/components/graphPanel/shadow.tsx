/*
 * @Description: 阴影
 * @Author: ldx
 * @Date: 2024-01-05 10:58:18
 * @LastEditors: ldx
 * @LastEditTime: 2024-01-05 15:00:13
 */
import { ColorPicker, Tooltip } from 'antd'
import { Color } from 'antd/es/color-picker'
import {
  ChangeEvent,
  KeyboardEvent,
  useContext,
  useEffect,
  useState
} from 'react'

import { BasicStyle } from '@/dxCanvas/style/basicStyle'
import EditorContext from '@/editor/context'
type Props = {
  style?: BasicStyle
}
const Shadow: React.FC<Props> = ({ style }) => {
  const editor = useContext(EditorContext)
  const [color, setColor] = useState<string>('#000000')
  const [x, setX] = useState<number>(2)
  const [y, setY] = useState<number>(2)
  const [blur, setBlur] = useState<number>(10)

  useEffect(() => {
    if (!style) return
    setX(style.shadowOffsetX)
    setY(style.shadowOffsetY)
    setBlur(style.shadowBlur)
    style.shadowColor && setColor(style.shadowColor)
  }, [style])

  const inputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    const type = event.target.dataset.type
    if (!isNaN(Number(value))) {
      switch (type) {
        case 'x':
          setX(Number(value))
          style && (style.shadowOffsetX = Number(value))
          break
        case 'y':
          setY(Number(value))
          style && (style.shadowOffsetY = Number(value))
          break
        case 'blur':
          setBlur(Number(value))
          style && (style.shadowBlur = Number(value))
          break

        default:
          break
      }

      editor?.baseLayer.render()
    }
  }
  const colorChange = (color: Color) => {
    setColor(color.toHexString())
    style && (style.shadowColor = color.toHexString())
    editor?.baseLayer.render()
  }
  const inputKeyDown = (event: KeyboardEvent) => {
    if (event.target instanceof HTMLInputElement) {
      const { key, target } = event
      if (key === 'ArrowUp') {
        target.value = String(Number(target.value) + 1)
      }
      if (key === 'ArrowDown') {
        target.value = String(Number(target.value) - 1)
      }
      const type = event.target.dataset.type
      const value = target.value
      switch (type) {
        case 'x':
          setX(Number(value))
          style && (style.shadowOffsetX = Number(value))
          break
        case 'y':
          setY(Number(value))
          style && (style.shadowOffsetY = Number(value))
          break
        case 'blur':
          setBlur(Number(value))
          style && (style.shadowBlur = Number(value))
          break
        default:
          break
      }
      editor?.baseLayer.render()
    }
  }

  return (
    <div className="flex bg-#80808014 h-32px flex items-center px-6px rounded-4px">
      <div>
        <Tooltip placement="top" title="颜色" arrow={false}>
          <ColorPicker
            value={color}
            placement="bottomLeft"
            allowClear
            size="small"
            className="h-32px w-42px bg-#f5f5f5 hover:bg-#80808014 rounded-4px"
            style={{
              boxShadow: 'none',
              border: 'none'
            }}
            onChange={colorChange}
          />
        </Tooltip>
      </div>
      <div className="w-1px h-16px bg-#ddd mx-2px"></div>
      <div>
        <Tooltip
          placement="top"
          title="X"
          arrow={false}
          overlayInnerStyle={{
            minHeight: '26px',
            width: '50px',
            textAlign: 'center',
            lineHeight: '16px'
          }}
        >
          <input
            data-type="x"
            value={x}
            className="w-40px h-24px border-0px bg-#f5f5f5 hover:bg-#80808014 rounded-4px focus:outline-0px text-12px font-thin"
            onChange={inputChange}
            onKeyDown={inputKeyDown}
          ></input>
        </Tooltip>
      </div>
      <div className="w-1px h-16px bg-#ddd mx-2px"></div>
      <div>
        <Tooltip
          placement="top"
          title="Y"
          arrow={false}
          overlayInnerStyle={{
            minHeight: '26px',
            width: '50px',
            textAlign: 'center',
            lineHeight: '16px'
          }}
        >
          <input
            value={y}
            data-type="y"
            className="w-40px h-24px border-0px bg-#f5f5f5 hover:bg-#80808014 rounded-4px focus:outline-0px text-12px font-thin"
            onChange={inputChange}
            onKeyDown={inputKeyDown}
          ></input>
        </Tooltip>
      </div>
      <div className="w-1px h-16px bg-#ddd mx-2px"></div>
      <div>
        <Tooltip
          placement="top"
          title="模糊"
          arrow={false}
          overlayInnerStyle={{
            minHeight: '26px',
            width: '50px',
            textAlign: 'center',
            lineHeight: '16px'
          }}
        >
          <input
            value={blur}
            data-type="blur"
            className="w-40px h-24px border-0px bg-#f5f5f5 hover:bg-#80808014 rounded-4px focus:outline-0px text-12px font-thin"
            onChange={inputChange}
            onKeyDown={inputKeyDown}
          ></input>
        </Tooltip>
      </div>
    </div>
  )
}
export default Shadow
