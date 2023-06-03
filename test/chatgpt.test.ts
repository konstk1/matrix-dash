import { ChatGPT } from '../src/services/chatgpt';

describe('ChatGPT', () => {
  const chatgpt = new ChatGPT();

  it('Asks a question', async () => {
    const answer = await chatgpt.generate('Say a nice short sentence about Steph');

    console.log(answer);

    expect(answer).toBeDefined();
    expect(answer).not.toEqual('');
  });
});
  