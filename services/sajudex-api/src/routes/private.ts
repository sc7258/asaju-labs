import { Router } from 'express';

const router = Router();

// GET /api/v1/private/persons
router.get('/persons', (req, res) => {
  res.json({ success: true, message: 'Private 인연록 API (준비 중)', data: [] });
});

export default router;
