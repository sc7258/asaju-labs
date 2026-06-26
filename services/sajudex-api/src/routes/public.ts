import { Router } from 'express';

const router = Router();

// GET /api/v1/public/persons
router.get('/persons', (req, res) => {
  // TODO: 연동될 Prisma Client 코드 작성 위치
  res.json({ success: true, message: 'Public 검색 API (준비 중)', data: [] });
});

export default router;
