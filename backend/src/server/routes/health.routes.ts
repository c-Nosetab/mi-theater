import { RequestHandler, Router } from 'express';
import { version } from '../../../package.json';

// * /health

const router = Router();
const upDate = new Date();

const health: RequestHandler = (req, res) => {
  res.status(200).send({
    status: 'up',
    message: 'Kalpa on Node js, Express, PostgreSQL',
    upDate,
    version,
  });
};

router.get('/', health);

export default router;
