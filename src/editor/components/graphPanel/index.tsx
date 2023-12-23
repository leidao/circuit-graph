/*
 * @Description:
 * @Author: ldx
 * @Date: 2023-12-21 15:26:11
 * @LastEditors: ldx
 * @LastEditTime: 2023-12-22 23:21:29
 */
import { Empty, InputNumber } from 'antd'
import { useContext, useEffect, useState } from 'react'

import { Object2D, SelectHelper } from '@/dxCanvas'
import EditorContext from '@/editor/context'
const GraphPanel = () => {
  const editor = useContext(EditorContext)
  const [selectGraph, setSetlectGraph] = useState<Object2D>()
  const [x, setX] = useState(0)
  const [y, setY] = useState(0)
  const [w, setW] = useState(0)
  const [h, setH] = useState(0)
  const [r, setR] = useState(0)
  useEffect(() => {
    if (!editor) return
    const selectHelper = editor.dynamicLayer.getObjectByName(
      'selectHelper'
    ) as SelectHelper
    const changeHelper = (event: {
      type: string
      target?: any
      [attachment: string]: any
    }) => {
      const target = event.target
      if (target instanceof SelectHelper) {
        const obj = target.children[0]
        if (!obj) return
        // obj.computeBoundingBox()
        const { min, max } = obj.boundingBox
        console.log('min', min.clone())

        setX(obj.position.x)
        setY(obj.position.y)
        setW(max.x - min.x)
        setH(max.y - min.y)
        setR(obj.rotate)
        setSetlectGraph(obj)
      }
    }
    selectHelper && selectHelper.addEventListener('change_helper', changeHelper)
  }, [editor])
  console.log('selectGraph', selectGraph)

  return (
    <div className="w-100% h-100%">
      <div className="h-38px border-b-1px box-border border-#dadadc99"></div>
      {!selectGraph ? (
        <div className="w-100% h-100% flex justify-center items-center">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="暂无选中的图形"
          />
        </div>
      ) : (
        <div className="w-100% h-100% p-12px box-border">
          <div className="flex justify-between items-center mb-10px">
            <InputNumber
              size="small"
              className="w-100px"
              onChange={(value) => {}}
              prefix="X"
              value={x}
            />
            <InputNumber
              size="small"
              className="w-100px"
              onChange={(value) => {}}
              prefix="Y"
              value={y}
            />
          </div>
          <div className="flex justify-between items-center mb-10px">
            <InputNumber
              size="small"
              className="w-100px"
              onChange={(value) => {}}
              prefix="W"
              value={w}
            />
            <InputNumber
              size="small"
              className="w-100px"
              onChange={(value) => {}}
              prefix="H"
              value={h}
            />
          </div>
          <div className="flex justify-start items-center mb-10px">
            <InputNumber
              size="small"
              className="w-100px"
              onChange={(value) => {}}
              prefix="R"
              value={r}
            />
          </div>
          <div className="h-1px bg-#ddd my-6px"></div>
        </div>
      )}
    </div>
  )
}
export default GraphPanel
