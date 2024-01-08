/*
 * @Description:
 * @Author: ldx
 * @Date: 2023-11-19 16:05:57
 * @LastEditors: ldx
 * @LastEditTime: 2024-01-08 10:00:02
 */
import { isFunction } from 'lodash'

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

/**
 * 计算点到直线的距离。
 * @param point 点的坐标。
 * @param p1 直线上的第一个点的坐标。
 * @param p2 直线上的第二个点的坐标。
 * @returns 点到直线的距离。
 */
export const calculateDistanceToLine = (
  point: Vector2,
  p1: Vector2,
  p2: Vector2
): number => {
  const { x: x1, y: y1 } = p1
  const { x: x2, y: y2 } = p2
  const { x: x, y: y } = point

  const A = x - x1
  const B = y - y1
  const C = x2 - x1
  const D = y2 - y1

  const dot = A * C + B * D
  const lenSq = C * C + D * D
  let param = -1
  if (lenSq !== 0) {
    param = dot / lenSq
  }

  let xx, yy

  if (param < 0) {
    xx = x1
    yy = y1
  } else if (param > 1) {
    xx = x2
    yy = y2
  } else {
    xx = x1 + param * C
    yy = y1 + param * D
  }

  const dx = x - xx
  const dy = y - yy
  return Math.sqrt(dx * dx + dy * dy)
}

const callbacks: (() => void)[] = []
function flushCallbacks() {
  callbacks.forEach((cb) => cb())
}
export function nextTick(cb: () => void) {
  callbacks.push(cb)
  const timerFunc = () => {
    flushCallbacks()
  }
  if (Promise) {
    return Promise.resolve().then(timerFunc)
  }
  if (MutationObserver) {
    //h5api
    const mutation = new MutationObserver(timerFunc)
    const node = document.createTextNode(1)
    mutation.observe(node, { characterData: true })
    node.textContent = '2'
    return
  }
  if (setImmediate) {
    setImmediate(timerFunc)
    return
  }
  setTimeout(timerFunc, 0)
}

export function isLeft(
  p0: [number, number],
  p1: [number, number],
  p2: [number, number]
): number {
  return (p1[0] - p0[0]) * (p2[1] - p0[1]) - (p2[0] - p0[0]) * (p1[1] - p0[1])
}
