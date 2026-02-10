'use client';

import { useFetchInterceptor } from '@/lib/useFetchInterceptor';

export default function FetchInterceptorInit() {
  useFetchInterceptor();
  return null;
}
