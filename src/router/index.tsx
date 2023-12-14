/*
 * @Description:
 * @Author: ldx
 * @Date: 2022-04-06 14:45:22
 * @LastEditors: ldx
 * @LastEditTime: 2023-12-14 16:18:54
 */
import React, { Suspense, useEffect } from 'react'
import {
  Route,
  Routes,
} from 'react-router-dom'

import { RouteLoading } from '@/components'

import routes from './routes'
const RouteList: React.FC = () => {

  return (
    <Suspense fallback={<RouteLoading />}>
      <Routes>
        {(routes || []).map((route) => {
          const Component = route.component
          return (
            <Route path={route.path} element={<Component />} key={route.key} />
          )
        })}
      </Routes>
    </Suspense>
  )
}

export default RouteList
