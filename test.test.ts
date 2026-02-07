import { RegistryBuilder } from "./dist";

// Registry Builder
test("Registry Builder", () => {
  const oldRegistry = new RegistryBuilder();
  oldRegistry.set("user:hai", () => {});

  const newRegistry = new RegistryBuilder();

  function TestingBasicPost() {
    return {
      data: {
        success: true,
      },
    };
  }
  newRegistry.set("post:basic", TestingBasicPost);
  newRegistry.set(
    "post:middleware",
    () => {
      return {
        data: {
          success: true,
        },
      };
    },
    () => {
      return {
        data: {
          success: true,
        },
      };
    },
  );

  expect(newRegistry.get("post:basic")).toBe(TestingBasicPost);
});
