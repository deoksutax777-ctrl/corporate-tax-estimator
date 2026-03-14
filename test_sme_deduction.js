/**
 * 중소기업특별세액감면 자가검증 테스트
 * 조세특례제한법 제7조 / 중소기업기본법 시행령 별표3 기준
 *
 * 핵심: 조특법 §7은 수도권/비수도권만 구분 (과밀억제권역 별도 구분 없음)
 *       과밀억제권역 구분은 조특법 §6(창업중소기업세액감면)에만 해당
 */

// ── 테스트 대상 함수 복제 ──

function getSmallBizThreshold(cd) {
  if (cd === 'C') return 12000000000;          // 제조업: 120억
  if ('ABDE'.includes(cd)) return 8000000000;  // 농림어업,광업,전기가스,수도하수: 80억
  if (cd === 'F' || cd === 'H') return 8000000000; // 건설업, 운수창고: 80억
  if (cd === 'G') return 5000000000;           // 도소매업: 50억
  if (cd === 'J' || cd === 'K') return 5000000000; // 정보통신,금융보험: 50억
  if ('IMNOPQRS'.includes(cd)) return 3000000000;  // 숙박음식,부동산,전문과학기술,사업시설관리,교육,보건,예술스포츠,수리개인서비스: 30억
  return 3000000000;                           // 기타: 30억
}

function getSmeRate(cd, revenue, region) {
  const threshold = getSmallBizThreshold(cd);
  const isSmall = revenue > 0 ? revenue <= threshold : true;
  const isCapital = (region === 'capital_non_dense' || region === 'dense');
  const isRetailMedical = (cd === 'G' || cd === 'Q');

  // 조특법 §7: 수도권/비수도권만 구분 (과밀억제권역 별도 구분 없음)
  let rate;
  if (isSmall) {
    if (isCapital) {
      rate = isRetailMedical ? 10 : 20;  // 소기업 수도권
    } else {
      rate = isRetailMedical ? 15 : 30;  // 소기업 비수도권
    }
  } else {
    if (isCapital) {
      rate = 0;                           // 중기업 수도권: 감면 없음
    } else {
      rate = isRetailMedical ? 5 : 15;   // 중기업 비수도권
    }
  }
  return { rate, isSmall, threshold };
}

// ── 테스트 실행 ──

let passed = 0;
let failed = 0;

function assert(testName, actual, expected) {
  if (actual === expected) {
    passed++;
  } else {
    failed++;
    console.log(`  FAIL: ${testName} → 기대: ${expected}, 실제: ${actual}`);
  }
}

console.log('=== 1. 소기업 매출액 기준 검증 (중소기업기본법 시행령 별표3) ===');

assert('제조업(C) 기준: 120억', getSmallBizThreshold('C'), 12000000000);
assert('농업(A) 기준: 80억', getSmallBizThreshold('A'), 8000000000);
assert('광업(B) 기준: 80억', getSmallBizThreshold('B'), 8000000000);
assert('전기가스(D) 기준: 80억', getSmallBizThreshold('D'), 8000000000);
assert('수도하수(E) 기준: 80억', getSmallBizThreshold('E'), 8000000000);
assert('건설업(F) 기준: 80억', getSmallBizThreshold('F'), 8000000000);
assert('도소매업(G) 기준: 50억', getSmallBizThreshold('G'), 5000000000);
assert('운수창고(H) 기준: 80억', getSmallBizThreshold('H'), 8000000000);
assert('숙박음식(I) 기준: 30억', getSmallBizThreshold('I'), 3000000000);
assert('정보통신(J) 기준: 50억', getSmallBizThreshold('J'), 5000000000);
assert('금융보험(K) 기준: 50억', getSmallBizThreshold('K'), 5000000000);
assert('부동산(M) 기준: 30억', getSmallBizThreshold('M'), 3000000000);
assert('전문과학기술(N) 기준: 30억', getSmallBizThreshold('N'), 3000000000);
assert('사업시설관리(O) 기준: 30억', getSmallBizThreshold('O'), 3000000000);
assert('교육서비스(P) 기준: 30억', getSmallBizThreshold('P'), 3000000000);
assert('보건사회복지(Q) 기준: 30억', getSmallBizThreshold('Q'), 3000000000);
assert('예술스포츠(R) 기준: 30억', getSmallBizThreshold('R'), 3000000000);
assert('수리개인서비스(S) 기준: 30억', getSmallBizThreshold('S'), 3000000000);

