/*
 * @Description: 工具按钮
 * @Author: ldx
 * @Date: 2023-12-21 11:13:40
 * @LastEditors: ldx
 * @LastEditTime: 2023-12-21 11:25:35
 */

import { Tooltip } from 'antd'
import { useContext, useEffect, useState } from 'react'

import EditorContext from '@/editor/context'

import { HandOutlined, LineOutlined, SelectOutlined, TextFilled } from './icons'
const ToolBtn = () => {
  const [selected, setSelected] = useState('')
  const editor = useContext(EditorContext)

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
      editor.keybordManager.unRegister('select')
      editor.keybordManager.unRegister('text')
      editor.keybordManager.unRegister('drag')
      editor.keybordManager.unRegister('line')
    }
  }, [editor])

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
  )
}

export default ToolBtn
