/*
 * @Description: 工具栏
 * @Author: ldx
 * @Date: 2022-04-06 19:34:55
 * @LastEditors: ldx
 * @LastEditTime: 2023-12-20 22:07:23
 */
import { Dropdown, InputNumber, MenuProps, Space, Tooltip } from 'antd'
import { useEffect, useState } from 'react'

import { Editor } from './editor'
import {
  DownOutlined,
  HandOutlined,
  LineOutlined,
  SelectOutlined,
  TextFilled
} from './icons'
type Props = {
  className: string
  editor: Editor | undefined
}
const Tool: React.FC<Props> = ({ className, editor }) => {
  const [selected, setSelected] = useState('')
  const [open, setOpen] = useState(false)
  useEffect(() => {
    if (!editor) return
    setActive('selectGraph')
    const fn = () => {
      setActive('selectGraph')
    }
    editor.toolManager.addEventListener('finish', fn)
    editor.keybordManager.registry({
      name: 'select',
      keyboard: ['a'],
      execute: () => setActive('selectGraph')
    })
    editor.keybordManager.registry({
      name: 'text',
      keyboard: ['t'],
      execute: () => setActive('drawText')
    })
    editor.keybordManager.registry({
      name: 'drag',
      keyboard: ['h'],
      execute: () => setActive('dragCanvas')
    })
    editor.keybordManager.registry({
      name: 'line',
      keyboard: ['l'],
      execute: () => setActive('drawLine')
    })
    return () => {
      editor.toolManager.removeEventListener('finish', fn)
    }
  }, [editor])
  /** 改变画布缩放大小 */
  const zoomChange = () => {}
  const items: MenuProps['items'] = [
    {
      label: (
        <InputNumber
          size="small"
          defaultValue={100}
          min={0}
          max={100}
          className="w-120px"
          formatter={(value) => `${value}%`}
          onChange={zoomChange}
        />
      ),
      key: '1'
    },
    {
      label: (
        <div className="flex justify-between items-center text-12px">
          <span>放大</span>
          <span>⌘+</span>
        </div>
      ),
      key: '2',
      onClick: () => editor?.zoomIn()
    },
    {
      label: (
        <div className="flex justify-between items-center text-12px">
          <span>缩小</span>
          <span>⌘-</span>
        </div>
      ),
      key: '3',
      onClick: () => editor?.zoomOut()
    },
    {
      label: (
        <div className="flex justify-between items-center text-12px">
          <span>显示全部</span>
          <span>⌘1</span>
        </div>
      ),
      key: '4',
      onClick: () => editor?.showAll()
    },
    {
      label: (
        <div className="w-120px flex justify-between items-center text-12px">
          <span>显示选中内容</span>
          <span>⌘2</span>
        </div>
      ),
      key: '5',
      onClick: () => editor?.showSelectGraph()
    }
  ]
  const styleFn = (value: string) => {
    return {
      background: selected === value ? '#1890ff' : '',
      color: selected === value ? '#fff' : '#000'
    }
  }
  const setActive = (toolName: string) => {
    if (!editor) return
    setSelected(toolName)
    editor.toolManager.setActiveTool(toolName)
  }
  return (
    <div
      className={`${className} flex justify-center items-center border-b-1px border-#dadadc99`}
    >
      <div className="flex-1 flex items-center ">
        <div
          className="cursor-pointer w-32px h-32px hover:bg-#f2f2f2  rounded-6px flex justify-center items-center ml-10px"
          style={styleFn('selectGraph')}
          onClick={() => setActive('selectGraph')}
        >
          <Tooltip placement="bottom" title="选择 A" arrow={false}>
            <span className="flex justify-center items-center">
              <SelectOutlined></SelectOutlined>
            </span>
          </Tooltip>
        </div>
        <div
          className="cursor-pointer w-32px h-32px hover:bg-#f2f2f2  rounded-6px flex justify-center items-center ml-10px"
          style={styleFn('drawText')}
          onClick={() => setActive('drawText')}
        >
          <Tooltip placement="bottom" title="绘制文字 T" arrow={false}>
            <span className="flex justify-center items-center">
              <TextFilled></TextFilled>
            </span>
          </Tooltip>
        </div>
        <div
          className="cursor-pointer w-32px h-32px hover:bg-#f2f2f2  rounded-6px flex justify-center items-center ml-10px"
          style={styleFn('dragCanvas')}
          onClick={() => setActive('dragCanvas')}
        >
          <Tooltip placement="bottom" title="拖拽画布 H" arrow={false}>
            <span className="flex justify-center items-center">
              <HandOutlined></HandOutlined>
            </span>
          </Tooltip>
        </div>
        <div
          className="cursor-pointer w-32px h-32px hover:bg-#f2f2f2  rounded-6px flex justify-center items-center ml-10px"
          style={styleFn('drawLine')}
          onClick={() => setActive('drawLine')}
        >
          <Tooltip placement="bottom" title="绘制线段 L" arrow={false}>
            <span className="flex justify-center items-center">
              <LineOutlined></LineOutlined>
            </span>
          </Tooltip>
        </div>
      </div>
      <div className="w-76px">
        <Dropdown
          menu={{ items }}
          trigger={['click']}
          open={open}
          onOpenChange={(flag) => {
            setOpen(flag)
          }}
          placement="bottom"
        >
          <Space className="cursor-pointer">
            <div className="text-#1890ff">100%</div>
            <DownOutlined className="mt-6px fill-#1890ff " />
          </Space>
        </Dropdown>
      </div>
    </div>
  )
}
export default Tool
