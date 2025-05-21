import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import express from 'express';
import http from 'http';
import cors from 'cors';
import bodyParser from 'body-parser';
import { typeDefs } from './schema.js'
import { resolvers } from './resolver.js'
import { CatalogueDataSource }  from './datasource/catalogue.js' 
import { OrderDataSource }  from './datasource/order.js' 

// Expressサーバとの統合
const app = express();


// Expressサーバーへの受信リクエストを処理するhttpServerの設定
const httpServer = http.createServer(app);

// 必要なbody parserミドルウェアを先に適用
app.use(cors());
app.use(bodyParser.json());

// ApolloServer 初期化用の処理
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

// ApolloServerの起動
await server.start()

// サーバーをマウントするパスの指定
app.use(
  '/graphql',
  expressMiddleware(server, {
    context: async ({ req }) => {
        return {
          dataSources: {
            catalogueApi: new CatalogueDataSource(),
            orderApi: new OrderDataSource()
          }
        }
      }
  }),
);

// REST APIのエンドポイント
const assistantUri = process.env.ASSISTANT_CLIENT_URI
  ? `http://${process.env.ASSISTANT_CLIENT_URI}`
  : 'http://localhost:9000';
app.post(
  '/recommendation',
  async (req, res) => {
    try {
      if (!req.body) {
        return res.status(400).json({ error: 'Missing query in request body' });
      }
      const { query } = req.body;
      console.log('Received request:', { query });
      
      const response = await fetch(`${assistantUri}/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      if (!response.ok) {
        return res.status(response.status).json({ error: 'Failed to fetch from /ask' });
      }
      const data = await response.json();
      console.log('Response from /ask:', data);
      res.json(data);
    } catch (err) {
      console.error('Error in /recommendation:', err);
      res.status(500).json({ error: err.message });
    }
  }
);

app.listen(4000)

console.log(`🚀 Server ready at http://localhost:4000/`);
