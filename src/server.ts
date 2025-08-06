import express from 'express';
import cors from 'cors';
import router from './routes/game'; 

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Backend is running!');
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'It works!' });
});

app.use('/api/games', router);

app.listen(3001, () => {
  console.log('Server is running on port 3001');
});