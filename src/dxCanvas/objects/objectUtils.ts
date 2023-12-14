/*
 * @Description:
 * @Author: ldx
 * @Date: 2023-11-19 16:05:57
 * @LastEditors: ldx
 * @LastEditTime: 2023-12-08 15:11:43
 */
import { Matrix3 } from '../math/matrix3'
import { Vector2 } from '../math/vector2'
/** 根据矩阵绘制路径 */
export function crtPathByMatrix(
  ctx: CanvasRenderingContext2D,
  vertices: number[],
  matrix: Matrix3,
  closePath = false
) {
  const p0 = new Vector2(vertices[0], vertices[1]).applyMatrix3(matrix)
  ctx.moveTo(p0.x, p0.y)
  for (let i = 2, len = vertices.length; i < len; i += 2) {
    const pn = new Vector2(vertices[i], vertices[i + 1]).applyMatrix3(matrix)
    ctx.lineTo(pn.x, pn.y)
  }
  closePath && ctx.closePath()
}
/* 创建路径 */
export function crtPath(
  ctx: CanvasRenderingContext2D,
  vertices: number[],
  closePath = false
) {
  const p0 = new Vector2(vertices[0], vertices[1])
  ctx.moveTo(p0.x, p0.y)
  for (let i = 2, len = vertices.length; i < len; i += 2) {
    const pn = new Vector2(vertices[i], vertices[i + 1])
    ctx.lineTo(pn.x, pn.y)
  }
  closePath && ctx.closePath()
}
export function ImagePromise(image: HTMLImageElement) {
  return new Promise<HTMLImageElement>((resolve) => {
    image.onload = () => {
      resolve(image)
    }
  })
}
export function ImagePromises(images: HTMLImageElement[]) {
  return images.map((image) => ImagePromise(image))
}

/**
 * 找出离 value 最近的 segment 的倍数值
 */
export const getClosestTimesVal = (value: number, segment: number) => {
  const n = Math.floor(value / segment)
  const left = segment * n
  const right = segment * (n + 1)
  // console.log('====', value, segment, n, left, right)

  return value - left <= right - value ? left : right
}
/**
 * Canvas 中绘制，必须为 x.5 才能绘制一列单独像素，
 * 否则会因为抗锯齿，绘制两列像素，且一个为半透明，导致一种模糊的效果
 *
 * 这个方法会得到值最接近的 x.5 值。
 */
export const nearestPixelVal = (n: number) => {
  const left = Math.floor(n)
  const right = Math.ceil(n)
  return (n - left < right - n ? left : right) + 0.5
}
