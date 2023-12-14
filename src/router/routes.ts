/*
 * @Description:
 * @Author: ldx
 * @Date: 2022-04-06 19:34:55
 * @LastEditors: ldx
 * @LastEditTime: 2023-12-14 16:19:17
 */
import React from 'react'

export default [
  {
    path: '/*',
    key: '/*',
    component: React.lazy(() => import('@/editor/index')),
    routes: []
  }
]
