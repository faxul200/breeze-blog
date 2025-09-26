// AI 블로그 글 생성 프롬프트 템플릿
export const BLOG_PROMPTS = {
  // 골프공 리뷰 프롬프트 (사용자 커스텀 프롬프트)
  golfBallReview: (imagePath, productName) => `
📸 내가 캐릭터 골프공 사진 여러 장을 줄게.  
이 사진들을 기반으로 **HTML 형식의 블로그 리뷰 본문**을 작성해줘.  

조건은 다음과 같아:

1.  **구매를 고려 중인 골퍼(초보~중급자)**를 대상으로,  
   단순한 스펙 설명이 아니라 **직접 써본 듯한 체험담 스타일**로 작성해줘.  
   → 네이버 블로그처럼 자연스럽게 말하듯,  
   "써보니 ~했습니다", "생각보다 ~하더군요" 같은 **친근한 존댓말**을 사용해줘.  
   (절대 반말은 쓰지 마.)

2. 결과는 \`<body>\` 태그 안의 내용만 출력해줘.  
   \`<html>\`, \`<head>\`, \`<meta>\`, \`<style>\`, \`<script>\` 등은 **절대 포함하지 마**.

3. 다음 **HTML 구성과 순서**를 반드시 지켜서 작성해줘.  
   다만 각 섹션 시작 시 **짧은 감성적인 한 줄**을 먼저 넣어서 블로그 글 느낌을 살려줘.

   - \`<h2>제목</h2>\`  
   - \`<p>제품 소개</p>\` → **핵심 브랜드/제품명을 첫 문장에서 굵게(\`<strong>\`) 처리해줘.**  
   - \`<h3>제품 실사</h3>\`  
     - 각 이미지마다 다음 형식 반복:  
       - \`<h4>사진 설명</h4>\`  
       - \`<img src="..." alt="..." />\`  
       - \`<p>사진 설명 내용</p>\`  
   - \`<h3>제품 정보</h3>\`  
     - <table>...</table> 작성 (아래 항목 반드시 포함)  
       1) 제품명  
       2) 제조사  
       3) 구성  
       4) 커버 소재  
       5) 주요 특징  
       6) 출시 시기  
       7) 현재 판매 여부  
       8) 판매처  

   ⚠️ 제품 정보는 **구글 검색으로 반드시 최신 데이터 확인**.  
   - 출시 시기, 판매 여부, 판매처는 특히 한 번 더 체크.  
   - 검색 결과 불확실하면 "정확한 정보 확인 불가"라고 명시 (추정 금지).

   - \`<br />\`  
   - \`<h3>제품 요약</h3>\`  
     - \`<ul>...</ul>\` 형식 + "추천 대상" 포함  
   - \`<br />\`  
   - \`<h3>사용 후기</h3>\`  
     - \`<ul>...</ul>\` 형식 (체험담 말투 유지)  
   - \`<br />\`  
   - \`<h3>총평</h3>\`  
     - \`<p>\` (친근하게 정리)

4. **이미지 개수만큼 반복해서 작성**하고,  
   **퍼팅라인이 보이는 이미지**는 따로 강조해줘.

5. \`<ul>\`과 \`<h3>\` 단락 사이에는 반드시 \`<br />\`을 넣어  
   **시각적 단락 분리**를 해줘.

6. \`<img>\`의 \`alt\` 속성은 **SEO 최적화 문장 + 자연스러운 표현**을 혼합.  
   → 너무 기계적으로 반복하지 말고, 조금씩 다르게.

7. 어조는 **친절하고 자연스럽게, 체험담 기반으로 정보 전달**.  
   초보~중급 골퍼가 **실제 구매 판단에 도움**되도록 작성해줘.

8. 골프공 이름이 한국어가 아니면 모두 한글로 표기 (예: 타이틀리스트, 커클랜드 시그니춰).

9. 제품 외형 설명에서 '디스트럼' 같은 잘못된 표현은 절대 쓰지 마.  
  골프공의 무늬는 반드시 '딤플 패턴'으로만 표기해.  
  불확실하거나 잘못된 표현은 사용하지 말고, 구글 검색으로 확인되지 않으면 아예 언급하지 마.
 
10.  불필요한 메타 태그나 \`:contentReference[...]\` 같은 내부 표시는 절대 포함하지 마.  

11. 내가 줄 이미지 URL은 다음 형식이야 (순서대로 넣어줘):  
   \`https://raw.githubusercontent.com/faxul200/blog-assets/main/images/파일명.webp\`

12. 본문 끝에는 아래 정보를 **본문 외부에 따로 표시해줘** (형식 유지):

<strong>title</strong>: (SEO 최적화 제목)
<strong>summary</strong>: (약 200자 분량 설명, 체험담 톤 유지)
<strong>tags</strong>: (쉼표로 구분된 키워드 6개, 한 줄)
<strong>category</strong>: (비거리(distance), 타구감(feel), 디자인(design) 중 하나 선택, 영어만 표기)

**이미지 경로**: ${imagePath}
**제품명**: ${productName}
`,

  // 일반 제품 리뷰 프롬프트
  generalReview: (imagePath, productName) => `
다음 이미지를 분석하여 제품 리뷰 글을 작성해주세요.

**이미지 경로**: ${imagePath}
**제품명**: ${productName}

**작성 요구사항**:
1. 제목: "제품명 완전 분석 - 구매 전 필독"
2. 구조:
   - 제품 정보 표
   - 외관 및 디자인
   - 사용성 및 기능
   - 장단점
   - 추천 대상
   - 총평

3. 길이: 1500-2500자
4. HTML 형식으로 작성
`,

  // 기술 제품 분석 프롬프트
  techAnalysis: (imagePath, productName) => `
다음 기술 제품을 분석하여 전문적인 리뷰를 작성해주세요.

**이미지 경로**: ${imagePath}
**제품명**: ${productName}

**작성 요구사항**:
1. 제목: "제품명 기술 분석 - 전문가 리뷰"
2. 구조:
   - 기술 사양 표
   - 핵심 기술 분석
   - 성능 벤치마크
   - 경쟁 제품 대비
   - 장단점
   - 추천 여부

3. 길이: 2500-3500자
4. HTML 형식으로 작성
`
};

// 카테고리별 프롬프트 선택 함수
export function getPromptByCategory(category, imagePath, productName) {
  switch (category) {
    case 'golf':
    case 'golfball':
    case 'distance':
    case 'feel':
    case 'design':
      return BLOG_PROMPTS.golfBallReview(imagePath, productName);
    case 'tech':
    case 'technology':
      return BLOG_PROMPTS.techAnalysis(imagePath, productName);
    default:
      return BLOG_PROMPTS.generalReview(imagePath, productName);
  }
}

// 이미지에서 제품명 추출하는 프롬프트
export const PRODUCT_EXTRACTION_PROMPT = `
다음 이미지를 분석하여 제품명을 추출해주세요.

**이미지 경로**: {imagePath}

**요구사항**:
1. 이미지에서 보이는 제품명, 브랜드명을 정확히 추출
2. 제품 카테고리 (golf, tech, general 등) 분류
3. JSON 형식으로 응답: {"productName": "제품명", "category": "카테고리"}

**주의사항**:
- 정확한 제품명만 추출 (추측하지 말 것)
- 카테고리는 명확하지 않으면 "general"로 설정
`;
