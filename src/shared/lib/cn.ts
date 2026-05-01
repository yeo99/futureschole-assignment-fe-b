import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// tailwind 클래스 병합 함수
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
