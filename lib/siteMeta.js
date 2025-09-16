export function getSiteMeta() {
  const year = new Date().getFullYear();
  const title = `${year} 골프공 추천 리뷰 – 브랜드별 성능 비교 분석`;
  const description = '타이틀리스트부터 던롭까지, 직접 라운드에서 테스트한 골프공 리뷰.<br/>디자인, 비거리, 타구감을 객관적으로 비교하여 당신에게 맞는 골프공 선택을 도와드립니다.';
  return { title, description };
}
