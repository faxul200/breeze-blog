# Breeze Blog (Next.js + Supabase + AdSense)

Next.js pages router 기반의 SSR 개인 블로그 예시입니다. Supabase로 글을 관리하고, Google AdSense 수익화를 위한 구성(ads.txt, 스크립트, robots/sitemap)을 포함합니다.

## 요구사항
- Node.js 18+
- Supabase 프로젝트 (테이블: `posts`)

### Supabase 테이블 예시
```sql
create table if not exists public.posts (
  id bigint primary key generated always as identity,
  title text not null,
  slug text unique,
  excerpt text,
  description text,
  content text,
  coverImage text,
  published boolean default false,
  publishedAt timestamptz,
  updatedAt timestamptz default now()
);
create index if not exists idx_posts_published_at on public.posts (publishedAt desc);
```

## 환경변수 설정
프로젝트 루트에 `.env.local` 파일을 생성하여 다음 값을 채우세요:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-XXXXXXXXXXXXXXXX
NEXT_PUBLIC_ADSENSE_SLOT=XXXXXXXXXX
```
- 실제 배포 시 `public/robots.txt`의 `Sitemap:` URL을 실제 도메인으로 바꾸세요.
- `public/ads.txt`의 퍼블리셔 ID(pub-...)를 본인 것으로 바꾸세요.

## 개발/빌드
```
npm install
npm run dev
# 빌드
npm run build && npm start
```

## 경로 구조
- `pages/index.js`: SSR 글 목록
- `pages/posts/[id].js`: SSR 글 상세 (id 또는 slug)
- `pages/sitemap.xml.js`: 동적 사이트맵
- `lib/supabase.js`: Supabase 클라이언트 및 데이터 함수
- `public/ads.txt`, `public/robots.txt`: 크롤링/광고 세팅
- `pages/_app.js`, `pages/_document.js`: 전역 스타일, 메타/스크립트

## AdSense 팁
- 실제 승인 전까지 광고가 표시되지 않을 수 있습니다.
- AdSense 클라이언트/슬롯 설정 후에도 반영까지 시간이 걸릴 수 있습니다.
- 페이지 내 `<ins class="adsbygoogle">`가 렌더링된 뒤 초기화가 필요하면, 클라이언트 측에서 `window.adsbygoogle = window.adsbygoogle || []; window.adsbygoogle.push({});` 호출을 고려하세요.

## SEO/색인
- SSR을 통해 목록/상세가 서버에서 HTML로 렌더링됩니다.
- `robots.txt`와 `sitemap.xml`을 제공하여 색인 지원.
- Open Graph 메타 태그 포함.

## 라이선스
MIT

