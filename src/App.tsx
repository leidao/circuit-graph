/*
 * @Description: 电路图编辑器
 * @Author: ldx
 * @Date: 2024-08-20 14:33:49
 * @LastEditors: ldx
 * @LastEditTime: 2024-09-05 17:49:13
 */

import { useEffect, useRef, useState } from 'react'

const preventDefaultScalePage = (event: WheelEvent) => {
  if (event.ctrlKey || event.metaKey) {
    event.preventDefault()
  }
}
import Panel from '@/editor/components/panel'
import Structure from '@/editor/components/structure'
import ToolBar from '@/editor/components/toolbar'
import EditorContext from '@/editor/context'
import { EditorView } from '@/editor/view'
const Home = () => {
  const [editor, setEditor] = useState<EditorView | null>(null)

  const container = useRef<HTMLDivElement>(null)


  useEffect(() => {
    if (!container.current) return
    const editor = new EditorView({ container: container.current })
    setEditor(editor)
    // 禁止页面放大
    document.addEventListener('wheel', preventDefaultScalePage, {
      capture: false,
      passive: false
    })
    return () => {
      editor?.destroy()
      document.removeEventListener('wheel', preventDefaultScalePage)
    }
  }, [])
  return (
    <EditorContext.Provider value={editor}>
      <div className='border-b-1 border-#e6e6e6 border-b-solid px-10px'>
        <ToolBar className="h-37px box-border text-#202020"></ToolBar>
      </div>
      <div className="flex w-100% overflow-hidden" style={{
        height: 'calc(100% - 38px)'
      }}>
        <div className='w-240px h-100% bg-#fafafa'>
          <Structure></Structure>
        </div>
        <div className="flex-1 relative box-border h-100%">
          <div
            className="absolute left-0px box-border w-100% h-100% bg-#fff border-solid border-t-0px border-b-0px border-#dadadc99"
            ref={container}
          >
          </div>
        </div>
        <div className="w-280px h-100% bg-#fafafa">
          <Panel></Panel>
        </div>
      </div>
    </EditorContext.Provider>
  )
}
export default Home
