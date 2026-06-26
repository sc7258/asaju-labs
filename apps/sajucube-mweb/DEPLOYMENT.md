# 사주큐브 (sajucube-mweb) 배포 가이드

이 프로젝트는 `asaju-labs` 모노레포(Turborepo) 구조 안에 포함된 Next.js 애플리케이션입니다. Vercel을 이용해 사주큐브를 배포하는 방법은 크게 두 가지가 있습니다.

---

## 1. 깃허브 자동 배포 (권장 ⭐️)

가장 권장되는 표준 배포 방식입니다. 로컬에서 작업한 코드를 깃허브의 `main` 브랜치로 푸시(push)하기만 하면, Vercel이 변경 사항을 자동으로 감지하여 빌드 및 배포를 진행합니다.

**실행 순서:**
```bash
# 1. 변경된 코드 스테이징 및 커밋
git add .
git commit -m "feat(sajucube): 새로운 기능 추가"

# 2. 깃허브로 푸시
git push origin main
```

* **동작 원리:** Vercel 대시보드의 `sajucube` 프로젝트 설정에 **`Root Directory`가 `apps/sajucube-mweb`으로 지정**되어 있기 때문에, 모노레포 전체 코드 중 사주큐브 앱만 정확히 찾아내어 알아서 빌드해 줍니다. (현재 완벽하게 설정되어 있습니다.)

---

## 2. 로컬 수동 배포 (Vercel CLI)

깃허브를 거치지 않고 현재 내 컴퓨터(로컬)에 있는 코드를 강제로 Vercel에 직접 배포하고 싶을 때 사용하는 방법입니다.

⚠️ **중요 주의사항:** 
Vercel 설정에 Root Directory가 이미 `apps/sajucube-mweb`으로 잡혀있기 때문에, 앱 폴더 안으로 들어가서 배포 명령을 내리면 경로가 두 번 중첩되는 에러(`apps/sajucube-mweb/apps/sajucube-mweb`)가 발생합니다. **반드시 모노레포 최상단 루트 폴더에서 명령어를 실행해야 합니다.**

**실행 순서:**
```bash
# 1. 최상단 루트 폴더로 이동 (이미 루트에 있다면 생략)
cd C:\Users\sc725\_work-github\asaju-labs

# 2. 로컬 환경을 Vercel의 sajucube 프로젝트와 연결 (최초 1회만)
pnpm dlx vercel link --project sajucube
# (질문이 나오면 모두 Y를 누르고 진행하시면 됩니다)

# 3. 배포 명령어 실행 (프로덕션 배포)
pnpm dlx vercel --prod
```

### 트러블슈팅 (에러 해결)
* **경로 중복 에러가 나는 경우:** 앱 폴더(`apps/sajucube-mweb`) 안에서 `vercel` 명령을 실행해서 발생한 것입니다. `cd ../..`을 통해 최상단 루트 폴더로 나온 뒤에 다시 실행하세요.
* **다른 앱(예: asaju-labs 루트 등)이 배포되는 경우:** 루트 폴더의 `.vercel` 숨김 폴더에 다른 프로젝트가 연결되어 있어서 그렇습니다. 위 2번 단계(`vercel link --project sajucube`)를 다시 실행하여 사주큐브 프로젝트로 명시적으로 덮어씌워주면 해결됩니다.
