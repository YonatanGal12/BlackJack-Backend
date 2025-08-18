import express from 'express';
import cors from 'cors';
import router from './routes/game'; 

const app = express();

app.use(cors());

app.use(express.json());

app.use('/game', router);

app.listen(3001, () => {
  console.log('Server is running on port 3001');
});