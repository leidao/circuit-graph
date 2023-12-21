import { Empty } from 'antd'
import { useContext, useEffect, useState } from 'react'

import { HoverHelper, Object2D, SelectHelper } from '@/dxCanvas'
import EditorContext from '@/editor/context'

import { HideOutlined, LockFilled, ShowOutlined, UnlockFilled } from './icons'
const Layer = () => {
  const editor = useContext(EditorContext)
  const [list, setList] = useState<Object2D[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [hoverId, setHoverId] = useState<string>('')
  useEffect(() => {
    if (!editor) return
    const baseLayer = editor.baseLayer
    const change = () => {
      const children = baseLayer.children
      setList(children.slice())
    }
    const changeHelper = (event: {
      type: string
      target?: any
      [attachment: string]: any
    }) => {
      const target = event.target
      if (target instanceof HoverHelper) {
        setHoverId(target.children[0]?.uuid || '')
      }
      if (target instanceof SelectHelper) {
        setSelected(target.children.map((obj) => obj.uuid))
      }
    }
    baseLayer.addEventListener('change', change)
    const selectHelper = editor.dynamicLayer.getObjectByName(
      'selectHelper'
    ) as SelectHelper
    selectHelper && selectHelper.addEventListener('change_helper', changeHelper)
    const hoverHelper = editor.dynamicLayer.getObjectByName(
      'hoverHelper'
    ) as HoverHelper
    hoverHelper && hoverHelper.addEventListener('change_helper', changeHelper)
    return () => {
      baseLayer.removeEventListener('change', change)
    }
  }, [editor])

  return (
    <div className="w-100% h-100%">
      {list.length === 0 ? (
        <div className="w-100% h-100% flex justify-center items-center">
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
        </div>
      ) : (
        <div>
          {list.map((obj) => {
            return (
              <div
                key={obj.uuid}
                className="relative  border-1px  box-border"
                onMouseEnter={() => {
                  setHoverId(obj.uuid)
                  if (!editor) return
                  const hoverHelper = editor.dynamicLayer.getObjectByName(
                    'hoverHelper'
                  ) as HoverHelper
                  if (!hoverHelper) return
                  hoverHelper.add(obj)
                  editor.dynamicLayer.render()
                }}
                onMouseLeave={() => {
                  setHoverId('')
                  if (!editor) return
                  const hoverHelper = editor.dynamicLayer.getObjectByName(
                    'hoverHelper'
                  ) as HoverHelper
                  if (!hoverHelper) return
                  hoverHelper.remove(obj)
                  editor.dynamicLayer.render()
                }}
                style={{
                  borderColor: hoverId === obj.uuid ? '#0f8fff' : 'transparent',
                  background: selected.includes(obj.uuid) ? '#e1f2ff' : '#fff'
                }}
              >
                <div
                  className="h-32px px-24px flex justify-between items-center cursor-pointer"
                  onClick={() => {
                    setSelected(Array.from(new Set(selected.concat(obj.uuid))))
                    if (!editor) return
                    const selectHelper = editor.dynamicLayer.getObjectByName(
                      'selectHelper'
                    ) as SelectHelper
                    if (!selectHelper) return
                    selectHelper.clear()
                    selectHelper.add(obj)
                    editor.dynamicLayer.render()
                  }}
                >
                  <span>{obj.name}</span>
                </div>
                <span className="flex items-center absolute top-5px right-18px">
                  <span
                    className="w-22px h-22px rounded-4px mr-2px hover:bg-#dcdcdc flex items-center justify-center"
                    style={{
                      opacity: hoverId === obj.uuid || obj.userData.lock ? 1 : 0
                    }}
                  >
                    {obj.userData.lock ? <LockFilled /> : <UnlockFilled />}
                  </span>
                  <span
                    className="w-22px h-22px rounded-4px hover:bg-#dcdcdc flex items-center justify-center"
                    style={{
                      opacity: hoverId === obj.uuid || !obj.visible ? 1 : 0
                    }}
                  >
                    {obj.visible ? <ShowOutlined /> : <HideOutlined />}
                  </span>
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Layer
