const Client = {

};
const ThriftTest$testMulti$Args = {};
const ThriftTest$testMulti$Result = {};
export const a = 1;

export class TestClient extends Client {
  static get test() {
    return 'a';
  }
  /**
   * Test.testMulti
   * @param {string} aa
   * @param {number} bb
   * @returns {Promise<void>}
   */
  testMulti(aa, bb) {
    const args = new ThriftTest$testMulti$Args({ aa, bb });
    return this.send('testMulti', args).then((input) => {
      const result = new ThriftTest$testMulti$Result();
      result.read(input);
      input.readMessageEnd();
      if (result.success !== null) {
        return result.success;
      }
      return Promise.reject(new Error('"Test.testMulti" request failed: unknown result'));
    }).catch((input) => {
      const error = new Thrift.TApplicationException();
      error.read(input);
      input.readMessageEnd();
      return Promise.reject(error);
    });
  }
}
