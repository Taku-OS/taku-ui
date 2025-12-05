'use client'

import React, { useEffect, useState } from 'react'

interface IconLoaderProps {
  src: string
  className?: string
  width?: number | string
  height?: number | string
  fallback?: React.ReactNode
}

/**
 * 动态加载 SVG 文件的图标组件
 * 使用 fetch 加载 SVG 文件内容并内联渲染
 */
export function IconLoader({
  src,
  className,
  width = 12,
  height = 12,
  fallback,
}: IconLoaderProps) {
  const [svgContent, setSvgContent] = useState<string | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch(src)
      .then((res) => res.text())
      .then((text) => {
        // 提取 SVG 内容（移除 <svg> 标签，只保留内部内容）
        const parser = new DOMParser()
        const doc = parser.parseFromString(text, 'image/svg+xml')
        const svg = doc.querySelector('svg')
        if (svg) {
          setSvgContent(svg.innerHTML)
        } else {
          setError(true)
        }
      })
      .catch(() => {
        setError(true)
      })
  }, [src])

  if (error && fallback) {
    return <>{fallback}</>
  }

  if (!svgContent && fallback) {
    return <>{fallback}</>
  }

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      dangerouslySetInnerHTML={{ __html: svgContent || '' }}
    />
  )
}

