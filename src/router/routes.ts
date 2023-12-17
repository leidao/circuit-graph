/*
 * @Description:
 * @Author: ldx
 * @Date: 2022-04-06 19:34:55
 * @LastEditors: ldx
 * @LastEditTime: 2023-12-16 14:36:19
 */
import React from 'react'

export default [
  {
    path: '/*',
    key: 'home',
    component: React.lazy(() => import('@/editor/index')),
    routes: []
  },
  {
    path: '/substation',
    key: 'substation',
    component: React.lazy(() => import('@/substation/index')),
    routes: []
  }
]
