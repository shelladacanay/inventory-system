const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const itemsRouter = require('./routes/items');

app.use(cors());
app.use(express.json());

app.use('/api/items', itemsRouter);

app.get('/', (req, res) => res.send('Inventory API Running'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));