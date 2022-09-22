// tslint:disable-next-line no-implicit-dependencies
import { assert } from "chai";
import path from "path";

import { useEnvironment } from "./helpers";

import dotenv from "dotenv";
dotenv.config();

describe("Integration tests examples", function () {
  describe("Hardhat Runtime Environment extension", function () {
    useEnvironment("hardhat-project");

    it("run node", async function () {
      await this.hre.run("node", "--version");
    });

    // it("Should add the example field", function () {
    //   assert.instanceOf(
    //     this.hre.example,
    //     ExampleHardhatRuntimeEnvironmentField
    //   );
    // });

    // it("The example filed should say hello", function () {
    //   assert.equal(this.hre.example.sayHello(), "hello");
    // });
  });

  // describe("HardhatConfig extension", function () {
  //   useEnvironment("hardhat-project");

  //   it("Should add the newPath to the config", function () {
  //     assert.equal(
  //       this.hre.config.paths.newPath,
  //       path.join(process.cwd(), "asd")
  //     );
  //   });
  // });
});

// describe("Unit tests examples", function () {
//   describe("ExampleHardhatRuntimeEnvironmentField", function () {
//     describe("sayHello", function () {
//       it("Should say hello", function () {
//         const field = new ExampleHardhatRuntimeEnvironmentField();
//         assert.equal(field.sayHello(), "hello");
//       });
//     });
//   });
// });
