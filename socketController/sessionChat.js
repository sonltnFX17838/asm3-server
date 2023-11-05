const SessionChat = require("../models/sessionChat");
const Product = require("../models/product");

const findAllRoom = async () => {
  const clientOnl = await SessionChat.find({ connecting: true }).select("_id");
  const stringData = clientOnl.map((obj) => ({ _id: obj._id.toString() }));
  const arrClientOnl = [];
  stringData.map((dt) => arrClientOnl.push(dt._id));
  return arrClientOnl;
};
const changeConnectRoom = async (idRoom, isConnect) => {
  const room = await SessionChat.findById(idRoom);
  room.sessionContent = [];
  room.connecting = isConnect;
  await room.save();
  return;
};

const socketController = (io) => {
  io.on("connection", (socket) => {
    // create new room if dont have a room of client
    socket.on("createRoom", async () => {
      console.log(1);
      const chatStart = new SessionChat({
        connecting: true,
        sessionContent: [{ role: "Counselors", content: "Can i help you ?" }],
      });
      const result = await chatStart.save();
      socket.emit("createRoom", result);
    });

    // connecting of client and send to admin
    socket.on("connecting", async (idRoom) => {
      await changeConnectRoom(idRoom, true);
      const clientOnl = await findAllRoom();
      io.emit("clientOnl", clientOnl);
    });

    //send rooms of client onl
    socket.on("clientOnl", async () => {
      const clientOnl = await findAllRoom();
      socket.emit("clientOnl", clientOnl);
    });

    // delete the room before client out chat
    socket.on("end", async (data) => {
      const destroyChat = await SessionChat.findById(data);
      await destroyChat.destroy();
      const clientOnl = await findAllRoom();
      io.emit("clientOnl", clientOnl);
    });

    // send old mess after chat
    socket.on("getStart", async (idRoom) => {
      const newChat = await SessionChat.findById(idRoom);
      io.emit(`chat${idRoom}`, newChat.sessionContent);
    });

    //send mess of chat room
    socket.on("messSend", async (idRoom, msg) => {
      const newChat = await SessionChat.findById(idRoom);
      newChat.sessionContent = [...newChat.sessionContent, msg];
      const result = await newChat.save();
      io.emit(`chat${idRoom}`, result.sessionContent);
    });

    socket.on("clientOff", async (idRoom) => {
      await changeConnectRoom(idRoom, false);
      const clientOnl = await findAllRoom();
      io.emit("clientOnl", clientOnl);
    });

    socket.on("updateProduct", async (idProduct) => {
      const updateProd = await Product.findById(idProduct);
      io.emit("updateProduct", updateProd);
    });
  });
};

module.exports = socketController;
