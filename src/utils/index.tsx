// import { NavigateFunction, useNavigate } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'

export const getToken = () => {
  return localStorage.getItem('token') || sessionStorage.getItem('token')
}
export const getUId = () => {
  return uuidv4().split('-')[0]
}

// export const navigate: NavigateFunction = () => {
//   return useNavigate()
// }
