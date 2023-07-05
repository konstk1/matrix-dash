import { Configuration, OpenAIApi } from 'openai';


export class ChatGPT {
  private readonly openai: OpenAIApi;

  constructor() {
    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    this.openai = new OpenAIApi(configuration);
  }

  public async generate(prompt: string): Promise<string | undefined> {
    const response = await this.openai.createCompletion({
      model: "text-davinci-003",
      prompt,
      // temperature: 1.3,
      // top_p: .1,
      n: 1,
    });

    console.log('ChatGPT usage: ', response.data.usage)

    console.log(response.data.choices.map((c) => c.text?.trim()).join('\n'))
    
    return response.data.choices[0].text?.trim();
  }

  public async generateChat(prompt: string): Promise<string | undefined> {
    const response = await this.openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{
        role: 'system',
        content: 'You are a sarcastic coworker who responds with short sentence.',
      }, {
        role: 'user',
        content: prompt,
      }],
    })

    console.log('ChatGPT usage: ', response.data.usage)

    console.log(response.data.choices);

    return response.data.choices[0].message?.content.trim();
  }
}