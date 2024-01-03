/*
 * @Description:
 * @Author: ldx
 * @Date: 2023-12-21 15:26:11
 * @LastEditors: ldx
 * @LastEditTime: 2024-01-01 14:01:28
 */
import { ColorPicker, ColorPickerProps, Empty, InputNumber, Slider } from 'antd'
import Big from 'big.js'
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
    if (!selectHelper) return
    const changeHelper = (event: {
      type: string
      target?: any
      [attachment: string]: any
    }) => {
      const target = event.target
      if (target instanceof SelectHelper) {
        const obj = target.children[0]
        setSetlectGraph(obj)
        if (!obj) return
        const { min, max } = obj.boundingBox
        setX(obj.position.x)
        setY(obj.position.y)
        setW(Number(new Big(max.x).minus(min.x).toFixed(3)))
        setH(Number(new Big(max.y).minus(min.y).toFixed(3)))
        setR(obj.rotate)
      }
    }
    selectHelper.addEventListener('change_helper', changeHelper)
    selectHelper.addEventListener('graphOperation', changeHelper)
    return () => {
      selectHelper.removeEventListener('change_helper', changeHelper)
      selectHelper.removeEventListener('graphOperation', changeHelper)
    }
  }, [editor])
  /** 透明度值格式化 */
  const formatter = (value?: number) => `${value}%`
  /** 透明度改变 */
  const globalAlphaChange = (value: number) => {
    const selectHelper = editor?.dynamicLayer.getObjectByName(
      'selectHelper'
    ) as SelectHelper
    if (!selectHelper) return
    for (let i = 0; i < selectHelper.children.length; i++) {
      const child = selectHelper.children[i]
      child.setStyle({ globalAlpha: value / 100 })
    }
    editor?.baseLayer.render()
  }
  /** 颜色选择完成 */
  const colorChangeComplete = (color: ColorPickerProps['value']) => {}
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
              onChange={(value) => {
                if (!value) return
                setX(value)
              }}
              min={Infinity}
              max={Infinity}
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
          <div className="mt-10px">
            <span>透明度</span>
            <Slider tooltip={{ formatter }} onChange={globalAlphaChange} />
          </div>
          <div>
            <div>投影</div>
            <div>
              <ColorPicker
                size="small"
                className="m-w-130px"
                showText
                placement="bottomRight"
                allowClear
                onChangeComplete={colorChangeComplete}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
export default GraphPanel
