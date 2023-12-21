/*
 * @Description: 编辑器上下文
 * @Author: ldx
 * @Date: 2023-12-21 11:15:14
 * @LastEditors: ldx
 * @LastEditTime: 2023-12-21 11:18:11
 */
import { createContext } from 'react'

import { Editor } from './editor'

const EditorContext = createContext<Editor | null>(null)

export default EditorContext
