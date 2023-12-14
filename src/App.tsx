/*
 * @Description:
 * @Author: ldx
 * @Date: 2022-04-06 19:34:55
 * @LastEditors: ldx
 * @LastEditTime: 2022-04-27 13:47:41
 */

import { ConfigProvider } from 'antd'
import zhCN from 'antd/es/locale/zh_CN'
import { createBrowserHistory } from 'history'
import { unstable_HistoryRouter as Router } from 'react-router-dom'
import { RecoilRoot } from 'recoil'

export const history = createBrowserHistory() as any

import RouteList from './router'

const App = () => {
  // 根据不同环境使用env内容
  const VITE_ACCESS_KEY_ID = import.meta.env.VITE_ACCESS_KEY_ID

  console.log(VITE_ACCESS_KEY_ID, 'VITE_ACCESS_KEY_ID')

  return (
    <ConfigProvider locale={zhCN}>
      {/* Recoil包裹器 */}
      <RecoilRoot>
        {/* 页面loading状态设置 配合路由动态懒加载 */}
        <Router history={history}>
          <RouteList />
        </Router>
      </RecoilRoot>
    </ConfigProvider>
  )
}

export default App
