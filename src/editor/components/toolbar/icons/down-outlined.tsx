/*
 * @Description: 下拉箭头
 * @Author: ldx
 * @Date: 2023-12-05 11:14:15
 * @LastEditors: ldx
 * @LastEditTime: 2023-12-05 12:34:54
 */
import React from 'react'
type Props = {
  className: string
}
export const DownOutlined: React.FC<Props> = React.memo(({ className }) => {
  return (
    <svg
      className={`${className} icon`}
      viewBox="0 0 1024 1024"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      p-id="1451"
      width="16"
      height="16"
    >
      <path
        d="M512 784c-8.5 0-16.6-3.4-22.6-9.4l-480-480c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L512 706.7l457.4-457.4c12.5-12.5 32.8-12.5 45.3 0s12.5 32.8 0 45.3l-480 480c-6.1 6-14.2 9.4-22.7 9.4z"
        fill=""
        p-id="1452"
      ></path>
    </svg>
  )
})
