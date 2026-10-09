import { jsx as reactJsx, jsxs as reactJsxs } from 'react/jsx-runtime'
import { sealProps } from './text'
export { Fragment } from 'react/jsx-runtime'
export type { JSX } from 'react/jsx-runtime'
export const jsx: typeof reactJsx = (type, props, key) => reactJsx(type, sealProps(type, props), key)
export const jsxs: typeof reactJsxs = (type, props, key) => reactJsxs(type, sealProps(type, props), key)
