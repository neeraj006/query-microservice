const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());
app.use(cors());

const posts = {};

app.get("/posts", (req, res) => {
  res.send(posts);
});

app.post("/events", async (req, res) => {
  console.log("Received Event", req.body.type);
  const { type, data } = req.body;
  handleEvent(type, data);
  res.send({});
});

app.listen(4002, async () => {
  console.log("Listening on 4002");
  const res = await axios.get("http://localhost:4005/events");
  console.log(res.data);
  for (let event of res.data) {
    console.log("processing event", event.type);
    handleEvent(event.type, event.data);
  }
});

function handleEvent(type, data) {
  if (type === "PostCreated") {
    const { id, title } = data;
    posts[id] = {
      id,
      title,
      comments: []
    };
  }

  if (type === "CommentCreated") {
    const { id, content, postId, status } = data;
    posts[postId].comments.push({
      id,
      content,
      status
    });
  }
  if (type === "CommentUpdated") {
    console.log("CommentUpdated", data);
    const { id, postId, content, status } = data;
    const post = posts[postId];
    const comment = post.comments.find(comment => comment.id === id);
    comment.status = status;
    comment.content = content;

    // axios.post("http://localhost:4005/events", {
    //   type: "CommentUpdated",
    //   data: { id, postId, status, content }
    // });
  }
}
