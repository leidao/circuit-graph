/*
 * @Description: 电路图编辑
 * @Author: ldx
 * @Date: 2022-04-06 19:34:55
 * @LastEditors: ldx
 * @LastEditTime: 2023-12-22 22:39:10
 */
import { useEffect, useRef, useState } from 'react'

const preventDefaultScalePage = (event: WheelEvent) => {
  if (event.ctrlKey || event.metaKey) {
    event.preventDefault()
  }
}
import GraphPanel from './components/graphPanel'
import Structure from './components/structure'
import ToolBar from './components/toolbar'
import EditorContext from './context'
import { Editor } from './editor'
const Home = () => {
  const [editor, setEditor] = useState<Editor | null>(null)

  const container = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!container.current) return
    const editor = new Editor({ container: container.current })
    setEditor(editor)

    // 禁止页面放大
    document.addEventListener('wheel', preventDefaultScalePage, {
      capture: false,
      passive: false
    })
    return () => {
      editor.destroy()
      document.removeEventListener('wheel', preventDefaultScalePage)
    }
  }, [container])
  return (
    <EditorContext.Provider value={editor}>
      <div className="flex h-100% w-100% overflow-hidden">
        <Structure></Structure>
        <div className="flex-1 relative box-border h-100%">
          <ToolBar className="h-37px box-border text-##202020"></ToolBar>
          <div
            className="absolute left-0px top-37px box-border w-100% bg-#f4f4f4 border-l-1px border-t-1px border-#dadadc99"
            style={{
              height: 'calc(100% - 38px)'
            }}
            ref={container}
          >
            {/* <canvas  className="w-100% h-100%"></canvas> */}
          </div>
        </div>
        <div className="w-240px h-100% border-l-1px border-#dadadc99">
          <GraphPanel></GraphPanel>
        </div>
      </div>
    </EditorContext.Provider>
  )
}
export default Home
