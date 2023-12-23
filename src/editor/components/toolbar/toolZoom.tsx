/*
 * @Description: 缩放工具
 * @Author: ldx
 * @Date: 2023-12-21 11:28:43
 * @LastEditors: ldx
 * @LastEditTime: 2023-12-22 22:01:22
 */
import { useClickAway } from 'ahooks'
import { InputNumber, Space } from 'antd'
import { useContext, useEffect, useRef, useState } from 'react'

import { Ruler } from '@/dxCanvas'
import EditorContext from '@/editor/context'

import { CheckOutlined, DownOutlined } from './icons'
export const isWindows =
  navigator.platform.toLowerCase().includes('win') ||
  navigator.userAgent.includes('Windows')

const ToolZoom = () => {
  const editor = useContext(EditorContext)
  const [open, setOpen] = useState(false)
  const [rulerVisible, setRulerVisible] = useState(false)
  const [zoom, setZoom] = useState(100)
  const containerRef = useRef<HTMLDivElement>(null)
  useClickAway(() => {
    setOpen(false)
  }, containerRef)

  useEffect(() => {
    if (!editor) return
    editor.orbitControler.addEventListener('change', (event) => {
      if (event.target.type === 'wheel') {
        const zoom = Math.floor(editor.scene.camera.zoom * 100)
        setZoom(zoom)
      }
    })
  }, [editor])
  const zoomActions = [
    {
      leftText: '放大',
      rightText: isWindows ? 'Ctrl++' : '⌘+',
      key: 'zoomIn',
      onClick: () => editor?.zoomIn()
    },
    {
      leftText: '缩小',
      rightText: isWindows ? 'Ctrl+-' : '⌘-',
      key: 'zoomOut',
      onClick: () => editor?.zoomOut()
    },
    {
      leftText: '显示全部',
      rightText: isWindows ? 'Ctrl+1' : '⌘1',
      key: 'showAll',
      onClick: () => editor?.showAll()
    },
    {
      leftText: '显示选中内容',
      rightText: isWindows ? 'Ctrl+2' : '⌘2',
      key: 'showSelectGraph',
      onClick: () => editor?.showSelectGraph()
    }
  ]
  return (
    <div className="relative" ref={containerRef}>
      <Space
        className="cursor-pointer w-90px"
        onClick={() => {
          setOpen(!open)
        }}
      >
        <div className="text-#1890ff w-50px flex justify-end">{zoom}%</div>
        <DownOutlined className="mt-6px fill-#1890ff " />
      </Space>
      {open && (
        <div
          className="absolute z-999 bg-#fff rounded-4px border-1px border-#eee py-6px top-32px right--32px"
          style={{
            boxShadow: '0 0 0 1px rgba(0,0,0,.05), 0 4px 10px rgba(0,0,0,.1)'
          }}
        >
          <InputNumber
            size="small"
            min={2}
            max={6000}
            value={zoom}
            defaultValue={100}
            className="w-130px mx-18px"
            onChange={(value) => {
              console.log('value', value)
              if (!value) return
              editor?.setZoom(value / 100)
              setZoom(value)
            }}
            addonAfter="%"
          />
          <div className="h-1px bg-#ddd my-6px"></div>
          {zoomActions.map((action) => {
            return (
              <div
                className="flex justify-between items-center text-12px  h-24px cursor-pointer hover:bg-#e1f2ff"
                key={action.key}
                onClick={() => {
                  action.onClick()
                  setOpen(false)
                }}
              >
                <span className="flex justify-between items-center">
                  <span className="w-24px h-24px"></span>
                  <span>{action.leftText}</span>
                </span>

                <span className="mr-24px">{action.rightText}</span>
              </div>
            )
          })}
          <div className="h-1px bg-#ddd my-6px"></div>
          <div
            className="flex justify-between items-center text-12px h-24px cursor-pointer hover:bg-#e1f2ff"
            onClick={() => {
              const ruler = editor?.dynamicLayer.getObjectByName(
                'Ruler'
              ) as Ruler
              ruler.visible ? ruler.hide() : ruler.show()
              setRulerVisible(ruler.visible)
              editor?.dynamicLayer.render()
              setOpen(false)
            }}
          >
            <span className="flex justify-between items-center">
              {rulerVisible ? (
                <CheckOutlined />
              ) : (
                <span className="w-24px h-24px"></span>
              )}
              <span>标尺</span>
            </span>
            <span className="mr-24px">{isWindows ? 'Shift+R' : '⇧R'}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default ToolZoom
