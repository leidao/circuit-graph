/*
 * @Description:
 * @Author: ldx
 * @Date: 2023-12-21 15:26:11
 * @LastEditors: ldx
 * @LastEditTime: 2024-01-05 15:06:00
 */
import { MinusOutlined, PlusOutlined } from '@ant-design/icons'
import { ColorPickerProps, Empty, InputNumber, Slider } from 'antd'
import Big from 'big.js'
import { useContext, useEffect, useState } from 'react'

import { Object2D, SelectHelper } from '@/dxCanvas'
import { BasicStyle } from '@/dxCanvas/style/basicStyle'
import EditorContext from '@/editor/context'

import Shadow from './shadow'
const GraphPanel = () => {
  const editor = useContext(EditorContext)
  const [selectGraph, setSetlectGraph] = useState<Object2D>()
  const [x, setX] = useState(0)
  const [y, setY] = useState(0)
  const [w, setW] = useState(0)
  const [h, setH] = useState(0)
  const [r, setR] = useState(0)
  const [style, setStyle] = useState<BasicStyle>()
  const [alpha, setAlpha] = useState(1)
  const [shadow, setShadow] = useState(false)
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
        setAlpha(
          typeof obj.style.globalAlpha === 'undefined'
            ? 1
            : obj.style.globalAlpha
        )
        setStyle(obj.style)
        setShadow(!!obj.style.shadowColor)
      }
    }
    selectHelper.addEventListener('change_helper', changeHelper)
    selectHelper.addEventListener('graph_operation', changeHelper)
    return () => {
      selectHelper.removeEventListener('change_helper', changeHelper)
      selectHelper.removeEventListener('graph_operation', changeHelper)
    }
  }, [editor])
  /** 透明度值格式化 */
  const formatter = (value = 0) => `${parseInt(value * 100 + '')}%`
  /** 透明度改变 */
  const globalAlphaChange = (value: number) => {
    const selectHelper = editor?.dynamicLayer.getObjectByName(
      'selectHelper'
    ) as SelectHelper
    if (!selectHelper) return
    // const alpha = value / 100
    for (let i = 0; i < selectHelper.children.length; i++) {
      const child = selectHelper.children[i]
      child.setStyle({ globalAlpha: value })
    }
    setAlpha(value)
    editor?.baseLayer.render()
  }
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
            <div className="h-38px leading-10">透明度</div>
            <Slider
              value={alpha}
              min={0}
              max={1}
              step={0.01}
              tooltip={{ formatter }}
              onChange={globalAlphaChange}
            />
          </div>
          <div className="h-1px bg-#ddd my-6px"></div>
          <div>
            <div className="h-38px leading-10 flex items-center justify-between">
              <span>阴影</span>
              <PlusOutlined
                className="cursor-pointer"
                onClick={() => {
                  if (!style) return
                  style.shadowColor = '#000000'
                  style.shadowOffsetX = 10
                  style.shadowOffsetY = 20
                  style.shadowBlur = 30
                  setShadow(true)
                  editor?.baseLayer.render()
                }}
              />
            </div>
            {shadow && (
              <div className="my-10px flex items-center justify-between">
                <Shadow style={style}></Shadow>
                <MinusOutlined
                  className="cursor-pointer"
                  onClick={() => {
                    if (!style) return
                    style.shadowColor = undefined
                    style.shadowBlur = 0
                    style.shadowOffsetX = 0
                    style.shadowOffsetY = 0
                    setShadow(false)
                    editor?.baseLayer.render()
                  }}
                />
              </div>
            )}
          </div>
          <div className="h-1px bg-#ddd my-6px"></div>
        </div>
      )}
    </div>
  )
}
export default GraphPanel
