
const express = require('express')
const http = require('http')
const config = require('./config')
const axios = require('axios')
const mongooseService = require('./services/mongoose')
const Users = require('./model/Users.model')
const Conversations = require('./model/Conversation.model')

const app = express();
const server = http.createServer(app)
const router = express.Router()

const port = config.port || 8090

mongooseService.connect(config.mongoURL)

// const newObj = new Users({
//   name: 'Tom',
//   email:'test2@gmail.com',
//   password: '123456'
// })
// newObj.save()

// const newObj1 = new Users({
//   name: "Jerry",
//   email: "test3@gmail.com",
//   password: "123456",
// });
// newObj1.save();

// const newConv = new Conversations({
//   members: ["62fc9ebf16a6a499bb086842", "62fc9ebf16a6a499bb086843"],
//   messages: [
//     {
//       sender: "62fc9ebf16a6a499bb086842",
//       text: "Hello, Marie!",
//       createdAt: new Date().toISOString(),
//     },
//     {
//       sender: "62fc9ebf16a6a499bb086843",
//       text: "Hello, John",
//       createdAt: new Date().toISOString(),
//     },
//   ],
// });
// newConv.save()

// const newConv1 = new Conversations({
//   members: ["62fc9ebf16a6a499bb086842", "62fc9f07d1476128a5295922"],
//   messages: [
//     {
//       sender: "62fc9ebf16a6a499bb086842",
//       text: "Hello, Jerry!",
//       createdAt: new Date().toISOString(),
//     },
//     {
//       sender: "62fc9f07d1476128a5295922",
//       text: "Hello, John",
//       createdAt: new Date().toISOString(),
//     },
//   ],
// });
// newConv1.save();

// const newConv2 = new Conversations({
//   members: ["62fc9f07d1476128a5295921", "62fc9f07d1476128a5295922"],
//   messages: [
//     {
//       sender: "62fc9f07d1476128a5295921",
//       text: "Hello, Jerry!",
//       createdAt: new Date().toISOString(),
//     },
//     {
//       sender: "62fc9f07d1476128a5295922",
//       text: "Hello, Tom",
//       createdAt: new Date().toISOString(),
//     },
//   ],
// });
// newConv2.save();

router.get('/', (req,res) => {
  res.json('Server up and running')
})

app.use(router)
app.use(express.json())

app.get("/api/v1/info", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/v1/users", async (req, res) => {
  try {
    const users = await Users.find({}).exec()
    res.json({status: 'ok', users})
  } catch (err) {
    console.log(err)
  }
})

app.get("/api/v1/conversations/:userId", async (req, res) => {
  const { userId } = req.params
  try {
    const conversations = await Conversations.find({members: { $in: [userId]}}).exec()
    res.json({status: 'ok', conversations})
  } catch (err) {
    console.log(err)
  }
})

app.post("/api/v1/messages/:conversationId", async (req, res) => {
  const { conversationId } = req.params
  const message = req.body
  try {
    await Conversations.findOneAndUpdate({ _id: conversationId}, { $push: { messages: message }})
    const conversations = await Conversations.find({members: { $in: [message.sender]}}).exec()
    res.json({status: 'ok', conversations})
  } catch (err) {
    console.log(err)
  }
})

app.post("/api/v1/messages/cn/:conversationId/:userId", async (req, res) => {
  const { conversationId, userId } = req.params
  const message = req.body
  const response = await axios("https://api.chucknorris.io/jokes/random")
    .then(({ data }) => {
      return data.value
    })
  const newMessage = { ...message, text: response}
    try {
    await Conversations.findOneAndUpdate({ _id: conversationId}, { $push: { messages: newMessage }})
    const conversations = await Conversations.find({members: { $in: [userId]}}).exec()
    res.json({status: 'ok', conversations})
  } catch (err) {
    console.log(err)
  }
})

server.listen(port, () => {
  console.log(`Server has started on port ${port}`)
})