console.log('');
console.log('=== 2. 감면율 검증 (조특법 §7 — 수도권/비수도권만 구분) ===');
console.log('');

// ── 소기업 + 일반업종(제조업 C) ──
console.log('--- 소기업 + 일반업종(제조업) ---');
let r;
r = getSmeRate('C', 10000000000, 'non_capital');     // 100억, 비수도권
assert('소기업+제조+비수도권 = 30%', r.rate, 30);
assert('소기업 판정', r.isSmall, true);

r = getSmeRate('C', 10000000000, 'capital_non_dense'); // 100억, 수도권(과밀억제 외)
assert('소기업+제조+수도권(과밀억제외) = 20%', r.rate, 20);

r = getSmeRate('C', 10000000000, 'dense');            // 100억, 과밀억제권역
assert('소기업+제조+과밀억제권역 = 20% (수도권과 동일)', r.rate, 20);

// ── 소기업 + 도소매업(G) ──
console.log('--- 소기업 + 도소매업 ---');
r = getSmeRate('G', 3000000000, 'non_capital');       // 30억, 비수도권
assert('소기업+도소매+비수도권 = 15%', r.rate, 15);

r = getSmeRate('G', 3000000000, 'capital_non_dense');
assert('소기업+도소매+수도권(과밀억제외) = 10%', r.rate, 10);

r = getSmeRate('G', 3000000000, 'dense');
assert('소기업+도소매+과밀억제권역 = 10% (수도권과 동일)', r.rate, 10);

// ── 소기업 + 의료업(Q) ──
console.log('--- 소기업 + 보건/의료업 ---');
r = getSmeRate('Q', 2000000000, 'non_capital');       // 20억, 비수도권
assert('소기업+보건+비수도권 = 15%', r.rate, 15);

r = getSmeRate('Q', 2000000000, 'capital_non_dense');
assert('소기업+보건+수도권(과밀억제외) = 10%', r.rate, 10);

r = getSmeRate('Q', 2000000000, 'dense');
assert('소기업+보건+과밀억제권역 = 10% (수도권과 동일)', r.rate, 10);

// ── 중기업 + 일반업종(제조업 C) ──
console.log('--- 중기업 + 일반업종(제조업) ---');
r = getSmeRate('C', 15000000000, 'non_capital');      // 150억, 비수도권
assert('중기업+제조+비수도권 = 15%', r.rate, 15);
assert('중기업 판정', r.isSmall, false);

r = getSmeRate('C', 15000000000, 'capital_non_dense');
assert('중기업+제조+수도권(과밀억제외) = 0%', r.rate, 0);

r = getSmeRate('C', 15000000000, 'dense');
assert('중기업+제조+과밀억제권역 = 0%', r.rate, 0);

// ── 중기업 + 도소매업(G) ──
console.log('--- 중기업 + 도소매업 ---');
r = getSmeRate('G', 6000000000, 'non_capital');       // 60억, 비수도권
assert('중기업+도소매+비수도권 = 5%', r.rate, 5);
assert('중기업 판정(도소매 50억 초과)', r.isSmall, false);

r = getSmeRate('G', 6000000000, 'capital_non_dense');
assert('중기업+도소매+수도권 = 0%', r.rate, 0);

r = getSmeRate('G', 6000000000, 'dense');
assert('중기업+도소매+과밀억제 = 0%', r.rate, 0);

// ── 경계값 테스트 ──
console.log('--- 경계값 테스트 ---');
r = getSmeRate('C', 12000000000, 'non_capital');      // 정확히 120억
assert('제조 120억 = 소기업(경계)', r.isSmall, true);

r = getSmeRate('C', 12000000001, 'non_capital');      // 120억 초과
assert('제조 120억+1 = 중기업(경계)', r.isSmall, false);

r = getSmeRate('I', 3000000000, 'non_capital');       // 숙박음식 정확히 30억
assert('숙박음식 30억 = 소기업(경계)', r.isSmall, true);

r = getSmeRate('I', 3000000001, 'non_capital');       // 30억 초과
assert('숙박음식 30억+1 = 중기업(경계)', r.isSmall, false);

// ── 결과 출력 ──
console.log('');
console.log('=== 검증 결과 ===');
console.log(`통과: ${passed}개`);
console.log(`실패: ${failed}개`);
console.log(`전체: ${passed + failed}개`);
if (failed === 0) {
  console.log('✅ 모든 테스트 통과!');
} else {
  console.log('❌ 실패한 테스트가 있습니다.');
  process.exit(1);
}
