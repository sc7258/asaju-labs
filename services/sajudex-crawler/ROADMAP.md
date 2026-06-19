# 🗺️ Sajudex Crawler Roadmap

크롤러 서비스의 단기 및 장기 개발 마일스톤입니다.

## Phase 1: 위키피디아 (Wikidata) 기본 수집기
- [ ] `packages/db-schema` 연동 및 Prisma Client 구성
- [ ] Wikidata API를 통한 특정 인물 JSON 데이터 1건 수집 테스트
- [ ] 수집된 데이터를 `RawWikipedia` 테이블에 Insert 하는 로직 구현
- [ ] 인물 목록(List)을 순회하며 대량 수집하는 배치 로직 구현

## Phase 2: 명식 파생 및 정제기 (Transformer)
- [ ] `packages/saju-core`를 import 하여 생년월일을 사주 8글자로 변환하는 로직 작성
- [ ] `RawWikipedia`에서 데이터를 읽어와 변환 후 `CuratedPerson` 테이블로 이관하는 로직 구현

## Phase 3: 자동화 및 스케줄링
- [ ] `node-cron`을 도입하여 매일 새벽 3시에 신규/업데이트된 위키 문서를 자동 수집
- [ ] 슬랙(Slack) 또는 디스코드 웹훅을 통한 수집 결과(성공/실패/수집건수) 알림 연동

## Phase 4: 수집 채널 확장 (나무위키)
- [ ] 나무위키 HTML 파서(Adapter) 개발
- [ ] `RawNamuwiki` 테이블 연동 및 비구조화된 텍스트에서 생년월일 추출 정규식 고도화