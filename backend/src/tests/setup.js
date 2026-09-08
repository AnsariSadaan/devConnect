// import mongoose from "mongoose";
// import { MongoMemoryServer } from "mongodb-memory-server";

// let mongoServer;

// beforeAll(async () => {
//   mongoServer = await MongoMemoryServer.create();

//   await mongoose.connect(mongoServer.getUri());
// });

// afterEach(async () => {
//   const collections = mongoose.connection.collections;

//   for (const key in collections) {
//     await collections[key].deleteMany();
//   }
// });

// afterAll(async () => {
//   await mongoose.disconnect();
//   await mongoServer.stop();
// });

import mongoose from "mongoose";
import { MongoMemoryReplSet } from "mongodb-memory-server";

let replset;


beforeAll(async () => {
  replset = await MongoMemoryReplSet.create({
    replSet: {
      count: 1,
      storageEngine: "wiredTiger",
    },
  });

  const uri = replset.getUri();

  await mongoose.connect(uri);

  // console.log(mongoose.connection.readyState);
  // console.log(await mongoose.connection.db.admin().command({ hello: 1 }));
});

afterEach(async () => {
  const collections = mongoose.connection.collections;

  for (const key in collections) {
    await collections[key].deleteMany();
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  await replset.stop();
});

