/*
 * @Description:
 * @Author: ldx
 * @Date: 2022-04-06 21:56:29
 * @LastEditors: ldx
 * @LastEditTime: 2022-04-27 14:22:32
 */

const LOADING =
  'http://capacity-platform.oss-cn-hangzhou.aliyuncs.com/capacity-platform/20210730/a1c35459662045c986e0298759f70f70.gif'

export const RouteLoading = () => {
  return (
    <div className="w-100% h-100% bg-white flex items-center justify-center">
      <img
        className="max-w-800px max-h-600px w-100% h-100%"
        src={LOADING}
        alt=""
      />
    </div>
  )
}
